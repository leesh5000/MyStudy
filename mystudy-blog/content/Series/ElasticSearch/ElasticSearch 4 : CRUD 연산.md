# ElasticSearch 4 : CRUD 연산

## 📌 핵심 요약

> 한 문장으로: ElasticSearch에서 데이터를 생성(Create), 조회(Read), 수정(Update), 삭제(Delete)하는 기본 연산을 마스터합니다.

## 🎯 학습 목표

- [ ] 도큐먼트 생성과 인덱싱 방법 익히기
- [ ] 다양한 조회 방법 이해하기
- [ ] 도큐먼트 업데이트 전략 파악하기
- [ ] 삭제 연산과 벌크 처리 활용하기

## 🤔 왜 중요한가요?

CRUD는 모든 데이터베이스 작업의 기본입니다. ElasticSearch의 RESTful API를 통한 CRUD 연산을 익히면 효율적인 데이터 관리가 가능합니다.

## 📖 개념 설명

### 간단한 비유

CRUD 연산을 메모장 관리로 비유하면:

- **Create**: 새 메모 작성하기
- **Read**: 메모 읽기
- **Update**: 메모 수정하기
- **Delete**: 메모 삭제하기
- **Bulk**: 여러 메모를 한 번에 처리하기

### 기술적 설명

ElasticSearch는 RESTful API를 통해 CRUD 연산을 수행합니다. HTTP 메서드와 엔드포인트를 조합하여 다양한 작업을 수행할 수 있습니다.

## 💻 CRUD 연산 예제

### 1. Create (생성)

```json
// ID를 지정하여 생성
PUT /books/_doc/1
{
  "title": "ElasticSearch 완벽 가이드",
  "author": "김개발",
  "price": 35000,
  "published_date": "2024-01-15",
  "tags": ["검색엔진", "빅데이터", "실습"]
}

// 자동 ID 생성
POST /books/_doc
{
  "title": "실전 ElasticSearch",
  "author": "이코딩",
  "price": 28000
}

// 이미 존재하는 경우 실패하도록 설정
PUT /books/_create/2
{
  "title": "ElasticSearch 입문",
  "author": "박초보"
}
```

### 2. Read (조회)

```json
// ID로 단일 도큐먼트 조회
GET /books/_doc/1

// 특정 필드만 조회
GET /books/_doc/1?_source=title,price

// 여러 도큐먼트 한 번에 조회 (Multi Get)
GET /_mget
{
  "docs": [
    { "_index": "books", "_id": "1" },
    { "_index": "books", "_id": "2" }
  ]
}

// 도큐먼트 존재 확인
HEAD /books/_doc/1
```

### 3. Update (수정)

```json
// 전체 도큐먼트 교체
PUT /books/_doc/1
{
  "title": "ElasticSearch 완벽 가이드 개정판",
  "author": "김개발",
  "price": 38000,
  "published_date": "2024-06-01",
  "tags": ["검색엔진", "빅데이터", "실습", "개정판"]
}

// 부분 업데이트
POST /books/_update/1
{
  "doc": {
    "price": 40000,
    "discount": 10
  }
}

// 스크립트를 이용한 업데이트
POST /books/_update/1
{
  "script": {
    "source": "ctx._source.price *= params.discount_rate",
    "params": {
      "discount_rate": 0.9
    }
  }
}

// 없으면 생성, 있으면 업데이트 (Upsert)
POST /books/_update/3
{
  "doc": {
    "title": "NoSQL 기초",
    "price": 25000
  },
  "upsert": {
    "title": "NoSQL 기초",
    "author": "최데이터",
    "price": 25000,
    "created": "2024-01-20"
  }
}
```

### 4. Delete (삭제)

```json
// 단일 도큐먼트 삭제
DELETE /books/_doc/1

// 쿼리로 삭제
POST /books/_delete_by_query
{
  "query": {
    "range": {
      "price": {
        "lt": 20000
      }
    }
  }
}

// 인덱스 전체 삭제
DELETE /books
```

### 5. Bulk (벌크 연산)

```json
// 벌크 API로 여러 작업 한 번에 수행
POST /_bulk
{ "index": { "_index": "books", "_id": "10" } }
{ "title": "Spring Boot 실전", "price": 32000 }
{ "update": { "_index": "books", "_id": "1" } }
{ "doc": { "price": 35000 } }
{ "delete": { "_index": "books", "_id": "2" } }

// 특정 인덱스에 대한 벌크 작업
POST /books/_bulk
{ "index": { "_id": "20" } }
{ "title": "Kafka 완벽 가이드", "price": 40000 }
{ "index": { "_id": "21" } }
{ "title": "Redis 핵심 정리", "price": 28000 }
```

## ⚡ 실전 활용

### 버전 관리

```json
// 버전 확인
GET /books/_doc/1

// 특정 버전에서만 업데이트
PUT /books/_doc/1?version=5&version_type=external
{
  "title": "업데이트된 제목"
}
```

### 성능 최적화 팁

- **벌크 사용**: 여러 작업은 벌크 API로 처리
- **적절한 벌크 크기**: 5-15MB 권장
- **리프레시 제어**: 대량 인덱싱 시 리프레시 비활성화

```json
// 리프레시 비활성화
PUT /books/_settings
{
  "refresh_interval": "-1"
}

// 작업 완료 후 수동 리프레시
POST /books/_refresh
```

### 주의사항

- 도큐먼트 ID는 512바이트 제한
- 벌크 요청은 HTTP 요청 크기 제한 고려
- 삭제된 도큐먼트는 즉시 디스크에서 제거되지 않음

### 베스트 프랙티스

- ID는 의미 있는 값 사용 (예: 상품코드)
- 벌크 작업 시 에러 처리 로직 구현
- 중요한 작업은 버전 관리 활용

## 🔗 관련 주제

- [[ElasticSearch 3 : 기본 개념]]
- [[ElasticSearch 5 : 검색 기초]]
- [[ElasticSearch 9 : 성능 최적화]]
- [[RESTful API 설계]]

## 📚 참고 자료

- [ElasticSearch Document APIs](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs.html)
- [Bulk API 가이드](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html)
- [Optimistic Concurrency Control](https://www.elastic.co/guide/en/elasticsearch/reference/current/optimistic-concurrency-control.html)