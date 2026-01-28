# CLAUDE.md - FitNote Codebase Guide

This document provides essential context for AI assistants working on the FitNote codebase.

## Project Overview

FitNote is a fitness tracking application with a **React Native mobile app** (iOS/Android) and a **Spring Boot REST API backend**. The primary language for UI labels and comments is **Korean**.

## Repository Structure

```
FitNote/
├── FitNoteApp/              # React Native mobile app
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React Context (AuthContext)
│   │   ├── hooks/           # Custom hooks (useAuth, useHistory, useRoutine)
│   │   ├── navigations/     # React Navigation (Root, Auth, Tabs)
│   │   ├── screens/         # App screens (Home, History, Routine, Settings, Auth)
│   │   ├── services/        # API services (auth, history, routine)
│   │   ├── storage/         # Encrypted local storage
│   │   ├── theme/           # Theme configuration
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utilities (API client, JWT)
│   ├── __tests__/           # Jest test files
│   ├── android/             # Android native code
│   ├── ios/                 # iOS native code
│   ├── tokens.json          # Design tokens (colors, spacing, typography)
│   └── design-role.json     # UI/UX design guidelines
├── server/                  # Spring Boot backend
│   ├── src/main/java/com/fitnote/server/
│   │   ├── config/          # Spring Security, JWT, CORS config
│   │   └── domain/          # Business logic (auth, workout, exercise, history, routine)
│   ├── src/test/java/       # JUnit tests
│   └── build.gradle         # Gradle build config
└── README.md                # Project documentation (Korean)
```

## Technology Stack

### Frontend (FitNoteApp)
- **React Native 0.82** with **React 19**
- **TypeScript 5.8**
- **React Navigation v7** (Stack + Bottom Tabs)
- **Axios** for HTTP requests
- **react-native-encrypted-storage** for secure token storage
- **react-native-vector-icons/Ionicons** for icons
- **Jest** for testing

### Backend (server)
- **Spring Boot 3.4.10** with **Java 17**
- **Spring Data JPA** with **MySQL**
- **Spring Security** with **JWT** (JJWT 0.11.5)
- **SpringDoc OpenAPI** (Swagger UI at `/swagger-ui.html`)
- **Gradle** build system

## Development Commands

### Frontend (run from `FitNoteApp/`)
```bash
npm install              # Install dependencies
npm start                # Start Metro bundler
npm run ios              # Build and run on iOS simulator
npm run android          # Build and run on Android emulator
npm run dev:android      # Auto-start Pixel_6_API_35 AVD, then run
npm run lint             # Run ESLint
npm run test             # Run Jest tests
```

For iOS, also run: `cd ios && pod install && cd ..`

### Backend (run from `server/`)
```bash
./gradlew build          # Build JAR
./gradlew bootRun        # Run application (port 8080)
./gradlew test           # Run JUnit tests
```

Copy `application.properties.example` to `application.properties` and configure MySQL connection.

## Key Architecture Patterns

### Frontend Authentication Flow
1. `AuthContext` provides global auth state via `useAuth()` hook
2. JWT tokens stored in encrypted storage (`tokenStorage.ts`)
3. Axios interceptors handle token injection and 401 refresh
4. `RootNavigator` switches between `AuthNavigator` and `TabsNavigator`

### Backend Architecture
- **MVC + Service layer**: Controllers → Services → Repositories
- **JWT-based stateless auth**: Access token (1h) + Refresh token (14d)
- **Protected endpoints** require `Authorization: Bearer <token>` header

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Token refresh |
| GET | `/api/history` | Fetch workout history |
| POST | `/api/history` | Create history entry |
| GET/POST | `/api/routines` | List/Create routines |
| GET/PUT/DELETE | `/api/routines/{id}` | Routine CRUD |

## Design System Conventions

### CRITICAL: Use tokens.json for all styling
- **Never hardcode** colors, spacing, typography, or shadows
- Reference `tokens.json` values in all components
- Follow `design-role.json` for component specifications

### Color Tokens (from tokens.json)
- Primary: `#2a7dff` (primary.500)
- Surface: `#FFFFFF`
- Text primary: `#151718`
- Text secondary: `#6b7280`
- Error: `#ef4444`
- Success: `#16a34a`

