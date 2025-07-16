## Redis란 무엇인가?

Redis는 오픈 소스 BSD 라이선스로 배포되는 **인메모리 데이터 구조 저장소**로, 데이터베이스, 캐시, 메시지 브로커 등으로 사용할 수 있습니다. 문자열(String), 해시(Hashes), 리스트(Lists), 셋(Sets), 정렬된 셋(Sorted Sets), 비트맵(Bitmaps), 하이퍼로그로그(HyperLogLogs), 지리공간 인덱스(Geospatial Indexes), 스트림(Streams) 등 다양한 네이티브 데이터 타입을 지원하여 높은 유연성과 성능을 제공합니다 [redis-doc-test.readthedocs.io](https://redis-doc-test.readthedocs.io/en/latest/topics/introduction/?utm_source=chatgpt.com)[Redis](https://redis.io/docs/latest/develop/data-types/?utm_source=chatgpt.com).

- **주요 특징**:
    - 모든 데이터를 RAM에 저장해 디스크 I/O 없이 초당 수십만 건의 읽기/쓰기 처리 가능
    - 다양한 내장 데이터 구조를 통해 복잡한 로직을 간결한 코드로 구현
    - Redis Sentinel, Redis Cluster로 고가용성(HA) 및 자동 샤딩(파티셔닝) 지원 [redis-doc-test.readthedocs.io](https://redis-doc-test.readthedocs.io/en/latest/topics/introduction/?utm_source=chatgpt.com)

---

## Redis 주요 사용 사례

1. **캐싱 (Cache)**

   단기적으로 자주 조회되는 데이터를 메모리에 저장해 애플리케이션의 응답 속도를 획기적으로 개선합니다 [Redis](https://redis.io/docs/latest/develop/get-started/?utm_source=chatgpt.com).

2. **세션 저장소 (Session Store)**

   웹 어플리케이션의 세션 정보를 키–값 형태로 저장하여 여러 인스턴스 간 세션 공유가 가능합니다 [Redis](https://redis.io/docs/latest/embeds/rc-create-db-use-cases/?utm_source=chatgpt.com)[Redis](https://redis.io/solutions/session-store/?utm_source=chatgpt.com).

3. **메시지 브로커 및 Pub/Sub**

   발행/구독(Pub/Sub) 모델을 통해 마이크로서비스 간 실시간 메시징 및 이벤트 스트리밍을 구현합니다 [redis-doc-test.readthedocs.io](https://redis-doc-test.readthedocs.io/en/latest/topics/introduction/?utm_source=chatgpt.com).

4. **스트리밍 엔진 (Streams)**

   Redis Streams를 이용해 로그, 이벤트, IoT 데이터 등 지속적인 스트림 데이터를 처리하고 소비할 수 있습니다 [Redis](https://redis.io/docs/latest/develop/get-started/?utm_source=chatgpt.com).

5. **레이트 리미팅 (Rate Limiting)**

   토큰 버킷(Token Bucket)·루키 버킷(Leaky Bucket) 알고리즘 등을 활용해 API 호출 제한, DoS 공격 방어 등에 활용합니다 [Redis](https://redis.io/learn/howtos/ratelimiting?utm_source=chatgpt.com)[Redis](https://redis.io/glossary/rate-limiting/?utm_source=chatgpt.com).

6. **게임 랭킹 보드 (Leaderboards)**

   Sorted Set 자료구조를 이용해 점수 기반 랭킹을 관리하고 실시간으로 상위권 데이터를 조회할 수 있습니다 [Redis](https://redis.io/docs/latest/embeds/rc-create-db-use-cases/?utm_source=chatgpt.com).

7. **지리공간 질의 (Geospatial Queries)**

   반경 검색, 좌표 기반 정렬 등 지리공간 인덱스를 활용한 위치 기반 서비스를 구현합니다 [redis-doc-test.readthedocs.io](https://redis-doc-test.readthedocs.io/en/latest/topics/introduction/?utm_source=chatgpt.com).


---

## 실무에서 자주 발생하는 이슈 및 트러블슈팅

1. **메모리 초과 및 키 축출(Eviction)**
    - `maxmemory` 설정과 `maxmemory-policy`(volatile-lru, allkeys-lru 등)를 적절히 구성하지 않으면 OOM(Out Of Memory)이 발생하거나 원치 않는 키 삭제가 일어날 수 있습니다. OOM 상태에서 쓰기 연산은 실패합니다 [Stack Overflow](https://stackoverflow.com/questions/5068518/what-does-redis-do-when-it-runs-out-of-memory?utm_source=chatgpt.com)[mindfulchase.com](https://www.mindfulchase.com/explore/troubleshooting-tips/troubleshooting-key-eviction-and-memory-fragmentation-in-redis.html?utm_source=chatgpt.com).
2. **성능 저하 및 레이턴시 스파이크**
    - 대량 쓰기/만료 처리 시 지연이 발생할 수 있으며, `SLOWLOG`, `MONITOR`, `latency` 모듈로 원인을 진단하고, 파이프라이닝(Pipelining)·배치 처리로 최적화해야 합니다 [Redis](https://redis.io/kb/doc/1mebipyp1e/performance-tuning-best-practices?utm_source=chatgpt.com)[Redis](https://redis.io/docs/latest/operate/oss_and_stack/management/troubleshooting/?utm_source=chatgpt.com).
3. **연결 실패 및 인증 오류**
    - 방화벽, 네트워크 DNS, 비밀번호 설정 오류 등으로 인해 클라이언트와 Redis 서버 간 연결이 실패할 수 있습니다. `redis-cli --ping`, 로그 확인, 포트/인증 설정을 점검해야 합니다 [mindfulchase.com](https://www.mindfulchase.com/explore/troubleshooting-tips/databases/troubleshooting-common-issues-in-redis.html?utm_source=chatgpt.com).
4. **복제 지연(Replication Lag) 및 Sentinel/Cluster 장애**
    - 마스터-슬레이브 동기화 지연, Sentinel 자동 장애 조치(failover) 실패 등이 서비스 가용성에 영향을 줍니다. 클러스터 모니터링, 리소스(네트워크·디스크) 최적화, Sentinel 구성 검토가 필요합니다 [mindfulchase.com](https://www.mindfulchase.com/explore/troubleshooting-tips/databases/troubleshooting-common-issues-in-redis.html?utm_source=chatgpt.com).
5. **캐시 스탬피드(Cache Stampede)**
    - 캐시 TTL 만료 시점에 다수의 요청이 DB로 몰려 성능 저하를 초래합니다. Mutex Lock, Cache Warming, TTL 랜덤화, Stale-while-revalidate 패턴으로 완화합니다 [slaknoah.com](https://www.slaknoah.com/blog/what-is-a-cache-stampede-how-to-prevent-it-using-redis?utm_source=chatgpt.com).
6. **시리얼라이제이션 오버헤드**
    - Spring Data Redis의 기본 `JdkSerializationRedisSerializer` 사용 시 바이트 오버헤드와 보안 문제가 발생할 수 있습니다. `StringRedisSerializer` 또는 `GenericJackson2JsonRedisSerializer`로 변경하여 JSON 기반 직렬화를 사용하는 것이 일반적입니다 [Home](https://docs.spring.io/spring-data/redis/reference/redis/template.html?utm_source=chatgpt.com)[Stack Overflow](https://stackoverflow.com/questions/50272157/spring-data-redis-override-default-serializer?utm_source=chatgpt.com).