# ElasticSearch 7 : 집계(Aggregation)

## 📌 핵심 요약

> 한 문장으로: ElasticSearch의 집계 기능을 사용하여 데이터를 분석하고 통계를 생성하는 방법을 학습합니다.

## 🎯 학습 목표

- [ ] 메트릭 집계로 통계 데이터 추출하기
- [ ] 버킷 집계로 데이터 그룹화하기
- [ ] 파이프라인 집계로 집계 결과 재처리하기
- [ ] 실전 데이터 분석 시나리오 구현하기

## 🤔 왜 중요한가요?

집계는 단순 검색을 넘어 데이터 분석과 인사이트 도출을 가능하게 합니다. 실시간 대시보드, 리포트 생성, 데이터 시각화 등에 필수적입니다.

## 📖 개념 설명

### 간단한 비유

집계를 매출 분석으로 비유하면:

- **메트릭 집계**: 총 매출액, 평균 구매액 계산
- **버킷 집계**: 월별, 카테고리별로 매출 분류
- **파이프라인 집계**: 전월 대비 성장률 계산
- **중첩 집계**: 카테고리별 월별 평균 매출 분석

### 기술적 설명

ElasticSearch의 집계는 크게 세 가지로 분류됩니다:

1. **Metrics Aggregations**: 숫자 값 계산 (sum, avg, min, max 등)
2. **Bucket Aggregations**: 도큐먼트를 버킷으로 그룹화
3. **Pipeline Aggregations**: 다른 집계의 결과를 입력으로 사용

## 💻 집계 예제

### 1. 메트릭 집계 (Metrics Aggregations)

```json
// 기본 통계
GET /sales/_search
{
  "size": 0,
  "aggs": {
    "total_revenue": {
      "sum": { "field": "amount" }
    },
    "average_order": {
      "avg": { "field": "amount" }
    },
    "max_order": {
      "max": { "field": "amount" }
    },
    "min_order": {
      "min": { "field": "amount" }
    }
  }
}

// Stats 집계 (한 번에 여러 통계)
GET /sales/_search
{
  "size": 0,
  "aggs": {
    "order_stats": {
      "stats": { "field": "amount" }
    }
  }
}

// Extended Stats (확장 통계)
GET /sales/_search
{
  "size": 0,
  "aggs": {
    "order_extended_stats": {
      "extended_stats": { "field": "amount" }
    }
  }
}

// Cardinality (고유값 개수)
GET /sales/_search
{
  "size": 0,
  "aggs": {
    "unique_customers": {
      "cardinality": { "field": "customer_id" }
    }
  }
}

// Percentiles (백분위수)
GET /products/_search
{
  "size": 0,
  "aggs": {
    "price_percentiles": {
      "percentiles": {
        "field": "price",
        "percents": [25, 50, 75, 95, 99]
      }
    }
  }
}
```

### 2. 버킷 집계 (Bucket Aggregations)

```json
// Terms 집계 (카테고리별 그룹화)
GET /sales/_search
{
  "size": 0,
  "aggs": {
    "sales_by_category": {
      "terms": {
        "field": "category.keyword",
        "size": 10
      },
      "aggs": {
        "total_revenue": {
          "sum": { "field": "amount" }
        }
      }
    }
  }
}

// Date Histogram (시계열 분석)
GET /sales/_search
{
  "size": 0,
  "aggs": {
    "sales_over_time": {
      "date_histogram": {
        "field": "date",
        "calendar_interval": "month",
        "format": "yyyy-MM"
      },
      "aggs": {
        "monthly_revenue": {
          "sum": { "field": "amount" }
        },
        "unique_customers": {
          "cardinality": { "field": "customer_id" }
        }
      }
    }
  }
}

// Range 집계 (범위별 그룹화)
GET /products/_search
{
  "size": 0,
  "aggs": {
    "price_ranges": {
      "range": {
        "field": "price",
        "ranges": [
          { "to": 50000, "key": "저가" },
          { "from": 50000, "to": 200000, "key": "중가" },
          { "from": 200000, "key": "고가" }
        ]
      },
      "aggs": {
        "product_count": {
          "value_count": { "field": "product_id" }
        }
      }
    }
  }
}

// Histogram (히스토그램)
GET /sales/_search
{
  "size": 0,
  "aggs": {
    "amount_distribution": {
      "histogram": {
        "field": "amount",
        "interval": 100000
      }
    }
  }
}
```

### 3. 중첩 집계 (Nested Aggregations)

