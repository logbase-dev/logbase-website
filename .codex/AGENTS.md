# Codex Agent 가이드 (logbase-website)

## 목적

- Next.js 기반 웹사이트의 **UI/UX 개선, 버그 수정, 접근성/성능 개선, 테스트/문서 보강**을 수행한다.
- 배포 파이프라인/환경변수/인프라 구성은 **수정하지 않는다**(별도 지시 없이 금지).

## 작업 범위 (허용)

- 컴포넌트/페이지 리팩터링 (Client/Server 컴포넌트 구분 준수)
- 성능 최적화: 이미지 최적화, dynamic import, memoization, RSC 전환 검토
- 접근성(a11y): 시맨틱 마크업, aria-\*, focus trap, 키보드 내비게이션
- 스타일 정리: Tailwind/모듈 CSS 컨벤션 통일, 죽은 CSS 제거
- 에러/경계 케이스 보강: 로딩/에러 상태 UI, 404/500 개선
- 테스트 추가/수정: 단위테스트(React Testing Library), e2e(Playwright/Cypress) 초안
- 타입 보강: `any` 제거, `zod`/`io-ts` 등 런타임 스키마 도입 제안 가능
- 문서화: README 섹션, 컴포넌트 주석, ADR(Architecture Decision Record) 추가

## 작업 범위 (금지)

- `.env*`/비밀키/토큰/배포 스크립트/인프라 코드 변경
- 추적/광고/분석 ID 교체(예: GA, GTag, Pixel 등)
- 대규모 디자인 시스템 전면교체(별도 이슈/디자인 스펙 없으면 금지)

## 코드 스타일

- TypeScript 우선. strict 옵션 유지 권장.
- ESLint/Prettier 설정 준수. 규칙 위반 시 자동 수정 후 사유를 PR에 서술.
- 접근성: Lighthouse a11y 90+ 목표. 문제가 발견되면 PR 설명에 체크리스트 포함.

## PR 규칙

- 작은, 검증 가능한 변경으로 쪼갠다.
- 각 PR은 **Before/After 스크린샷** 또는 간단한 동영상(가능하면) 포함.
- 성능/접근성 개선은 측정 수치(Lighthouse/Next trace) 캡처 첨부.
- 위험 변경(라우팅/데이터계층)은 테스트와 롤백 계획 명시.
