# MyStudy Blog

React + Next.js로 구축된 개발 공부 블로그입니다.

## 기능

- ✨ 마크다운 기반 포스트 작성
- 🎨 다크 모드 지원
- 🔍 실시간 검색 기능
- 📚 카테고리별 분류 (Development, Series, TIL, AI)
- 📖 시리즈 관리
- ⚡ 빠른 정적 사이트 생성
- 📱 반응형 디자인

## 시작하기

### 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

### 빌드

```bash
npm run build
```

### 프로덕션 실행

```bash
npm run start
```

## 포스트 작성

`content/` 폴더에 마크다운 파일을 추가하면 자동으로 블로그에 표시됩니다.

- `content/Development/` - 개발 관련 포스트
- `content/Series/` - 시리즈 형태의 포스트
- `content/TIL/` - Today I Learned
- `content/AI/` - AI 관련 포스트

## 기술 스택

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Markdown
- Lucide Icons

## 배포

Vercel, Netlify, GitHub Pages 등에 쉽게 배포할 수 있습니다.