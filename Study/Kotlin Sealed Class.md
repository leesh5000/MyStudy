**Sealed Class**는 `제한된 클래스 계층 구조를 만들기 위한 Kotlin의 특별한 클래스`입니다. 해당 클래스를 상속받을 수 있는 서브클래스들이 컴파일 타임에 모두 정해져 있어, 런타임에 새로운 서브클래스가 추가될 수 없는 "봉인된" 클래스입니다.

## 동작 방식과 원리

Sealed Class는 다음과 같은 방식으로 동작합니다:

**컴파일 타임 제한**: 컴파일러가 모든 가능한 서브클래스를 미리 알고 있어서, when 표현식에서 모든 경우를 다뤘는지 검증할 수 있습니다.

**상속 제한**: Sealed Class와 그 서브클래스들은 같은 파일 또는 같은 패키지 내에서만 정의될 수 있습니다.

**추상 클래스 특성**: Sealed Class는 기본적으로 추상 클래스이므로 직접 인스턴스화할 수 없습니다.

```kotlin
// 기본 구조
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val message: String) : Result<Nothing>()
    object Loading : Result<Nothing>()
}
```

## 예제 코드

### 1. 네트워크 요청 상태 관리

```kotlin
sealed class NetworkState {
    object Loading : NetworkState()
    data class Success(val data: String) : NetworkState()
    data class Error(val errorMessage: String) : NetworkState()
}

fun handleNetworkState(state: NetworkState) {
    when (state) {
        is NetworkState.Loading -> {
            // 로딩 스피너 표시
            println("데이터를 불러오는 중...")
        }
        is NetworkState.Success -> {
            // 성공 데이터 처리
            println("데이터: ${state.data}")
        }
        is NetworkState.Error -> {
            // 에러 처리
            println("에러 발생: ${state.errorMessage}")
        }
    }
}
```

### 2. 결제 방법 선택

```kotlin
sealed class PaymentMethod {
    data class CreditCard(val cardNumber: String, val cvv: String) : PaymentMethod()
    data class BankTransfer(val accountNumber: String) : PaymentMethod()
    object Cash : PaymentMethod()
    data class DigitalWallet(val walletType: String, val accountId: String) : PaymentMethod()
}
```

## Sealed Class vs 다른 방식들 비교

## Kotlin Sealed Class 기본 정의

**Sealed Class**는 제한된 클래스 계층 구조를 만들기 위한 Kotlin의 특별한 클래스입니다. 해당 클래스를 상속받을 수 있는 서브클래스들이 컴파일 타임에 모두 정해져 있어, 런타임에 새로운 서브클래스가 추가될 수 없는 "봉인된" 클래스입니다.

## 동작 방식과 원리

Sealed Class는 다음과 같은 방식으로 동작합니다:

**컴파일 타임 제한**: 컴파일러가 모든 가능한 서브클래스를 미리 알고 있어서, when 표현식에서 모든 경우를 다뤘는지 검증할 수 있습니다.

**상속 제한**: Sealed Class와 그 서브클래스들은 같은 파일 또는 같은 패키지 내에서만 정의될 수 있습니다.

**추상 클래스 특성**: Sealed Class는 기본적으로 추상 클래스이므로 직접 인스턴스화할 수 없습니다.

```kotlin
// 기본 구조
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val message: String) : Result<Nothing>()
    object Loading : Result<Nothing>()
}

```

## 실생활 예시

### 1. 네트워크 요청 상태 관리

```kotlin
sealed class NetworkState {
    object Loading : NetworkState()
    data class Success(val data: String) : NetworkState()
    data class Error(val errorMessage: String) : NetworkState()
}

fun handleNetworkState(state: NetworkState) {
    when (state) {
        is NetworkState.Loading -> {
            // 로딩 스피너 표시
            println("데이터를 불러오는 중...")
        }
        is NetworkState.Success -> {
            // 성공 데이터 처리
            println("데이터: ${state.data}")
        }
        is NetworkState.Error -> {
            // 에러 처리
            println("에러 발생: ${state.errorMessage}")
        }
    }
}

```

### 2. 결제 방법 선택

```kotlin
sealed class PaymentMethod {
    data class CreditCard(val cardNumber: String, val cvv: String) : PaymentMethod()
    data class BankTransfer(val accountNumber: String) : PaymentMethod()
    object Cash : PaymentMethod()
    data class DigitalWallet(val walletType: String, val accountId: String) : PaymentMethod()
}

```

## Sealed Class vs 다른 방식들 비교

| 특징              | Sealed Class       | Enum  | 일반 상속 | Interface |
|-----------------|--------------------|-------|-------|-----------|
| **타입 안전성**      | 매우 높음              | 높음    | 낮음    | 낮음        |
| **When 완전성 검사** | ✅ 자동               | ✅ 자동  | ❌ 수동  | ❌ 수동      |
| **데이터 저장**      | ✅ 각 서브클래스마다 다른 데이터 | ❌ 제한적 | ✅ 가능  | ✅ 가능      |
| **런타임 확장**      | ❌ 불가능              | ❌ 불가능 | ✅ 가능  | ✅ 가능      |
| **메모리 효율성**     | 높음                 | 매우 높음 | 보통    | 보통        |
| **패턴 매칭**       | 매우 우수              | 우수    | 제한적   | 제한적       |

## 모범 사례 (Best Practices)

1. **너무 많은 서브클래스 생성** (5-7개 이상은 enum이나 다른 방식 고려)
2. **서브클래스에 복잡한 로직 포함** (비즈니스 로직은 별도 분리)
3. **Sealed Class를 데이터 저장 목적으로만 사용** (단순 데이터는 data class 사용)

Sealed Class는 특히 상태 관리, API 응답 처리, 네비게이션 상태 등에서 타입 안전성과 코드 가독성을 크게 향상시키는 강력한 도구입니다.