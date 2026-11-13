# SK AIGEN 지원 포트폴리오 — 서승준

SK AIGEN 지원을 위한 **PDF 중심·웹 미리보기 겸용 포트폴리오**. HTML/CSS 원본을 GitHub에서 버전 관리합니다.

## 현재 상태

- [x] A4 가로 1페이지 표지
- [x] 제작·배포 선택 근거 ([ADR-001](docs/ADR-001-build-and-deploy.md))
- [x] 웹 원본 HTML/CSS 및 PDF 출력 스크립트
- [x] 변경 시 PDF 자동 생성 및 GitHub Pages 배포 워크플로
- [ ] GitHub Pages 최초 활성화 및 실제 배포 검증
- [ ] 이후 페이지: 실무·개인 프로젝트에서 **검증된 문제 해결 경험** 중심으로 추가

## 기술 선택 근거

**정적 HTML/CSS + GitHub Pages + Playwright PDF**를 선택했습니다. 이번 결과물은 로그인·데이터베이스·API가 아닌, 채용 평가자가 읽는 **여러 페이지 문서**가 핵심입니다. 한 벌의 HTML/CSS로 웹 페이지와 PDF를 만들기 때문에 별도 웹사이트·인쇄물 두 벌을 수정할 필요가 없습니다.

## 로컬 실행

```bash
pnpm install
pnpm exec playwright install chromium
pnpm dev
```

로컬 미리보기: http://localhost:4173

```bash
pnpm pdf
```

출력 파일: `exports/sk-aigen-portfolio.pdf` 및 `exports/cover-preview.png`.

## GitHub Pages 최초 설정 (1회)

1. [저장소 Pages 설정](https://github.com/HTML-is-a-programming-language/sk-aigen/settings/pages)에 접속합니다.
2. **Build and deployment → Source**에서 **GitHub Actions**를 선택합니다.
3. [Actions 탭](https://github.com/HTML-is-a-programming-language/sk-aigen/actions)에서 `Deploy portfolio site` 작업을 다시 실행합니다. (또는 다음 커밋을 푸시합니다.)
4. 배포가 성공하면 웹 주소는 `https://html-is-a-programming-language.github.io/sk-aigen/`이고, 배포된 최신 PDF는 `/downloads/sk-aigen-portfolio.pdf`입니다. 배포 성공 전에는 접속을 보장하지 않습니다.

배포 시 워크플로가 Chromium과 한글 글꼴을 설치하고 PDF를 생성하여 웹사이트와 함께 게시합니다. 생성된 PDF는 **GitHub 저장소에 커밋되는 것이 아니라 배포 산출물**입니다.

## 다음 페이지 작성 기준

`site/index.html`의 `main#portfolio` 안에 `.page-wrap > article.page`를 추가합니다. 각 프로젝트에서 **문제 → 대안 비교 → 구현 → 결과 검증 → 회고**의 흐름을 보여주되, 없는 숫자와 확인되지 않은 역할/성과를 작성하지 않습니다.
