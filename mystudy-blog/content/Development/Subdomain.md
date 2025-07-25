# 서브 도메인 구축 경험 및 개념 정리

회사 업무를 하던 중,  GS 인증 시험을 위해  라이브 서비스를 하고 있는 서버 이외에 별도의 서버를 하나 구축해야할 일이 있었다. 약 2주 간의 시험을 위한 서버로 공개 IP를 이용하려고 하였는데, HTTPS 설정도 필요하여 도메인을 붙일 필요가 있었다. 그러던 중 우리가 소유하고 있는 도메인의 서브 도메인을 활용하면, 별도의 추가 작업없이 매우 간단하게 새 도메인을 붙일 수 있다는 것을 알았다.

## 서브 도메인

도메인 네임 시스템(DNS)에서 **서브도메인(subdomain)**은 기본 도메인(Second-Level Domain, 예: example.com)의 앞에 붙는 추가적인 계층으로, 특정 서비스나 구역을 논리적으로 분리·관리하기 위해 사용된다.

- **구조**
  - 인터넷 주소는 `호스트명.도메인명.최상위도메인` 형태로 계층화되어 있고, 이 중 최상위(Top-Level Domain, TLD)는 `.com`, `.org`, `.kr` 등이며, 그 바로 앞이 두 번째 계층(Second-Level Domain)이다.
  - 이보다 앞에 붙는 세 번째 계층이 바로 서브 도메인이다. (더 깊은 계층도 가능하니 `a.b.example.com`처럼 네 번째, 다섯 번째 계층도 만들 수 있다.)

    ```text
    ┌────────────┐ ┌───────────┐ ┌───────────────┐
    │ 서브도메인  │ │  도메인명  │ │  최상위도메인  │
    └────────────┘ └───────────┘ └───────────────┘
        blog         example        com
    ```

- **설정 방식**
  - DNS 관리자(호스팅 서비스나 네임서버)에서 A 레코드 또는 CNAME 레코드를 추가하여 서브도메인을 원하는 IP나 다른 도메인에 매핑한다.
  - 예) `blog.example.com → A 레코드: 203.0.113.10`

      `shop.example.com → CNAME 레코드: shop.myshopplatform.com`

- **활용 예시**
  - **서비스 분리**: `api.example.com` (API 서버), `shop.example.com` (쇼핑몰), `blog.example.com` (블로그)
  - **환경 분리**: `dev.example.com`, `staging.example.com`, `prod.example.com`
  - **다국어 사이트**: `en.example.com`, `jp.example.com`, `kr.example.com`
  - **특정 기능 전용**: `mail.example.com` (메일), `ftp.example.com` (FTP)
- **서브디렉토리(/)와의 차이**
  - 서브디렉토리(`example.com/blog`)는 웹 서버 내부 경로로 분리하며, 하나의 호스트에서 URI 구조로 구분
  - 서브도메인(`blog.example.com`)은 DNS 단계에서 별도 호스트로 분리하므로, 서버·서비스 구성이나 SSL 인증서 적용 등을 독립적으로 관리할 수 있음

---

**정리**하자면, 서브도메인은 도메인 네임의 계층 구조에서 ‘별도의 호스트 또는 서비스’를 정의하기 위해 최상위·기본 도메인 앞에 붙이는 이름이며, DNS 레코드 설정만으로 손쉽게 여러 서비스나 환경을 독립적으로 운영·관리할 수 있다는 장점이 있다.
