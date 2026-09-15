# Android 설치와 배포

## 현재 상태

- Capacitor 8 Android 프로젝트: `android/`
- 앱 이름: Quiet Calculator
- 초기 앱 ID: `com.claire.quietcalculator` (첫 스토어 등록 전에 최종 확정)
- 계산기 파일은 앱 안에 포함됩니다. 개발 서버 연결 없이 실행됩니다.
- Android 앱에서는 공학용 버튼을 위쪽에 배치합니다.
- SDK: compile/target 36, minimum 24. 실제 설치·화면 검증은 아직 하지 않았습니다.
- 이번 PC 점검에서는 Android Studio 및 Android SDK 기본 설치 경로와 ANDROID 환경 변수가 확인되지 않았습니다.

## Android 개발 환경

Android Studio 2025.2.1 이상을 설치하고 최초 설정을 완료하세요.
SDK Manager에서 Android SDK Platform 36, Build Tools, Platform Tools를 설치합니다.
Gradle JDK는 Android Studio에 포함된 JDK를 사용합니다.

공식 안내: https://capacitorjs.com/docs/getting-started/environment-setup

## 휴대폰에서 테스트

프로젝트 폴더에서:

```powershell
npm install
npm run android:sync
npm run android:open
```

휴대폰에서 개발자 옵션과 USB 디버깅을 켜고 USB로 연결합니다.
휴대폰의 디버깅 허용 창을 승인한 뒤 Android Studio에서 연결된 기기를 선택하고 Run을 누릅니다.

명령줄 환경의 JAVA_HOME과 Android SDK 경로를 구성했다면:

```powershell
npm run android:apk
```

테스트 APK 출력: `android/app/build/outputs/apk/debug/app-debug.apk`.
이 파일은 테스트용이며 Play 배포 파일이 아닙니다.

## Google Play 배포 준비

1. 실제 기기에서 두 테마, 계산 모드, 화면 회전, 히스토리, 복사, 재실행 후 저장 상태를 확인합니다.
2. 앱 이름, 앱 ID, 런처 아이콘을 확정합니다. 현재 런처 아이콘은 Capacitor 기본 아이콘입니다.
3. `npm run android:sync` 실행 후 Android Studio에서 Build > Generate Signed App Bundle / APK > Android App Bundle을 선택합니다.
4. 본인 소유의 업로드 키를 생성·보관하여 release 번들에 서명합니다. 키와 비밀번호는 저장소에 넣지 않습니다.
5. 본인의 Google Play Console 계정에서 앱을 만들고 서명된 AAB와 스토어 정보를 등록합니다. 먼저 내부 테스트로 기기 설치를 확인합니다.
6. 개인정보 및 데이터 보안 정보, 스크린샷, 콘텐츠 등급 등을 실제 앱 동작에 맞게 작성한 뒤 계정에 표시되는 출시 요건을 완료합니다.

`npm run android:bundle`은 release 번들 빌드 명령입니다. 현재 서명 설정이 없으므로 이것만으로 스토어 제출 가능한 서명본이 만들어지지 않습니다.

서명 안내: https://developer.android.com/studio/publish/app-signing

## 디자인 원본

`components.svg`는 원본 그대로 보존했습니다. `src/Icon.jsx`에 삭제 아이콘의 벡터 경로를 반영했고, 복사 아이콘은 원본 SVG에 포함된 PNG를 추출해 사용합니다. 버튼 색상과 그림자는 원본 값을 CSS에 반영했습니다. 히스토리용으로 명확하게 식별되는 아이콘은 없어 기존 시계 아이콘을 유지합니다.

## 검증 한계

웹 프로덕션 빌드와 Android 자산 동기화, 계산 테스트 38개는 통과했습니다. SDK 환경이 없어 APK/AAB 생성 및 실기기 테스트는 완료하지 못했습니다. 스토어 업로드도 하지 않았습니다.

Capacitor CLI의 iOS 관련 개발 의존성(xcode → uuid)에 moderate 보안 알림이 있습니다. Android 앱에 번들되는 UI 코드에는 포함되지 않습니다. 배포 준비 시 CLI 업데이트를 확인하세요.
