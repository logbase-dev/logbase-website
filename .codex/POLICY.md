# 리뷰/가드레일 정책 (logbase-website)

## PR 체크리스트

- [ ] 변경 목적과 범위가 요약되었는가?
- [ ] 사용자 영향(UX, 성능, SEO, 접근성)이 서술되었는가?
- [ ] 테스트가 추가/수정되었는가? 없으면 이유 명시.
- [ ] ESLint/Prettier/TypeCheck 통과 스크린샷 또는 로그 포함?
- [ ] 라우팅/데이터 페칭(SSR/ISR/SSG) 변경 시 캐시/SEO 영향 설명?
- [ ] Lighthouse(Perf/A11y/Best/SEO) 주요 지표 캡처 포함(가능 시)?
- [ ] 위험 구역(배포 스크립트, 인프라, env, 분석 ID)을 수정하지 않았는가?

## 금지/주의 영역

- `.env*`, `scripts/deploy/**`, `.github/workflows/**`, `infra/**`, `terraform/**`
- 서드파티 키/토큰 노출 또는 교체
- 브레이킹 변경(라우트 경로/공용 컴포넌트 API) 시 사전 합의 없이 진행

## 커밋/메시지 규칙

- 커밋 프리픽스 예: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`, `docs:`
- Codex가 생성한 커밋에는 `codex:` 접두 추가 허용
