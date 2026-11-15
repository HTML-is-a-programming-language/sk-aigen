# SK AIGEN · 13페이지 포트폴리오 구성 및 근거

2026-11-14 · 서승준 · 지원용 웹 / PDF 공통 구성

## 페이지 구성

| 페이지 | 역할 | 중심 내용 |
|---|---|---|
| 01 | Cover | 문제를 발견하고 제품으로 개선하는 개발자 |
| 02 | About | 웹 개발 경험·KT AIVLE, DEFINE→DECIDE→BUILD→VERIFY |
| 03 | Projects | LectureForge, CareFlow AI, SurveyLens, BeautyRanks |
| 04 | LectureForge · 제품 | PDF 대본 생성, Writer·Reviewer·사람 승인 |
| 05 | LectureForge · 검증 | 실제 3페이지 샘플 영상 생성·다운로드 및 회고 |
| 06 | CareFlow · 제품 | 근거 있는 고객지원, 답변 보류 및 관리자 보완 |
| 07 | CareFlow · 검증 | 근거 검색 오류 개선, Top-1 근거 회귀 검증과 회고 |
| 08 | SurveyLens · 제품 | 설문 기반 고객 만족도 예측, 개선 가설 |
| 09 | SurveyLens · 검증 | 정확도·불만족 Recall·미탐·오경보 비교 및 회고 |
| 10 | BeautyRanks · 제품 | 개인 화장품 선택 경험에서 출발한 성분 비교 서비스 |
| 11 | BeautyRanks · 개선 | 성분 점수 근거와 AI 설명 누락 복원·테스트·회고 |
| 12 | Growth & Collaboration | KT AIVLE 아이데이션 방향 조정, 검색 실패 복구, HITL 적용 |
| 13 | Role Fit & Contact | 직무 적용 역량, 프로젝트 서비스·코드, GitHub·Velog |

**협업 표현 기준:** 아이데이션은 코치의 데이터 확보·실현 가능성 피드백을 바탕으로 팀 방향을 재검토한 사례다. 확인되지 않은 팀원 간 언쟁·직접 설득·개인 기여 비율은 서술하지 않는다.

## 사용한 프로젝트 원본

### CareFlow AI
- [공개 서비스](https://careflow-ai-support.vercel.app/)
- [README](https://github.com/HTML-is-a-programming-language/ai-customer-support-agent/blob/main/README.md)
- [사례 연구](https://github.com/HTML-is-a-programming-language/ai-customer-support-agent/blob/main/docs/portfolio/CASE_STUDY.md)
- [운영 QA](https://github.com/HTML-is-a-programming-language/ai-customer-support-agent/actions/runs/43563970689)
- 교육용 원본 FAQ 40행, 브랜드 FAQ 30행, 제품 30행, 가상 약관 20개를 사용.
- 초기 10/16은 기대 문구 일치, 개선 후 16/16은 동일 질문의 Top-1 근거 ID. **동일한 지표의 정확도 개선율이라고 쓰지 않는다.**
- 별도 CSV 질문 Top-1 9/9, 모호 질문 보류 8/8, 실모델 기반 소수 질문 3/3.
- 사용자 실측 상담 생산성/고객 만족도는 없음. 관리자 저장 뒤 재검색 통합 실운영 검증은 별도 과제.

### SurveyLens
- [공개 서비스](https://ai-survey-insight-agen-html-is-a-programming-languages-projects.vercel.app/)
- [원본 설문과 실험](https://github.com/HTML-is-a-programming-language/ai-survey-insight-agent/blob/main/docs/portfolio/DEVELOPMENT_HISTORY.md)
- [체험용 샘플 출처](https://github.com/HTML-is-a-programming-language/ai-survey-insight-agent/blob/main/docs/portfolio/SAMPLE_DATA_PROVENANCE.md)
- [실제 브라우저 E2E](https://github.com/HTML-is-a-programming-language/ai-survey-insight-agent/actions/runs/43562936223)
- 항공 교육용 원본 19,278건과 웹 체험용 800건은 서로 다른 표본. 800건은 만족 718 / 중립·불만족 82.
- 원본 70:30 홀드아웃 테스트 5,784건: 다수 클래스 Accuracy 89.70%, 불만족 Recall 0%, 미탐 596; 로지스틱 Accuracy 85.53%, Recall 87.25%, 미탐 76, 오경보 761; 랜덤 포레스트 Accuracy 96.66%, Recall 76.01%, 미탐 143, 오경보 50.
- 관찰 평균 차이는 개선 조치의 인과적 효과가 아니다. 실사용 고객 개선 효과 미측정.

### LectureForge
- [공개 서비스](https://ai-instructor-agent.vercel.app/)
- [실제 근거](https://github.com/HTML-is-a-programming-language/ai-instructor-agent/blob/main/docs/PORTFOLIO_EVIDENCE.md)
- [개발 기록](https://github.com/HTML-is-a-programming-language/ai-instructor-agent/blob/main/docs/PORTFOLIO_DEVLOG.md)
- [실제 OpenAI E2E](https://github.com/HTML-is-a-programming-language/ai-instructor-agent/actions/runs/43562270338)
- 1페이지 자체 제작 PDF를 실제 OpenAI Writer·Reviewer·TTS와 FFmpeg로 1회 생성 성공. 전체 17.26초, 영상 17.625초 (평균 아님).
- PC/모바일 브라우저 QA 12건은 모의 AI 응답. 실제 2~4페이지 OpenAI 운영 E2E, 사용자 만족도와 비용 개선율은 미측정.

### BeautyRanks
- [공개 서비스](https://beautyranks.com/)
- [코드·운영 기록](https://github.com/HTML-is-a-programming-language/beauty-rank)
- [403 오류 종료 로그](https://github.com/HTML-is-a-programming-language/beauty-rank/actions/runs/43559306708)
- [502 복구 수정](https://github.com/HTML-is-a-programming-language/beauty-rank/pull/9)
- [운영 감시·성분 설명 수정](https://github.com/HTML-is-a-programming-language/beauty-rank/pull/10)
- 성분 점수는 사전 정의된 공개 성분표 기반 구성 지표. GPT는 해설과 정리 담당.
- 403 접근 제한을 우회하지 않으며 수집 완료를 보장하지 않는다. 전성분표만으로 효능이나 안전성을 임상적으로 확정하지 않는다.

## 작성 원칙과 개인 기여 표기

1. 원본 KT AIVLE 미니프로젝트의 교육 자료와 추가 개인 웹서비스 구현은 구분한다.
2. 과거 팀 프로젝트에서 직접 작성한 코드·업무 분장 비율·동료와의 의견 충돌은 증거 없이 창작하지 않는다.
3. 모델 품질은 언제, 어떤 질문·데이터셋·테스트 환경에서 측정했는지 함께 쓴다.
4. 공개 사이트의 개발 단계나 로드맵은 실제 고객 UI에 표시하지 않는다. 제작·디버깅·검증 과정은 이 포트폴리오에 남긴다.
5. 서비스 도메인이나 결과값이 바뀔 수 있으므로 최종 제출 전에 링크·API·CI 상태를 다시 확인한다.

## 편집·검수

- 본문 페이지: site/chapters.html
- 표지 및 웹 컨테이너: site/index.html
- 디자인: site/assets/styles.css 및 site/assets/editorial.css
- PDF 출력: pnpm pdf
- CI: portfolio-checks.yml에서 13페이지, 글자 출력, 레이아웃 넘침을 검증
- 배포: pages.yml에서 웹·PDF 동일 소스를 공개
