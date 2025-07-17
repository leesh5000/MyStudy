# 개요

진행 중인 프로젝트에서는 `kafka`를 통해 데이터를 수신받고 해당 데이터를 처리하여 알람을 발생시키는 로직이 있다. 알람을 발생시키기에 앞서, 수신한 데이터가 정상 범위 안에 들어오면 기존에 존재했던 알람이 있는지 확인하고 자동 완료시키거나 혹은 재발송하는 등의 로직이 있는데 이 로직을 수행하기 위해 한 메서드 내에서 DB 접근을 여러 번 하게 된다.

`KafkaListener`를 통해 여러 개의 컨슈머가 데이터를 병렬로 수신하게 되고 결과적으로 여러 스레드에서 하나의 DB 자원에 접근하게 되어 동시성 이슈가 발생할 가능성이 있었다.

다행이도 데이터가 30초마다 수신되어 문제가 발생하지는 않았지만 만약 서버가 잠시 중단되어서 kafka에 메세지가 쌓이고 서버가 재가동되어 여러 개의 메세지를 한 번에 수신하게 되면 문제가 발생할 수 있었다.

이런 이유로, 해당 로직에 Lock의 도입이 필요해졌고 그 전에 먼저 스터디를 통해 자세히 알아보고자 한다.

## Lock이란?

Lock은 여러 스레드(Thread) 또는 프로세스(Process)가 동시에 접근하는 공유 자원(메모리, 파일, 캐시 등)에 대해 상호 배제(mutual exclusion)를 보장하여 데이터의 일관성과 무결성을 지키는 메커니즘입니다.

---

## Lock을 사용하는 여러 가지 방법

### 1. Java 레벨 락 (Java-Level Locks)

