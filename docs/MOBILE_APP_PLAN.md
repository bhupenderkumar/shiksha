# Shiksha Mobile App — Complete Plan

> **Goal**: Build a hybrid mobile app for Shiksha (School Management System) that mirrors the web app's functionality, is deployable to Google Play Store (and optionally Apple App Store), and is powered by a configurable dedicated backend.

---

## Table of Contents

1. [Tech Stack Decision](#1-tech-stack-decision)
2. [Why This Stack](#2-why-this-stack)
3. [Project Architecture](#3-project-architecture)
4. [Dedicated Backend (Replacing Supabase)](#4-dedicated-backend-replacing-supabase)
5. [Mobile App Structure](#5-mobile-app-structure)
6. [Feature Mapping (Web → Mobile)](#6-feature-mapping-web--mobile)
7. [Configurable Backend URL](#7-configurable-backend-url)
8. [Authentication Flow](#8-authentication-flow)
9. [Push Notifications](#9-push-notifications)
10. [Offline Support](#10-offline-support)
11. [File Uploads & Camera](#11-file-uploads--camera)
12. [Navigation Design](#12-navigation-design)
13. [Build & Deployment (Play Store)](#13-build--deployment-play-store)
14. [CI/CD Pipeline](#14-cicd-pipeline)
15. [Environment Configuration](#15-environment-configuration)
16. [Testing Strategy](#16-testing-strategy)
17. [Folder Structure](#17-folder-structure)
18. [Migration Plan from Supabase](#18-migration-plan-from-supabase)
19. [Step-by-Step Implementation Roadmap](#19-step-by-step-implementation-roadmap)
20. [Cost & Timeline Estimates](#20-cost--timeline-estimates)

---

## 1. Tech Stack Decision

### Mobile App (Frontend)

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Framework** | **React Native + Expo** | Reuse React + TypeScript skills from the web app |
| **Language** | **TypeScript** | Already used in web app, type safety |
| **Navigation** | **Expo Router** (file-based) | Similar to web routing, easy to learn |
| **State Management** | **Zustand** | Already used in web app |
| **Forms** | **React Hook Form + Zod** | Already used in web app |
| **UI Kit** | **Tamagui** or **NativeWind** (Tailwind for RN) | NativeWind lets you reuse Tailwind class knowledge |
| **HTTP Client** | **Axios** | Already used in web app |
| **Notifications** | **Expo Notifications** | Easy push notifications with FCM |
| **Storage** | **AsyncStorage + MMKV** | Fast local key-value storage |
| **File Handling** | **Expo ImagePicker, DocumentPicker, FileSystem** | Camera, gallery, file uploads |
| **Charts** | **react-native-chart-kit** or **Victory Native** | Dashboard charts |
| **PDF** | **react-native-pdf** + **expo-print** | View and generate PDFs |
| **Icons** | **Lucide React Native** | Same icon library as web |

### Dedicated Backend

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Runtime** | **Node.js (v20 LTS)** | Same JS/TS ecosystem |
| **Framework** | **NestJS** | Enterprise-grade, modular, TypeScript-first |
| **ORM** | **Prisma** | Type-safe DB access, migrations |
| **Database** | **PostgreSQL** | Same as current Supabase DB |
| **Auth** | **Passport.js + JWT** | Standard, configurable auth |
| **File Storage** | **MinIO (S3-compatible)** or **Cloudinary** | Self-hosted or cloud file storage |
| **Realtime** | **Socket.io** or **Server-Sent Events** | Push updates for attendance, homework |
| **API Docs** | **Swagger (via NestJS)** | Auto-generated API documentation |
| **Caching** | **Redis** | Session management, rate limiting |
| **Containerization** | **Docker + Docker Compose** | Easy deployment |

---

## 2. Why This Stack

### Why React Native + Expo (not Flutter, Ionic, or Capacitor)?

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **React Native + Expo** | Reuse React/TS skills; huge ecosystem; native performance; Expo simplifies builds | Larger bundle than Flutter | **✅ Best fit** — your team already knows React + TypeScript |
| **Flutter** | Great performance; single codebase | Dart language (new learning); can't reuse existing code | ❌ Learning curve |
| **Ionic/Capacitor** | Can wrap existing web app | WebView-based = poor performance; not truly native feel | ❌ Feels like a web app |
| **Capacitor + React** | Reuse existing React code directly | Still WebView; limited native API access | ❌ Performance issues |

### Why NestJS (not Express, Fastify, or Supabase self-hosted)?

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **NestJS** | Modular; TypeScript-first; built-in validation, guards, interceptors; Swagger OOB | Slight learning curve | **✅ Best for structured backend** |
| **Express** | Simple, flexible | No structure; everything manual | ❌ Gets messy at scale |
| **Supabase Self-hosted** | Same API as current | Limited customization; still depends on Supabase | ❌ Not fully "dedicated" |

---

## 3. Project Architecture

```
┌──────────────────────────┐     ┌──────────────────────────┐
│                          │     │                          │
│   React Native + Expo    │     │   React Web App (Vite)   │
│   (Mobile App)           │     │   (Existing Shiksha)     │
│                          │     │                          │
└──────────┬───────────────┘     └──────────┬───────────────┘
           │                                │
           │  HTTPS (REST + WebSocket)      │  HTTPS (REST)
           │                                │
           ▼                                ▼
┌────────────────────────────────────────────────────────────┐
│                                                            │
│              Dedicated NestJS Backend API                   │
│   ┌──────────┬──────────┬──────────┬──────────────────┐   │
│   │   Auth   │  School  │  Files   │   Notifications  │   │
│   │  Module  │  Module  │  Module  │     Module       │   │
│   └──────────┴──────────┴──────────┴──────────────────┘   │
│                                                            │
└───────┬──────────────┬───────────────┬────────────────────┘
        │              │               │
        ▼              ▼               ▼
   ┌─────────┐  ┌────────────┐  ┌──────────┐
   │PostgreSQL│  │ MinIO/S3   │  │  Redis   │
   │(school)  │  │ (Files)    │  │ (Cache)  │
   └─────────┘  └────────────┘  └──────────┘
```

---

## 4. Dedicated Backend (Replacing Supabase)

### 4.1 Database Schema Migration

The current Supabase uses the `school` schema. We'll migrate that directly:

```bash
# Export from Supabase
pg_dump --schema=school -h <supabase-host> -U postgres -d postgres > school_schema.sql

# Import to new PostgreSQL
psql -h <new-host> -U postgres -d shiksha < school_schema.sql
```

### 4.2 Backend Module Structure (NestJS)

```
shiksha-api/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── config/
│   │   ├── configuration.ts        # Centralized config
│   │   ├── database.config.ts
│   │   └── jwt.config.ts
│   ├── common/
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── decorators/
│   │   │   └── roles.decorator.ts
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts
│   │   └── filters/
│   │       └── http-exception.filter.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── local.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── register.dto.ts
│   │   ├── students/
│   │   │   ├── students.module.ts
│   │   │   ├── students.controller.ts
│   │   │   ├── students.service.ts
│   │   │   └── dto/
│   │   ├── homework/
│   │   ├── classwork/
│   │   ├── attendance/
│   │   ├── fees/
│   │   ├── classes/
│   │   ├── subjects/
│   │   ├── id-cards/
│   │   ├── admissions/
│   │   ├── feedback/
│   │   ├── parent-feedback/
│   │   ├── interactive-assignments/
│   │   ├── birthdays/
│   │   ├── date-sheet/
│   │   ├── fee-structure/
│   │   ├── sports/
│   │   ├── files/
│   │   │   ├── files.module.ts
│   │   │   ├── files.controller.ts
│   │   │   └── files.service.ts       # MinIO/S3 integration
│   │   ├── notifications/
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   └── notifications.gateway.ts  # WebSocket for realtime
│   │   └── settings/
│   └── prisma/
│       ├── prisma.module.ts
│       ├── prisma.service.ts
│       └── schema.prisma
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── nest-cli.json
├── tsconfig.json
└── package.json
```

### 4.3 API Endpoints Design

All current Supabase table operations map to REST endpoints:

| Current Table | API Endpoint | Methods |
|---------------|-------------|---------|
| `Student` | `/api/v1/students` | GET, POST, PUT, DELETE |
| `Homework` | `/api/v1/homework` | GET, POST, PUT, DELETE |
| `Classwork` | `/api/v1/classwork` | GET, POST, PUT, DELETE |
| `Attendance` | `/api/v1/attendance` | GET, POST, PUT, DELETE |
| `Fee` | `/api/v1/fees` | GET, POST, PUT, DELETE |
| `Class` | `/api/v1/classes` | GET, POST, PUT, DELETE |
| `Subject` | `/api/v1/subjects` | GET, POST, PUT, DELETE |
| `IDCard` | `/api/v1/id-cards` | GET, POST, PUT, DELETE |
| `ProspectiveStudent` | `/api/v1/admissions` | GET, POST, PUT, DELETE |
| `feedback` | `/api/v1/feedback` | GET, POST, PUT, DELETE |
| `File` | `/api/v1/files` | GET, POST, DELETE |
| `Settings` | `/api/v1/settings` | GET, PUT |
| `Profile` | `/api/v1/profiles` | GET, PUT |
| Auth | `/api/v1/auth/login` | POST |
| Auth | `/api/v1/auth/register` | POST |
| Auth | `/api/v1/auth/refresh` | POST |
| Auth | `/api/v1/auth/forgot-password` | POST |
| Notifications | `/api/v1/notifications` | GET, POST |
| Sports | `/api/v1/sports/events` | GET, POST, PUT, DELETE |
| Sports | `/api/v1/sports/enrollments` | GET, POST, PUT, DELETE |
| DateSheet | `/api/v1/date-sheet` | GET, POST, PUT, DELETE |
| FeeStructure | `/api/v1/fee-structure` | GET, POST, PUT |
| ParentFeedback | `/api/v1/parent-feedback` | GET, POST, PUT, DELETE |
| Birthdays | `/api/v1/birthdays` | GET |

### 4.4 Prisma Schema (Key Models)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["school"]
}

model Student {
  id            String    @id @default(uuid())
  name          String
  class_id      String?
  roll_number   String?
  gender        String?
  date_of_birth DateTime?
  parent_name   String?
  parent_phone  String?
  parent_email  String?
  address       String?
  photo_url     String?
  status        String    @default("ACTIVE")
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt

  class         Class?      @relation(fields: [class_id], references: [id])
  attendance    Attendance[]
  fees          Fee[]
  homework      Homework[]
  id_cards      IDCard[]

  @@schema("school")
  @@map("Student")
}

model Class {
  id         String    @id @default(uuid())
  name       String
  section    String?
  created_at DateTime  @default(now())
  students   Student[]
  subjects   Subject[]

  @@schema("school")
  @@map("Class")
}

// ... (all other models follow the same pattern from database.types.ts)
```

### 4.5 Docker Compose for Backend

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/shiksha?schema=school
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRATION=7d
      - MINIO_ENDPOINT=minio
      - MINIO_PORT=9000
      - MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
      - MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
      - minio

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=shiksha
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=${MINIO_ACCESS_KEY}
      - MINIO_ROOT_PASSWORD=${MINIO_SECRET_KEY}
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

volumes:
  pgdata:
  minio_data:
```

---

## 5. Mobile App Structure

### 5.1 Expo Project Setup

```bash
# Create new Expo project with TypeScript
npx create-expo-app@latest shiksha-mobile --template tabs
cd shiksha-mobile

# Install key dependencies
npx expo install expo-router expo-secure-store expo-image-picker
npx expo install expo-document-picker expo-file-system expo-notifications
npx expo install expo-camera expo-print expo-sharing
npx expo install @react-native-async-storage/async-storage
npm install axios zustand react-hook-form @hookform/resolvers zod
npm install nativewind tailwindcss react-native-reanimated
npm install react-native-chart-kit react-native-svg
npm install lucide-react-native react-native-pdf
npm install date-fns react-native-toast-message
npm install @tanstack/react-query  # For data fetching + caching
```

### 5.2 Mobile App Folder Structure

```
shiksha-mobile/
├── app/                            # Expo Router (file-based routing)
│   ├── _layout.tsx                 # Root layout (auth check)
│   ├── index.tsx                   # Home / Landing
│   ├── (auth)/                     # Auth group
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                     # Main tab navigator (protected)
│   │   ├── _layout.tsx             # Tab bar config
│   │   ├── dashboard.tsx
│   │   ├── homework/
│   │   │   ├── index.tsx           # List
│   │   │   ├── [id].tsx            # Detail
│   │   │   ├── create.tsx
│   │   │   └── edit/[id].tsx
│   │   ├── classwork/
│   │   │   ├── index.tsx
│   │   │   ├── [id].tsx
│   │   │   ├── create.tsx
│   │   │   └── edit/[id].tsx
│   │   ├── students/
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   ├── attendance/
│   │   │   └── index.tsx
│   │   ├── fees/
│   │   │   └── index.tsx
│   │   ├── settings.tsx
│   │   └── profile.tsx
│   ├── (public)/                   # Public routes (no auth)
│   │   ├── admission-enquiry.tsx
│   │   ├── admission-progress/[id].tsx
│   │   ├── id-card.tsx
│   │   ├── parent-feedback.tsx
│   │   ├── parent-feedback-submission.tsx
│   │   ├── date-sheet.tsx
│   │   ├── fee-structure.tsx
│   │   ├── sports-week.tsx
│   │   └── birthday/[studentId].tsx
│   ├── admissions/
│   │   ├── index.tsx
│   │   └── enquiries.tsx
│   ├── id-cards/
│   │   ├── index.tsx
│   │   ├── new.tsx
│   │   └── table.tsx
│   ├── interactive-assignments/
│   │   ├── index.tsx
│   │   ├── create.tsx
│   │   ├── edit/[id].tsx
│   │   └── view/[id].tsx
│   ├── parent-feedback/
│   │   ├── index.tsx
│   │   ├── list.tsx
│   │   ├── form.tsx
│   │   ├── search.tsx
│   │   ├── submitted/
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   └── view-all.tsx
│   ├── birthdays.tsx
│   ├── subjects.tsx
│   ├── sports/
│   │   ├── index.tsx
│   │   ├── enrollments.tsx
│   │   └── enrollments-grouped.tsx
│   └── share/
│       ├── homework/[token].tsx
│       └── classwork/[token].tsx
├── components/                     # Reusable components
│   ├── ui/                         # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── Badge.tsx
│   │   ├── Toast.tsx
│   │   └── Avatar.tsx
│   ├── homework/
│   │   ├── HomeworkCard.tsx
│   │   └── HomeworkForm.tsx
│   ├── classwork/
│   │   ├── ClassworkCard.tsx
│   │   └── ClassworkForm.tsx
│   ├── students/
│   │   └── StudentCard.tsx
│   ├── attendance/
│   │   └── AttendanceForm.tsx
│   ├── fees/
│   │   └── FeeCard.tsx
│   ├── id-card/
│   │   └── IDCardGenerator.tsx
│   ├── feedback/
│   │   └── FeedbackForm.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── TabBar.tsx
│   └── common/
│       ├── FileUploader.tsx
│       ├── PhotoPicker.tsx
│       └── ShareButton.tsx
├── services/                       # API service layer
│   ├── api-client.ts               # Axios instance with configurable URL
│   ├── auth.service.ts
│   ├── students.service.ts
│   ├── homework.service.ts
│   ├── classwork.service.ts
│   ├── attendance.service.ts
│   ├── fees.service.ts
│   ├── classes.service.ts
│   ├── subjects.service.ts
│   ├── id-cards.service.ts
│   ├── admissions.service.ts
│   ├── feedback.service.ts
│   ├── parent-feedback.service.ts
│   ├── interactive-assignments.service.ts
│   ├── birthdays.service.ts
│   ├── sports.service.ts
│   ├── file.service.ts
│   ├── notifications.service.ts
│   ├── settings.service.ts
│   └── date-sheet.service.ts
├── stores/                         # Zustand stores
│   ├── auth.store.ts
│   ├── settings.store.ts
│   └── app.store.ts
├── hooks/                          # Custom hooks
│   ├── useAuth.ts
│   ├── useStudents.ts
│   ├── useHomework.ts
│   ├── useClasswork.ts
│   ├── useAttendance.ts
│   ├── useFees.ts
│   └── useNotifications.ts
├── lib/                            # Utilities
│   ├── constants.ts                # Table names, roles, etc.
│   ├── utils.ts                    # cn() and helpers
│   ├── storage.ts                  # AsyncStorage helpers
│   └── config.ts                   # App configuration
├── types/                          # TypeScript types
│   ├── api.types.ts
│   ├── student.types.ts
│   ├── homework.types.ts
│   └── ...
├── assets/                         # Images, fonts
├── app.json                        # Expo config
├── eas.json                        # EAS Build config
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 6. Feature Mapping (Web → Mobile)

| Web Feature | Mobile Implementation | Native Capability Used |
|---|---|---|
| Dashboard with charts | Dashboard tab with `react-native-chart-kit` | — |
| Homework CRUD | List → Detail → Form flow | Camera for photo homework |
| Classwork CRUD | List → Detail → Form flow | Camera, file picker |
| Student Management | List + Detail screens | Camera for photos |
| Attendance | Toggle grid by class | — |
| Fee Management | Fee cards + payment history | — |
| ID Card Generator | Generate + share as image | `expo-sharing`, `expo-print` |
| Interactive Assignments | Play assignments (drag-drop, drawing) | Touch gestures, `expo-av` |
| Admission Enquiry | Multi-step form | Document picker, camera |
| Parent Feedback | Search + Submit form | — |
| Birthdays | List + Public share page | `expo-sharing` |
| Date Sheet | View exam schedule | — |
| Fee Structure | View fee chart | — |
| Sports Week | Browse events + enroll | — |
| File Uploads | Upload from camera/gallery/files | `expo-image-picker`, `expo-document-picker` |
| PDF Generation | Generate report cards, fee receipts | `expo-print` → PDF |
| Share Links | Share homework/classwork publicly | `expo-sharing` + deep links |
| Push Notifications | Homework alerts, fee reminders | `expo-notifications` + FCM |
| Offline Mode | Cache recent data | `AsyncStorage` + `react-query` |
| Theme Toggle | Light/Dark mode | `useColorScheme()` |

---

## 7. Configurable Backend URL

### 7.1 Configuration System

The mobile app will support runtime-configurable backend URLs:

```typescript
// lib/config.ts
import * as SecureStore from 'expo-secure-store';

const CONFIG_KEYS = {
  API_BASE_URL: 'shiksha_api_base_url',
  API_VERSION: 'shiksha_api_version',
} as const;

// Default values (can be overridden)
const DEFAULTS = {
  API_BASE_URL: 'https://api.shiksha.example.com',
  API_VERSION: 'v1',
};

export const AppConfig = {
  async getApiBaseUrl(): Promise<string> {
    const stored = await SecureStore.getItemAsync(CONFIG_KEYS.API_BASE_URL);
    return stored || DEFAULTS.API_BASE_URL;
  },

  async setApiBaseUrl(url: string): Promise<void> {
    await SecureStore.setItemAsync(CONFIG_KEYS.API_BASE_URL, url);
  },

  async getFullApiUrl(): Promise<string> {
    const base = await this.getApiBaseUrl();
    return `${base}/api/${DEFAULTS.API_VERSION}`;
  },

  async resetToDefaults(): Promise<void> {
    await SecureStore.deleteItemAsync(CONFIG_KEYS.API_BASE_URL);
  },
};
```

### 7.2 Configurable API Client

```typescript
// services/api-client.ts
import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { AppConfig } from '@/lib/config';

let apiClient: AxiosInstance | null = null;

export async function getApiClient(): Promise<AxiosInstance> {
  if (apiClient) return apiClient;

  const baseURL = await AppConfig.getFullApiUrl();
  const token = await SecureStore.getItemAsync('auth_token');

  apiClient = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // Request interceptor — attach token
  apiClient.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor — handle 401
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        await SecureStore.deleteItemAsync('auth_token');
        // Navigate to login
      }
      return Promise.reject(error);
    }
  );

  return apiClient;
}

// Reset client when URL changes
export function resetApiClient(): void {
  apiClient = null;
}
```

### 7.3 Settings Screen for URL Configuration

The Settings screen will include a "Server Configuration" section accessible only in dev/admin mode, or through a hidden gesture (e.g., tap the version number 7 times):

```typescript
// Features:
// - Text input for backend URL
// - "Test Connection" button (pings /api/v1/health)
// - Save / Reset to Default
// - Shows current connected server
```

---

## 8. Authentication Flow

```
┌─────────┐      ┌────────────┐      ┌──────────┐
│  App     │──────│  Login     │──────│  Backend  │
│  Launch  │      │  Screen    │      │  /auth    │
└────┬────┘      └─────┬──────┘      └─────┬────┘
     │                 │                    │
     │  Check token    │                    │
     │  in SecureStore │                    │
     │◄────────────────│                    │
     │                 │                    │
     │  [no token]     │   POST /login      │
     │────────────────►│───────────────────►│
     │                 │                    │
     │                 │  {token, user}     │
     │                 │◄───────────────────│
     │                 │                    │
     │  Store token    │                    │
     │  SecureStore    │                    │
     │◄────────────────│                    │
     │                 │                    │
     │  Navigate to    │                    │
     │  Dashboard      │                    │
     │────────────────►│                    │
```

**Token Management:**
- Access token (JWT, 15 min expiry) — stored in memory
- Refresh token (30 day expiry) — stored in `expo-secure-store`
- Auto-refresh before expiry using interceptor
- Biometric lock option (FaceID/Fingerprint) via `expo-local-authentication`

---

## 9. Push Notifications

### Setup

```typescript
// services/notifications.service.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { getApiClient } from './api-client';

export async function registerForPushNotifications() {
  if (!Device.isDevice) return;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Register token with backend
  const api = await getApiClient();
  await api.post('/notifications/register-device', {
    push_token: token,
    platform: Device.osName,
  });

  return token;
}
```

### Notification Types

| Event | Notification |
|-------|-------------|
| New homework assigned | "New homework in {subject}: {title}" |
| Homework deadline approaching | "Homework due tomorrow: {title}" |
| Attendance marked | "Attendance marked for {date}" |
| Fee payment due | "Fee payment of ₹{amount} due on {date}" |
| Fee payment received | "Payment of ₹{amount} received" |
| New announcement | "{title}" |
| Birthday reminder | "🎂 {student_name}'s birthday today!" |
| Sports enrollment | "Enrolled in {event_name}" |

---

## 10. Offline Support

Using `@tanstack/react-query` with persistence:

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutes
      gcTime: 24 * 60 * 60 * 1000,  // 24 hours
      retry: 3,
      networkMode: 'offlineFirst',
    },
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'SHIKSHA_QUERY_CACHE',
});
```

**Offline Strategy:**
- **Read**: Serve from cache first, refresh in background
- **Write**: Queue mutations in AsyncStorage, sync when online
- **Conflict Resolution**: Last-write-wins with server timestamp

---

## 11. File Uploads & Camera

```typescript
// components/common/PhotoPicker.tsx
import * as ImagePicker from 'expo-image-picker';
import { getApiClient } from '@/services/api-client';

export async function pickAndUploadImage(purpose: string) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
    base64: false,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  const formData = new FormData();
  formData.append('file', {
    uri: asset.uri,
    type: 'image/jpeg',
    name: `${purpose}_${Date.now()}.jpg`,
  } as any);
  formData.append('purpose', purpose);

  const api = await getApiClient();
  const response = await api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
}
```

---

## 12. Navigation Design

### Bottom Tab Bar (Protected)

```
┌───────┬──────────┬──────────┬──────┬──────────┐
│  🏠   │   📚     │   ✅     │  💰  │   ⚙️    │
│ Home  │ Homework │Attendance│ Fees │ Settings │
└───────┴──────────┴──────────┴──────┴──────────┘
```

### Drawer Menu (More Options)

```
┌──────────────────────┐
│  👤 Profile          │
│  📋 Classwork        │
│  👩‍🎓 Students         │
│  📖 Subjects         │
│  🪪 ID Cards         │
│  📝 Admissions       │
│  🎮 Assignments      │
│  💬 Feedback         │
│  🎂 Birthdays        │
│  📅 Date Sheet       │
│  💵 Fee Structure    │
│  🏅 Sports Week      │
│  🔔 Notifications    │
└──────────────────────┘
```

---

## 13. Build & Deployment (Play Store)

### 13.1 EAS Build Configuration

```json
// eas.json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

### 13.2 App Configuration

```json
// app.json
{
  "expo": {
    "name": "Shiksha",
    "slug": "shiksha",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#4F46E5"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#4F46E5"
      },
      "package": "com.shiksha.app",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "NOTIFICATIONS"
      ],
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "bundleIdentifier": "com.shiksha.app",
      "supportsTablet": true,
      "buildNumber": "1"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#4F46E5"
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow Shiksha to access your photos for student profiles and homework."
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Allow Shiksha to take photos for ID cards and homework."
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### 13.3 Play Store Deployment Steps

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to Expo account
eas login

# 3. Configure project
eas build:configure

# 4. Build for Android (AAB for Play Store)
eas build --platform android --profile production

# 5. Submit to Play Store
eas submit --platform android --profile production

# OR download the AAB and manually upload to Play Console:
# → https://play.google.com/console
```

### 13.4 Play Store Requirements Checklist

- [ ] **App name**: Shiksha - School Management
- [ ] **Package name**: `com.shiksha.app`
- [ ] **Target SDK**: API 34 (Android 14)
- [ ] **App icon**: 512x512 PNG
- [ ] **Feature graphic**: 1024x500 PNG
- [ ] **Screenshots**: Min 2, max 8 per device type (phone + tablet)
- [ ] **Privacy policy URL**: Required
- [ ] **App category**: Education
- [ ] **Content rating**: Complete IARC questionnaire
- [ ] **Data safety form**: Declare data collection practices
- [ ] **App signing**: Use Google Play App Signing (recommended)
- [ ] **Internal testing**: Test with internal track first
- [ ] **Closed testing → Open testing → Production**: Staged rollout

---

## 14. CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/mobile-build.yml
name: Mobile App Build

on:
  push:
    branches: [main]
    paths: ['shiksha-mobile/**']
  pull_request:
    branches: [main]
    paths: ['shiksha-mobile/**']

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: shiksha-mobile

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: shiksha-mobile/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run TypeScript check
        run: npx tsc --noEmit

      - name: Run tests
        run: npm test

      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build Android (Preview)
        if: github.event_name == 'pull_request'
        run: eas build --platform android --profile preview --non-interactive

      - name: Build Android (Production)
        if: github.ref == 'refs/heads/main'
        run: eas build --platform android --profile production --non-interactive

      - name: Submit to Play Store
        if: github.ref == 'refs/heads/main'
        run: eas submit --platform android --profile production --non-interactive
```

---

## 15. Environment Configuration

### 15.1 Build-time Configuration

```bash
# .env.development
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001
EXPO_PUBLIC_API_VERSION=v1
EXPO_PUBLIC_APP_ENV=development

# .env.staging
EXPO_PUBLIC_API_URL=https://staging-api.shiksha.example.com
EXPO_PUBLIC_API_VERSION=v1
EXPO_PUBLIC_APP_ENV=staging

# .env.production
EXPO_PUBLIC_API_URL=https://api.shiksha.example.com
EXPO_PUBLIC_API_VERSION=v1
EXPO_PUBLIC_APP_ENV=production
```

### 15.2 Runtime Configuration (Changeable by User)

```typescript
// The AppConfig class (Section 7.1) allows runtime URL changes.
// This is useful for:
// - Multi-school deployments (each school has its own backend)
// - Testing against different environments
// - Self-hosted customers pointing to their own servers
```

---

## 16. Testing Strategy

| Type | Tool | What to Test |
|------|------|-------------|
| Unit | Jest + Testing Library | Services, utilities, hooks |
| Component | React Native Testing Library | UI components |
| Integration | Jest + MSW | API integration flows |
| E2E | Detox or Maestro | Full user flows |
| Visual | Storybook for React Native | Component library |

```bash
# Test commands
npm test                    # Unit + component tests
npm run test:e2e            # E2E with Maestro
npx maestro test flows/     # Run Maestro E2E flows
```

---

## 17. Shared Code Between Web and Mobile

### Create a shared package for common logic:

```
shiksha/
├── packages/
│   └── shared/                    # Shared between web + mobile
│       ├── types/                 # TypeScript types
│       │   ├── student.types.ts
│       │   ├── homework.types.ts
│       │   └── ...
│       ├── constants/             # Shared constants
│       │   ├── roles.ts
│       │   ├── tables.ts
│       │   └── validation.ts
│       ├── utils/                 # Pure utility functions
│       │   ├── date-utils.ts
│       │   ├── format-utils.ts
│       │   └── validation-utils.ts
│       └── schemas/               # Zod validation schemas
│           ├── student.schema.ts
│           ├── homework.schema.ts
│           └── ...
├── src/                           # Existing web app
└── shiksha-mobile/                # New mobile app
```

---

## 18. Migration Plan from Supabase

### Phase 1: Build Backend API (Weeks 1-3)
1. Set up NestJS project with Prisma
2. Create Prisma schema matching current Supabase tables
3. Implement auth module (JWT, register, login, refresh)
4. Implement CRUD modules for all tables
5. Set up MinIO for file storage
6. Write API tests

### Phase 2: Build Mobile App Shell (Weeks 2-4)
1. Set up Expo project with router
2. Implement auth flow (login, register, token management)
3. Create configurable API client
4. Build base UI components (NativeWind)
5. Set up navigation (tabs + drawer)

### Phase 3: Implement Mobile Features (Weeks 4-8)
1. Dashboard with charts
2. Student management (list, detail, CRUD)
3. Homework & Classwork (list, detail, create, edit)
4. Attendance (daily marking grid)
5. Fee management (view, payment history)
6. ID Card generator (camera + template)
7. Admissions module
8. Interactive assignments
9. Parent feedback
10. Birthdays, Date Sheet, Fee Structure
11. Sports Week + Enrollment
12. Push notifications
13. Offline support

### Phase 4: Migrate Web App to New Backend (Weeks 6-8)
1. Create a new API service layer in the web app that hits REST API
2. Replace Supabase calls one module at a time
3. Test extensively
4. Switch DNS from Supabase to new backend

### Phase 5: Deploy & Launch (Weeks 8-10)
1. Set up production infrastructure (VPS/Cloud)
2. Deploy backend with Docker
3. Build production APK/AAB
4. Internal testing → Closed testing → Production
5. Submit to Play Store
6. Monitor and iterate

---

## 19. Step-by-Step Implementation Roadmap

### Immediate Next Steps (This Week)

```bash
# 1. Create the mobile app project
mkdir -p shiksha-mobile && cd shiksha-mobile
npx create-expo-app@latest . --template tabs

# 2. Create the backend project
mkdir -p shiksha-api && cd shiksha-api
npx @nestjs/cli new . --strict

# 3. Set up Prisma in backend
npm install prisma @prisma/client
npx prisma init --datasource-provider postgresql

# 4. Copy & convert database schema
# (from database.types.ts → prisma/schema.prisma)
```

### Week 1 Checklist
- [ ] NestJS project initialized with modules structure
- [ ] Prisma schema created matching all `school` tables
- [ ] Auth module implemented (login, register, JWT)
- [ ] Health check endpoint (`GET /api/v1/health`)
- [ ] Docker Compose for local dev (Postgres + Redis + MinIO)
- [ ] Expo project initialized with TypeScript
- [ ] NativeWind (Tailwind) configured
- [ ] Configurable API client created
- [ ] Login screen implemented

### Week 2-3 Checklist
- [ ] All CRUD backend modules implemented
- [ ] File upload/download working via MinIO
- [ ] Swagger documentation generated
- [ ] Mobile: Dashboard screen with charts
- [ ] Mobile: Student list + detail screens
- [ ] Mobile: Homework list + detail + CRUD
- [ ] Mobile: Bottom tab navigation working

### Week 4-6 Checklist
- [ ] Mobile: All remaining screens implemented
- [ ] Push notifications end-to-end
- [ ] Offline mode with react-query
- [ ] Deep linking for share URLs
- [ ] Camera integration for ID cards and homework

### Week 7-8 Checklist
- [ ] Web app migrated to new backend API
- [ ] Both web and mobile working with same backend
- [ ] End-to-end testing
- [ ] Performance optimization

### Week 9-10 Checklist
- [ ] Production deployment
- [ ] Play Store submission
- [ ] App Store submission (if needed)
- [ ] Monitoring setup (Sentry, analytics)

---

## 20. Cost & Timeline Estimates

### Infrastructure Costs (Monthly)

| Service | Option A (Budget) | Option B (Production) |
|---------|-------------------|----------------------|
| VPS (Backend + DB) | $10-20 (Hetzner/DigitalOcean) | $50-100 (AWS/GCP) |
| MinIO/File Storage | Included in VPS | $5-20 (S3) |
| Redis | Included in VPS | $15 (Upstash/ElastiCache) |
| Domain + SSL | $10/year | $10/year |
| Expo EAS Build | Free (30 builds/mo) | $99/mo (unlimited) |
| Play Store | $25 one-time | $25 one-time |
| Apple Developer | $99/year | $99/year |
| **Total Monthly** | **~$15-25** | **~$100-200** |

### Timeline Summary

| Phase | Duration | Effort |
|-------|----------|--------|
| Backend API | 3 weeks | 1 developer |
| Mobile App Shell | 2 weeks | 1 developer |
| Mobile Features | 4 weeks | 1-2 developers |
| Web Migration | 2 weeks | 1 developer |
| Testing + Deploy | 2 weeks | 1 developer |
| **Total** | **8-10 weeks** | **1-2 developers** |

---

## Quick Start Commands

```bash
# Clone and set up
git clone <repo> && cd shiksha

# --- Backend ---
cd shiksha-api
cp .env.example .env          # Configure DB, JWT, MinIO
docker compose up -d           # Start Postgres, Redis, MinIO
npm install
npx prisma migrate dev         # Run migrations
npm run start:dev              # Start backend (http://localhost:3001)

# --- Mobile App ---
cd shiksha-mobile
npm install
npx expo start                 # Start dev server
# Press 'a' for Android emulator
# Press 'i' for iOS simulator
# Scan QR code for physical device (Expo Go)

# --- Build for Play Store ---
eas build --platform android --profile production
eas submit --platform android
```

---

## Summary

| Decision | Choice |
|----------|--------|
| **Mobile Framework** | React Native + Expo (SDK 52+) |
| **Mobile UI** | NativeWind (Tailwind CSS for RN) |
| **Mobile Navigation** | Expo Router (file-based) |
| **Backend Framework** | NestJS + Prisma + PostgreSQL |
| **Authentication** | JWT (access + refresh tokens) |
| **File Storage** | MinIO (S3-compatible, self-hosted) |
| **Push Notifications** | Expo Notifications + FCM |
| **Offline Support** | React Query + AsyncStorage |
| **State Management** | Zustand (reused from web) |
| **Build System** | EAS Build (Expo Application Services) |
| **Deployment** | Docker (backend) + Play Store (mobile) |
| **Configurable URL** | Runtime config via SecureStore + Settings screen |

This architecture ensures:
- **Code reuse**: TypeScript, Zustand, Zod schemas shared between web & mobile
- **Configurability**: Backend URL changeable at runtime
- **Scalability**: NestJS modular architecture grows with the app
- **Independence**: No vendor lock-in (self-hosted everything)
- **Native Experience**: True native UI via React Native (not WebView)
