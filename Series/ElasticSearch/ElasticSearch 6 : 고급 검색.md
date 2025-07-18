# ElasticSearch 6 : 고급 검색

## 📌 핵심 요약

> 한 문장으로: 복잡한 검색 요구사항을 처리하기 위한 고급 쿼리 기법과 검색 결과를 최적화하는 방법을 학습합니다.

## 🎯 학습 목표

- [ ] 복잡한 쿼리 조합과 중첩 쿼리 이해하기
- [ ] 정렬과 페이징 구현하기
- [ ] 하이라이팅으로 검색 결과 강조하기
- [ ] 스코어링 메커니즘 이해하고 조정하기

## 🤔 왜 중요한가요?

실제 서비스에서는 단순 검색보다 복잡한 검색 요구사항이 많습니다. 고급 검색 기능을 활용하면 사용자 경험을 크게 향상시킬 수 있습니다.

## 📖 개념 설명

### 간단한 비유

고급 검색을 도서관 사서의 능력으로 비유하면:

- **중첩 쿼리**: 책 속의 특정 챕터 안에서만 검색
- **정렬**: 인기도순, 최신순으로 책 정렬
- **하이라이팅**: 찾은 단어에 형광펜 표시
- **스코어 부스팅**: 특정 섹션의 책에 가중치 부여

### 기술적 설명

ElasticSearch의 고급 검색 기능은 복잡한 비즈니스 로직을 쿼리로 표현할 수 있게 해줍니다. 중첩된 문서 구조, 관련성 스코어 조정, 결과 하이라이팅 등을 지원합니다.

## 💻 고급 검색 예제

### 1. 중첩 쿼리 (Nested Query)

```json
// 중첩 문서 구조 매핑
PUT /orders
{
  "mappings": {
    "properties": {
      "order_id": { "type": "keyword" },
      "items": {
        "type": "nested",
        "properties": {
          "product_name": { "type": "text" },
          "quantity": { "type": "integer" },
          "price": { "type": "float" }
        }
      }
    }
  }
}

// 중첩 쿼리 실행
GET /orders/_search
{
  "query": {
    "nested": {
      "path": "items",
      "query": {
        "bool": {
          "must": [
            { "match": { "items.product_name": "노트북" } },
            { "range": { "items.price": { "gte": 1000000 } } }
          ]
        }
      }
    }
  }
}
```

### 2. 정렬 (Sorting)

```json
// 단일 필드 정렬
GET /products/_search
{
  "query": { "match_all": {} },
  "sort": [
    { "price": { "order": "asc" } }
  ]
}

// 다중 필드 정렬
GET /products/_search
{
  "query": { "match": { "category": "노트북" } },
  "sort": [
    { "popularity": { "order": "desc" } },
    { "price": { "order": "asc" } },
    "_score"
  ]
}

// 지리적 정렬
GET /stores/_search
{
  "query": { "match_all": {} },
  "sort": [
    {
      "_geo_distance": {
        "location": {
          "lat": 37.5665,
          "lon": 126.9780
        },
        "order": "asc",
        "unit": "km"
      }
    }
  ]
}
```

### 3. 페이징 (Pagination)

```json
// From/Size 방식
GET /products/_search
{
  "query": { "match_all": {} },
  "from": 20,
  "size": 10,
  "sort": [{ "created_at": "desc" }]
}

// Search After 방식 (대용량 데이터)
GET /products/_search
{
  "query": { "match_all": {} },
  "size": 10,
  "sort": [
    { "created_at": "desc" },
    { "_id": "asc" }
  ],
  "search_after": ["2024-01-15T10:00:00", "product_123"]
}

// Scroll API (전체 데이터 추출)
POST /products/_search?scroll=1m
{
  "size": 1000,
  "query": { "match_all": {} }
}
```

### 4. 하이라이팅 (Highlighting)

