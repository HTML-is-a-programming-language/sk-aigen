# SK AIGEN 지원 포트폴리오 — 서승준

**[웹 포트폴리오](https://html-is-a-programming-language.github.io/sk-aigen/)** · **[PDF 보기](https://html-is-a-programming-language.github.io/sk-aigen/downloads/sk-aigen-portfolio.pdf)**

기존의 A4 가로 표지를 유지하면서, **4개 실제 프로젝트의 문제 발견 → 기술 선택 → 구현 → 검증 → 한계**를 보여주는 14페이지 포트폴리오로 확장했습니다.

## 페이지별 구성

| 페이지 | 콘텐츠 |
|---|---|
| 01 | 표지 — 사용자 문제를 서비스로 구현하고 검증하는 개발자 |
| 02 | 자기소개 — 약 4년 웹 개발, KT AIVLE AI, 문제 해결 과정 |
| 03 | 프로젝트 지도 — CareFlow AI / SurveyLens / LectureForge / BeautyRanks |
| 04–05 | CareFlow AI — 근거 중심 챗봇, 검색/보류/검증 결과 |
| 06–07 | SurveyLens — 설문 만족도 예측, 불만족 Recall 실험, 개선 가설 |
| 08–09 | LectureForge — 사람 승인 대본 → TTS → MP4, 실제 E2E |
| 10–11 | BeautyRanks — 성분 평가 구조, 상품 수집 장애 대응 |
| 12 | 공통 기술 판단 — 근거, 사람의 제어, 장애 복구 |
| 13 | SK AIGEN 지원 방향 — 창업·비즈니스 / 사회·공공·교육 |
| 14 | 실제 프로젝트 웹사이트, GitHub 소스 및 검증 링크 |

상세 근거는 [페이지·데이터 출처 문서](docs/PORTFOLIO_STRUCTURE.md)에 기록합니다.

## 편집·출력

원본은 정적 HTML/CSS입니다. 웹과 PDF는 동일한 자료를 사용합니다.

- 표지: site/index.html
- 페이지별 본문: site/chapters.html
- 디자인: site/assets/styles.css, site/assets/editorial.css
- PDF 렌더: scripts/export-pdf.mjs
- GitHub Pages 배포: .github/workflows/pages.yml
- 14페이지 PDF·넘침/텍스트 QA: .github/workflows/portfolio-checks.yml

로컬 실행:

    pnpm install
    pnpm exec playwright install chromium
    pnpm dev

로컬 웹: http://localhost:4173

PDF 출력:

    pnpm pdf

출력: exports/sk-aigen-portfolio.pdf, exports/cover-preview.png, exports/page-XX.png.

## 자료 활용과 정확성

본 포트폴리오는 교육용 실습 자료에서 출발한 개인 확장 프로젝트와 개인 웹서비스를 구분합니다. 팀 실습의 미확인 개인 기여, 고객 효율 개선, 인과적 서비스 성과, 독립 사용자 평가 수치를 창작하지 않습니다.

CareFlow AI의 16/16은 **개발용 질문의 Top-1 근거 검색**이고 실제 고객상담 정확도가 아닙니다. SurveyLens 19,278행 원본 연구와 웹 체험용 800행은 별도 데이터이며 실서비스 인과 효과는 미측정입니다. LectureForge 실모델 1페이지 1회 E2E와 브라우저 모의 테스트 12건은 다른 측정입니다. BeautyRanks 외부 사이트 접근 차단이나 미완료 수집을 성공으로 꾸미지 않습니다.

## 최초 배포 설정

GitHub [Pages 설정](https://github.com/HTML-is-a-programming-language/sk-aigen/settings/pages)에서 **Build and deployment → GitHub Actions**를 선택합니다. 저장소 main 푸시가 정적 사이트와 PDF를 함께 빌드하여 배포합니다. 실제 배포 전에는 위 웹/PDF 링크가 접속된다고 보장할 수 없습니다.

제작 방식 선택: [ADR-001](docs/ADR-001-build-and-deploy.md).
