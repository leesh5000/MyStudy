# ElasticSearch 3 : 기본 개념

## 📌 핵심 요약

> 한 문장으로: ElasticSearch의 핵심 구성 요소인 인덱스, 도큐먼트, 샤드를 이해하고 데이터가 어떻게 저장되고 관리되는지 배웁니다.

## 🎯 학습 목표

- [ ] 인덱스와 도큐먼트의 관계 이해하기
- [ ] 샤드와 레플리카의 역할 파악하기
- [ ] 노드와 클러스터 구조 이해하기
- [ ] 매핑과 데이터 타입 활용하기

## 🤔 왜 중요한가요?

ElasticSearch를 효과적으로 사용하려면 데이터가 어떻게 저장되고 분산되는지 이해해야 합니다. 이러한 기본 개념은 성능 최적화와 문제 해결의 기초가 됩니다.

## 📖 개념 설명

### 간단한 비유

ElasticSearch의 구조를 도서관으로 비유해보면:

- **클러스터**: 도서관 전체
- **노드**: 도서관의 각 층
- **인덱스**: 책의 카테고리 (소설, 과학, 역사 등)
- **도큐먼트**: 개별 책
- **샤드**: 책장 (카테고리를 여러 책장에 나눠 보관)

### 기술적 설명

#### 1. 인덱스 (Index)

관련된 도큐먼트들의 모음입니다. RDB의 데이터베이스와 유사한 개념입니다.

```json
// 인덱스 생성
PUT /my_index
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  }
}
```

#### 2. 도큐먼트 (Document)

JSON 형태의 데이터 단위입니다. RDB의 행(row)과 유사합니다.

```json
// 도큐먼트 예시
{
  "_index": "products",
  "_id": "1",
  "_source": {
    "name": "노트북",
    "price": 1500000,
    "category": "전자제품"
  }
}
```

#### 3. 샤드와 레플리카

- **샤드**: 인덱스를 여러 조각으로 나눈 것
- **레플리카**: 샤드의 복제본

```json
// 샤드와 레플리카 설정
PUT /my_index
{
  "settings": {
    "number_of_shards": 5,      // 주 샤드 5개
    "number_of_replicas": 2     // 각 샤드당 2개 복제본
  }
}
```

#### 4. 매핑 (Mapping)

도큐먼트의 필드와 데이터 타입을 정의합니다.

```json
// 매핑 정의
PUT /my_index
{
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "price": { "type": "integer" },
      "created_at": { "type": "date" },
      "is_active": { "type": "boolean" },
      "tags": { "type": "keyword" }
    }
  }
}
```

## 💻 실습 예제

### 1. 클러스터 상태 확인

```bash
# 클러스터 정보
GET /_cluster/health

# 노드 정보
GET /_nodes

# 인덱스 목록
GET /_cat/indices?v
```

### 2. 인덱스 생성과 매핑

```json
// 상품 인덱스 생성
PUT /products
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1
  },
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword"
          }
        }
      },
      "description": {
        "type": "text"
      },
      "price": {
        "type": "float"
      },
      "stock": {
        "type": "integer"
      },
      "created_at": {
        "type": "date"
      },
      "categories": {
        "type": "keyword"
      }
    }
  }
}
```

### 3. 도큐먼트 추가

```json
// 단일 도큐먼트 추가
POST /products/_doc/1
{
  "name": "삼성 노트북",
  "description": "고성능 비즈니스 노트북",
  "price": 1500000,
  "stock": 10,
  "created_at": "2024-01-15",
  "categories": ["전자제품", "컴퓨터"]
}

// 자동 ID 생성
POST /products/_doc
{
  "name": "LG 모니터",
  "price": 300000
}
```

### 4. 매핑 확인

```bash
# 인덱스 매핑 확인
GET /products/_mapping

# 특정 필드 매핑 확인
GET /products/_mapping/field/name
```

## ⚡ 실전 활용

### 데이터 타입 선택 가이드

- **text**: 전문 검색이 필요한 필드 (설명, 리뷰)
- **keyword**: 정확한 매칭이 필요한 필드 (ID, 카테고리)
- **integer/float**: 숫자 연산이 필요한 필드
- **date**: 시간 기반 검색이 필요한 필드
- **boolean**: 참/거짓 필터링

### 샤드 설정 권장사항

- 샤드당 크기: 10-50GB 권장
- 노드당 샤드 수: 노드당 힙 메모리 1GB당 20개 이하
- 레플리카: 최소 1개 이상 (고가용성)

### 주의사항

- 샤드 수는 인덱스 생성 후 변경 불가
- 과도한 샤드는 오버헤드 증가
- 매핑은 필드 추가만 가능, 타입 변경 불가

## 🔗 관련 주제

- [[ElasticSearch 2 : 설치 및 환경 구성]]
- [[ElasticSearch 4 : CRUD 연산]]
- [[ElasticSearch 8 : 매핑과 분석기]]
- [[분산 시스템 기초]]

## 📚 참고 자료

- [ElasticSearch 인덱스 관리](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices.html)
- [매핑 파라미터 가이드](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-params.html)
- [샤드 배치 이해하기](https://www.elastic.co/guide/en/elasticsearch/reference/current/scalability.html)