1. **암시적 락 (Intrinsic Lock)**
    - `synchronized` 키워드로 객체 모니터(Monitor)를 이용한 상호 배제
    - 임계 영역이 짧고, 복잡한 동시성 제어가 필요 없을 때 사용 (ex. 단일 메서드나 코드 블록 내에서 간단한 공유 자원 보호)
    - JVM이 자동으로 관리하며, 코드 블록 또는 메서드 수준에서 사용

      [Oracle Docs](https://docs.oracle.com/javase/tutorial/essential/concurrency/locksync.html?utm_source=chatgpt.com)

2. **명시적 락 (Explicit Lock, `java.util.concurrent.locks`)**
    - `Lock` 인터페이스를 구현하여 더 유연한 락 제어 가능 [Oracle Docs](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/package-summary.html?utm_source=chatgpt.com)
    - 공정성(fairness)이 필요하거나 복잡한 동시성 제어가 필요할 때 사용
    - **ReentrantLock**: 재진입 가능(mutex) 락, `lock()`, `unlock()`, `tryLock()`, 공정성(fairness) 옵션 제공 [Oracle Docs](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/package-summary.html?utm_source=chatgpt.com)
    - **ReentrantReadWriteLock**: 읽기/쓰기 락 분리, 다중 읽기 가능(readLock), 단독 쓰기(writeLock) [Oracle Docs](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/package-summary.html?utm_source=chatgpt.com)
    - **StampedLock**: 낙관적 읽기(optimistic read), 읽기→ 쓰기 업그레이드, 비재진입성(non-reentrant) [Oracle Docs](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/StampedLock.html?utm_source=chatgpt.com)

### 2. JPA 레벨 락 (JPA-Level Locks)

1. **낙관적 락 (Optimistic Locking)**
    - 엔티티에 `@Version` 필드를 선언하여 트랜잭션 커밋 시점 버전 충돌 감지
    - 충돌 확률이 낮고, 읽기 위주의 워크로드에 적합
    - 충돌 시 `OptimisticLockException` 발생 → 재시도 로직 구현 등으로 처리

      [Javadoc](https://javadoc.io/static/jakarta.platform/jakarta.jakartaee-api/10.0.0/jakarta/persistence/Version.html?utm_source=chatgpt.com)

2. **비관적 락 (Pessimistic Locking)**
    - DB 레벨의 Shared/Exclusive 락을 트랜잭션 시작 시점에 획득
    - 충돌 빈도가 높고, 데이터 일관성을 즉시 보장해야 하는 경우
    - `@Lock(LockModeType.PESSIMISTIC_READ)` / `@Lock(LockModeType.PESSIMISTIC_WRITE)` 또는 `EntityManager.lock(...)` 사용
    - `PESSIMISTIC_READ`, `PESSIMISTIC_WRITE`, `PESSIMISTIC_FORCE_INCREMENT` 모드 지원 [Jakarta EE](https://jakartaee.github.io/persistence/latest/api/jakarta.persistence/jakarta/persistence/LockModeType.html?utm_source=chatgpt.com)
    - `PESSIMISTIC_READ(공유 락)`
        - **동작 방식**: 해당 행(row)에 **공유(shared) 락**을 걸어 다른 트랜잭션이 데이터를 **수정(UPDATE/DELETE)** 하지 못하도록 막습니다.
        - **허용되는 동시성**: 다른 트랜잭션은 **또다른 공유 락**은 획득할 수 있어 **다중 읽기**가 가능합니다.
        - **SQL 매핑**: 대부분 DB에서 `SELECT … LOCK IN SHARE MODE` 또는 `SELECT … FOR SHARE`로 구현됩니다.
        - **사용 예시**:
            - 읽기 작업 중 데이터 일관성을 보장해야 하지만, 여러 스레드가 동시에 읽어도 무방한 경우.
            - 조회 위주의 트랜잭션에서, 간헐적인 쓰기 차단이 필요할 때.

      [Baeldung](https://www.baeldung.com/jpa-pessimistic-locking?utm_source=chatgpt.com) [Stack Overflow](https://stackoverflow.com/questions/1657124/whats-the-difference-between-pessimistic-read-and-pessimistic-write-in-jpa?utm_source=chatgpt.com)

    - `PESSIMISTIC_WRITE (배타 락)`
        - **동작 방식**: 해당 행에 **배타(exclusive) 락**을 걸어 다른 트랜잭션이 **읽기·수정·삭제** 모두 하지 못하게 완전 배타 제어를 수행합니다.
        - **허용되는 동시성**: **어떠한 다른 락도** 획득할 수 없으므로, 락 획득 시점부터 해제 시점까지 **완전 단일 스레드 접근**이 보장됩니다.
        - **SQL 매핑**: `SELECT … FOR UPDATE` 구문으로 구현됩니다.
        - **사용 예시**:
            - 트랜잭션 내에서 **데이터 수정이 주가** 될 때, 중간에 다른 트랜잭션이 읽거나 쓰는 것을 원천 차단하고 싶을 때.
            - 금전 이체 같은 **강력한 일관성**이 필수적인 비즈니스 로직.

      [Baeldung](https://www.baeldung.com/jpa-pessimistic-locking?utm_source=chatgpt.com) [Stack Overflow](https://stackoverflow.com/questions/1657124/whats-the-difference-between-pessimistic-read-and-pessimistic-write-in-jpa?utm_source=chatgpt.com)

    - `PESSIMISTIC_FORCE_INCREMENT`
        - **동작 방식**: `PESSIMISTIC_WRITE`와 **동일한 배타 락**을 획득하면서, **엔티티의 `@Version` 필드**를 **강제로 증가**시킵니다.
        - **버전 관리**: 락을 건 시점에 버전이 올라가므로, 이후 **낙관적 락**을 사용하는 다른 트랜잭션에도 충돌로 인식시킬 수 있습니다.
        - **사용 예시**:
            - 트랜잭션이 실제로 데이터를 변경하지 않더라도, **버전만 증가**시켜 변경 이벤트를 기록하거나 후속 로직에서 재검증을 유도할 때.
            - **감사(audit)** 또는 **이력 관리** 목적으로 엔티티 버전을 업데이트해야 할 때.

---

### 3. 분산 락 (Distributed Locks)

1. **Spring Integration `LockRegistry`**
    - *Redis 기반*: `RedisLockRegistry`
        - Redis 키-값에 락 상태 저장, 만료(expire) 옵션, 재진입성 지원 [Home](https://docs.spring.io/spring-integration/docs/current/api/org/springframework/integration/redis/util/RedisLockRegistry.html?utm_source=chatgpt.com)
    - *Zookeeper 기반*: `ZookeeperLockRegistry`
        - CuratorFramework 이용, ZK 노드에 락 경로(`/SpringIntegration-LockRegistry/`) 유지 [Home](https://docs.spring.io/spring-integration/api/org/springframework/integration/zookeeper/lock/ZookeeperLockRegistry.html?utm_source=chatgpt.com)
2. **외부 라이브러리**
    - *Redisson* 등 Redis 클라이언트를 활용한 분산 `RLock` 제공

---

### 4. DB 레벨 락 (Database-Level Locks)

- **행 단위(row-level) 락**:
  - `SELECT … FOR UPDATE` 와 같은 SQL 문으로 특정 행에 배타 잠금 적용
- **테이블/파티션 락**:
  - DBMS별(`LOCK TABLES`, `LOCK IN SHARE MODE` 등)로 제공
- 트랜잭션 격리 수준 설정을 통해 간접 제어도 가능

## 2. 공통 고려사항

1. **데드락(Deadlock) 방지**
    - **락 획득 순서 통일**: 여러 락 동시 사용 시 순서를 고정
    - **타임아웃/인터럽트**: `tryLock(timeout)` 또는 `lockInterruptibly()` 활용 [Oracle Docs](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/locks/Lock.html?utm_source=chatgpt.com)
2. **성능 오버헤드 & 컨텐션**
    - **락 범위 최소화**: 임계영역(critical section)을 최대한 작게 유지
    - **락 그레인(Granularity)**: 전역 락 대신 필드·객체 단위로 분리
    - **공정성 옵션 vs Throughput**: 공정성(`new ReentrantLock(true)`) 켜면 응답성 보장되나 처리량 감소 가능 [Oracle Docs](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/Lock.html?utm_source=chatgpt.com)
3. **재진입성(Reentrancy)**
    - `synchronized`·`ReentrantLock` 재진입 가능
    - `StampedLock`은 비재진입(non-reentrant)이므로 설계 유의 [Oracle Docs](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/package-use.html?utm_source=chatgpt.com)
4. **분산 환경 특수사항**
    - **단일 실패 지점(SPOF)** 방지: Redis/ZK 장애 시 락 해제 누락 가능
    - **Lease & Watchdog**: 자동 만료(`leaseTime`)와 워치독으로 락 장기 점유 방지 [GitHub](https://github.com/redisson/redisson/wiki/8.-%E5%88%86%E5%B8%83%E5%BC%8F%E9%94%81%E5%92%8C%E5%90%8C%E6%AD%A5%E5%99%A8?utm_source=chatgpt.com)
5. **데이터 일관성 요구 수준**
    - **즉시 일관성**: 비관적 락이나 DB-레벨 배타 락
    - **최종 일관성**: 낙관적 락 + 재시도 로직
6. **애플리케이션 특성**
    - **읽기/쓰기 비율**: 읽기 많으면 ReadWriteLock / StampedLock, 쓰기 많으면 배타 락
    - **트랜잭션 범위**: 짧게 유지, 락 해제 지연 방지
