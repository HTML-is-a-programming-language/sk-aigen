# SK AIGEN 지원 포트폴리오 — 서승준

SK AIGEN 지원을 위한 **인쇄 우선 포트폴리오**. HTML/CSS 원본으로 웹과 PDF를 함께 관리합니다.

## 현황

- [x] 1페이지 표지 디자인 및 A4 가로 출력 확인
- [x] 제작·배포 기술 선정 근거 문서화
- [x] HTML/CSS 원본 및 Playwright PDF 내보내기 스크립트
- [ ] GitHub Pages 배포 설정 및 실제 URL 검증
- [ ] 2페이지 이후: 본인 기여 및 객관적 증거를 갖춘 사례 추가

## 선택한 기술

정적 HTML/CSS + GitHub Pages + Playwright. **문제 정의와 실행을 증명하는 인쇄용 문서**가 목표이므로 서버/인증/DB가 필요하지 않습니다. 웹 배포와 PDF 출력이 같은 소스를 사용하도록 유지합니다. 선택 근거: [ADR-001](docs/ADR-001-build-and-deploy.md).

## 시작하기

```bash
pnpm install
pnpm exec playwright install chromium
pnpm dev
```

로컬 웹 미리보기: http://localhost:4173

```bash
pnpm pdf
```

PDF 결과물: `exports/sk-aigen-portfolio.pdf` / 표지 미리보기: `exports/cover-preview.png` (실행 시 생성).

## GitHub Pages 배포

저장소 **Settings → Pages → Build and deployment → Source**에서 **GitHub Actions**를 선택합니다. 해당 설정 후 `Deploy portfolio site` 워크플로의 배포 성공을 확인해야 합니다.

## 작성 원칙

- 첫 장은 이력서식 나열보다 핵심 가치와 성장 방향을 전달합니다.
- 사례는 **문제 정의 → 대안 비교 → 실행 → 결과 검증 → 한계와 학습**의 흐름을 따릅니다.
- 역할, 수치 및 성과는 로그·코드·커밋·테스트 등 객관적인 근거를 확인한 후에만 작성합니다.
- 지원용 자료이므로 개인 연락처 등 민감한 정보는 공개 저장소에 올리기 전에 검수합니다.