### Spacing Scale
`0, 4, 8, 12, 16, 20, 24, 32, 40, 48` px (keys: 0-12)

### Typography
- Display XL: 32px, weight 700
- Title MD: 20px, weight 700
- Body MD: 16px, weight 400
- Label LG: 18px, weight 600

### Component Requirements
- **Minimum touch target**: 44dp (accessibility)
- **Contrast**: WCAG AA compliance
- **Icons**: Use Ionicons from react-native-vector-icons
- **Button states**: Loading spinner, pressed opacity 0.85
- **Card**: `shadow.md`, `spacing.4` padding, `radius.lg`
- **Input**: min height 48px, focus ring with primary.500

### Tab Navigation Icons
| Tab | Active | Inactive |
|-----|--------|----------|
| 홈 (Home) | `home` | `home-outline` |
| 기록 (History) | `time` | `time-outline` |
| 루틴 (Routine) | `list` | `list-outline` |
| 설정 (Settings) | `settings` | `settings-outline` |

## Code Conventions

### TypeScript/React Native
- Use functional components with hooks
- Type all props and state
- Custom hooks in `src/hooks/` with `use` prefix
- Services in `src/services/` for API calls
- Follow existing file naming patterns (PascalCase for components)

### Java/Spring Boot
- Use Lombok annotations (`@Data`, `@Builder`, `@RequiredArgsConstructor`)
- DTOs for request/response objects
- Service layer for business logic
- Repository interfaces extend `JpaRepository`
- Entity classes in domain packages

### Korean Language
- UI labels should be in Korean (2-12 characters)
- Format: 동사+명사 (verb+noun), e.g., "운동 시작", "세트 추가"
- Comments may be in Korean

## Testing

### Frontend Tests (`FitNoteApp/__tests__/`)
- `App.test.tsx` - App component tests
- `auth-context.test.tsx` - AuthContext tests
- `history-routine.integration.test.tsx` - Integration tests

Mocks are configured in `jest.setup.js` for:
- react-native-encrypted-storage
- NativeEventEmitter

### Backend Tests (`server/src/test/java/`)
- JUnit 5 with Spring Boot Test
- Run with `./gradlew test`

## Configuration Files

### Frontend
| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript configuration |
| `babel.config.js` | Babel transpilation |
| `metro.config.js` | Metro bundler config |
| `jest.config.js` | Jest test configuration |
| `.eslintrc.js` | ESLint rules (React Native preset) |
| `.prettierrc.js` | Prettier formatting (single quotes, no trailing commas) |

### Backend
| File | Purpose |
|------|---------|
| `build.gradle` | Dependencies and build config |
| `application.properties` | Runtime configuration (not in git) |
| `application.properties.example` | Configuration template |

## Environment & Requirements
- **Node.js**: 20+
- **Java**: 17
- **Database**: MySQL 5.7+ or 8.0+
- **iOS**: Xcode, CocoaPods
- **Android**: Android Studio, SDK, AVD

## Common Issues & Solutions

### iOS Build Errors
```bash
cd FitNoteApp/ios && pod repo update && pod install && cd ..
```

### Metro Cache Issues
```bash
npx react-native start --reset-cache
```

### Android SDK Issues
Verify SDK and build tools versions in Android Studio.

## Database Schema (Key Entities)
- `users` - User accounts with email, password hash, unit system, timezone
- `workouts` - Workout sessions with timestamps
- `exercises` - Exercise definitions (global or user-specific)
- `workout_exercises` - Exercises within workouts
- `workout_sets` - Individual sets with weight/reps
- `routines` - User-created workout templates

## Security Notes
- JWT secret must be 32+ bytes in production
- Access tokens expire in 1 hour, refresh tokens in 14 days
- CORS is configured for development (all origins)
- Passwords hashed with BCrypt
- Sensitive data stored in encrypted storage on mobile

## Review Checklist
When reviewing changes, verify:
- [ ] All colors/spacing/typography use tokens.json
- [ ] Touch targets are 44dp minimum
- [ ] Contrast meets WCAG AA
- [ ] New components follow design-role.json patterns
- [ ] API changes have corresponding service/hook updates
- [ ] Tests cover new functionality
