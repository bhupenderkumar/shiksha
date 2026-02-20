# Security Audit Report — Shiksha School Management System

**Date:** February 20, 2026  
**Scope:** Full frontend codebase, Supabase configuration, deployment config  
**Application:** React + Vite + TypeScript + Supabase (PostgreSQL)

---

## Executive Summary

The application has **3 Critical**, **6 High**, **7 Medium**, and **5 Low** severity security issues. The most urgent risks are: real credentials committed to the Git repository, role-based access control completely bypassed, and a service role key pattern that exposes admin secrets to the browser.

| Severity | Count |
|----------|-------|
| **Critical** | 3 |
| **High** | 6 |
| **Medium** | 7 |
| **Low** | 5 |

---

## Critical Issues

### 1. Real Credentials Committed to Git

**File:** `.env.cloud-backup` (tracked by Git)  
**Severity:** Critical

**Risk:** The file `.env.cloud-backup` is tracked by Git and contains real production credentials:
- Supabase URL and anon key
- **Database connection string with plaintext password:** `postgresql://postgres:3NxHriuzwMIJD87s@db.ytfzqzjuhcdgcvvqihda.supabase.co:5432/postgres`
- Google Maps API key: `AIzaSyD7IJF39_HZvW9Bhno1guh95uAfY79WpaA`
- YouTube API key: `AIzaSyBqQ5PqyArDzq9aodIEyZglrffRlqsNh-M`

Anyone with read access to this repository can extract these credentials and gain full database access.

