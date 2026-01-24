# Google Drive 사진 정리 자동화

Google Drive에 있는 사진을 촬영 날짜별로 자동으로 정리하고 중복을 제거하는 파이썬 스크립트입니다.

## 기능

- 📸 **사진 검색**: Google Drive에서 모든 사진 파일 자동 검색
- 📁 **날짜별 정리**: 촬영 날짜(연-월)별로 폴더 자동 생성 및 정리
- 🔄 **중복 제거**: MD5 해시를 사용한 중복 파일 자동 감지 및 삭제
- 📝 **작업 로그**: 모든 작업 내역을 JSON 형식으로 기록

## 설치

### 1. 필수 요구사항
- Python 3.7 이상
- Google 계정
- Google Drive API 활성화

### 2. Google API 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에서 새 프로젝트 생성
2. "Google Drive API" 활성화
3. OAuth 2.0 클라이언트 ID 생성 (데스크톱 애플리케이션)
4. JSON 파일 다운로드 후 현재 디렉토리에 `credentials.json`으로 저장

### 3. 라이브러리 설치

```bash
pip install -r requirements.txt
```

## 사용법

### 기본 실행

```bash
python drive_photo_organizer.py
```

### 첫 실행 시
- 브라우저가 자동으로 열립니다
- Google 계정으로 로그인
- 권한 허용
- 자동으로 `token.json` 파일이 생성됩니다

### 이후 실행
- `token.json`이 있으면 자동으로 인증됩니다
- 스크립트 실행만 하면 됩니다

## 처리 흐름

```
1. Google Drive API 인증
   ↓
2. 모든 사진 파일 검색 (JPG, PNG, GIF, BMP, HEIC, WEBP)
   ↓
3. 중복 파일 감지 (MD5 해시값 비교)
   ↓
4. 중복 파일 삭제
   ↓
5. 촬영 날짜별로 분류 (YYYY-MM 형식)
   ↓
6. 해당 폴더 자동 생성
   ↓
7. 사진 파일을 폴더로 이동
   ↓
8. 작업 로그 저장 (organize_log.json)
```

## 로그 파일

작업이 완료되면 `organize_log.json` 파일이 생성됩니다:

```json
{
  "timestamp": "2024-01-24T10:30:00.123456",
  "operations": [
    "분류: photo1.jpg -> 2024-01",
    "폴더 생성: 2024-01",
    "이동됨: photo1.jpg -> 2024-01/",
    ...
  ]
}
```

## 주의사항

⚠️ **중요**: 이 스크립트는 다음 작업을 수행합니다:
- Google Drive의 파일을 **이동 및 삭제**합니다
- 반드시 **테스트 폴더**에서 먼저 실행해보세요
- **중요한 사진은 백업**해두세요

## 트러블슈팅

### 인증 오류
- `credentials.json` 파일이 올바른 위치에 있는지 확인
- API 권한 설정 확인

### 파일을 찾을 수 없음
- Google Drive에 사진이 있는지 확인
- 공유 폴더의 경우 접근 권한 확인

### 권한 오류
- `token.json` 파일 삭제 후 다시 실행
- 브라우저에서 다시 인증

## 라이선스

MIT License