```json
// 다단계 집계
GET /sales/_search
{
  "size": 0,
  "aggs": {
    "by_category": {
      "terms": {
        "field": "category.keyword"
      },
      "aggs": {
        "by_month": {
          "date_histogram": {
            "field": "date",
            "calendar_interval": "month"
          },
          "aggs": {
            "monthly_revenue": {
              "sum": { "field": "amount" }
            },
            "avg_order_value": {
              "avg": { "field": "amount" }
            }
          }
        }
      }
    }
  }
}

// Filter 집계와 조합
GET /sales/_search
{
  "size": 0,
  "aggs": {
    "premium_customers": {
      "filter": {
        "range": {
          "total_spent": { "gte": 1000000 }
        }
      },
      "aggs": {
        "avg_order": {
          "avg": { "field": "amount" }
        },
        "favorite_categories": {
          "terms": {
            "field": "category.keyword",
            "size": 5
          }
        }
      }
    }
  }
}
```

### 4. 파이프라인 집계 (Pipeline Aggregations)

```json
// Moving Average (이동평균)
GET /sales/_search
{
  "size": 0,
  "aggs": {
    "sales_per_month": {
      "date_histogram": {
        "field": "date",
        "calendar_interval": "month"
      },
      "aggs": {
        "revenue": {
          "sum": { "field": "amount" }
        },
        "moving_avg_revenue": {
          "moving_avg": {
            "buckets_path": "revenue",
            "window": 3
          }
        }
      }
    }
  }
}

// Derivative (변화율)
GET /sales/_search
{
  "size": 0,
  "aggs": {
    "sales_per_day": {
      "date_histogram": {
        "field": "date",
        "calendar_interval": "day"
      },
      "aggs": {
        "daily_revenue": {
          "sum": { "field": "amount" }
        },
        "revenue_change": {
          "derivative": {
            "buckets_path": "daily_revenue"
          }
        }
      }
    }
  }
}

// Bucket Script (버킷 간 계산)
GET /sales/_search
{
  "size": 0,
  "aggs": {
    "monthly_analysis": {
      "date_histogram": {
        "field": "date",
        "calendar_interval": "month"
      },
      "aggs": {
        "total_sales": {
          "sum": { "field": "amount" }
        },
        "total_orders": {
          "value_count": { "field": "order_id" }
        },
        "avg_order_value": {
          "bucket_script": {
            "buckets_path": {
              "sales": "total_sales",
              "orders": "total_orders"
            },
            "script": "params.sales / params.orders"
          }
        }
      }
    }
  }
}
```

### 5. 실전 분석 예제

```json
// 종합 대시보드 데이터
GET /ecommerce/_search
{
  "size": 0,
  "query": {
    "range": {
      "date": {
        "gte": "now-30d",
        "lte": "now"
      }
    }
  },
  "aggs": {
    "total_metrics": {
      "stats": { "field": "amount" }
    },
    "daily_trend": {
      "date_histogram": {
        "field": "date",
        "calendar_interval": "day",
        "format": "yyyy-MM-dd"
      },
      "aggs": {
        "revenue": {
          "sum": { "field": "amount" }
        },
        "orders": {
          "value_count": { "field": "order_id" }
        }
      }
    },
    "top_products": {
      "terms": {
        "field": "product_id",
        "size": 10,
        "order": { "product_revenue": "desc" }
      },
      "aggs": {
        "product_revenue": {
          "sum": { "field": "amount" }
        },
        "product_name": {
          "top_hits": {
            "size": 1,
            "_source": ["product_name"]
          }
        }
      }
    },
    "customer_segments": {
      "range": {
        "field": "customer_total_spent",
        "ranges": [
          { "to": 100000, "key": "Bronze" },
          { "from": 100000, "to": 500000, "key": "Silver" },
          { "from": 500000, "key": "Gold" }
        ]
      },
      "aggs": {
        "segment_value": {
          "sum": { "field": "amount" }
        }
      }
    }
  }
}
```

## ⚡ 실전 활용

### 성능 최적화

- `size: 0` 사용하여 불필요한 도큐먼트 반환 방지
- 필요한 필드만 집계
- 적절한 샤드 수 설정
- 캐시 활용

### 주의사항

- 높은 카디널리티 필드의 terms 집계는 메모리 사용량 증가
- 깊은 중첩 집계는 성능 저하 가능
- 적절한 타임아웃 설정 필요

### 베스트 프랙티스

- 집계 결과 캐싱 고려
- 사전 집계된 데이터 활용
- 적절한 시간 단위 선택
- 필터링으로 데이터 범위 제한

## 🔗 관련 주제

- [[ElasticSearch 5 : 검색 기초]]
- [[ElasticSearch 6 : 고급 검색]]
- [[ElasticSearch 9 : 성능 최적화]]
- [[데이터 시각화]]

## 📚 참고 자료

- [Aggregations 공식 문서](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations.html)
- [Pipeline Aggregations](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-pipeline.html)
- [Aggregation Performance](https://www.elastic.co/guide/en/elasticsearch/reference/current/tune-for-search-speed.html#tune-for-search-speed-aggregations)