**Remediation:**
1. **Immediately rotate ALL exposed credentials** — Supabase keys, database password, Google Maps key, YouTube key.
2. Remove the file from Git history using `git filter-branch` or [BFG Repo Cleaner](https://rtyley.github.io/bfg-repo-cleaner/).
3. Add `.env.cloud-backup` to `.gitignore`.
4. Audit Git history for any other committed secrets.

---

### 2. Role-Based Access Control Completely Bypassed

**File:** `src/components/ProtectedRoute.tsx` (lines 30–35)  
**Severity:** Critical

**Risk:** The `ProtectedRoute` component accepts `allowedRoles` but **never enforces them**. The role check is replaced with a `console.log`:

```typescript
if (allowedRoles.length > 0) {
  console.log('Role check bypassed:', {
    allowedRoles,
    message: 'Role checking is disabled to avoid Profile API calls'
  });
}
```

Routes in `App.tsx` pass `allowedRoles` like `['TEACHER', 'ADMIN']`, but these are silently ignored. **Any authenticated user — including students — can access admin pages** such as student management, fee management, and settings.

**Remediation:**
1. Implement role checking by fetching the user's profile/role on login and caching it in auth context.
2. Compare the user's role against `allowedRoles` in `ProtectedRoute`.
3. Redirect unauthorized users to an `/unauthorized` page.
4. Consider using Supabase's JWT custom claims to embed roles in the token (avoids extra API calls).

---

### 3. Service Role Key Pattern Exposes Admin Secrets to Browser

**File:** `src/lib/api-client.ts` (line 7)  
**Severity:** Critical

**Risk:** The code reads `VITE_SUPABASE_SERVICE_ROLE_KEY` from environment variables:

```typescript
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
```

Any variable with the `VITE_` prefix is **bundled into the client-side JavaScript** and shipped to the browser. The service role key grants **full admin access** with all RLS policies bypassed. Even though `supabaseAdmin` currently aliases the regular `supabase` client (line 22), the infrastructure is set up to leak the service role key.

The `.env.example` also documents this pattern, encouraging developers to set `VITE_SUPABASE_SERVICE_ROLE_KEY`.

**Remediation:**
1. **Never** use `VITE_` prefix for service role keys.
2. Move all admin operations (creating users, deleting users, admin queries) to **Supabase Edge Functions** or a backend API.
3. Remove the `supabaseAdmin` export from `api-client.ts`.
4. Update `.env.example` to remove the service role key variable.

---

## High Issues

### 4. All Environment Variables Exposed to Browser

**File:** `vite.config.ts` (line 13)  
**Severity:** High

**Risk:** The Vite config uses:

```typescript
define: {
  'process.env': env,
}
```

`loadEnv(mode, process.cwd(), '')` loads **all** env variables (not just `VITE_`-prefixed ones), and `'process.env': env` injects them all into the browser bundle. This includes `DATABASE_URL` with the database password if present in `.env`.

**Remediation:**
1. Remove `'process.env': env` from the `define` block.
2. Access client-safe variables only via `import.meta.env.VITE_*`.
3. If specific `process.env` variables are needed, whitelist them explicitly:
   ```typescript
   define: {
     'process.env.NODE_ENV': JSON.stringify(mode),
   }
   ```

---

### 5. User Can Self-Select Role During Registration

**File:** `src/pages/Register.tsx`, `src/lib/class-auth-provider.tsx` (lines 80–102)  
**Severity:** High

**Risk:** The registration form allows users to pick their own role (`student`, `teacher`, or `admin`). The `signUp` function inserts this user-chosen role directly into the `profiles` table with no server-side validation. **Any user can register as ADMIN.**

**Remediation:**
1. Remove role selection from the client-side registration form.
2. Assign a default role (e.g., `STUDENT`) for all new signups.
3. Create an admin-only server-side endpoint (Edge Function) to promote users to higher roles.
4. Add a database trigger or RLS policy to prevent users from setting their own role to `ADMIN`.

---

### 6. SQL Injection via `execute_sql` RPC Function

**File:** `src/services/student.service.ts` (lines 270–291)  
**Severity:** High

**Risk:** The code constructs raw SQL using string interpolation and sends it to a `execute_sql` RPC function:

```typescript
const safeClassId = classId.replace(/'/g, "''");
const query = `SELECT ... FROM school."Student" WHERE "classId" = '${safeClassId}' ...`;
const { data } = await supabase.rpc('execute_sql', { sql: query });
```

The single-quote escaping is insufficient — it can be bypassed with encoding tricks, backslash attacks, or Unicode exploits. An `execute_sql` function that accepts arbitrary SQL is an **extreme risk vector**.

**Remediation:**
1. **Remove the `execute_sql` RPC function entirely** from the database.
2. Use the Supabase client's built-in query builder exclusively:
   ```typescript
   const { data } = await supabase
     .schema('school')
     .from('Student')
     .select('id, name, admissionNumber, classId')
     .eq('classId', classId)
     .order('name');
   ```
3. If custom SQL is absolutely needed, use parameterized queries in a Postgres function with explicit parameters — not arbitrary SQL strings.

---

### 7. No Security Headers on Production Deployment

**File:** `netlify.toml`  
**Severity:** High

**Risk:** The deployment configuration has **zero security headers**:
- No `Content-Security-Policy` — allows inline scripts, arbitrary origins
- No `Strict-Transport-Security` — no HTTPS enforcement
- No `X-Frame-Options` — vulnerable to clickjacking
- No `X-Content-Type-Options` — MIME-sniffing attacks possible
- No `Referrer-Policy` — full referrer URLs leaked to third parties
- No `Permissions-Policy` — browser features unrestricted

**Remediation:**
Add security headers to `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
    Permissions-Policy = "camera=(), microphone=(), geolocation=(self)"
    Content-Security-Policy = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co; font-src 'self' data:; frame-ancestors 'none';"
```

> **Note:** The CSP above is a starting point — adjust after testing to ensure all legitimate resources load correctly.

---

### 8. Extensive Console Logging of Sensitive Data

**Files:** Multiple (200+ instances across the codebase)  
**Severity:** High

**Risk:** Sensitive data is logged to the browser console:
- `src/services/dashboardService.ts` — user IDs, student data, fee data
- `src/services/profileService.ts` — user roles, emails, profile access checks
- `src/services/student.service.ts` — Supabase connection info, student records
- `src/services/interactiveAssignmentService.ts` — 100+ console.log calls including token data
- `src/components/ProtectedRoute.tsx` — role bypass information

This data is visible to **anyone** opening browser DevTools and may contain PII (Personally Identifiable Information).

**Remediation:**
1. Remove all `console.log` / `console.warn` / `console.error` calls logging sensitive data.
2. Use a logging library (e.g., `loglevel`, `pino`) with log levels, disabled in production.
3. Add an ESLint rule to prevent `console.log` in production:
   ```json
   { "no-console": ["warn", { "allow": ["warn", "error"] }] }
   ```

---

### 9. Hardcoded Mock Data Fallback in Production

**File:** `src/services/student.service.ts` (lines 413–420)  
**Severity:** High

**Risk:** When all database query methods fail, the `getStudentsByClass` method returns **hardcoded mock student data** instead of throwing an error. In production, a broken database connection silently returns fake data, causing data integrity issues and misleading the UI.

**Remediation:**
1. Remove all mock/fallback data from production code.
2. Throw proper errors and handle them in the UI with error states.
3. Use feature flags or environment checks if mock data is needed for development.

---

## Medium Issues

### 10. Weak Password Policy

**File:** `supabase/config.toml` (lines 117–120)  
**Severity:** Medium

**Risk:** Minimum password length is only **6 characters** and `password_requirements` is empty (`""`), meaning no complexity requirements at all.

**Remediation:**
```toml
minimum_password_length = 8
password_requirements = "lower_upper_letters_digits"
```

---

### 11. Email Confirmation Disabled

**File:** `supabase/config.toml` (line 129)  
**Severity:** Medium

**Risk:** `enable_confirmations = false` — users don't need to verify their email before signing in. This allows registration with fake/disposable emails.

**Remediation:**
Set `enable_confirmations = true` and configure a production SMTP server.

---

### 12. Partial Row-Level Security (RLS) Coverage

**Files:** Migration files in `migrations/`  
**Severity:** Medium

**Risk:** Only some tables have RLS enabled: `ParentFeedback`, `FeedbackCertificate`, `ShareableLink`, `ContentQuery`, `QueryReply`, `SportsEnrollment`. Core tables like `Student`, `Class`, `Homework`, `Attendance`, `Fee`, `Staff`, and `Settings` have **no RLS policies**. Without RLS, any authenticated user can read/modify any row in these tables.

**Remediation:**
1. Enable RLS on ALL tables: `ALTER TABLE school."TableName" ENABLE ROW LEVEL SECURITY;`
2. Create appropriate policies (teachers see their class's data, students see their own, admins see all).
3. Test thoroughly — RLS is a critical safety net even beyond frontend restrictions.

---

### 13. Predictable Default Student Passwords

**File:** `src/services/student.service.ts` (lines 2, 119, 178)  
**Severity:** Medium

**Risk:** `DEFAULT_PASSWORD_PREFIX = 'Welcome@'` — student passwords are generated as `Welcome@{admissionNumber}`. Anyone knowing an admission number can log in as that student. The Docker backup also shows a hardcoded `Student@123` default.

**Remediation:**
1. Generate random passwords (e.g., `crypto.getRandomValues()`-based) for new accounts.
2. Deliver initial passwords securely (email or in-person).
3. Force password change on first login.

---

### 14. Google Maps API Key Unrestricted in Client

**File:** `src/api/maps.ts` (lines 10, 29, 67)  
**Severity:** Medium

**Risk:** The Google Maps API key is used directly in client-side `fetch()` calls without referrer restrictions. The key (also exposed in `.env.cloud-backup`) can be abused for quota theft.

**Remediation:**
1. Apply HTTP referrer restrictions in Google Cloud Console.
2. Apply API restrictions — limit the key to only the Maps APIs you use.
3. Set up billing alerts.

---

### 15. `supabaseAdmin` Alias Provides False Security

**File:** `src/lib/api-client.ts` (line 22)  
**Severity:** Medium

**Risk:** `supabaseAdmin = supabase` — admin operations like `supabaseAdmin.auth.admin.createUser()` (used in `student.service.ts`) require a service role key. This either fails silently or works with an exposed service role key.

**Remediation:**
1. Move all `auth.admin.*` calls to server-side Edge Functions.
2. Remove the `supabaseAdmin` export.
3. Create a proper server-side API for user account management.

---

### 16. Wildcard CORS in Dev Server

**File:** `vite.config.ts` (line 126)  
**Severity:** Medium

**Risk:** `'Access-Control-Allow-Origin': '*'` is set in the dev server headers. If the dev server is exposed on a network, any origin can make authenticated requests.

**Remediation:**
Restrict to specific origins or remove the header (Vite dev server handles CORS by default for same-origin).

---

## Low Issues

### 17. Secure Password Change Disabled

**File:** `supabase/config.toml` (line 131)  
**Severity:** Low

**Risk:** `secure_password_change = false` — users don't need to re-authenticate to change their password. If a session is hijacked, the attacker can change the password.

**Remediation:** Set `secure_password_change = true`.

---

### 18. `innerHTML` Usage

**Files:** `src/main.tsx` (line 23), `src/components/ParentFeedbackCertificate.tsx` (line 83)  
**Severity:** Low

**Risk:** `innerHTML` is used for injecting GTM scripts and SVG rendering. These are static/trusted strings, so XSS risk is minimal, but the pattern is dangerous if copied.

**Remediation:** Replace with `React.createElement` or JSX where possible. For GTM, consider using `react-gtm-module`.

---

### 19. `mocha` in Production Dependencies

**File:** `package.json`  
**Severity:** Low

**Risk:** `mocha` (a test framework) is in `dependencies` instead of `devDependencies`, unnecessarily increasing the install footprint.

**Remediation:** Move `mocha` to `devDependencies`.

---

### 20. WhatsApp API Calls from Client

**File:** `src/services/whatsappService.ts` (line 50)  
**Severity:** Low

**Risk:** Client-side calls to `callmebot.com` expose phone numbers and message content in network logs and browser history.

**Remediation:** Proxy WhatsApp API calls through a backend service.

---

### 21. Storage Size Limit Mismatch

**Files:** `supabase/config.toml` (line 84) — `50MiB`; `src/backend/fileService.ts` (line 10) — `5MB`  
**Severity:** Low

**Risk:** The server-side storage limit (50MB) is 10× the client-side limit (5MB). A malicious user can bypass client-side validation and upload files up to 50MB directly via the Supabase API.

**Remediation:** Align the server-side `file_size_limit` in `config.toml` with the intended max (e.g., `5MiB`).

---

## Prioritized Remediation Plan

### Phase 1 — Immediate (Week 1)
| # | Action | Issue |
|---|--------|-------|
| 1 | **Rotate all exposed credentials** (Supabase, DB password, Google Maps key, YouTube key) | #1 |
| 2 | Remove `.env.cloud-backup` from Git history using BFG Repo Cleaner | #1 |
| 3 | Add `.env.cloud-backup`, `.env` to `.gitignore` | #1 |
| 4 | Remove `'process.env': env` from `vite.config.ts` | #4 |
| 5 | Remove `VITE_SUPABASE_SERVICE_ROLE_KEY` from `.env.example` and any env files | #3 |
| 6 | Remove `supabaseAdmin` export; move admin ops to Edge Functions | #3, #15 |

### Phase 2 — Urgent (Week 2)
| # | Action | Issue |
|---|--------|-------|
| 7 | Implement role-based access control in `ProtectedRoute.tsx` | #2 |
| 8 | Remove self-role-selection from registration | #5 |
| 9 | Remove `execute_sql` RPC function; refactor to use query builder | #6 |
| 10 | Add security headers to `netlify.toml` | #7 |
| 11 | Remove mock data fallback from `student.service.ts` | #9 |

### Phase 3 — Important (Week 3–4)
| # | Action | Issue |
|---|--------|-------|
| 12 | Remove/gate all `console.log` calls with debug config | #8 |
| 13 | Enable RLS on all core tables with proper policies | #12 |
| 14 | Strengthen password policy and enable email confirmation | #10, #11 |
| 15 | Generate random student passwords; force reset on first login | #13 |
| 16 | Restrict Google Maps API key in Google Cloud Console | #14 |

### Phase 4 — Hardening (Month 2)
| # | Action | Issue |
|---|--------|-------|
| 17 | Enable `secure_password_change` | #17 |
| 18 | Replace `innerHTML` usage with React patterns | #18 |
| 19 | Move `mocha` to devDependencies | #19 |
| 20 | Proxy WhatsApp API calls through backend | #20 |
| 21 | Align storage size limits | #21 |

---

## Tools & References

- [BFG Repo Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) — remove secrets from Git history
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security) — implement Row Level Security
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions) — move admin operations server-side
- [Security Headers](https://securityheaders.com/) — test your headers
- [Mozilla Observatory](https://observatory.mozilla.org/) — comprehensive web security scan
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) — common web application security risks
