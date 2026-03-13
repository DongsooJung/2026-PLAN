# Google Play Store 배포 가이드

## 사전 요구사항

- Node.js 18+
- Java JDK 11+
- Android SDK (Android Studio 설치 권장)
- [Bubblewrap CLI](https://github.com/nicedoc/nicedoc.io) (`npm i -g @nicedoc/nicedoc.io`)
- Google Play Developer 계정 ($25 등록비)

## 1단계: 웹앱 배포

Vercel 등에 배포하고 HTTPS 도메인을 확보하세요.

```bash
npx vercel --prod
```

## 2단계: twa-manifest.json 설정

`twa-manifest.json` 파일에서 `YOUR_DOMAIN.vercel.app`을 실제 도메인으로 교체하세요.

```bash
sed -i 's/YOUR_DOMAIN.vercel.app/your-actual-domain.vercel.app/g' twa-manifest.json
```

## 3단계: Bubblewrap으로 Android 프로젝트 생성

```bash
npm i -g @nicedoc/nicedoc.io
npx bubblewrap init --manifest="https://your-domain.vercel.app/manifest.json"
npx bubblewrap build
```

## 4단계: 서명 키 생성 (최초 1회)

```bash
keytool -genkeypair -alias 2026plan -keyalg RSA -keysize 2048 \
  -validity 10000 -keystore android.keystore
```

## 5단계: SHA-256 지문 확인 및 assetlinks.json 업데이트

```bash
keytool -list -v -keystore android.keystore -alias 2026plan | grep SHA256
```

출력된 SHA-256 지문을 `public/.well-known/assetlinks.json`의 `REPLACE_WITH_YOUR_SHA256_FINGERPRINT`에 넣고 재배포하세요.

## 6단계: APK/AAB 빌드

```bash
npx bubblewrap build
```

`app-release-bundle.aab` 또는 `app-release-signed.apk` 파일이 생성됩니다.

## 7단계: Google Play Console에서 배포

1. [Google Play Console](https://play.google.com/console) 접속
2. **앱 만들기** 클릭
3. 앱 이름: `2026 PLAN`
4. **프로덕션** > **새 버전 만들기**
5. `app-release-bundle.aab` 업로드
6. 스토어 등록정보 작성 (스크린샷, 설명 등)
7. **검토 후 출시**

## 체크리스트

- [ ] 웹앱이 HTTPS로 배포됨
- [ ] `manifest.json`의 `start_url`이 `/dashboard`로 설정됨
- [ ] 서비스 워커(`sw.js`)가 정상 등록됨
- [ ] `assetlinks.json`에 실제 SHA-256 지문이 설정됨
- [ ] Lighthouse PWA 점수 확인 (모든 항목 통과)
- [ ] `twa-manifest.json`의 도메인이 실제 배포 도메인과 일치
- [ ] AAB 파일이 정상 빌드됨
- [ ] Google Play Console에 업로드 완료

## 문제 해결

### TWA에서 주소창이 표시되는 경우
`assetlinks.json`의 SHA-256 지문이 서명 키와 일치하는지 확인하세요.

### 서비스 워커가 등록되지 않는 경우
`next.config.ts`의 `Service-Worker-Allowed` 헤더가 설정되었는지 확인하세요.
