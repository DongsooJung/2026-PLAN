# Claude Code 세션 이력

## 분류 체계

### 작업 유형 (Type)
| 코드 | 설명 |
|------|------|
| `feat` | 신규 기능 개발 |
| `fix` | 버그 수정 |
| `refactor` | 코드 리팩토링 |
| `infra` | 배포, CI/CD, 환경 설정 |
| `docs` | 문서 작성/업데이트 |
| `review` | 코드 리뷰, 분석, 기획 |
| `test` | 테스트 작성 |
| `style` | UI/UX 수정 |

### 도메인 (Domain)
| 도메인 | 경로 | 설명 |
|--------|------|------|
| `subscription` | `src/app/dashboard/`, `src/components/dashboard/` | 구독 관리 |
| `converter` | `src/app/converter/`, `src/components/converter/` | 공문서 변환 |
| `auth` | `src/app/auth/`, `src/components/auth/` | 인증 |
| `pwa` | `src/components/pwa/`, `public/` | PWA/TWA |
| `core` | `src/lib/`, `src/components/ui/` | 공통 라이브러리 |

### 브랜치 네이밍 규칙
```
claude/{type}/{domain}-{description}-{sessionId}
```
예시: `claude/feat/converter-hwpx-export-abc123`

---

## 세션 기록

| 날짜 | 분류 | 도메인 | 브랜치 | PR | 요약 |
|------|------|--------|--------|-----|------|
| 2026-03-08 | feat | subscription | `claude/subscription-dashboard-Ht2Da` | #1 | 구독 관리 대시보드 구현 (CRUD, 캘린더 뷰, 요약 카드) |
| 2026-03-10 | feat | converter | `claude/korean-doc-formatter-8f5cM` | #2 | 공문서 변환기 구현 (마크다운→공문서, PDF/DOCX/HWPX 내보내기) |
| 2026-03-13 | infra | pwa | `claude/korean-doc-formatter-8f5cM` | #3 | Google Play TWA 배포 설정 (서비스 워커, manifest, assetlinks) |
| 2026-03-13 | fix | pwa | master (직접 커밋) | - | TWA 도메인 및 SHA256 fingerprint 수정 |
| 2026-03-19 | review | core | `claude/review-conversation-classification-tNaqD` | - | 대화 분류 체계 수립 및 프로젝트 이름 정리 |
