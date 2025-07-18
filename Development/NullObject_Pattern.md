# Null Object 패턴

**Null Object 패턴**은 null 참조 대신 기본 동작을 제공하는 객체를 사용하여 `null 체크를 제거하는 디자인 패턴`입니다.

## 동작 방식과 원리

Null Object 패턴은 다음과 같은 방식으로 작동합니다:

1. **인터페이스 정의**: 공통 인터페이스를 만듭니다
2. **실제 구현체**: 정상적인 동작을 하는 클래스를 구현합니다
3. **Null Object 구현체**: "아무것도 하지 않는" 기본 동작을 하는 클래스를 구현합니다
4. **null 대신 사용**: null을 반환하는 대신 Null Object를 반환합니다

## 예시 코드

**음악 플레이어 예시**를 생각해보세요:

- 노래가 있을 때: 실제 음악을 재생
- 노래가 없을 때: 조용히 "재생"하지만 소리는 나지 않음 (null 체크 없이도 안전)

    ```java
    // 인터페이스
    interface MusicPlayer {
        void play();
        void stop();
    }
    
    // 실제 구현체
    class RealMusicPlayer implements MusicPlayer {
        private String song;
    
        public RealMusicPlayer(String song) {
            this.song = song;
        }
    
        public void play() {
            System.out.println("재생 중: " + song);
        }
    
        public void stop() {
            System.out.println("정지");
        }
    }
    
    // Null Object
    class NullMusicPlayer implements MusicPlayer {
        public void play() {
            // 아무것도 하지 않음
        }
    
        public void stop() {
            // 아무것도 하지 않음
        }
    }
    
    ```


## 기존 방식 vs Null Object 패턴 비교

| 구분 | 기존 방식 (null 체크) | Null Object 패턴 |
| --- | --- | --- |
| **null 체크** | 매번 필요 | 불필요 |
| **코드 복잡성** | if-else 문 많음 | 깔끔함 |
| **NullPointerException** | 발생 위험 있음 | 발생하지 않음 |
| **확장성** | 새로운 null 체크 추가 필요 | Null Object만 수정 |
| **가독성** | 비즈니스 로직과 섞임 | 비즈니스 로직에 집중 |

## 사용 예시

```java
// 기존 방식
MusicPlayer player = getPlayer(); // null일 수 있음
if (player != null) {
    player.play();
}

// Null Object 패턴
MusicPlayer player = getPlayer(); // 항상 객체 반환 (실제 또는 Null Object)
player.play(); // 안전하게 호출 가능

```

이 패턴은 특히 **옵셔널한 의존성**이나 **기본 동작이 명확한 경우**에 매우 유용합니다. 그럼 Null-Object 패턴은 장점만 있는 것일까요? 이 디자인 패턴의 단점 혹은 주의사항에 대해서도 알아보겠습니다.

## 사용 시 주의사항

### 1. **조용한 실패 (Silent Failure)**

가장 큰 문제는 실제 오류가 조용히 무시될 수 있다는 점입니다.

```java
// 문제 상황 예시
MusicPlayer player = getPlayerById("invalid-id");// NullMusicPlayer 반환
player.play();// 아무 일도 일어나지 않음 - 버그를 찾기 어려움!
```

### 2. **메모리 및 성능 오버헤드**

불필요한 객체들이 계속 생성됩니다.

```java
// 매번 새로운 Null Object 생성
for (int i = 0; i < 1000; i++) {
    MusicPlayer player = new NullMusicPlayer();// 메모리 낭비
}
```

## 사용 권장 사항

**사용하면 좋은 경우:**

- 로깅, 캐싱처럼 실패해도 큰 문제가 없는 경우
- 기본 동작이 "아무것도 하지 않기"인 경우
- 옵셔널한 기능들

**사용하지 말아야 할 경우:**

- 결제, 인증처럼 실패가 중요한 경우
- 데이터 무결성이 중요한 경우
- 실패 시 사용자에게 알려야 하는 경우

→ `핵심은 “조용한 실패가 허용되는 상황"에서만 사용하는 것입니다.`

## 결론

Null Object 패턴은 null 참조 대신 기본 동작을 하는 객체를 제공하여 반복적인 null 체크 로직을 제거하는 디자인 패턴입니다. 이 디자인 패턴을 사용하면, NPE 발생 오류를 줄일 수 있고, 새로운 객체에 대한 확장성을 가질 수 있습니다. 하지만, 패턴의 특성상 반드시 나타나야할 오류가 아무도 모르게 사라질 수도 있다는 단점이 있습니다. 따라서, “조용한 실패가 허용되는 상황”에서 사용하는 것이 권장됩니다.
