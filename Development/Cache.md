# **캐시(Cache)란?**

캐시는 “자주 사용하는 데이터를 복사해 놓은 임시 저장소”로, 데이터 원본(예: 데이터베이스, 외부 API)으로의 반복적인 접근을 줄여 응답 시간을 단축하고 시스템 부하를 완화하는 기법입니다. 알고리즘의 동적 프로그래밍(DP)에서 `메모이제이션(Memoization)`을 떠올리면 이해가 쉽습니다. [kth990303의 코딩 블로그](https://kth990303.tistory.com/287?utm_source=chatgpt.com) [feeva.github.io](https://feeva.github.io/posts/%EC%9E%90%EB%B0%94%EC%97%90%EC%84%9C-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%BA%90%EC%8B%9C-%EA%B5%AC%ED%98%84%ED%95%98%EA%B8%B0/?utm_source=chatgpt.com)

---

## **캐시 전략**

### **1. Cache-Aside (Lazy Loading)**

- 항상 캐시 저장소를 먼저 확인하고, 없으면 원본 저장소에서 값을 읽어온 후 캐시에 저장한다.
- 장점
  - 필요한 데이터만 캐시에 저장된다.
  - 캐시 miss가 발생해도 치명적이지 않다.
- 단점
  - 첫 호출 시 Cache Miss가 발생한다. → `캐시 Warming` 등을 이용하여 해결할 수 있다.
  - 캐시 데이터가 최신이 아닐 수도 있다. → 캐시 Hit Rate를 일부 포기하고 `캐시 주기를 짧게`하는 해결책이 있다.

### **2. Write-Through**

- 데이터를 쓸 때 캐시에 먼저 쓰고, 그 다음 DB에 쓰기를 하여 최신 상태를 유지한다.
- 장점
  - 캐시와 DB의 일관성이 유지
- 단점
  - 쓰기 지연(latency)가 증가
  - 자주 사용되지 않는 데이터도 캐시됨

### **3. Write-Back (Write-Behind)**

- 데이터를 캐시에만 쓰고, 캐시를 일정 주기로 원본 저장소에 업데이트한다.
- 장점
  - 캐시와 DB의 일관성이 유지
  - 쓰기 응답 시간이 빠름
  - 쓰기가 많은 경우 DB에 부하를 줄일 수 있음
- 단점
  - DB 장애 시 데이터 유실 위험

### **4. Refresh-Ahead**

- 캐시가 만료되기 전에 백그라운드 작업을 통해 미리 갱신한다.
- 장점
  - 캐시 miss 최소화
- 단점
  - 갱신 작업 과부하 가능성

## **Java + Spring Boot에서 캐시 적용 방법**

Spring Framework의 캐시 추상화와 Spring Boot의 자동 설정(auto-configuration)을 이용하면 몇 가지 애노테이션과 설정만으로 손쉽게 캐시를 적용할 수 있습니다.

### **1. 의존성 추가 & 캐시 활성화**

```xml
<!-- build.gradle 예시 -->
implementation 'org.springframework.boot:spring-boot-starter-cache'
implementation 'org.springframework.boot:spring-boot-starter-data-redis'  
<!-- Redis 사용 시 -->
```

```java
@SpringBootApplication
@EnableCaching   // 캐시 지원 활성화
public class IemsApplication { … }
```

`@EnableCaching`은 캐시 어노테이션이 붙은 메서드를 검사하는 포스트프로세서를 등록합니다. [Home](https://spring.io/guides/gs/caching?utm_source=chatgpt.com) [Home](https://docs.spring.io/spring-boot/reference/io/caching.html?utm_source=chatgpt.com)

### **2. 어노테이션 적용**

- `@Cacheable("캐시명")`: 메서드 실행 전 캐시에 값이 있으면 이를 반환, 없으면 메서드 실행 후 캐시에 저장
- `@CacheEvict("캐시명")`: 특정 키(또는 `allEntries=true` 시 전체)를 캐시에서 제거
- `@CachePut("캐시명")`: 메서드 실행 결과를 캐시에 저장(기존 캐시 무시)

  [Home](https://docs.spring.io/spring-framework/reference/integration/cache/annotations.html?utm_source=chatgpt.com) [Home](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/cache/annotation/Cacheable.html?utm_source=chatgpt.com)


### **3. CacheManager 커스터마이징**

Spring Boot는 사용 가능한 캐시 라이브러리(e.g. Redis, Ehcache, Caffeine 등)를 자동 탐지해 `CacheManager`를 구성합니다. 필요 시 다음과 같이 직접 빈을 정의해 세부 설정(통계, 만료 등)을 조정할 수 있습니다.

```java
@Bean
public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
    return RedisCacheManager.builder(factory)
                            .cacheDefaults(
                               RedisCacheConfiguration.defaultCacheConfig()
                               .entryTtl(Duration.ofMinutes(10)))
                            .enableStatistics()
                            .build();
}

```

[Home](https://docs.spring.io/spring-boot/reference/io/caching.html?utm_source=chatgpt.com)

---

## **캐시 도입 시 고려사항 및 주의사항**

### **1. 캐시 스토어 선택**

- **로컬 캐시**: `ConcurrentMapCache`(기본), Ehcache, Caffeine 등은 별도 서버가 필요 없지만 단일 인스턴스에 종속되어 멀티노드 환경에서 동기화 문제가 발생할 수 있습니다. [Home](https://spring.io/guides/gs/caching/?utm_source=chatgpt.com) [Read me](https://juhi.tistory.com/66?utm_source=chatgpt.com)
- **분산 캐시**: Redis, Hazelcast 등은 여러 애플리케이션 인스턴스 간에 캐시를 공유할 수 있어 확장성과 일관성 면에서 유리합니다. [Pleiades Spring](https://spring.pleiades.io/spring-boot/reference/io/caching.html?utm_source=chatgpt.com)

### **2. 만료 정책(TTL) 설정**

캐시된 데이터가 영구 저장되지 않도록 적절한 수명(Time-To-Live)을 지정해야 메모리 누수와 오래된 데이터 반환을 방지할 수 있습니다. Spring Boot에서는 `RedisCacheConfiguration` 또는 `spring.cache.redis.time-to-live` 같은 설정으로 제어합니다. [Home](https://docs.spring.io/spring-boot/reference/io/caching.html?utm_source=chatgpt.com)

### 3. **일관성(Consistency) & 무효화(Invalidation)**

- **Cache-Aside 패턴**: DB 업데이트 시 `@CacheEvict`를 반드시 호출하거나, `@Caching`으로 복수 연산을 묶어야 DB-캐시 간 불일치(stale data)를 방지할 수 있습니다.
- **Race Condition** 주의: 동시에 읽기·쓰기가 발생하면 무효화 호출 전후로 캐시가 덮어써질 수 있습니다. [Home](https://docs.spring.io/spring-framework/reference/integration/cache/annotations.html?utm_source=chatgpt.com)

### 4. **키 전략(Key Strategy)**

- 기본적으로 파라미터를 조합해 키를 생성하지만, 복잡한 구조체나 사용자 고유 키가 필요할 때는 `keyGenerator`나 `key` SpEL 표현식을 사용해 명시적으로 정의하세요. [Home](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/cache/annotation/Cacheable.html?utm_source=chatgpt.com)

### 5. **모니터링 & 통계 수집**

- **Actuator Metrics**: `/actuator/metrics/cache.gets`로 히트·미스 건수 조회
- **CacheStatistics API**: `cacheManager.getCache("users").getCacheStatistics()`
- **Redis INFO stats**: `redis-cli INFO stats`로 서버 레벨 히트율 확인

  [Home](https://docs.spring.io/spring-boot/api/rest/actuator/caches.html?utm_source=chatgpt.com) [Stack Overflow](https://stackoverflow.com/questions/62065084/spring-boot-2-actuator-cache-metrics?utm_source=chatgpt.com)


---

## **캐시 도입 시 발생할 수 있는 이슈**

### 1. **데이터 불일치(Stale Data)**

- DB 업데이트 후 캐시 무효화(`@CacheEvict`)가 누락되거나 지연되면, 오래된 값이 계속 반환될 수 있습니다. 명시적 무효화 로직과 일관성 전략을 반드시 설계해야 합니다. [Java Tech Blog](https://javanexus.com/blog/avoiding-spring-boot-cache-pitfalls?utm_source=chatgpt.com)[Software Engineering Stack Exchange](https://softwareengineering.stackexchange.com/questions/334028/possibility-of-stale-data-in-cache-aside-pattern?utm_source=chatgpt.com)

### 2. **캐시 스탬피드(Cache Stampede)**

- 동일한 키의 캐시가 만료된 시점에 다수의 요청이 한꺼번에 원본(DB/API)으로 쏠려 시스템 부하나 장애를 유발할 수 있습니다. 요청 병합(request coalescing)이나 분산 락(예: Redisson lock)으로 방어해야 합니다. [위키백과](https://en.wikipedia.org/wiki/Cache_stampede?utm_source=chatgpt.com)

### 3. **메모리 과다 사용·OOM**

- 캐싱 대상이 너무 크거나 캐시 엔트리가 과도하게 쌓이면 서버 메모리를 전부 소진해 OOM(OutOfMemoryError)이 발생할 수 있습니다. 적절한 TTL 설정과 `maxmemory`·eviction 정책(예: `allkeys-lru`)을 이용해 메모리 상한을 관리하세요. [DEV Community](https://dev.to/matheusmartinello/improving-backend-performance-with-caching-in-spring-boot-2pka?utm_source=chatgpt.com)

### 4. **직렬화/역직렬화 오류**

- 기본 `JdkSerializationRedisSerializer` 사용 시 `Serializable` 미구현 객체는 직렬화 실패를 일으키고, JSON 직렬화 시 타입 정보 누락으로 역직렬화 오류가 발생할 수 있습니다. `GenericJackson2JsonRedisSerializer` 등 적절한 `RedisSerializationContext` 설정이 필요합니다. [쏭의 개발 블로그](https://dev-ssongu1.tistory.com/62?utm_source=chatgpt.com)

### 5. **키 충돌·네임스페이스 관리 미흡**

- 캐시 이름 없이 동일 키를 쓰면 다른 캐시와 충돌해 잘못된 데이터를 반환할 수 있습니다. `spring.cache.redis.use-key-prefix=true` 또는 `computePrefixWith()` 설정으로 캐시별 키 프리픽스를 적용하세요. [Home](https://docs.spring.io/spring-boot/reference/io/caching.html?utm_source=chatgpt.com)

### 6. **만료 정책(TTL) 설정 오류**

- TTL이 없거나 지나치게 길면 오래된 데이터가 계속 남고, 너무 짧으면 캐시 히트율이 떨어집니다. `RedisCacheConfiguration.entryTtl(Duration)` 등으로 서비스 특성에 맞는 적절한 만료시간을 설정해야 합니다. [Home](https://docs.spring.io/spring-boot/reference/io/caching.html?utm_source=chatgpt.com)

### 7. **분산 환경에서의 일관성 문제**

- 멀티 인스턴스(클러스터) 환경에서 캐시 무효화가 모든 노드에 전파되지 않으면, 일부 인스턴스가 구버전 데이터를 제공할 수 있습니다. Redis Cluster, Hazelcast 등의 분산 캐시 솔루션과 Pub/Sub 동기화를 고려하세요. [momentslog.com](https://www.momentslog.com/development/web-backend/cache-conundrums-solving-cache-invalidation-challenges-in-spring-boot?utm_source=chatgpt.com)

---