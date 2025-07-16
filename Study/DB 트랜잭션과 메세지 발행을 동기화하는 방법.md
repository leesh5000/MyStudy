회사에서 개발 중인 서비스에는 수신한 데이터를 분석하여 알람을 발생시키는 기능이 있다. 이때 `@Transactional` 로 묶인 하나의 메서드에서 다음과 같이 발생한 알람을 저장하고, 이벤트를 발행한다. 발행된 이벤트는 이벤트 리스너에서 수신하여 알람을 받아야하는 수신자들에게 발송한다.

```jsx
@Transactional
public void saveAndSendAlarm(Alarm alarm) {
	saveAlarm(alarm);
	Event event = new SaveAlarmEvent(alarm.getId());
	Events.raise(event);
}

@EventListner
public void handleSaveAlarmEvent(Event event) {
      notificationSenders.stream()
            .filter(notificationSender -> notificationSender.isSupport(event))
            .forEach(notificationSender -> notificationSender.send(event));
}
```

운영 환경에서는 한 번도 문제가 발생한 적이 없었으나, 로컬 환경에서 Push 알람을 받은 프론트엔드에서 알람 수신 직후 해당 알람에 대한 상세 정보 API 호출할 때 알람을 찾지 못해 404 에러가 발생했다.

확인 결과, 트랜잭션이 커밋되어 저장된 알람이 DB에 반영되기도 전에, 프론트엔드에서 수신받은 알람 ID로 알람 상세 정보 API를 호출해서 발생한 문제였다.

운영 환경에서는 DB와 서버 사이에 물리적인 거리로 인해 트랜잭션이 DB에 반영되기까지 충분한 시간이 있어서 문제가 발생한 적이 없었던 것이었다.

논리적으로 봤을 때에도 아직 알람 저장이 DB에 반영되지도 않았음에도 해당 알람을 발송해버렸으니 문제가 생기는게 당연했다.

이를 해결하기 위해 DB에 트랜잭션 커밋이 완료된 다음에 메세지가 발행되어야 했다. 즉, DB 트랜잭션과 메세지 발행이 동기화 되어야 했는데, 조사 결과 이를 해결하기 위한 여러 방법들이 존재했다.

## DB 트랜잭션과 메세지 동기화를 위한 여러가지 방법

### 1. @TransactionalEventListener

- **비즈니스 로직에서 커스텀 이벤트 발행:** 트랜잭션이 걸린 서비스 메서드 안에서 `ApplicationEventPublisher`로 이벤트만 발행한다.

```java
@Service
public class AlarmService {

    private final EventPublisher publisher;

    public AlarmService (EventPublisher publisher) {
        this.publisher = publisher;
    }

    @Transactional
    public void saveAndSendAlarm(Alarm alarm) {
        // 1) DB에 알람 저장
        alarmRepository.save(alarm);
        // 2) 주문 생성 이벤트 발행 (트랜잭션 커밋 전까지는 실제 핸들러가 실행되지 않음)
        publisher.publishEvent(new SaveAlarmEvent(alarm.getId()));
    }
}

```

- **커스텀 이벤트 리스너를 `AFTER_COMMIT`로:** 트랜잭션 커밋 이후에만 호출되도록 `phase = AFTER_COMMIT` 을 지정한다.

```java
@Component
public class SaveAlarmEventListener {
    private final KafkaTemplate<String, String> kafkaTemplate;

    public SaveAlarmEventListener(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onSaved(SaveAlarmEvent event) {
        // 여기서는 DB 커밋이 완료된 뒤에만 호출됩니다.
        kafkaTemplate.send("save-alarm-event", alarm.getId().toString());
    }
}

```

### 2. `TransactionSynchronizationManager` 직접 등록하기

- 이벤트를 발행하는 곳에서 트랜잭션과 메세지 발행을 동기화 할 수 있다.

```java
@Override
public void publish(Event event) {
    // 1) 트랜잭션 동기화가 활성화(= @Transactional 안에서 실행 중) 되어 있는지 확인
    if (TransactionSynchronizationManager.isSynchronizationActive()) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            // 2) 트랜잭션이 커밋에 성공한 직후 이 콜백이 호출된다
            @Override
            public void afterCommit() {
                kafkaTemplate.send(event.getTopic(), event);
            }
        });
    } else {
        // 트랜잭션이 없으면 즉시 발행
        kafkaTemplate.send(event.getTopic(), event);
    }
}
```

### 3. Outbox 패턴

- 아웃박스(Outbox) 패턴은 **단일 DB 트랜잭션** 내에서 비즈니스 데이터 변경과 메시지(이벤트) 저장을 함께 처리함으로써, 메시지 발행 실패로 인한 데이터 불일치를 방지하는 방식이다.