```json
// 기본 하이라이팅
GET /articles/_search
{
  "query": {
    "match": { "content": "ElasticSearch" }
  },
  "highlight": {
    "fields": {
      "content": {}
    }
  }
}

// 커스텀 하이라이팅
GET /articles/_search
{
  "query": {
    "match": { "content": "검색엔진" }
  },
  "highlight": {
    "pre_tags": ["<mark>"],
    "post_tags": ["</mark>"],
    "fields": {
      "content": {
        "fragment_size": 150,
        "number_of_fragments": 3,
        "type": "unified"
      },
      "title": {
        "number_of_fragments": 0
      }
    }
  }
}
```

### 5. 스코어 조정 (Score Boosting)

```json
// 필드별 부스팅
GET /products/_search
{
  "query": {
    "multi_match": {
      "query": "갤럭시",
      "fields": ["name^3", "description", "tags^2"]
    }
  }
}

// Function Score Query
GET /products/_search
{
  "query": {
    "function_score": {
      "query": { "match": { "name": "노트북" } },
      "functions": [
        {
          "filter": { "term": { "brand": "Samsung" } },
          "weight": 2
        },
        {
          "field_value_factor": {
            "field": "popularity",
            "factor": 1.2,
            "modifier": "sqrt"
          }
        },
        {
          "decay": {
            "created_at": {
              "origin": "now",
              "scale": "30d",
              "decay": 0.5
            }
          }
        }
      ],
      "boost_mode": "multiply"
    }
  }
}
```

### 6. 검색 제안 (Suggest)

```json
// Term Suggester
GET /products/_search
{
  "suggest": {
    "text": "삼성 갤럭스",
    "my-suggestion": {
      "term": {
        "field": "name"
      }
    }
  }
}

// Completion Suggester (자동완성)
GET /products/_search
{
  "_source": false,
  "suggest": {
    "product-suggest": {
      "prefix": "갤럭",
      "completion": {
        "field": "name_suggest",
        "size": 5,
        "fuzzy": {
          "fuzziness": 1
        }
      }
    }
  }
}
```

## ⚡ 실전 활용

### 검색 결과 최적화 전략

```json
// 종합적인 검색 쿼리 예시
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "multi_match": {
            "query": "게이밍 노트북",
            "fields": ["name^3", "description", "category^2"],
            "type": "best_fields"
          }
        }
      ],
      "filter": [
        { "range": { "price": { "gte": 1000000, "lte": 3000000 } } },
        { "term": { "in_stock": true } }
      ],
      "should": [
        { "term": { "brand": { "value": "ASUS", "boost": 2 } } },
        { "range": { "rating": { "gte": 4.5, "boost": 1.5 } } }
      ]
    }
  },
  "sort": [
    "_score",
    { "popularity": { "order": "desc" } }
  ],
  "from": 0,
  "size": 20,
  "highlight": {
    "fields": {
      "name": {},
      "description": { "fragment_size": 200 }
    }
  },
  "_source": ["name", "price", "brand", "rating", "image_url"]
}
```

### 성능 고려사항

- 깊은 페이징은 피하고 Search After 사용
- 불필요한 필드는 _source에서 제외
- 캐시 가능한 필터는 filter context 사용
- 복잡한 스코어링은 성능에 영향

### 베스트 프랙티스

- 사용자 검색 패턴 분석하여 부스팅 조정
- A/B 테스트로 검색 품질 개선
- 검색 로그 분석으로 제안 기능 개선
- 적절한 타임아웃 설정

## 🔗 관련 주제

- [[ElasticSearch 5 : 검색 기초]]
- [[ElasticSearch 7 : 집계(Aggregation)]]
- [[ElasticSearch 8 : 매핑과 분석기]]
- [[검색 UX 디자인]]

## 📚 참고 자료

- [ElasticSearch Sorting](https://www.elastic.co/guide/en/elasticsearch/reference/current/sort-search-results.html)
- [Highlighting](https://www.elastic.co/guide/en/elasticsearch/reference/current/highlighting.html)
- [Function Score Query](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-function-score-query.html)