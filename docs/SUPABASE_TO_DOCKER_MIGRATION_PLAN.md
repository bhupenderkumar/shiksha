# Supabase to Docker Migration Plan

**Generated:** December 26, 2025  
**Status:** Planning Phase  
**Total Files Affected:** 80+

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Architecture](#current-architecture)
3. [Proposed Docker Architecture](#proposed-docker-architecture)
4. [Files Requiring Changes](#files-requiring-changes)
5. [Critical Issues Found](#critical-issues-found)
6. [Migration Steps](#migration-steps)
7. [Backup Strategy](#backup-strategy)
8. [Recommended Docker Stack](#recommended-docker-stack)

---

## Executive Summary

This document outlines the complete plan to migrate from Supabase cloud (free tier) to a self-hosted Docker solution. The migration involves:

- **PostgreSQL Database** - 40+ tables in `school` schema
- **Authentication** - Email/password login with Supabase Auth
- **File Storage** - 2 storage buckets for file uploads
- **80+ files** need review/updates

### Why Migrate?

- Supabase free tier pauses after 7 days of inactivity
- No control over uptime
- Limited to free tier quotas

### Recommended Solution

**Self-hosted Supabase via Docker** - This keeps the same API, minimizing code changes.

---

## Current Architecture

### Supabase Features Used

| Feature | Usage |
|---------|-------|
| **PostgreSQL** | `school` schema with 40+ tables |
| **Authentication** | Email/password, session management |
| **Storage** | File uploads (images, PDFs, documents) |
| **Admin API** | Creating users programmatically |
| **RPC Functions** | `execute_sql` custom function |

### Environment Variables

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_SUPABASE_SERVICE_ROLE_KEY=xxx
```

### Database Schema

**Schema Name:** `school` (NOT `public`)

### Storage Buckets

1. `shiksha-files` - Main file storage
2. `admission-documents` - Admission related files

---

## Proposed Docker Architecture

### Option 1: Self-Hosted Supabase (Recommended - Minimal Code Changes)

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Compose Stack                      │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  PostgreSQL  │   PostgREST  │   GoTrue     │    Storage     │
│   (DB)       │   (REST API) │   (Auth)     │   (S3/MinIO)   │
├──────────────┴──────────────┴──────────────┴────────────────┤
│                      Kong (API Gateway)                       │
├──────────────────────────────────────────────────────────────┤
│                    Supabase Studio (Admin)                    │
└──────────────────────────────────────────────────────────────┘
```

**Pros:**
- Same `@supabase/supabase-js` client works
- Minimal code changes (just environment variables)
- Built-in backup tools
- Supabase Studio for database management

**Cons:**
- Heavier resource usage (~2GB RAM minimum)
- More complex Docker setup

### Option 2: Custom Stack (More Control, More Code Changes)

```
┌───────────────────────────────────────────────────┐
│               Docker Compose Stack                 │
├─────────────┬─────────────┬───────────────────────┤
│ PostgreSQL  │    MinIO    │   Ory Kratos/Keycloak │
│   (DB)      │  (Storage)  │      (Auth)           │
├─────────────┴─────────────┴───────────────────────┤
│            Custom API Layer (Express/Fastify)      │
└───────────────────────────────────────────────────┘
```

**Pros:**
- Lighter resource usage
- Full control over every component

**Cons:**
- Requires rewriting all service files
- Need to build custom API wrapper
- 2-3 weeks additional development time

---

## Files Requiring Changes

### 1. CORE CONFIGURATION FILES (Priority: HIGH)

| File | Changes Needed |
|------|----------------|
| [src/lib/api-client.ts](../src/lib/api-client.ts) | Update URL/keys to point to self-hosted instance |
| [src/lib/constants.ts](../src/lib/constants.ts) | Verify schema and bucket names |
| [src/database.types.ts](../src/database.types.ts) | Regenerate types after migration |
| [package.json](../package.json) | Keep `@supabase/supabase-js` dependency |
| [supabase/config.toml](../supabase/config.toml) | Reference for Docker config |

### 2. AUTHENTICATION FILES (Priority: HIGH)

| File | Supabase Auth Methods Used |
|------|---------------------------|
| [src/lib/class-auth-provider.tsx](../src/lib/class-auth-provider.tsx) | signInWithPassword, signUp, signOut, getSession, onAuthStateChange |
| [src/lib/auth-provider.ts](../src/lib/auth-provider.ts) | Re-exports class-auth-provider |
| [src/lib/auth.ts](../src/lib/auth.ts) | Re-exports class-auth-provider |
| [src/backend/authService.ts](../src/backend/authService.ts) | signInWithPassword, signUp, signOut, getUser |
| [src/services/auth.service.ts](../src/services/auth.service.ts) | Duplicate of above |
| [src/components/forms/ForgotPasswordForm.tsx](../src/components/forms/ForgotPasswordForm.tsx) | resetPasswordForEmail |
| [src/components/forms/LoginForm.tsx](../src/components/forms/LoginForm.tsx) | Uses useAuth hook |

### 3. SERVICE FILES - src/services/ (Priority: HIGH)

| File | Tables Used | Uses Storage | Uses Auth |
|------|-------------|--------------|-----------|
| [admission.service.ts](../src/services/admission.service.ts) | ProspectiveStudent, AdmissionProcess | ✅ admission-documents | ❌ |
| [assignment.service.ts](../src/services/assignment.service.ts) | Homework | ❌ | ❌ |
| [attendance.service.ts](../src/services/attendance.service.ts) | Attendance | ❌ | ❌ |
| [auth.service.ts](../src/services/auth.service.ts) | - | ❌ | ✅ |
| [base.service.ts](../src/services/base.service.ts) | Generic base class | ❌ | ❌ |
| [class.service.ts](../src/services/class.service.ts) | Class | ❌ | ❌ |
| [classwork.service.ts](../src/services/classwork.service.ts) | Classwork | ❌ | ❌ |
| [dashboard.service.ts](../src/services/dashboard.service.ts) | Multiple tables | ❌ | ❌ |
| [feedback.service.ts](../src/services/feedback.service.ts) | feedback, feedback_reply | ❌ | ❌ |
| [fee.service.ts](../src/services/fee.service.ts) | Fee, Student | ✅ URLs | ❌ |
| [file.service.ts](../src/services/file.service.ts) | - | ✅ shiksha-files | ❌ |
| [fileTable.service.ts](../src/services/fileTable.service.ts) | File | ❌ | ❌ |
| [homework.service.ts](../src/services/homework.service.ts) | Homework | ❌ | ❌ |
| [idcard.service.ts](../src/services/idcard.service.ts) | IDCard | ✅ shiksha-files | ❌ |
| [interactive-assignment.service.ts](../src/services/interactive-assignment.service.ts) | InteractiveAssignment, Question | ❌ | ❌ |
| [notification.service.ts](../src/services/notification.service.ts) | Notification | ❌ | ❌ |
| [parent-feedback-certificate.service.ts](../src/services/parent-feedback-certificate.service.ts) | parent_feedback_certificate | ✅ shiksha-files | ✅ |
| [parent-submitted-feedback.service.ts](../src/services/parent-submitted-feedback.service.ts) | parent_feedback | ❌ | ❌ |
| [profile.service.ts](../src/services/profile.service.ts) | Profile, Student | ❌ | ✅ |
| [progress.service.ts](../src/services/progress.service.ts) | StudentProgress | ❌ | ❌ |
| [settings.service.ts](../src/services/settings.service.ts) | Settings, UserSettings | ✅ shiksha-files | ❌ |
| [student.service.ts](../src/services/student.service.ts) | Student, Profile | ❌ | ✅ Admin API |
| [student-feedback.service.ts](../src/services/student-feedback.service.ts) | StudentFeedback | ✅ shiksha-files | ✅ |
| [student-progress.service.ts](../src/services/student-progress.service.ts) | StudentProgress | ❌ | ❌ |
| [subject.service.ts](../src/services/subject.service.ts) | Subject | ❌ | ❌ |
| [year-end-feedback.service.ts](../src/services/year-end-feedback.service.ts) | year_end_feedback | ✅ shiksha-files | ❌ |
| [anonymous-user.service.ts](../src/services/anonymous-user.service.ts) | AnonymousUser | ❌ | ❌ |

### 4. BACKEND SERVICE FILES - src/backend/ (Priority: MEDIUM - Legacy)

| File | Tables Used | Uses Storage | Uses Auth |
|------|-------------|--------------|-----------|
| [admissionService.ts](../src/backend/admissionService.ts) | ProspectiveStudent | ✅ | ❌ |
| [assignmentService.ts](../src/backend/assignmentService.ts) | Homework | ❌ | ❌ |
| [attendanceService.ts](../src/backend/attendanceService.ts) | Attendance | ❌ | ❌ |
| [authService.ts](../src/backend/authService.ts) | - | ❌ | ✅ |
| [classService.ts](../src/backend/classService.ts) | Class | ❌ | ❌ |
| [classworkService.ts](../src/backend/classworkService.ts) | Classwork | ❌ | ❌ |
| [dashboardService.ts](../src/backend/dashboardService.ts) | Multiple | ❌ | ❌ |
| [feedbackService.ts](../src/backend/feedbackService.ts) | feedback | ❌ | ❌ |
| [feesService.ts](../src/backend/feesService.ts) | Fee | ✅ URLs | ❌ |
| [fileService.ts](../src/backend/fileService.ts) | - | ✅ | ❌ |
| [fileTableService.ts](../src/backend/fileTableService.ts) | File | ❌ | ❌ |
| [homeworkService.ts](../src/backend/homeworkService.ts) | Homework | ❌ | ❌ |
| [idCardService.ts](../src/backend/idCardService.ts) | IDCard | ✅ | ❌ |
| [interactiveAssignmentService.ts](../src/backend/interactiveAssignmentService.ts) | InteractiveAssignment | ❌ | ❌ |
| [notificationService.ts](../src/backend/notificationService.ts) | Notification | ❌ | ❌ |
| [pdfService.ts](../src/backend/pdfService.ts) | - | ❌ | ❌ |
| [profileService.ts](../src/backend/profileService.ts) | Profile | ❌ | ✅ |

### 5. PAGES WITH DIRECT SUPABASE USAGE (Priority: HIGH)

| File | Issue |
|------|-------|
| [src/pages/ManageSubjects.tsx](../src/pages/ManageSubjects.tsx) | ⚠️ Missing `.schema(SCHEMA)` - BUG |
| [src/pages/ManageStudents.tsx](../src/pages/ManageStudents.tsx) | ⚠️ Missing `.schema(SCHEMA)` - BUG |
| [src/pages/TeacherTimetable.tsx](../src/pages/TeacherTimetable.tsx) | Uses supabase directly |
| [src/pages/TimetablePage.tsx](../src/pages/TimetablePage.tsx) | Uses supabase directly |

### 6. PAGES USING AUTH HOOK (Priority: MEDIUM)

All these pages use `useAuth()` hook and need auth working:

- [src/pages/Home.tsx](../src/pages/Home.tsx)
- [src/pages/Login.tsx](../src/pages/Login.tsx)
- [src/pages/Dashboard.tsx](../src/pages/Dashboard.tsx)
- [src/pages/Attendance.tsx](../src/pages/Attendance.tsx)
- [src/pages/Profile.tsx](../src/pages/Profile.tsx)
- [src/pages/Fees.tsx](../src/pages/Fees.tsx)
- [src/pages/Homework.tsx](../src/pages/Homework.tsx)
- [src/pages/Classwork.tsx](../src/pages/Classwork.tsx)
- [src/pages/ManageClasses.tsx](../src/pages/ManageClasses.tsx)
- [src/pages/ManageStudents.tsx](../src/pages/ManageStudents.tsx)
- [src/pages/ManageSubjects.tsx](../src/pages/ManageSubjects.tsx)
- [src/pages/ManageHomework.tsx](../src/pages/ManageHomework.tsx)
- [src/pages/ManageClasswork.tsx](../src/pages/ManageClasswork.tsx)
- [src/pages/ManageIDCards.tsx](../src/pages/ManageIDCards.tsx)
- [src/pages/ManageNotifications.tsx](../src/pages/ManageNotifications.tsx)
- [src/pages/ManageAttendance.tsx](../src/pages/ManageAttendance.tsx)
- [src/pages/GrievanceManagement.tsx](../src/pages/GrievanceManagement.tsx)
- [src/pages/ParentFeedback.tsx](../src/pages/ParentFeedback.tsx)
- [src/pages/FeeManagement.tsx](../src/pages/FeeManagement.tsx)
- [src/pages/Settings.tsx](../src/pages/Settings.tsx)
- [src/pages/AdminReviews.tsx](../src/pages/AdminReviews.tsx)
- [src/pages/AdmissionManagement.tsx](../src/pages/AdmissionManagement.tsx)
- [src/pages/InteractiveAssignmentsAdmin.tsx](../src/pages/InteractiveAssignmentsAdmin.tsx)

### 7. COMPONENTS WITH STORAGE USAGE (Priority: HIGH)

| File | Storage Operations |
|------|-------------------|
| [src/components/FileUploader.tsx](../src/components/FileUploader.tsx) | upload, getPublicUrl |
| [src/components/PhotoUploader.tsx](../src/components/PhotoUploader.tsx) | upload, getPublicUrl |
| [src/components/IDCardGenerator.tsx](../src/components/IDCardGenerator.tsx) | getPublicUrl |
| [src/components/id-card-generator.tsx](../src/components/id-card-generator.tsx) | getPublicUrl |
| [src/components/Attachment.tsx](../src/components/Attachment.tsx) | Checks supabase URLs |
| [src/components/ReviewCard.tsx](../src/components/ReviewCard.tsx) | Checks supabase URLs |
| [src/components/admission/DocumentUpload.tsx](../src/components/admission/DocumentUpload.tsx) | upload |
| [src/components/settings/SchoolLogoUpload.tsx](../src/components/settings/SchoolLogoUpload.tsx) | upload, getPublicUrl |

### 8. SQL MIGRATION FILES (Priority: HIGH)

All these need to be run on the self-hosted PostgreSQL:

| File | Description |
|------|-------------|
| [migrations/20240126_add_admission_process_columns.sql](../migrations/20240126_add_admission_process_columns.sql) | Admission process columns |
| [migrations/20250410_add_id_card_table.sql](../migrations/20250410_add_id_card_table.sql) | ID Card table + storage bucket |
| [migrations/create_parent_feedback_certificate_tables.sql](../migrations/create_parent_feedback_certificate_tables.sql) | Feedback tables + RLS |
| [supabase/migrations/](../supabase/migrations/) | All Supabase migration files |

### 9. OTHER FILES (Priority: LOW)

| File | Changes Needed |
|------|----------------|
| [src/lib/rest-client.ts](../src/lib/rest-client.ts) | Update URL patterns if needed |
| [src/api/maps.ts](../src/api/maps.ts) | Creates separate Supabase client |
| [scripts/add-sample-feedback.js](../scripts/add-sample-feedback.js) | Update connection params |
| [src/scripts/export-id-cards.ts](../src/scripts/export-id-cards.ts) | Update domain checks |

---

## Critical Issues Found

### 🚨 Issue 1: Missing Schema in Direct Queries (BUG - Fix Before Migration)

These files query Supabase WITHOUT using the `school` schema:

**File:** `src/pages/ManageSubjects.tsx`
```typescript
// WRONG - queries 'public' schema
const { error } = await supabase.from('subjects').delete().eq('id', id);

// CORRECT
const { error } = await supabase.schema(SCHEMA).from('subjects').delete().eq('id', id);
```

**File:** `src/pages/ManageStudents.tsx`
```typescript
// WRONG - queries 'public' schema
const { error } = await supabase.from('students').insert([...]);

// CORRECT
const { error } = await supabase.schema(SCHEMA).from('students').insert([...]);
```

### 🚨 Issue 2: Admin Auth API Usage

**File:** `src/services/student.service.ts`

Uses Supabase Admin Auth API:
- `supabase.auth.admin.createUser()`
- `supabase.auth.admin.deleteUser()`
- `supabase.auth.admin.updateUserById()`

**Requires:** Service role key must be configured with admin privileges in self-hosted instance.

### 🚨 Issue 3: Custom RPC Function

**File:** `src/services/student.service.ts`
```typescript
await supabase.rpc('execute_sql', { sql: query });
```

**Requires:** Create this PostgreSQL function in self-hosted database:
```sql
CREATE OR REPLACE FUNCTION school.execute_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 🚨 Issue 4: Hardcoded Supabase Domain Checks

These files check for `supabase.co` domain in URLs:

| File | Code Pattern |
|------|-------------|
| [src/components/Attachment.tsx](../src/components/Attachment.tsx) | `url.includes('supabase.co')` |
| [src/components/ReviewCard.tsx](../src/components/ReviewCard.tsx) | `url.includes('supabase.co')` |
| [src/backend/feesService.ts](../src/backend/feesService.ts) | `url.includes('supabase.co')` |
| [src/scripts/export-id-cards.ts](../src/scripts/export-id-cards.ts) | `url.includes('supabase.co')` |

**Fix:** Update to also check for self-hosted domain or use environment variable.

---

## Migration Steps

### Phase 1: Setup (Day 1-2)

- [ ] Set up VPS/server for Docker hosting
- [ ] Install Docker and Docker Compose
- [ ] Clone Supabase self-hosted repository
- [ ] Configure docker-compose.yml with proper settings
- [ ] Set up reverse proxy (Nginx/Caddy) with SSL

### Phase 2: Database Migration (Day 3-4)

- [ ] Export existing data from Supabase cloud using `pg_dump`
- [ ] Create `school` schema in self-hosted PostgreSQL
- [ ] Run all migration files in order
- [ ] Import existing data
- [ ] Verify data integrity
- [ ] Create `execute_sql` RPC function
- [ ] Regenerate TypeScript types

### Phase 3: Storage Migration (Day 5)

- [ ] Create storage buckets: `shiksha-files`, `admission-documents`
- [ ] Configure bucket permissions (public read for some)
- [ ] Migrate existing files from Supabase Storage
- [ ] Update any hardcoded URLs

### Phase 4: Code Updates (Day 6-7)

- [ ] Update environment variables
- [ ] Fix missing `.schema(SCHEMA)` bugs
- [ ] Update hardcoded `supabase.co` domain checks
- [ ] Test authentication flow
- [ ] Test file uploads/downloads
- [ ] Test all CRUD operations

### Phase 5: Testing & Go-Live (Day 8-10)

- [ ] Full application testing
- [ ] Performance testing
- [ ] Set up automated backups
- [ ] Configure monitoring
- [ ] Update DNS to point to self-hosted
- [ ] Monitor for issues

---

## Backup Strategy

### PostgreSQL Backups

```yaml
# Add to docker-compose.yml
postgres-backup:
  image: prodrigestivill/postgres-backup-local
  restart: always
  volumes:
    - ./backups:/backups
  environment:
    POSTGRES_HOST: db
    POSTGRES_DB: postgres
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    SCHEDULE: "@daily"
    BACKUP_KEEP_DAYS: 7
    BACKUP_KEEP_WEEKS: 4
    BACKUP_KEEP_MONTHS: 6
```

### Storage Backups

```yaml
# Add to docker-compose.yml for MinIO/Storage backups
minio-backup:
  image: minio/mc
  entrypoint: /bin/sh
  command: >
    -c "mc alias set myminio http://storage:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD} && 
        mc mirror myminio/shiksha-files /backups/storage/"
  volumes:
    - ./backups/storage:/backups/storage
```

### Backup Locations

```
/backups/
├── postgres/
│   ├── daily/
│   ├── weekly/
│   └── monthly/
└── storage/
    ├── shiksha-files/
    └── admission-documents/
```

### Off-site Backup (Recommended)

Configure rsync or rclone to sync backups to:
- AWS S3
- Google Cloud Storage
- Backblaze B2
- Another VPS

---

## Recommended Docker Stack

### docker-compose.yml Structure

```yaml
version: "3.8"

services:
  # PostgreSQL Database
  db:
    image: supabase/postgres:15.1.0.117
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    
  # Supabase Studio (Admin UI)
  studio:
    image: supabase/studio:latest
    
  # Kong API Gateway
  kong:
    image: kong:2.8.1
    
  # GoTrue (Authentication)
  auth:
    image: supabase/gotrue:v2.99.0
    
  # PostgREST (REST API)
  rest:
    image: postgrest/postgrest:v11.2.0
    
  # Storage API
  storage:
    image: supabase/storage-api:v0.40.4
    
  # Realtime (if needed)
  realtime:
    image: supabase/realtime:v2.25.27
    
  # Backup Service
  postgres-backup:
    image: prodrigestivill/postgres-backup-local
    
volumes:
  postgres-data:
```

### Minimum Server Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 4 GB | 8 GB |
| Storage | 40 GB SSD | 100 GB SSD |
| Bandwidth | 1 TB/month | Unlimited |

### Hosting Options

| Provider | Cost/Month | Notes |
|----------|------------|-------|
| DigitalOcean Droplet | $24 | 4GB RAM, easy setup |
| Hetzner VPS | $10 | Best value, EU only |
| Linode | $24 | Good performance |
| Vultr | $24 | Many locations |
| AWS Lightsail | $20 | AWS ecosystem |

---

## Summary

### Files by Priority

| Priority | Count | Description |
|----------|-------|-------------|
| **CRITICAL** | 4 | Bugs to fix + Admin API setup |
| **HIGH** | ~35 | Core services, auth, storage, config |
| **MEDIUM** | ~30 | Secondary services, pages with auth |
| **LOW** | ~15 | Legacy files, scripts |

### Estimated Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| Setup | 2 days | Server + Docker setup |
| Database | 2 days | Schema + data migration |
| Storage | 1 day | Files migration |
| Code | 2 days | Update code + fix bugs |
| Testing | 3 days | Full testing + go-live |
| **Total** | **10 days** | Complete migration |

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Data loss | Low | High | Multiple backup layers |
| Downtime | Medium | Medium | Migration during low-traffic hours |
| Auth issues | Medium | High | Test thoroughly before go-live |
| Performance | Low | Medium | Proper server sizing |

---

## Next Steps

1. **Review this document** and ask questions
2. **Choose hosting provider** based on budget
3. **Set up staging environment** first
4. **Test migration** on staging before production
5. **Schedule maintenance window** for production migration

---

*Document generated by GitHub Copilot for Shiksha project migration planning.*
