# ElasticSearch 1 : 개요

## 📌 핵심 요약

> 한 문장으로: ElasticSearch는 대용량 데이터에서 빠른 검색과 분석을 가능하게 하는 분산형 검색 엔진입니다.

## 🎯 학습 목표

- [ ] ElasticSearch가 무엇인지 이해하기
- [ ] 왜 ElasticSearch를 사용하는지 설명할 수 있기
- [ ] ElasticSearch의 핵심 특징 파악하기
- [ ] 실제 사용 사례를 통해 활용 방법 이해하기

## 🤔 왜 중요한가요?

현대 애플리케이션에서 검색 기능은 필수입니다. 사용자는 수백만 건의 데이터에서도 원하는 정보를 즉시 찾기를 원합니다. 전통적인 데이터베이스의 LIKE 검색으로는 한계가 있죠. ElasticSearch는 이런 문제를 해결하는 강력한 도구입니다.

## 📖 개념 설명

### 간단한 비유

ElasticSearch를 도서관의 사서로 생각해보세요:

- **전통적인 DB**: 책을 한 권씩 펼쳐보며 원하는 내용 찾기
- **ElasticSearch**: 모든 책의 색인을 미리 만들어 두고, "이 단어가 들어간 책" 즉시 찾기

### 기술적 설명

ElasticSearch는 Apache Lucene 기반의 오픈소스 분산 검색 엔진입니다. RESTful API를 제공하며, JSON 문서를 저장하고 실시간으로 검색할 수 있습니다.

핵심 특징:

- **분산 처리**: 여러 노드에 데이터를 분산 저장
- **실시간 검색**: 데이터 인덱싱 즉시 검색 가능
- **풀텍스트 검색**: 형태소 분석, 동의어 처리 등
- **집계 기능**: 데이터 분석 및 통계 제공

## 💻 간단한 예제

```bash
# 문서 추가 (색인)
PUT /products/_doc/1
{
  "name": "삼성 갤럭시 S24",
  "category": "스마트폰",
  "price": 1200000
}

# 검색
GET /products/_search
{
  "query": {
    "match": {
      "name": "갤럭시"
    }
  }
}
```

## ⚡ 실전 활용

### 사용 시나리오

- **전자상거래**: 상품 검색, 추천 시스템
- **로그 분석**: 시스템 로그 수집 및 분석 (ELK Stack)
- **콘텐츠 플랫폼**: 게시글, 댓글 검색
- **위치 기반 서비스**: 지도에서 장소 검색

### 주의사항

- 실시간 트랜잭션이 중요한 곳에는 부적합
- 메모리 사용량이 많음
- 복잡한 관계형 데이터에는 비효율적

### 베스트 프랙티스

- 적절한 샤드 개수 설정
- 매핑 최적화로 인덱스 크기 관리
- 불필요한 필드는 인덱싱하지 않기

## 🔗 관련 주제

- [[ElasticSearch 2 : 설치 및 환경 구성]]
- [[ElasticSearch 3 : 기본 개념]]
- [[Redis]] - 캐싱과의 차이점
- [[DB 트랜잭션과 메세지 발행을 동기화하는 방법]] - 검색 인덱스 동기화

## 📚 참고 자료

- [ElasticSearch 공식 문서](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [ElasticSearch 한국어 가이드](https://esbook.kimjmin.net/)
- [ELK Stack 소개](https://www.elastic.co/kr/what-is/elk-stack)
