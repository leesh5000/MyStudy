# ElasticSearch 2 : 설치 및 환경 구성

## 📌 핵심 요약

> 한 문장으로: ElasticSearch를 로컬 환경에 설치하고 기본 설정을 통해 개발 환경을 구축하는 방법을 배웁니다.

## 🎯 학습 목표

- [ ] Docker를 이용한 ElasticSearch 설치하기
- [ ] 기본 설정 이해하고 변경하기
- [ ] Kibana를 통한 시각화 도구 설정하기
- [ ] 클러스터 상태 확인 및 모니터링하기

## 🤔 왜 중요한가요?

ElasticSearch를 제대로 활용하려면 먼저 안정적인 개발 환경이 필요합니다. 설치와 설정 과정을 이해하면 프로덕션 환경에서도 문제없이 운영할 수 있습니다.

## 📖 개념 설명

### 간단한 비유

ElasticSearch 환경 구성은 새 집에 이사하는 것과 비슷합니다:

- **ElasticSearch 설치**: 집 계약하기
- **설정 변경**: 가구 배치하기
- **Kibana 설치**: 관리 사무실 설치하기
- **클러스터 구성**: 여러 집을 하나의 단지로 만들기

### 기술적 설명

ElasticSearch는 여러 방법으로 설치할 수 있습니다:

- **Docker**: 가장 간편한 설치 방법
- **패키지 매니저**: apt, yum 등을 통한 설치
- **압축 파일**: 직접 다운로드 후 실행
- **클라우드 서비스**: Elastic Cloud, AWS ES 등

## 💻 설치 및 설정 예제

### 1. Docker를 이용한 설치

```bash
# ElasticSearch 이미지 다운로드 및 실행
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.0

# Kibana 설치 (선택사항)
docker run -d \
  --name kibana \
  --link elasticsearch:elasticsearch \
  -p 5601:5601 \
  docker.elastic.co/kibana/kibana:8.11.0
```

### 2. Docker Compose를 이용한 설치

```yaml
# docker-compose.yml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - 9200:9200
      - 9300:9300
    volumes:
      - es-data:/usr/share/elasticsearch/data

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    container_name: kibana
    ports:
      - 5601:5601
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  es-data:
    driver: local
```

### 3. 클러스터 상태 확인

```bash
# ElasticSearch 상태 확인
curl -X GET "localhost:9200"

# 클러스터 건강 상태
curl -X GET "localhost:9200/_cluster/health?pretty"

# 노드 정보 확인
curl -X GET "localhost:9200/_nodes?pretty"

# 인덱스 목록 확인
curl -X GET "localhost:9200/_cat/indices?v"
```

### 4. 기본 설정 변경

```yaml
# elasticsearch.yml
cluster.name: my-application
node.name: node-1

# 네트워크 설정
network.host: 0.0.0.0
http.port: 9200

# 메모리 설정
bootstrap.memory_lock: true

# 경로 설정
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
```

## ⚡ 실전 활용

### 개발 환경 vs 프로덕션 환경

**개발 환경**:

- Single node로 충분
- 보안 설정 비활성화 가능
- 낮은 메모리 설정

**프로덕션 환경**:

- 최소 3개 노드 권장
- 보안 설정 필수
- 충분한 메모리 할당 (최소 4GB)

### 주의사항

- JVM 힙 메모리는 시스템 메모리의 50% 이하로 설정
- 9200 포트는 HTTP, 9300 포트는 노드 간 통신용
- 프로덕션에서는 반드시 보안 설정 활성화

### 베스트 프랙티스

- 데이터와 로그는 별도 볼륨에 저장
- 정기적인 스냅샷 설정
- 모니터링 도구 설정 (Elastic APM, Metricbeat)

## 🔗 관련 주제

- [[ElasticSearch 1 : 개요]]
- [[ElasticSearch 3 : 기본 개념]]
- [[Docker 기초]] - 컨테이너 환경 이해
- [[Linux 서버 관리]] - 시스템 리소스 관리

## 📚 참고 자료

- [ElasticSearch 설치 가이드](https://www.elastic.co/guide/en/elasticsearch/reference/current/install-elasticsearch.html)
- [Docker로 ElasticSearch 실행하기](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html)
- [ElasticSearch 설정 레퍼런스](https://www.elastic.co/guide/en/elasticsearch/reference/current/settings.html)
