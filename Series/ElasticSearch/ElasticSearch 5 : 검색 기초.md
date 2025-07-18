# ElasticSearch 5 : 검색 기초

## 📌 핵심 요약

> 한 문장으로: Query DSL을 사용하여 ElasticSearch에서 원하는 데이터를 정확하고 효율적으로 검색하는 방법을 배웁니다.

## 🎯 학습 목표

- [ ] Query DSL의 기본 구조 이해하기
- [ ] Match, Term 등 기본 쿼리 사용하기
- [ ] Bool 쿼리로 복잡한 조건 조합하기
- [ ] 쿼리와 필터의 차이점 파악하기

## 🤔 왜 중요한가요?

ElasticSearch의 핵심은 강력한 검색 기능입니다. Query DSL을 마스터하면 복잡한 검색 요구사항도 쉽게 구현할 수 있으며, 성능도 최적화할 수 있습니다.

## 📖 개념 설명

### 간단한 비유

검색 쿼리를 온라인 쇼핑몰 검색으로 비유하면:

- **Match Query**: "노트북" 검색 (유사한 것도 포함)
- **Term Query**: 정확히 "Samsung" 브랜드만
- **Range Query**: 100만원 ~ 200만원 사이
- **Bool Query**: 위 조건들을 AND/OR로 조합

### 기술적 설명

Query DSL(Domain Specific Language)은 JSON 기반의 쿼리 언어입니다. 크게 두 가지 컨텍스트로 나뉩니다:

- **Query Context**: 얼마나 잘 매칭되는지 (스코어 계산)
- **Filter Context**: 매칭 여부만 판단 (스코어 계산 안 함)

## 💻 검색 쿼리 예제

### 1. Match Query (전문 검색)

```json
// 단일 필드 검색
GET /products/_search
{
  "query": {
    "match": {
      "description": "스마트폰"
    }
  }
}

// 여러 단어 검색 (OR)
GET /products/_search
{
  "query": {
    "match": {
      "description": "삼성 갤럭시"
    }
  }
}

// AND 조건으로 검색
GET /products/_search
{
  "query": {
    "match": {
      "description": {
        "query": "삼성 갤럭시",
        "operator": "and"
      }
    }
  }
}

// 여러 필드 동시 검색
GET /products/_search
{
  "query": {
    "multi_match": {
      "query": "갤럭시",
      "fields": ["name", "description", "brand"]
    }
  }
}
```

### 2. Term Query (정확한 검색)

```json
// 정확한 값 매칭
GET /products/_search
{
  "query": {
    "term": {
      "brand.keyword": "Samsung"
    }
  }
}

// 여러 값 중 하나와 매칭
GET /products/_search
{
  "query": {
    "terms": {
      "category": ["스마트폰", "태블릿", "노트북"]
    }
  }
}
```

### 3. Range Query (범위 검색)

```json
// 가격 범위 검색
GET /products/_search
{
  "query": {
    "range": {
      "price": {
        "gte": 500000,
        "lte": 1500000
      }
    }
  }
}

// 날짜 범위 검색
GET /orders/_search
{
  "query": {
    "range": {
      "created_at": {
        "gte": "2024-01-01",
        "lte": "2024-01-31",
        "format": "yyyy-MM-dd"
      }
    }
  }
}

// 상대적 시간 검색
GET /logs/_search
{
  "query": {
    "range": {
      "timestamp": {
        "gte": "now-7d",
        "lte": "now"
      }
    }
  }
}
```

### 4. Bool Query (복합 검색)

```json
// 여러 조건 조합
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "노트북" } }
      ],
      "filter": [
        { "term": { "brand.keyword": "Samsung" } },
        { "range": { "price": { "lte": 2000000 } } }
      ],
      "should": [
        { "match": { "description": "게이밍" } },
        { "match": { "description": "고성능" } }
      ],
      "must_not": [
        { "term": { "status": "discontinued" } }
      ]
    }
  }
}

// must와 should 조합
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "category": "노트북" } }
      ],
      "should": [
        { "term": { "brand.keyword": "Apple" } },
        { "term": { "brand.keyword": "Samsung" } }
      ],
      "minimum_should_match": 1
    }
  }
}
```

### 5. 기타 유용한 쿼리

```json
// Wildcard 검색
GET /products/_search
{
  "query": {
    "wildcard": {
      "name": "갤럭시*"
    }
  }
}

// Prefix 검색
GET /products/_search
{
  "query": {
    "prefix": {
      "name": "아이"
    }
  }
}

// Exists 검색 (필드 존재 여부)
GET /products/_search
{
  "query": {
    "exists": {
      "field": "discount"
    }
  }
}
```

## ⚡ 실전 활용

### Query vs Filter 선택 기준

**Query Context 사용**:
- 검색 결과의 관련성이 중요할 때
- 스코어링이 필요한 검색

**Filter Context 사용**:
- 단순 필터링 (예: 카테고리, 상태)
- 범위 검색
- 캐싱을 활용한 성능 향상

### 검색 성능 최적화

```json
// Filter를 활용한 최적화
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "노트북" } }  // 스코어 계산
      ],
      "filter": [  // 캐싱되어 빠름
        { "term": { "status": "active" } },
        { "range": { "stock": { "gt": 0 } } }
      ]
    }
  }
}
```

### 주의사항

- text 필드는 분석되므로 Term Query 사용 시 주의
- keyword 필드는 정확한 매칭에 사용
- 와일드카드 검색은 성능에 영향을 줄 수 있음

### 베스트 프랙티스

- 가능한 Filter Context 활용
- 필요한 필드만 반환 (_source 필터링)
- 적절한 분석기 설정
- 자주 사용하는 쿼리는 템플릿화

## 🔗 관련 주제

- [[ElasticSearch 4 : CRUD 연산]]
- [[ElasticSearch 6 : 고급 검색]]
- [[ElasticSearch 8 : 매핑과 분석기]]
- [[검색 엔진 최적화]]

## 📚 참고 자료

- [Query DSL 공식 문서](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)
- [Query and Filter Context](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-filter-context.html)
- [ElasticSearch 검색 최적화](https://www.elastic.co/guide/en/elasticsearch/reference/current/tune-for-search-speed.html)