```sql
-- 예시: outbox 테이블 스키마
CREATE TABLE message_outbox (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    aggregate_id VARCHAR(50),
    payload JSON,
    topic VARCHAR(100),
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

1. 트랜잭션 안에서 `message_outbox`에 INSERT
2. 커밋 후 별도 스케줄러나 Debezium/Change Data Capture로 읽어 Kafka에 발행
3. 발행 완료 시 `processed=true`로 업데이트

### **3.1. 왜 OutBox 패턴인가?**

- `DB에 주문 저장 → 커밋 → Kafka 메세지 발행` 방식은 DB 커밋 후 네트워크 장애나 애플리케이션 장애로 메세지가 발행되지 않을 수가 있다.
- 반대로, 메세지를 먼저 발행 후 DB 커밋이 실패하면 소비자는 잘못된 이벤트를 처리하게 된다.
- OutBox 패턴은 아래와 같은 과정으로 진행된다.
    1. **서비스 레이어**
        - `orders` 테이블에 주문 저장
        - 같은 트랜잭션에서 `message_outbox` 테이블에 이벤트 레코드 INSERT
    2. **Outbox 프로세서**
        - 별도 스케줄러(스프링 `@Scheduled`) 또는 Debezium 같은 CDC(Change Data Capture) 커넥터가 Outbox 테이블 변화를 감지
    3. **메시지 발행**
        - 감지된 레코드를 Kafka(또는 RabbitMQ 등)에 발행
        - 발행 성공 시 `processed=true` 로 업데이트

### 3.2. 구체적 구현 예제 (ex. 주문 프로세스)

**Outbox 테이블 스키마**

```sql
CREATE TABLE message_outbox (
  id            BIGINT      AUTO_INCREMENT PRIMARY KEY,
  aggregate_id  VARCHAR(50) NOT NULL,
  topic         VARCHAR(100) NOT NULL,
  payload       JSON        NOT NULL,
  processed     BOOLEAN     DEFAULT FALSE,
  created_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);
```

**JPA 엔티티 & 리포지토리**

```java
@Entity
@Table(name = "message_outbox")
public class OutboxMessage {
    @Id @GeneratedValue
    private Long id;
    private String aggregateId;
    private String topic;
    @Column(columnDefinition = "json")
    private String payload;
    private boolean processed = false;
    private LocalDateTime createdAt;

    // 생성자·게터·세터 생략
}

public interface OutboxRepository extends JpaRepository<OutboxMessage, Long> {
    List<OutboxMessage> findByProcessedFalseOrderByCreatedAtAsc();
}
```

**서비스 레이어: DB 작업 + Outbox INSERT**

```java
@Service
public class OrderService {
    private final OrderRepository orderRepo;
    private final OutboxRepository outboxRepo;
    private final ObjectMapper objectMapper;

    @Transactional
    public void placeOrder(Order order) {
        // 1) 주문 저장
        orderRepo.save(order);

        // 2) Outbox에 이벤트 기록
        OrderCreatedEvent evt = new OrderCreatedEvent(order.getId(), order.getTotal());
        outboxRepo.save(new OutboxMessage(
            order.getId().toString(),
            "orders-topic",
            objectMapper.writeValueAsString(evt)
        ));
    }
}
```

**Outbox 폴링 스케줄러**

```java
@Component
public class OutboxPublisher {
    private final OutboxRepository outboxRepo;
    private final KafkaTemplate<String, String> kafka;

    @Scheduled(fixedDelay = 5000)
    public void publishPending() {
        List<OutboxMessage> list = outboxRepo.findByProcessedFalseOrderByCreatedAtAsc();
        for (OutboxMessage msg : list) {
            kafka.send(msg.getTopic(), msg.getAggregateId(), msg.getPayload())
                 .addCallback(
                   success -> {
                     msg.setProcessed(true);
                     outboxRepo.save(msg);
                   },
                   failure -> {
                     // 로깅/모니터링
                   }
                 );
        }
    }
}
```

## 결론

간단한 애플리케이션에서는 OutBox 패턴을 도입하는 비용이 더 발생할 수 있으니 `TransactionSynchronizationManager` 를 이용하여 메세지 동기화를 하는 것이 좋을 것 같다. 다만, `TransactionSynchronizationManager` 를 이용하는 방법은 장애가 발생하여 메세지가 발행되지 않는 경우에 대한 대비책이 없기 때문에 `@Retryable` 과 같은 어노테이션으로 일시적인 장애에 대해 최대한 재시도 로직을 적용하고 그럼에도 실패하는 영구적인 장애인 경우를 대비하여 로그를 남기는 편이 좋을 것 같다. 애플리케이션이 복잡해지면 OutBox 패턴을 도입하는 것이 유의미한 결과를 만들 수 있을 것 같다.