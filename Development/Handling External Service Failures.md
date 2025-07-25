# 외부 서비스의 장애에 대처하는 방법

외부 서비스와 연동할 때 외부 서비스에서 장애가 발생하는 경우가 종종 발생합니다. 이 경우, 우리가 통제할 수 없는 부분일지라도 우리 서비스에 최대한 영향이 안 가게 대처해야 합니다. 오늘은 이 대처 방법에 대해 올바른 모범 사례들을 확인하고 공부해보겠습니다.

## 주요 대처 방법과 동작 원리

### 1. Circuit Breaker Pattern (회로 차단기 패턴)

**동작 원리**: 전기 회로의 차단기처럼, 외부 서비스의 오류율이 임계값을 넘으면 자동으로 요청을 차단합니다.

**3가지 상태**:

- **Closed**: 정상 상태, 요청 허용
- **Open**: 장애 감지, 요청 차단
- **Half-Open**: 복구 확인, 제한적 요청 허용

**실생활 예시**: 집의 전기 차단기가 과부하를 감지하면 자동으로 전기를 차단하는 것과 같습니다.

### 2. Retry Pattern 구현 (재시도 패턴)

**동작 원리**: 일시적인 장애를 가정하고 정해진 규칙에 따라 요청을 재시도 합니다.

**재시도 전략**:

- **Fixed Delay**: 고정된 시간 간격으로 재시도
- **Exponential Backoff**: 지수적으로 증가하는 시간 간격
- **Jitter**: 무작위 요소를 추가하여 동시 요청 분산

**실생활 예시**: 통화 중일 때 몇 분 후에 다시 전화를 거는 것과 같습니다.

### 3. Fallback Pattern 구현 (대체 처리 패턴)

**동작 원리**: 외부 서비스가 실패했을 때 미리 준비된 대체 로직을 실행합니다.

**대체 방법**:

- 캐시된 데이터 반환
- 기본값 제공
- 다른 서비스로 전환
- 간소화된 기능 제공

**실생활 예시**: 엘리베이터가 고장 났을 때 계단을 이용하는 것과 같습니다.

### 4. Timeout Pattern 구현 (타임아웃 패턴)

**동작 원리**: 외부 서비스 응답을 무한정 기다리지 않고 일정 시간 후 포기합니다.

**실생활 예시**: 식당에서 음식을 주문했는데 30분 이상 기다려도 안 나오면 주문을 취소하는 것과 같습니다.

## 각 패턴의 비교

| 패턴              | 목적        | 장점             | 단점          | 적용 상황       |
|-----------------|-----------|----------------|-------------|-------------|
| Circuit Breaker | 연쇄 장애 방지  | 시스템 보호, 빠른 실패  | 복잡한 구현      | 높은 트래픽 환경   |
| Retry           | 일시적 장애 극복 | 간단한 구현, 높은 성공률 | 리소스 낭비 가능   | 네트워크 불안정    |
| Fallback        | 서비스 연속성   | 사용자 경험 유지      | 부분 기능 제한    | 중요한 비즈니스 로직 |
| Timeout         | 응답 시간 보장  | 리소스 보호         | 정상 요청 취소 가능 | 실시간 처리 필요   |

## Kotlin으로 구현한 외부 서비스 장애 대처 패턴

### 1. Circuit Breaker Pattern 구현 (회로 차단기 패턴)

```kotlin
import kotlinx.coroutines.delay
import java.time.LocalDateTime
import java.time.temporal.ChronoUnit

class CircuitBreaker(
    private val failureThreshold: Int = 5,        // 실패 임계값
    private val recoveryTimeoutMs: Long = 60000,  // 복구 시간 (1분)
    private val monitoringPeriodMs: Long = 10000  // 모니터링 주기 (10초)
) {
    private var failureCount = 0
    private var lastFailureTime: LocalDateTime? = null
    private var state = CircuitState.CLOSED

    enum class CircuitState {
        CLOSED,    // 정상 상태 - 요청 허용
        OPEN,      // 장애 상태 - 요청 차단
        HALF_OPEN  // 복구 확인 상태 - 제한적 요청 허용
    }

    suspend fun <T> execute(operation: suspend () -> T): T {
        when (state) {
            CircuitState.OPEN -> {
                if (shouldAttemptReset()) {
                    state = CircuitState.HALF_OPEN
                    println("회로 차단기 상태: HALF_OPEN - 복구 시도")
                } else {
                    throw CircuitBreakerOpenException("외부 서비스 일시 차단 중")
                }
            }
            CircuitState.HALF_OPEN -> {
                // 복구 확인 중이므로 제한적으로 요청 허용
                println("회로 차단기: 복구 확인 중...")
            }
            CircuitState.CLOSED -> {
                // 정상 상태, 요청 허용
            }
        }

        return try {
            val result = operation()
            onSuccess()
            result
        } catch (e: Exception) {
            onFailure()
            throw e
        }
    }

    private fun onSuccess() {
        failureCount = 0
        state = CircuitState.CLOSED
        println("회로 차단기 상태: CLOSED - 정상 복구")
    }

    private fun onFailure() {
        failureCount++
        lastFailureTime = LocalDateTime.now()

        if (failureCount >= failureThreshold) {
            state = CircuitState.OPEN
            println("회로 차단기 상태: OPEN - 장애 감지, 요청 차단")
        }
    }

    private fun shouldAttemptReset(): Boolean {
        return lastFailureTime?.let { lastFailure ->
            ChronoUnit.MILLIS.between(lastFailure, LocalDateTime.now()) >= recoveryTimeoutMs
        } ?: false
    }
}

class CircuitBreakerOpenException(message: String) : Exception(message)

```

