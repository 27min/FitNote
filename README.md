## FitNote

피트니스 기록을 간단히 시작할 수 있는 React Native 앱입니다. `FitNoteApp` 폴더에 실제 앱 소스가 있으며, 하단 탭을 통해 홈, 기록, 루틴, 설정 화면을 탐색할 수 있습니다.

### 주요 기능 (초기 버전)
- **홈**: 오늘의 운동 시작 진입점 및 안내
- **기록**: 이전 운동 기록 표시(데모 텍스트)
- **루틴**: 루틴 추가/수정 예정(데모 텍스트)
- **설정**: 다크 모드 스위치(UI 데모)

### 기술 스택
- **React Native 0.82** / **React 19**
- **React Navigation v7**: Stack + Bottom Tabs
- **Gesture Handler / Screens / Safe Area Context**
- **TypeScript 5**

### 프로젝트 구조
```
FitNote/
  └─ FitNoteApp/
      ├─ App.tsx
      ├─ package.json
      └─ src/
         ├─ navigations/
         │  ├─ RootNavigator.tsx
         │  └─ types.ts
         └─ screens/
            ├─ HomeScreen.tsx
            ├─ HistoryScreen.tsx
            ├─ RoutineScreen.tsx
            └─ SettingsScreen.tsx
```

### 빠른 시작
사전 요구사항:
- Node.js 20+
- iOS: Xcode, CocoaPods
- Android: Android Studio, SDK/에뮬레이터

설치:
```bash
cd FitNote/FitNoteApp
npm install
# iOS 전용: CocoaPods 설치
cd ios && pod install && cd ..
```

실행:
- iOS 시뮬레이터
```bash
npm run ios
```
- Android 에뮬레이터
```bash
# 에뮬레이터가 이미 실행 중이라면
npm run android

# 로컬에 Pixel_6_API_35 AVD가 있고 자동 실행을 원하면
npm run dev:android
```
- Metro 번들러만 실행
```bash
npm start
```

### 사용 가능한 스크립트 (`FitNoteApp/package.json`)
- `start`: Metro 번들러 실행
- `ios`: iOS 빌드 및 시뮬레이터 실행
- `android`: Android 빌드 및 에뮬레이터/디바이스 실행
- `dev:android`: 지정 AVD(Pixel_6_API_35) 자동 부팅 후 Android 실행
- `lint`: ESLint 실행
- `test`: Jest 실행

### 네비게이션 개요
- 루트는 `NavigationContainer`에서 커스텀 라이트 테마를 적용합니다.
- `RootNavigator`는 Stack 내에 Tabs를 포함하고, 탭은 `Home / History / Routine / Settings` 4개 화면으로 구성됩니다.

### 트러블슈팅
- iOS 빌드 오류(Pods 관련): `cd ios && pod repo update && pod install && cd ..`
- Android 빌드/SDK 오류: Android Studio에서 SDK/빌드도구 버전 확인 후 재시도
- Metro 캐시 문제: `npx react-native start --reset-cache`