### 2. Retry Pattern (재시도 패턴)

```kotlin
import kotlinx.coroutines.delay
import kotlin.math.min
import kotlin.math.pow
import kotlin.random.Random

class RetryPolicy(
    private val maxRetries: Int = 3,
    private val baseDelayMs: Long = 1000,
    private val maxDelayMs: Long = 30000,
    private val retryStrategy: RetryStrategy = RetryStrategy.EXPONENTIAL_BACKOFF
) {
    enum class RetryStrategy {
        FIXED_DELAY,           // 고정 간격
        EXPONENTIAL_BACKOFF,   // 지수적 증가
        LINEAR_BACKOFF,        // 선형 증가
        EXPONENTIAL_BACKOFF_WITH_JITTER  // 지수적 증가 + 무작위 요소
    }

    suspend fun <T> execute(operation: suspend () -> T): T {
        var lastException: Exception? = null

        repeat(maxRetries + 1) { attempt ->
            try {
                return operation()
            } catch (e: Exception) {
                lastException = e

                if (attempt == maxRetries) {
                    println("재시도 실패: ${attempt + 1}번 시도 후 포기")
                    break
                }

                val delayMs = calculateDelay(attempt)
                println("재시도 ${attempt + 1}/${maxRetries} 실패: ${delayMs}ms 후 재시도")
                delay(delayMs)
            }
        }

        throw lastException ?: Exception("재시도 실패")
    }

    private fun calculateDelay(attempt: Int): Long {
        return when (retryStrategy) {
            RetryStrategy.FIXED_DELAY -> baseDelayMs

            RetryStrategy.EXPONENTIAL_BACKOFF -> {
                min(baseDelayMs * 2.0.pow(attempt).toLong(), maxDelayMs)
            }

            RetryStrategy.LINEAR_BACKOFF -> {
                min(baseDelayMs * (attempt + 1), maxDelayMs)
            }

            RetryStrategy.EXPONENTIAL_BACKOFF_WITH_JITTER -> {
                val exponentialDelay = min(baseDelayMs * 2.0.pow(attempt).toLong(), maxDelayMs)
                val jitter = Random.nextLong(0, exponentialDelay / 4) // 25% 범위의 무작위 값
                exponentialDelay + jitter
            }
        }
    }
}

```

### 3. Fallback Pattern (대체 처리 패턴)

```kotlin
class FallbackHandler<T>(
    private val primaryOperation: suspend () -> T,
    private val fallbackStrategies: List<suspend () -> T> = emptyList(),
    private val cacheProvider: CacheProvider<T>? = null
) {
    suspend fun execute(): T {
        // 1차: 주요 서비스 시도
        try {
            val result = primaryOperation()
            cacheProvider?.put("primary_result", result) // 성공 시 캐시 저장
            return result
        } catch (e: Exception) {
            println("주요 서비스 실패: ${e.message}")
        }

        // 2차: 대체 서비스들 시도
        fallbackStrategies.forEachIndexed { index, fallback ->
            try {
                println("대체 서비스 ${index + 1} 시도 중...")
                return fallback()
            } catch (e: Exception) {
                println("대체 서비스 ${index + 1} 실패: ${e.message}")
            }
        }

        // 3차: 캐시된 데이터 반환
        cacheProvider?.get("primary_result")?.let { cachedResult ->
            println("캐시된 데이터 반환")
            return cachedResult
        }

        throw FallbackException("모든 대체 방법 실패")
    }
}

interface CacheProvider<T> {
    suspend fun get(key: String): T?
    suspend fun put(key: String, value: T)
}

class FallbackException(message: String) : Exception(message)

```

### 4. Timeout Pattern (타임아웃 패턴)

```kotlin
import kotlinx.coroutines.*
import java.util.concurrent.TimeoutException

class TimeoutHandler(
    private val timeoutMs: Long = 5000 // 5초 타임아웃
) {
    suspend fun <T> execute(operation: suspend () -> T): T {
        return try {
            withTimeout(timeoutMs) {
                operation()
            }
        } catch (e: TimeoutCancellationException) {
            throw TimeoutException("외부 서비스 응답 시간 초과: ${timeoutMs}ms")
        }
    }
}

```

## 패턴별 실생활 비유와 Kotlin 특징

| 패턴              | 실생활 비유           | Kotlin 특징 활용              |
|-----------------|------------------|---------------------------|
| Circuit Breaker | 집의 전기 차단기        | `enum class`로 상태 관리       |
| Retry           | 바쁜 신호 시 재전화      | `suspend fun`으로 비동기 처리    |
| Fallback        | 엘리베이터 고장 시 계단 이용 | `sealed class`로 다양한 대체 전략 |
| Timeout         | 식당 주문 대기 시간 제한   | `withTimeout` 코루틴 활용      |

## 조합 전략 Best Practice

실제 프로덕션 환경에서는 여러 패턴을 조합하여 사용합니다:

1. **Timeout + Retry + Circuit Breaker**: 가장 일반적인 조합
2. **Circuit Breaker + Fallback**: 사용자 경험 중심
3. **Retry + Fallback**: 단순하지만 효과적

외부 서비스 장애 대처는 시스템의 안정성과 사용자 만족도에 직결되는 중요한 요소입니다. 각 패턴의 특성을 이해하고 상황에 맞게 적절히 조합하여 사용하는 것이 핵심입니다.
