# AI-Powered Next Day Planning & Syllabus Management — Technical Plan

## 1. What Already Exists (NOT Being Rebuilt)

The following features are **already working** and will be leveraged, not recreated:

| Feature | Status | Key Files |
|---------|--------|-----------|
| Classwork upload (photo/file) | ✅ Working | `classworkService.ts`, `classwork-form.tsx`, `FileUploader.tsx` |
| Homework upload (photo/file) | ✅ Working | `homeworkService.ts`, `homework-form.tsx`, `FileUploader.tsx` |
| File storage (Supabase bucket) | ✅ Working | `fileService.ts`, `fileTableService.ts` |
| Class → Subject mapping | ✅ Working | `Subject.classId` FK in DB |
| TimeTable (day/period/subject/class) | ✅ In DB | `TimeTable` table exists (not actively used in UI) |
| Dashboard with stats + calendar placeholder | ✅ Working | `Dashboard.tsx`, `dashboardService.ts` |

### Existing Data the AI Will Consume

**When a teacher creates classwork today, this is saved:**
```
Classwork row: { id, title, description, date, classId }
File rows:     { fileName, filePath, fileType, classworkId, uploadedBy }
```

**When a teacher creates homework today, this is saved:**
```
Homework row:  { id, title, description, dueDate, subjectId, classId, status }
File rows:     { fileName, filePath, fileType, homeworkId, uploadedBy }
```

**TimeTable already in DB:**
```
TimeTable row: { classId, subjectId, day (0-6), startTime, endTime }
```

This existing data is the **input** for the AI planning system.

---

## 2. Problem Statement

Teachers currently upload classwork/homework photos for today. But there is:
- **No syllabus tracking** — no way to know what chapters are done, what's pending
- **No oral vs writing categorization** — all work is lumped together  
- **No next-day planning** — teachers plan mentally, nothing is recorded or AI-assisted
- **No smart scheduling** — no awareness of festivals, holidays, or syllabus pacing
- **No AI analysis** — uploaded photos are just stored, never analyzed

---

## 3. Core Architecture: AI as the Central Brain

```
                        ┌─────────────────────────┐
                        │   LLM ENGINE (Groq)      │
                        │  Provider-agnostic layer  │
                        │  (swap Groq↔Claude↔OpenAI │
                        │   via single config file) │
                        └────────┬────────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
            ▼                    ▼                    ▼
   ┌────────────────┐  ┌─────────────────┐  ┌────────────────┐
   │  PHOTO ANALYSIS │  │ NEXT DAY PLAN   │  │ SYLLABUS       │
   │  (Input)        │  │ GENERATION      │  │ INTELLIGENCE   │
   │                 │  │ (Output)        │  │ (Knowledge)    │
   │ • Today's       │  │ • Per-subject   │  │ • Chapter list │
   │   classwork     │  │   oral+writing  │  │ • Progress %   │
   │   photos        │  │   breakdown     │  │ • Pacing alerts│
   │ • Today's       │  │ • Linked to     │  │ • Behind/Ahead │
   │   homework      │  │   syllabus      │  │   detection    │
   │   photos        │  │   chapters      │  │ • Auto-flag    │
   └────────────────┘  │ • Festival-aware │  │   gaps         │
                       │ • Improvement    │  └────────────────┘
                       │   notes          │
                       └─────────────────┘
```

### The AI Loop (Daily Cycle) — Closed-Loop System

The plan IS the classwork/homework. Tomorrow's AI plan auto-creates the classwork and homework entries. Teachers just upload photos against them.

```
  ┌──────────────────────────────────────────────────────────────────┐
  │                    THE DAILY AI LOOP                             │
  │                                                                  │
  │   PREVIOUS EVENING              NEXT MORNING                    │
  │   ──────────────────            ─────────────                   │
  │                                                                  │
  │   AI generates plan ──────────▶ Plan auto-creates               │
  │   for tomorrow                  Classwork entries                │
  │   (NextDayPlan +                (1 per subject,                 │
  │    NextDayPlanItem)             oral + writing tagged)           │
  │         ▲                       + Homework entries              │
  │         │                       (with due dates)                │
  │         │                              │                        │
  │         │                              ▼                        │
  │         │                                                       │
  │   END OF DAY                    DURING SCHOOL                   │
  │   ──────────                    ─────────────                   │
  │                                                                  │
  │   AI analyzes ◀──────────────── Teacher uploads photos          │
  │   everything:                   against pre-created entries     │
  │                                 (camera/gallery → existing      │
  │   • Compares plan vs actual     classwork/homework cards)       │
  │   • Ranks completion                                            │
  │   • Flags gaps/issues                                           │
  │   • Updates syllabus progress                                   │
  │   • Generates feedback                                          │
  │   • Creates NEXT day plan ──────────────────────────▶ (loops)   │
  │                                                                  │
  └──────────────────────────────────────────────────────────────────┘
```

### Detailed Flow: End of Day → Next Morning

```
  END OF DAY (Teacher triggers or auto at 3 PM)
  ═══════════════════════════════════════════════

  Step 1: GATHER — What happened today?
  ┌─────────────────────────────────────────────────────────┐
  │  • Fetch all Classwork where classId=X AND date=today   │
  │  • Fetch all Homework where classId=X AND created=today │
  │  • Check which entries have photos uploaded (File rows) │
  │  • Check which planned items have NO uploads (missed)   │
  └─────────────────────────────────────────────────────────┘
         │
         ▼
  Step 1.5: VALIDATE — AI reads each uploaded photo against the plan
  ┌─────────────────────────────────────────────────────────┐
  │  For EVERY classwork/homework entry that has a photo:   │
  │                                                         │
  │  AI reads the image and compares it to what was planned:│
  │                                                         │
  │  Plan said: "Math — Exercise 4.3, problems 1-15"       │
  │  Photo shows: Exercise 4.3, problems 1-8 done          │
  │  → PARTIAL MATCH (53%). 7 problems not attempted.      │
  │                                                         │
  │  Plan said: "Hindi — Write 5 sentences using Ch-4 words"│
  │  Photo shows: 5 sentences written, good handwriting    │
  │  → FULL MATCH (100%). Content matches plan exactly.    │
  │                                                         │
  │  Plan said: "Hindi Oral — Read textbook pg 24-25"      │
  │  Photo shows: Board writing about वर्णमाला (Ch-1 topic) │
  │  → MISMATCH. Planned Ch-4, photo shows Ch-1 content.  │
  │    Flag: Did teacher cover different topic than planned?│
  │                                                         │
  │  Each entry gets a validation result:                   │
  │  • matchScore (0-100)                                   │
  │  • matchStatus: 'full_match' | 'partial' | 'mismatch'  │
  │  • whatWasPlanned vs whatPhotoShows                     │
  │  • deviationNotes (if any)                              │
  │  • qualityNotes (handwriting, errors spotted, etc.)     │
  └─────────────────────────────────────────────────────────┘
         │
         ▼
  Step 2: RANK & SCORE — How well did the day go?
  ┌─────────────────────────────────────────────────────────┐
  │  AI assigns per-subject scores using VALIDATED data:    │
  │  (photos are now analyzed, not just "present or not")   │
  │                                                         │
  │  Hindi:   ██████████ 100% — oral done, writing done,   │
  │           photos VALIDATED: content matches plan         │
  │                                                         │
  │  Math:    ██████░░░░  60% — writing done but photo      │
  │           shows only 8/15 problems. Oral skipped.       │
  │                                                         │
  │  English: ████░░░░░░  40% — only oral done, no writing, │
  │           no photo uploaded                              │
  └─────────────────────────────────────────────────────────┘
         │
         ▼
  Step 3: FLAG — What needs attention?
  ┌─────────────────────────────────────────────────────────┐
  │  🔴 English writing was planned but not done            │
  │     → Carry forward to tomorrow                         │
  │                                                         │
  │  🟡 Math: Photo shows students struggling with          │
  │     carrying in addition (AI photo analysis)            │
  │     → Suggest extra oral drill tomorrow                 │
  │                                                         │
  │  🟢 Hindi Ch-4 completed! Auto-mark syllabus progress   │
  │     → Move to Ch-5 tomorrow                             │
  │                                                         │
  │  🟠 Ram Navami on Apr 21 (5 days away)                  │
  │     → Suggest festive activity for Friday               │
  └─────────────────────────────────────────────────────────┘
         │
         ▼
  Step 4: FEEDBACK — Teacher sees end-of-day report
  ┌─────────────────────────────────────────────────────────┐
  │  📊 Today's Report Card — Nursery A — Apr 16           │
  │                                                         │
  │  Overall: ████████░░ 73% planned work completed         │
  │                                                         │
  │  ✅ Hindi: Great! Ch-4 completed.                       │
  │  ⚠️ Math: Partial. Students need more carrying practice │
  │  ❌ English: Writing not done. Carrying forward.        │
  │                                                         │
  │  💡 Improvements:                                       │
  │  • "मात्रा usage still weak — add 10-min drill"         │
  │  • "3 students behind on math carrying"                 │
  │                                                         │
  │  [👍 Accept & Generate Tomorrow's Plan]                 │
  │  [✏️ Edit feedback before generating]                   │
  └─────────────────────────────────────────────────────────┘
         │
         ▼
  Step 5: GENERATE — AI creates tomorrow's plan
  ┌─────────────────────────────────────────────────────────┐
  │  Inputs:                                                │
  │  • Today's scores + flags + unfinished work             │
  │  • Syllabus: what's next in each subject                │
  │  • Timetable: which subjects scheduled tomorrow         │
  │  • Calendar: any holidays coming up                     │
  │  • Past week: oral/writing balance                      │
  │  • Improvements: what to reinforce                      │
  │                                                         │
  │  Output: NextDayPlan with per-subject plan items        │
  └─────────────────────────────────────────────────────────┘
         │
         ▼
  NEXT MORNING (Auto or teacher-triggered)
  ═══════════════════════════════════════════

  Step 6: MATERIALIZE — Plan becomes real entries
  ┌─────────────────────────────────────────────────────────┐
  │  For each NextDayPlanItem:                              │
  │                                                         │
  │  IF oralWork → Create Classwork entry:                  │
  │     title: "Hindi — Ch-5 कविता Reading"                 │
  │     workType: 'oral'                                    │
  │     subjectId: hindi_id                                 │
  │     syllabusItemId: ch5_id                             │
  │     description: "Read poem aloud, focus on rhythm"     │
  │     date: today                                         │
  │     status: 'planned' (NEW column)                      │
  │     sourcePlanItemId: plan_item_id (NEW column)         │
  │                                                         │
  │  IF writingWork → Create Classwork entry:               │
  │     title: "Hindi — Sulekh page 13"                     │
  │     workType: 'writing'                                 │
  │     ...same pattern                                     │
  │                                                         │
  │  IF homework planned → Create Homework entry:           │
  │     title, description, dueDate, subjectId, classId     │
  │     status: 'PENDING'                                   │
  │     sourcePlanItemId: plan_item_id                      │
  │                                                         │
  │  Teacher sees pre-populated classwork/homework cards     │
  │  on existing /classwork and /homework pages.            │
  │  They just upload photos against them!                  │
  └─────────────────────────────────────────────────────────┘
```

### What This Means for the Teacher

```
  BEFORE (current):                    AFTER (with AI loop):
  ─────────────────                    ─────────────────────

  Morning:                             Morning:
  • Think about what to teach          • Open app → see today's plan
  • No plan recorded                   • Pre-created classwork cards
                                       • "Hindi Oral: Ch-5 Reading"
                                       • "Math Writing: Ex 4.3"

  During school:                       During school:
  • Teach                              • Teach as planned
  • Maybe upload a photo later         • Tap card → upload photo
                                       • Card updates: ✅ Photo added

  End of day:                          End of day:
  • Create classwork entries           • Tap "End of Day Report"
  • Type title, description            • AI shows: 73% completed
  • Upload photos                      • Flags: English writing missed
  • No feedback                        • Improvements: matra drill
  • No plan for tomorrow               • "Generate Tomorrow's Plan" →
  • Repeat from scratch                • Loop continues automatically
```

---

## 4. Feature A — Syllabus Management (The Knowledge Base)

AI can't plan without knowing the syllabus. This is the **foundation** everything else builds on.

### 4.1 How Syllabus Data Gets In

**Option 1: Admin uploads syllabus PDF/image per class+subject**
- AI extracts chapter list from the document (OCR + structure parsing)
- Admin reviews and approves the extracted chapter list
- Stored as structured `SyllabusItem` rows

**Option 2: Admin manually enters chapter list**
- Simple form: add chapter name, description, estimated days
- Bulk paste from spreadsheet

**Option 3: Hybrid (Recommended)**
- Admin uploads PDF → AI extracts → Admin edits/corrects → Approves

### 4.2 Data Model

```sql
-- ============================================================
-- SYLLABUS: The master curriculum approved by admin
-- ============================================================
CREATE TABLE school."Syllabus" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "classId" UUID NOT NULL REFERENCES school."Class"(id),
  "subjectId" UUID NOT NULL REFERENCES school."Subject"(id),
  "academicYear" TEXT NOT NULL,          -- e.g. '2026-27'
  title TEXT NOT NULL,                   -- e.g. 'Hindi Syllabus Nursery A'
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'archived')),
  "approvedBy" UUID REFERENCES school."Profile"(id),
  "approvedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("classId", "subjectId", "academicYear")
);

-- ============================================================
-- SYLLABUS ITEMS: Individual chapters/topics within a syllabus
-- ============================================================
CREATE TABLE school."SyllabusItem" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "syllabusId" UUID NOT NULL REFERENCES school."Syllabus"(id) ON DELETE CASCADE,
  "chapterNumber" INTEGER NOT NULL,
  title TEXT NOT NULL,                   -- e.g. 'वर्णमाला (Alphabets)'
  description TEXT,                      -- detailed scope of the chapter
  "learningObjectives" TEXT[],           -- what students should learn
  "estimatedDays" INTEGER DEFAULT 5,     -- how many school days to cover
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SYLLABUS PROGRESS: Teacher marks what's done per chapter
-- ============================================================
CREATE TABLE school."SyllabusProgress" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "syllabusItemId" UUID NOT NULL REFERENCES school."SyllabusItem"(id) ON DELETE CASCADE,
  "classId" UUID NOT NULL REFERENCES school."Class"(id),
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
  "startedDate" DATE,
  "completedDate" DATE,
  "actualDays" INTEGER,                  -- how many days it actually took
  notes TEXT,                            -- teacher's notes on coverage
  "updatedBy" UUID REFERENCES school."Profile"(id),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("syllabusItemId", "classId")
);

ALTER TABLE school."Syllabus" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."SyllabusItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."SyllabusProgress" ENABLE ROW LEVEL SECURITY;

-- Link File table to Syllabus for PDF uploads
ALTER TABLE school."File"
  ADD COLUMN "syllabusId" UUID REFERENCES school."Syllabus"(id);
```

### 4.3 AI-Powered Syllabus Extraction

When admin uploads a syllabus PDF/image:

```typescript
// aiService.extractSyllabus(imageBase64, classLevel, subject)
// Prompt sent to LLM (Groq by default):
`You are analyzing a school syllabus document for ${subject} for ${classLevel}.
Extract ALL chapters/topics as a structured list.

Return JSON:
{
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "chapter title in original language",
      "description": "brief scope description",
      "learningObjectives": ["obj1", "obj2"],
      "estimatedDays": 5
    }
  ],
  "totalChapters": 12,
  "notes": "any relevant notes about the syllabus structure"
}`
```

### 4.4 AI Syllabus Flags (Continuous Intelligence)

The AI doesn't just extract — it **continuously monitors**:

| Flag | Trigger | Action |
|------|---------|--------|
| 🔴 **Behind Schedule** | `actualDays > estimatedDays * 1.5` or chapter not started when it should be by date | Alert teacher + suggest compressed plan |
| 🟡 **Approaching Deadline** | Term exam in < 2 weeks but chapters remain | Show countdown + prioritized list |
| 🟢 **Ahead of Schedule** | Completed faster than estimated | Suggest enrichment activities or revision |
| 🔵 **Gap Detected** | AI sees classwork for Ch-5 but Ch-3 & Ch-4 not marked complete | Ask teacher to confirm: skipped or forgot to mark? |
| 🟠 **Festival Impact** | Upcoming holidays will reduce available days | Recalculate pacing automatically |

### 4.5 Syllabus Pages

**Admin View — `/syllabus` (manage):**
```
┌──────────────────────────────────────────────────────────────┐
│  Syllabus Management — Academic Year 2026-27                 │
├──────────────────────────────────────────────────────────────┤
│  [+ Upload Syllabus PDF]  [+ Add Manually]                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Nursery A — Hindi      │ 12 chapters │ ✅ Approved    │    │
│  │ Nursery A — English    │ 10 chapters │ ⏳ Draft       │    │
│  │ Nursery A — Math       │  8 chapters │ ✅ Approved    │    │
│  │ Nursery B — Hindi      │ 12 chapters │ ✅ Approved    │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

**Teacher View — `/syllabus/:id` (track):**
```
┌──────────────────────────────────────────────────────────────┐
│  Hindi — Nursery A — 2026-27                                 │
│  📎 Syllabus PDF  |  Progress: ████████░░░░ 65% (8/12)      │
│                                                              │
│  🔴 ALERT: Behind schedule on Ch-6. 3 days over estimate.   │
│  🟠 NOTE: Dussehra break in 2 weeks — 4 working days lost   │
├──────────────────────────────────────────────────────────────┤
│  Ch 1: वर्णमाला         ✅ Done  (5 days, est. 5)  Apr 1-5   │
│  Ch 2: मात्राएँ          ✅ Done  (4 days, est. 5)  Apr 7-10  │
│  Ch 3: शब्द निर्माण      ✅ Done  (6 days, est. 4)  Apr 11-18│
│  Ch 4: वाक्य रचना       🔄 In Progress (Day 3/5)  Apr 21-   │
│  Ch 5: कविता             ⬚ Not Started                      │
│  ...                                                         │
│                                                              │
│  [AI: "Ch-3 took 2 extra days. Consider shortening Ch-5     │
│   from 5 to 3 days since students showed strong grasp of    │
│   word formation which overlaps with poetry vocabulary."]    │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Feature B — Oral & Writing Categorization (Minimal Change to Existing Flow)

### 5.1 Approach: Extend Existing Classwork, Don't Create New Entity

Instead of a separate `DailyWork` table, **add columns to the existing `Classwork` table**:

```sql
ALTER TABLE school."Classwork"
  ADD COLUMN "workType" TEXT DEFAULT 'writing'
    CHECK ("workType" IN ('oral', 'writing')),
  ADD COLUMN "chapterName" TEXT,
  ADD COLUMN "subjectId" UUID REFERENCES school."Subject"(id),
  ADD COLUMN "syllabusItemId" UUID REFERENCES school."SyllabusItem"(id),
  ADD COLUMN "completionStatus" TEXT DEFAULT 'manual'
    CHECK ("completionStatus" IN ('planned', 'in_progress', 'completed', 'skipped', 'manual')),
  ADD COLUMN "sourcePlanItemId" UUID REFERENCES school."NextDayPlanItem"(id);

-- Similarly extend Homework to link back to the plan
ALTER TABLE school."Homework"
  ADD COLUMN "syllabusItemId" UUID REFERENCES school."SyllabusItem"(id),
  ADD COLUMN "chapterName" TEXT,
  ADD COLUMN "sourcePlanItemId" UUID REFERENCES school."NextDayPlanItem"(id);
```

**New columns explained:**
| Column | Table | Purpose |
|--------|-------|---------|
| `workType` | Classwork | `oral` or `writing` categorization |
| `chapterName` | Classwork, Homework | Human-readable chapter reference |
| `subjectId` | Classwork | Link to subject (Homework already has this) |
| `syllabusItemId` | Classwork, Homework | Links to specific syllabus chapter |
| `completionStatus` | Classwork | `planned` = AI created, waiting for teacher. `completed` = photo uploaded & validated. `skipped` = teacher marked skip. `manual` = legacy/manual entry |
| `sourcePlanItemId` | Classwork, Homework | Links back to the AI plan item that generated this entry. `NULL` = manually created (backward compatible) |
| `photoValidation` | Classwork, Homework | JSONB storing AI photo validation result: `{ matchScore, matchStatus, whatPhotoShows, errorsSpotted[], qualityNotes }`. Written when teacher uploads a photo against a planned entry. Used by end-of-day report for evidence-based scoring. |

**Why extend Classwork/Homework instead of new tables?**
- Plan items BECOME classwork/homework entries — they're the same thing at different lifecycle stages
- Teachers already know the classwork upload flow — just upload photo against the card
- Existing file attachment system works perfectly
- No data fragmentation — one table to query for "what happened today"
- Backward compatible — existing manually-created entries have `sourcePlanItemId = NULL`

### 5.2 UI Change to `classwork-form.tsx`

Add 3 fields to the existing form:

```
┌─────────────────────────────────────────────┐
│  Create Classwork                           │
├─────────────────────────────────────────────┤
│  Class:    [Nursery A          ▾]           │
│  Subject:  [Hindi              ▾]  ← NEW   │
│  Type:     (● Oral) (○ Writing)     ← NEW  │
│  Chapter:  [Ch-3: शब्द निर्माण  ▾]  ← NEW   │
│            (auto-populated from syllabus)    │
│  Title:    [___________________________]    │
│  Description: [________________________]    │
│  Date:     [Apr 16, 2026]                   │
│  Attachments: [📷 Camera] [📎 File]         │
│                                             │
│  [Cancel]              [Create Classwork]   │
└─────────────────────────────────────────────┘
```

The **Chapter dropdown** is populated from `SyllabusItem` rows for the selected class+subject. This is how classwork gets linked to syllabus automatically.

### 5.3 Classwork List View Enhancement

On the existing `/classwork` page, add filtering tabs:

```
┌──────────────────────────────────────────────┐
│  Classwork — [Class: Nursery A ▾] — Apr 16  │
├──────────────────────────────────────────────┤
│  [All] [📖 Oral] [✏️ Writing]               │
├──────────────────────────────────────────────┤
│  📖 Hindi — Ch-5 Reading aloud              │
│     📷 2 photos                              │
│                                              │
│  ✏️ Math — Exercise 4.2 (Writing)            │
│     📷 1 photo                               │
│                                              │
│  ✏️ Hindi — Sulekh page 12 (Writing)         │
│     📷 1 photo                               │
└──────────────────────────────────────────────┘
```

---

## 6. Feature C — AI-Powered Next Day Planning

This is the **main new feature**. It uses everything above as input.

### 6.1 How It Works

```
                    AI INPUTS                              AI OUTPUT
  ┌──────────────────────────────────────┐    ┌─────────────────────────────┐
  │                                      │    │                             │
  │  1. Today's classwork uploads        │    │  TOMORROW'S PLAN            │
  │     (from Classwork table)           │    │                             │
  │                                      │    │  Per Subject:               │
  │  2. Today's homework given           │    │  ┌─────────────────────┐    │
  │     (from Homework table)            │    │  │ Hindi:              │    │
  │                                      │    │  │  Oral: Ch-4 poem    │    │
  │  3. Syllabus + Progress              │    │  │  Writing: Sulekh 13 │    │
  │     (what's done, what's next)       │────▶  │  Chapter: वाक्य रचना │    │
  │                                      │    │  │  Why: Continues     │    │
  │  4. Timetable for tomorrow           │    │  │  from today's work  │    │
  │     (which subjects are scheduled)   │    │  └─────────────────────┘    │
  │                                      │    │  ┌─────────────────────┐    │
  │  5. Calendar (festivals/holidays)    │    │  │ Math:               │    │
  │     (is tomorrow a holiday?)         │    │  │  Writing: Ex 4.3    │    │
  │                                      │    │  │  Why: Follows 4.2   │    │
  │  6. Past week's work pattern         │    │  │  done today         │    │
  │     (balance oral vs writing)        │    │  └─────────────────────┘    │
  │                                      │    │                             │
  │  7. Improvement notes from AI        │    │  FLAGS:                     │
  │     (what needs reinforcement)       │    │  🟡 Hindi Ch-4 behind by    │
  │                                      │    │     2 days — consider       │
  └──────────────────────────────────────┘    │     double period           │
                                              │  🟠 Apr 21 Ram Navami —     │
                                              │     plan activity           │
                                              │                             │
                                              │  IMPROVEMENTS:              │
                                              │  "Students struggled with   │
                                              │  मात्रा in today's work.     │
                                              │  Suggest 10-min oral drill  │
                                              │  tomorrow before writing."  │
                                              └─────────────────────────────┘
```

### 6.2 Data Model

```sql
-- ============================================================
-- NEXT DAY PLAN: AI-generated + teacher-edited plan per class per day
-- ============================================================
CREATE TABLE school."NextDayPlan" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "classId" UUID NOT NULL REFERENCES school."Class"(id),
  "planDate" DATE NOT NULL,              -- the date being planned FOR (tomorrow)
  "generatedAt" TIMESTAMPTZ,             -- when AI generated this
  "editedAt" TIMESTAMPTZ,               -- when teacher last edited
  "editedBy" UUID REFERENCES school."Profile"(id),
  status TEXT NOT NULL DEFAULT 'ai_generated'
    CHECK (status IN ('ai_generated', 'teacher_edited', 'finalized', 'materialized')),
  "materialized" BOOLEAN NOT NULL DEFAULT false,  -- plan converted to classwork/homework entries?
  "materializedAt" TIMESTAMPTZ,          -- when auto-creation happened
  "aiRawResponse" JSONB,                -- full AI response for debugging/reuse
  -- End-of-day report fields (filled after day is done)
  "dayScore" INTEGER,                    -- AI-computed 0-100 score for the day
  "dayFeedback" TEXT,                    -- AI summary: "73% planned work completed"
  "improvements" JSONB,                  -- Array of improvement suggestions
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("classId", "planDate")
);

-- ============================================================
-- PLAN ITEMS: Individual subject entries within a plan
-- Each item can generate 1-2 Classwork entries (oral + writing)
-- and optionally 1 Homework entry
-- ============================================================
CREATE TABLE school."NextDayPlanItem" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "planId" UUID NOT NULL REFERENCES school."NextDayPlan"(id) ON DELETE CASCADE,
  "subjectId" UUID NOT NULL REFERENCES school."Subject"(id),
  "syllabusItemId" UUID REFERENCES school."SyllabusItem"(id),  -- linked chapter
  "chapterName" TEXT,                    -- chapter context
  -- Classwork: Oral
  "oralWork" TEXT,                       -- what oral work to do
  "oralDetails" TEXT,                    -- detailed instructions for oral
  -- Classwork: Writing
  "writingWork" TEXT,                    -- what writing work to do
  "writingDetails" TEXT,                 -- detailed instructions for writing
  -- Homework (optional per subject)
  "homeworkTitle" TEXT,                   -- homework to assign, if any
  "homeworkDescription" TEXT,            -- homework details
  "homeworkDueDate" DATE,                -- when homework is due
  -- AI context
  "aiRationale" TEXT,                    -- why AI suggested this
  "teacherNotes" TEXT,                   -- teacher's own edits/notes
  "carryForward" BOOLEAN DEFAULT false,  -- was this unfinished from previous day?
  "carryForwardReason" TEXT,             -- why it was carried forward
  -- Tracking
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "subjectScore" INTEGER,               -- end-of-day AI score (0-100) for this subject
  "subjectFeedback" TEXT,               -- end-of-day AI feedback for this subject
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- AI FLAGS: Alerts and suggestions generated by AI
-- ============================================================
CREATE TABLE school."AiFlag" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "classId" UUID NOT NULL REFERENCES school."Class"(id),
  "planId" UUID REFERENCES school."NextDayPlan"(id),
  "subjectId" UUID REFERENCES school."Subject"(id),
  "syllabusItemId" UUID REFERENCES school."SyllabusItem"(id),
  "flagType" TEXT NOT NULL
    CHECK ("flagType" IN (
      'behind_schedule',     -- chapter taking longer than estimated
      'ahead_of_schedule',   -- chapter completed faster
      'gap_detected',        -- skipped chapter suspected
      'festival_upcoming',   -- holiday approaching
      'improvement_needed',  -- students struggling with topic
      'revision_suggested',  -- time for revision before exam
      'balance_alert'        -- too much oral or too much writing
    )),
  severity TEXT NOT NULL DEFAULT 'info'
    CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,                 -- human-readable message
  "suggestedAction" TEXT,                -- what to do about it
  "isResolved" BOOLEAN NOT NULL DEFAULT false,
  "resolvedAt" TIMESTAMPTZ,
  "resolvedBy" UUID REFERENCES school."Profile"(id),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE school."NextDayPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."NextDayPlanItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."AiFlag" ENABLE ROW LEVEL SECURITY;
```

### 6.3 The AI Prompts (Core Intelligence)

**Two prompts power the system:**

#### Prompt 1: End-of-Day Report

```typescript
// src/services/aiService.ts — generateEndOfDayReport()

const endOfDayPrompt = `You are an AI teaching assistant analyzing a school day.

You are given:
- The PLAN for today (what was supposed to happen per subject)
- The ACTUAL classwork entries (what was created, which have photos uploaded)
- The ACTUAL homework entries (what was assigned)
- PHOTO VALIDATION RESULTS (for each uploaded photo: what it actually shows vs what was planned, match score, errors spotted)
- Syllabus progress (overall chapter completion status)

Your job:
1. Score each subject 0-100 based on plan completion AND photo validation:
   - Use the photoValidation matchScore as primary evidence
   - 100 = planned work fully done, photo validates content matches plan
   - 80 = mostly done, photo shows minor deviations from plan
   - 50 = partially done, photo shows significant gaps or different content
   - 20 = photo uploaded but content doesn't match plan at all
   - 0 = not done / no photo
2. Compute overall day score (weighted average of validated scores)
3. Identify what was NOT done and should carry forward
4. USE photo validation errorsSpotted to identify student learning gaps
5. Detect if any chapter was completed today (mark for syllabus update)
6. Generate improvement suggestions based on VALIDATED observations
7. Flag any plan-vs-actual MISMATCHES (teacher did different topic than planned)
7. Flag any patterns (e.g., writing always skipped for English)

Return JSON:
{
  "dayScore": 73,
  "feedback": "Good day overall. Hindi completed, Math partial, English needs attention.",
  "perSubjectScores": [
    {
      "planItemId": "...",
      "subjectName": "Hindi",
      "score": 100,
      "feedback": "Excellent! Ch-4 completed. Photos show good sentence construction.",
      "oralDone": true,
      "writingDone": true,
      "photosUploaded": true
    },
    {
      "planItemId": "...",
      "subjectName": "Math",
      "score": 80,
      "feedback": "Ex 4.3 partially done. Photo shows carrying errors in problems 6 & 8.",
      "oralDone": false,
      "writingDone": true,
      "photosUploaded": true
    }
  ],
  "improvements": [
    "मात्रा usage still weak — add 10-min drill tomorrow",
    "Math: 3 students made carrying errors — extra oral practice needed"
  ],
  "carryForwardItems": ["plan_item_id_for_english_writing"],
  "completedChapters": [
    { "syllabusItemId": "...", "subjectName": "Hindi", "chapterName": "Ch-4 वाक्य रचना" }
  ]
}`;
```

#### Prompt 2: Photo Validation (Plan vs Actual)

```typescript
// src/services/aiService.ts — validateWorkPhoto()

const photoValidationPrompt = `You are an AI teaching assistant validating school work.

You are given:
- An IMAGE of a student's/class's classwork or homework (photo of notebook, board, worksheet)
- What was PLANNED for this entry (title, description, work type, chapter)

Your job:
1. READ the image carefully — identify what subject, topic, chapter it covers
2. COUNT specifics — how many problems done, sentences written, pages covered
3. COMPARE to what was planned
4. SCORE the match 0-100:
   - 100 = exact match, everything planned was done
   - 70-99 = mostly matches, minor deviations
   - 40-69 = partially matches, significant gaps
   - 1-39 = mostly mismatched content
   - 0 = completely different topic or unreadable
5. NOTE quality issues — handwriting, errors, incomplete work
6. SPOT specific student errors if visible (wrong answers, misconceptions)

Return JSON:
{
  "matchScore": 85,
  "matchStatus": "partial",
  "whatPhotoShows": "Exercise 4.3, addition problems 1-8 completed in notebook. 
                     Problems 9-15 not attempted.",
  "whatWasPlanned": "Exercise 4.3, problems 1-15",
  "deviationNotes": "Only 8 of 15 problems completed (53%). 
                     Last 7 problems not attempted, likely ran out of time.",
  "qualityNotes": "Handwriting is clear and neat. Work shows understanding 
                   of basic addition. Carrying technique used correctly in 
                   problems 1-5.",
  "topicsCovered": ["2-digit addition", "carrying"],
  "errorsSpotted": [
    "Problem 6: 47+35=72 (should be 82) — carrying error",
    "Problem 8: 56+29=75 (should be 85) — carrying error"
  ],
  "syllabusAlignment": "Matches Ch-3 Addition as planned",
  "suggestedFollowUp": "Complete remaining 7 problems as homework. 
                        Extra carrying drill needed — 2 errors detected."
}

IMPORTANT: 
- If the image is blurry or unreadable, return matchStatus='unreadable' with a note
- If the image shows DIFFERENT content than planned (e.g., Hindi work on a Math card), 
  flag it clearly — this helps detect data entry errors or plan deviations
- Be specific about errors — don't just say "some errors found"
- Count actual items (problems, sentences, words) when possible`;
```

#### Prompt 3: Next Day Plan Generation

```typescript
// src/services/aiService.ts — generateNextDayPlan()

const planningPrompt = `You are an AI teaching assistant for an Indian school.
You help teachers plan the next day's classwork based on:
- What was done today (including end-of-day scores and feedback)
- Items carried forward from today (unfinished work — MUST be included)
- The approved syllabus and current progress
- Tomorrow's timetable (which subjects are scheduled)
- Upcoming festivals and holidays
- Past patterns of oral vs writing work balance

Rules:
1. Every subject period should have BOTH oral and writing components
2. Oral work = reading aloud, recitation, verbal Q&A, discussion — reference chapter name
3. Writing work = notebook exercises, copying, worksheets, drawing
4. Follow the syllabus sequence — don't skip chapters
5. If a chapter is behind schedule, suggest ways to catch up
6. If a festival is within 3 days, suggest a relevant activity
7. Consider what students found difficult (from improvement notes)
8. Balance workload — don't overload one subject

Return JSON:
{
  "planItems": [
    {
      "subjectName": "Hindi",
      "subjectId": "...",
      "syllabusItemId": "...",
      "chapterName": "Ch-4: वाक्य रचना",
      "oralWork": "Read sentences from textbook pg 24-25",
      "oralDetails": "Focus on pronunciation of conjunct consonants. 
                      Call 5 students individually.",
      "writingWork": "Write 5 sentences using new words from Ch-4",
      "writingDetails": "Use lined notebook. Check previous day's work 
                        corrections first.",
      "aiRationale": "Continues from today's Ch-4 introduction. 
                     Students need practice with sentence construction 
                     before moving to Ch-5."
    }
  ],
  "flags": [
    {
      "flagType": "behind_schedule",
      "severity": "warning",
      "subjectName": "Hindi",
      "message": "Hindi Ch-4 is on Day 6 vs estimated 4 days",
      "suggestedAction": "Consider combining oral reading with 
                         writing practice to cover more ground"
    },
    {
      "flagType": "festival_upcoming",
      "severity": "info",
      "message": "Ram Navami on Apr 21 (4 days away)",
      "suggestedAction": "Plan a Ram Navami drawing/essay activity 
                         for Friday's EVS period"
    }
  ],
  "improvements": [
    "Students showed difficulty with मात्रा usage in today's writing. 
     Suggest 10-minute oral drill on आ, इ, ई मात्रा tomorrow.",
    "Math: 3 students made errors on carrying in addition. 
     Give them extra practice problems orally."
  ],
  "overallNotes": "Good progress today. Tomorrow has 5 periods. 
                   Hindi and Math should be prioritized given upcoming 
                   unit test in 2 weeks."
}`;
```

### 6.4 AI Service — Full Architecture

```typescript
// src/services/aiService.ts

export const aiService = {
  /**
   * Gather all context needed for AI planning
   */
  async gatherPlanningContext(classId: string, date: string) {
    // Parallel fetch all data AI needs
    const [
      todayClasswork,     // from classworkService — what was uploaded today
      todayHomework,      // from homeworkService — homework given today
      syllabusList,       // from syllabusService — all subjects' progress
      tomorrowTimetable,  // from TimeTable — what subjects are tomorrow
      upcomingHolidays,   // from calendarService — next 7 days
      recentClasswork,    // from classworkService — last 5 days of work
      activeFlags,        // from AiFlag table — unresolved alerts
    ] = await Promise.all([...]);

    return { todayClasswork, todayHomework, syllabusList, 
             tomorrowTimetable, upcomingHolidays, recentClasswork, activeFlags };
  },

  /**
   * Call LLM to generate next day plan
   */
  async generateNextDayPlan(classId: string, targetDate: string) {
    const context = await this.gatherPlanningContext(classId, targetDate);
    
    // Build the prompt with all context data serialized
    const prompt = buildPlanningPrompt(context);
    
    // Call LLM via provider-agnostic layer (Groq by default)
    const response = await llm.complete(systemPrompt, prompt);
    
    // Parse and store the plan
    const plan = parseAIResponse(response);
    
    // Save to NextDayPlan + NextDayPlanItem tables
    const savedPlan = await nextDayPlanService.savePlan(classId, targetDate, plan);
    
    // Save any flags
    await aiFlagService.saveFlags(classId, plan.flags);
    
    return savedPlan;
  },

  /**
   * MATERIALIZE PLAN — Convert NextDayPlanItems into real Classwork/Homework rows
   * Called automatically when teacher opens the app on plan date, or manually triggered
   */
  async materializePlan(planId: string) {
    const plan = await nextDayPlanService.getById(planId);
    if (plan.materialized) return; // already done

    const planItems = await nextDayPlanService.getItems(planId);

    for (const item of planItems) {
      // Create Oral Classwork entry if oral work is planned
      if (item.oralWork) {
        await classworkService.create({
          title: `${item.chapterName || ''} — ${item.oralWork}`.trim(),
          description: item.oralDetails || item.oralWork,
          date: plan.planDate,
          classId: plan.classId,
          // New fields:
          workType: 'oral',
          subjectId: item.subjectId,
          syllabusItemId: item.syllabusItemId,
          chapterName: item.chapterName,
          completionStatus: 'planned',
          sourcePlanItemId: item.id,
          attachments: [],
          uploadedBy: plan.editedBy,
        });
      }

      // Create Writing Classwork entry if writing work is planned
      if (item.writingWork) {
        await classworkService.create({
          title: `${item.chapterName || ''} — ${item.writingWork}`.trim(),
          description: item.writingDetails || item.writingWork,
          date: plan.planDate,
          classId: plan.classId,
          workType: 'writing',
          subjectId: item.subjectId,
          syllabusItemId: item.syllabusItemId,
          chapterName: item.chapterName,
          completionStatus: 'planned',
          sourcePlanItemId: item.id,
          attachments: [],
          uploadedBy: plan.editedBy,
        });
      }

      // Create Homework entry if homework is planned for this subject
      if (item.homeworkTitle) {
        await homeworkService.create({
          title: item.homeworkTitle,
          description: item.homeworkDescription || item.homeworkTitle,
          dueDate: item.homeworkDueDate || addDays(plan.planDate, 1),
          subjectId: item.subjectId,
          classId: plan.classId,
          syllabusItemId: item.syllabusItemId,
          chapterName: item.chapterName,
          sourcePlanItemId: item.id,
          attachments: [],
          uploadedBy: plan.editedBy,
        });
      }
    }

    // Mark plan as materialized
    await nextDayPlanService.markMaterialized(planId);
  },

  /**
   * END OF DAY REPORT — AI analyzes what was done vs what was planned
   * Teacher triggers this or it auto-runs at configured time
   */
  async generateEndOfDayReport(classId: string, date: string) {
    // 1. Fetch today's plan (what was supposed to happen)
    const plan = await nextDayPlanService.getByClassAndDate(classId, date);
    const planItems = plan ? await nextDayPlanService.getItems(plan.id) : [];

    // 2. Fetch what actually happened (classwork + homework entries for today)
    const todayClasswork = await classworkService.getByClassAndDate(classId, date);
    const todayHomework = await homeworkService.getByClassAndDate(classId, date);

    // 3. Check which planned items have photos uploaded
    const classworkWithPhotos = todayClasswork.filter(c => c.attachments?.length > 0);
    const classworkWithoutPhotos = todayClasswork.filter(c => 
      c.completionStatus === 'planned' && (!c.attachments || c.attachments.length === 0)
    );

    // 3.5. VALIDATE PHOTOS — AI reads each photo and compares to planned work
    const photoValidations = [];
    for (const cw of classworkWithPhotos) {
      // Find the plan item that generated this classwork entry
      const planItem = planItems.find(p => p.id === cw.sourcePlanItemId);
      if (!planItem) continue; // manually created, skip validation

      for (const attachment of cw.attachments) {
        const signedUrl = await fileService.getSignedUrl(attachment.filePath);
        const imageBase64 = await fetchImageAsBase64(signedUrl);

        const validation = await this.validateWorkPhoto(imageBase64, {
          plannedTitle: cw.title,
          plannedDescription: cw.description,
          plannedWorkType: cw.workType,
          plannedChapter: cw.chapterName,
          plannedSubject: planItem.subjectId,
        });

        photoValidations.push({
          classworkId: cw.id,
          planItemId: cw.sourcePlanItemId,
          fileName: attachment.fileName,
          ...validation,
        });
      }
    }

    // 4. Send to AI for full analysis (now WITH photo validation results)
    const context = {
      plannedItems: planItems,
      actualClasswork: todayClasswork,
      actualHomework: todayHomework,
      classworkWithPhotos: classworkWithPhotos.length,
      classworkWithoutPhotos: classworkWithoutPhotos.map(c => c.title),
      photoValidations, // NEW: per-photo plan-vs-actual match results
      syllabusProgress: await syllabusService.getProgressByClass(classId),
    };

    const aiReport = await llm.complete(endOfDayPrompt, JSON.stringify(context));
    // Returns: { dayScore, perSubjectScores[], feedback, improvements[], carryForwardItems[] }

    // 5. Update plan with scores and feedback
    await nextDayPlanService.updateDayReport(plan.id, {
      dayScore: aiReport.dayScore,
      dayFeedback: aiReport.feedback,
      improvements: aiReport.improvements,
    });

    // 6. Update per-subject scores on plan items
    for (const subjectScore of aiReport.perSubjectScores) {
      await nextDayPlanService.updateItemScore(subjectScore.planItemId, {
        subjectScore: subjectScore.score,
        subjectFeedback: subjectScore.feedback,
      });
    }

    // 7. Auto-update syllabus progress for completed chapters
    for (const completed of aiReport.completedChapters || []) {
      await syllabusService.markProgress(completed.syllabusItemId, classId, 'completed');
    }

    // 8. Mark skipped classwork entries
    for (const skipped of classworkWithoutPhotos) {
      if (aiReport.carryForwardItems.includes(skipped.sourcePlanItemId)) {
        await classworkService.updateStatus(skipped.id, 'skipped');
      }
    }

    return aiReport;
  },

  /**
   * VALIDATE PHOTO AGAINST PLAN — Core validation function
   * Reads the photo, understands what it actually shows, and compares
   * to what was planned. This is the "plan vs actual" proof.
   * 
   * Called during end-of-day report for every uploaded photo.
   * Also callable in real-time when teacher uploads a photo (instant feedback).
   */
  async validateWorkPhoto(
    imageBase64: string,
    planned: {
      plannedTitle: string;
      plannedDescription: string;
      plannedWorkType: 'oral' | 'writing';
      plannedChapter: string;
      plannedSubject: string;
    }
  ): Promise<PhotoValidation> {
    const response = await llm.completeWithVision(
      photoValidationPrompt,
      imageBase64,
      JSON.stringify(planned)
    );

    return {
      matchScore: response.matchScore,           // 0-100
      matchStatus: response.matchStatus,          // 'full_match' | 'partial' | 'mismatch' | 'unreadable'
      whatPhotoShows: response.whatPhotoShows,     // "Exercise 4.3, problems 1-8"
      whatWasPlanned: response.whatWasPlanned,     // "Exercise 4.3, problems 1-15"
      deviationNotes: response.deviationNotes,    // "7 problems not attempted"
      qualityNotes: response.qualityNotes,        // "Handwriting is neat. Carrying error in Q6"
      topicsCovered: response.topicsCovered,       // ["addition", "carrying"]
      errorsSpotted: response.errorsSpotted,       // ["Carrying error in problem 6", "Wrong sum in problem 8"]
      syllabusAlignment: response.syllabusAlignment, // Does content match expected chapter?
      suggestedFollowUp: response.suggestedFollowUp, // "Re-do problems 9-15 + extra carrying drill"
    };
  },

  /**
   * Analyze uploaded classwork photo and extract info
   * (Called when teacher uploads a photo in existing classwork form)
   * Also triggers INSTANT VALIDATION if the entry was AI-planned
   */
  async analyzeWorkPhoto(imageBase64: string, classId: string, subjectId: string, plannedEntry?: any) {
    // Fetch syllabus context for this class+subject
    const syllabus = await syllabusService.getByClassAndSubject(classId, subjectId);
    
    const response = await llm.completeWithVision(
      'Analyze this school work photo...',
      imageBase64,
      JSON.stringify({ syllabusContext: syllabus, question: 'What chapter/topic does this cover? Is it oral or writing work?' })
    );

    const analysis = {
      suggestedTitle: response.title,
      suggestedDescription: response.description,
      detectedChapter: response.chapterName,
      detectedWorkType: response.workType,  // 'oral' or 'writing'
      matchedSyllabusItemId: response.syllabusItemId,
      improvements: response.improvements,
    };

    // If this is a planned entry, also validate against the plan in real-time
    let validation = null;
    if (plannedEntry?.sourcePlanItemId) {
      validation = await this.validateWorkPhoto(imageBase64, {
        plannedTitle: plannedEntry.title,
        plannedDescription: plannedEntry.description,
        plannedWorkType: plannedEntry.workType,
        plannedChapter: plannedEntry.chapterName,
        plannedSubject: subjectId,
      });
    }

    return { ...analysis, validation };
  },

  /**
   * Extract syllabus chapters from uploaded PDF/image
   */
  async extractSyllabusFromDocument(imageBase64: string, subject: string, classLevel: string) {
    // ... OCR and structured extraction
  },
};
```

### 6.5 LLM Provider Abstraction Layer

All LLM calls go through a single file: **`src/services/llmProvider.ts`**.
Swapping providers (Groq → Claude → OpenAI → local) requires changing **only this file**.

```typescript
// src/services/llmProvider.ts
// ============================================================
// SINGLE FILE TO CHANGE WHEN SWITCHING LLM PROVIDERS
// Currently: Groq (llama-3.3-70b-versatile)
// To switch: Change PROVIDER config + the provider-specific call
// ============================================================

import Groq from 'groq-sdk';

// ─── PROVIDER CONFIG (change this block to switch LLM) ───────
const PROVIDER = 'groq' as const;  // 'groq' | 'anthropic' | 'openai'
const MODEL = 'llama-3.3-70b-versatile';  // Groq model
const VISION_MODEL = 'llama-3.2-90b-vision-preview';  // Groq vision model
const MAX_TOKENS = 4096;
// ──────────────────────────────────────────────────────────────

// Provider-specific client initialization
function getClient() {
  switch (PROVIDER) {
    case 'groq':
      return new Groq({ apiKey: process.env.GROQ_API_KEY });
    // case 'anthropic':
    //   return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    // case 'openai':
    //   return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
}

const client = getClient();

export interface LLMResponse {
  text: string;
  usage?: { inputTokens: number; outputTokens: number };
}

export const llm = {
  /**
   * Text-only completion (planning, reports, syllabus extraction)
   */
  async complete(systemPrompt: string, userMessage: string): Promise<LLMResponse> {
    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      response_format: { type: 'json_object' },  // Force JSON output
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });

    return {
      text: response.choices[0].message.content || '',
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
      },
    };
  },

  /**
   * Vision completion (photo validation, work analysis)
   * Sends an image + text prompt to the LLM
   */
  async completeWithVision(
    systemPrompt: string,
    imageBase64: string,
    userMessage: string
  ): Promise<LLMResponse> {
    const response = await client.chat.completions.create({
      model: VISION_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
            { type: 'text', text: userMessage },
          ],
        },
      ],
    });

    return {
      text: response.choices[0].message.content || '',
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
      },
    };
  },

  /**
   * Parse JSON from LLM response (handles markdown fences, etc.)
   */
  parseJSON<T>(response: LLMResponse): T {
    let text = response.text.trim();
    // Strip markdown code fences if present
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    return JSON.parse(text) as T;
  },
};
```

**How to switch providers later:**

| Step | What to change | Where |
|------|---------------|-------|
| 1 | Set `PROVIDER = 'anthropic'` | `llmProvider.ts` line 11 |
| 2 | Set `MODEL = 'claude-sonnet-4-20250514'` | `llmProvider.ts` line 12 |
| 3 | Install SDK: `npm install @anthropic-ai/sdk` | terminal |
| 4 | Uncomment Anthropic client init | `llmProvider.ts` getClient() |
| 5 | Adapt message format (Anthropic uses slightly different vision API) | `completeWithVision()` |

All other files (`aiService.ts`, `nextDayPlanService.ts`, etc.) call `llm.complete()` or `llm.completeWithVision()` — they never know which provider is behind it.

**Why Groq as default:**
| | Groq | Claude | OpenAI |
|---|---|---|---|
| Speed | ~10x faster (LPU inference) | Standard | Standard |
| Cost | Free tier: 30 RPM, 14,400 RPD | $3/$15 per M tokens | $2.50/$10 per M tokens |
| Vision | ✅ Llama 3.2 90B | ✅ Native | ✅ GPT-4o |
| JSON mode | ✅ `response_format` | ✅ Tool use | ✅ `response_format` |
| Best for school | ✅ Free tier covers ~10 classes | Paid only | Paid only |

### 6.6 Backend Proxy for LLM Calls (Security)

The LLM API key must NOT be in the frontend bundle. Two options:

**Option A: Supabase Edge Function (Recommended for MVP)**
```
POST /functions/v1/ai-plan
Body: { classId, date, context }
→ Edge Function has llmProvider.ts
→ Calls Groq API server-side
→ Returns plan JSON
```

**Option B: Existing `shiksha-api` Java backend**
```
POST /api/ai/generate-plan
Body: { classId, date }
→ Java service gathers context from DB
→ Calls Groq API via HTTP
→ Returns plan JSON
```

### 6.6 Next Day Plan Page — `/next-day-plan`

This page serves TWO purposes depending on context:
- **Morning/Planning view**: Shows tomorrow's plan, allows editing, materializes to classwork/homework
- **End-of-day view**: Shows today's report card, scores, feedback, then generates tomorrow's plan

**MORNING VIEW — Plan for today (already materialized):**

When a teacher uploads a photo, the AI **instantly validates** it against the plan
and shows inline feedback. No need to wait until end of day.

```
┌──────────────────────────────────────────────────────────────────┐
│  Today's Plan — Nursery A — Apr 17, 2026                        │
│  Status: ✅ Materialized → 4 classwork + 2 homework created     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📚 WHAT TO DO TODAY                                             │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Period 1: Hindi (9:00-9:40) — Ch-4 वाक्य रचना               │  │
│  │                                                            │  │
│  │ 📖 Oral: Read pg 24-25    [📷 Upload Photo] [✅ Done]       │  │
│  │ ✏️ Writing: 5 sentences    [📷 Upload Photo] [✅ Done]       │  │
│  │                                                            │  │
│  │ 🔍 AI Validation (instant on upload):                      │  │
│  │ ┌──────────────────────────────────────────────────────┐   │  │
│  │ │ ✅ Writing photo: MATCH 95/100                       │   │  │
│  │ │ Shows: 5 sentences using Ch-4 words ✓                │   │  │
│  │ │ Quality: Neat handwriting, correct grammar           │   │  │
│  │ └──────────────────────────────────────────────────────┘   │  │
│  │                                                            │  │
│  │ 📝 HW: Complete Ex-4      (auto-created, due Apr 18)      │  │
│  │ ⚠️ Carry-forward: English writing from yesterday           │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Period 2: Math (9:40-10:20) — Ch-3 Addition               │  │
│  │                                                            │  │
│  │ 📖 Oral: Mental math drill [📷 Upload Photo]               │  │
│  │ ✏️ Writing: Ex 4.3          [📷 Upload Photo] [✅ Done]      │  │
│  │                                                            │  │
│  │ 🔍 AI Validation (instant on upload):                      │  │
│  │ ┌──────────────────────────────────────────────────────┐   │  │
│  │ │ ⚠️ Writing photo: PARTIAL 53/100                     │   │  │
│  │ │ Planned: Ex 4.3, problems 1-15                       │   │  │
│  │ │ Photo shows: Only problems 1-8 done                  │   │  │
│  │ │ Errors: Carrying mistakes in Q6 (47+35=72≠82)        │   │  │
│  │ │         and Q8 (56+29=75≠85)                         │   │  │
│  │ │ Tip: "Complete remaining 7 problems. Practice        │   │  │
│  │ │       carrying with tens."                           │   │  │
│  │ └──────────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Progress: ████████░░░░ 2/4 classwork photos uploaded           │
│  Validation: 1 full match, 1 partial, 2 pending                 │
│  [+ Add Unplanned Classwork]   (manual entry still available)   │
└──────────────────────────────────────────────────────────────────┘
```

**END-OF-DAY VIEW — Report + Next day generation:**

The end-of-day report now uses **validated photo data** — not just "was a photo uploaded?"
but "does the photo actually show what was planned?"

```
┌──────────────────────────────────────────────────────────────────┐
│  End of Day Report — Nursery A — Apr 17, 2026                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📊 TODAY'S SCORE: ████████░░ 68/100  (validated by AI photos)   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Subject Scores (based on photo-validated evidence):         │  │
│  │                                                            │  │
│  │ Hindi:   ██████████  95%  ✅ Oral done ✅ Writing done       │  │
│  │          📸 Photo validation: MATCH (95/100)                │  │
│  │          "5 sentences written correctly. Neat handwriting. │  │
│  │           Content matches Ch-4 as planned. Ready for Ch-5."│  │
│  │                                                            │  │
│  │ Math:    ██████░░░░  53%  ✅ Writing partial ❌ Oral skipped │  │
│  │          📸 Photo validation: PARTIAL (53/100)              │  │
│  │          "Planned: Ex 4.3, problems 1-15                   │  │
│  │           Actual: Only problems 1-8 done                   │  │
│  │           Errors found: Q6 (47+35=72≠82), Q8 (56+29=75≠85)│  │
│  │           Both errors are carrying mistakes."              │  │
│  │                                                            │  │
│  │ English: ████░░░░░░  40%  ✅ Oral done ❌ Writing not done   │  │
│  │          📸 No photo uploaded — cannot validate             │  │
│  │          "Writing task will carry forward to tomorrow."    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ⚠️ FLAGS                                                        │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 🔴 English writing missed 2nd day in a row                │  │
│  │ 🟡 Math: carrying errors in Q6 & Q8 (AI-detected from     │  │
│  │    photo) — add targeted carrying drill tomorrow          │  │
│  │ 🟢 Hindi Ch-4 done! → Auto-updated syllabus progress      │  │
│  │ 🟠 Ram Navami in 4 days (Apr 21)                          │  │
│  │ 🔵 Math: Photo shows 8/15 problems vs 15 planned          │  │
│  │    → Remaining 7 problems carried forward                 │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  💡 IMPROVEMENTS (evidence-based from photo analysis)            │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ • मात्रा drill needed (10 min oral) — weak in today's work │  │
│  │ • Math: 2 carrying errors spotted in uploaded work →      │  │
│  │   oral drill on tens-carrying before next writing session │  │
│  │ • English writing must happen tomorrow — 2nd day missed   │  │
│  │ • Math: 7 remaining problems to complete as homework      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  [🤖 Generate Tomorrow's Plan]                                   │
│  (Takes scores, flags, improvements, syllabus as input)          │
│  [✏️ Add manual notes before generating]                         │
└──────────────────────────────────────────────────────────────────┘

      │ Teacher clicks "Generate Tomorrow's Plan"
      ▼

┌──────────────────────────────────────────────────────────────────┐
│  Tomorrow's Plan — Nursery A — Apr 18, 2026                     │
│  Status: 🤖 AI Generated  |  [✏️ Edit]  [✅ Finalize]           │
├──────────────────────────────────────────────────────────────────┤
│  ⚠️ English writing carried forward from today                  │
│                                                                  │
│  📚 SUBJECT PLAN                                                 │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Period 1: Hindi (9:00-9:40) — Ch-5 कविता (NEW CHAPTER)    │  │
│  │ 📖 Oral: Read poem "बारिश" aloud, discuss meaning          │  │
│  │ ✏️ Writing: Copy poem in notebook, underline new words     │  │
│  │ 📝 HW: Learn poem for recitation (Due: Apr 21)            │  │
│  │ 💡 "Starting Ch-5. Students strong on Ch-4, should        │  │
│  │    pick up poetry vocabulary quickly."                     │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Period 2: Math (9:40-10:20) — Ch-3 Addition (continued)   │  │
│  │ 📖 Oral: Carrying drill — call students to board          │  │
│  │ ✏️ Writing: Ex 4.3 remaining (problems 9-15)              │  │
│  │ 💡 "Extra oral drill because photo analysis showed        │  │
│  │    carrying errors yesterday."                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Period 3: English (10:30-11:10) — Ch-2 (CARRY FORWARD)    │  │
│  │ ⚠️ CARRIED FROM: Apr 17 — writing not done                │  │
│  │ 📖 Oral: Story reading "The Cat"                          │  │
│  │ ✏️ Writing: Write 5 sentences about the story             │  │
│  │ 💡 "Writing was missed 2 days. MUST complete today."      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  [✅ Finalize Plan]  → Auto-creates classwork/homework at 7 AM  │
│  [📤 Share WhatsApp]  [🖨️ Print]  [🤖 Regenerate]               │
└──────────────────────────────────────────────────────────────────┘
```

### 6.7 Plan Generation Flow (Sequence)

```
  FULL LIFECYCLE OF A PLAN
  ════════════════════════

  Evening (Day N):
  ┌─────────────────────────────────────────────────┐
  │ 1. Teacher taps "End of Day Report"             │
  │                                                 │
  │ 2. AI: Gather today's data                      │
  │    • Classwork entries for today (with photos?)  │
  │    • Homework entries created today              │
  │    • Today's plan items (what was expected)      │
  │                                                 │
  │ 3. AI: Score & flag                             │
  │    • Compare actual vs planned                  │
  │    • Score each subject 0-100                   │
  │    • Analyze uploaded photos for quality/issues  │
  │    • Flag gaps, carry-forwards, improvements     │
  │    • Auto-update syllabus progress              │
  │                                                 │
  │ 4. AI: Show end-of-day report to teacher        │
  │    • Teacher can add notes or corrections       │
  │                                                 │
  │ 5. Teacher taps "Generate Tomorrow's Plan"      │
  │                                                 │
  │ 6. AI: Gather planning context                  │
  │    • Today's scores + carry-forwards            │
  │    • Syllabus: what's next per subject           │
  │    • TimeTable: subjects for Day N+1            │
  │    • Calendar: holidays in next 7 days          │
  │    • Last 5 days oral/writing balance           │
  │    • Active flags (unresolved)                  │
  │                                                 │
  │ 7. AI: Generate NextDayPlan + PlanItems         │
  │    • Save to DB                                 │
  │    • Create new AiFlag rows                     │
  │                                                 │
  │ 8. Teacher reviews, edits if needed             │
  │ 9. Teacher taps "Finalize Plan"                 │
  └───────────────────────┬─────────────────────────┘
                          │
  Morning (Day N+1):      ▼
  ┌─────────────────────────────────────────────────┐
  │ 10. Auto-materialize (7 AM or on first login):  │
  │     • Create Classwork entries from plan items  │
  │       (oral + writing, with completionStatus    │
  │        = 'planned')                             │
  │     • Create Homework entries from plan items   │
  │       (with status = 'PENDING')                 │
  │     • Mark plan as "materialized"               │
  │                                                 │
  │ 11. Teacher opens /classwork or /homework       │
  │     → Sees pre-created cards ready for photos   │
  │     → Just uploads photos against them          │
  │     → Can also add unplanned manual entries     │
  │                                                 │
  │ 12. During school: classwork entries get         │
  │     photos uploaded, status → 'completed'       │
  │                                                 │
  │ 13. Evening: Back to Step 1 → The loop repeats  │
  └─────────────────────────────────────────────────┘
```

---

## 7. Feature D — Dashboard Calendar with Indian Festivals

### 7.1 Calendar API

**Calendarific API** (recommended):
```
GET https://calendarific.com/api/v2/holidays
  ?api_key=KEY
  &country=IN
  &year=2026
  &type=national,religious
```

**Caching strategy:**
- Fetch full year's holidays once → cache in `localStorage` with 7-day TTL
- On dashboard load, read from cache
- If expired, fetch fresh

### 7.2 Integration with AI Planning

```typescript
// In calendarService.ts
export const calendarService = {
  async getHolidaysInRange(startDate: string, endDate: string): Promise<Holiday[]> {
    const cached = getCachedHolidays();
    if (cached) return filterByRange(cached, startDate, endDate);
    
    const holidays = await fetchFromCalendarific();
    cacheHolidays(holidays);
    return filterByRange(holidays, startDate, endDate);
  },

  isSchoolDay(date: string, holidays: Holiday[]): boolean {
    const dayOfWeek = new Date(date).getDay();
    if (dayOfWeek === 0) return false; // Sunday
    return !holidays.some(h => h.date === date);
  },

  getNextSchoolDay(fromDate: string, holidays: Holiday[]): string {
    // Skip Sundays and holidays to find actual next working day
  },
};
```

### 7.3 Dashboard Calendar Widget

Replace the existing placeholder in `Dashboard.tsx`:

```
┌──────────────────────────────────┐
│  📅 April 2026                   │
│  Mo Tu We Th Fr Sa Su            │
│   1  2  3  4  5  6  7           │
│   8  9 10 11 12 13 14🟠         │
│  15 16● 17 18 19 20 21🔴        │
│  22 23  24 25 26 27 28          │
│  29 30                           │
│                                  │
│  Today: Apr 16 — No holiday      │
│  🟠 Apr 14 — Baisakhi (past)     │
│  🔴 Apr 21 — Ram Navami          │
│                                  │
│  📋 Tomorrow's Plan: ✅ Ready     │
│  [View Plan →]                   │
│                                  │
│  🤖 AI Suggestion:               │
│  "Ram Navami in 5 days. Plan a   │
│   drawing activity for Friday's  │
│   EVS period."                   │
└──────────────────────────────────┘
```

---

## 8. Feature E — Class Workbook (Combined View)

A read-only aggregation page. No new tables needed — it queries existing data.

```
┌────────────────────────────────────────────────────────────────┐
│  Class Workbook — [Nursery A ▾] — [This Week ▾]               │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  📅 Wednesday, April 16, 2026                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Hindi                                                     │  │
│  │  📖 Oral: Ch-4 वाक्य रचना — Read pg 24-25                │  │
│  │  ✏️ Writing: 5 sentences using new words                  │  │
│  │  📷 2 photos attached                                     │  │
│  │  📝 Homework: Complete Ex-4 (Due: Apr 17)                 │  │
│  │                                                           │  │
│  │ Math                                                      │  │
│  │  ✏️ Writing: Exercise 4.2 (problems 1-15)                 │  │
│  │  📷 1 photo attached                                      │  │
│  │  📝 Homework: Practice sheet (Due: Apr 17)                │  │
│  │                                                           │  │
│  │ 💡 Improvements: मात्रा drill needed, carrying practice   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  📅 Tuesday, April 15, 2026                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Hindi: Oral Ch-4 intro | Writing: Dictation              │  │
│  │ English: Oral poem recitation | Writing: Copy poem        │  │
│  │ 📷 4 photos                                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  [← Previous Week]                        [Next Week →]       │
│  [Export as PDF]  [Share]                                      │
└────────────────────────────────────────────────────────────────┘
```

**Data sources:**
- `Classwork` table (with new `workType`, `subjectId`, `chapterName` columns)
- `Homework` table (existing)
- `AiFlag` table (improvement notes)

---

## 9. Complete Database Migration

```sql
-- Migration: 20260416_add_ai_planning_syllabus.sql

-- ===== 1. SYLLABUS TABLES =====

CREATE TABLE school."Syllabus" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "classId" UUID NOT NULL REFERENCES school."Class"(id),
  "subjectId" UUID NOT NULL REFERENCES school."Subject"(id),
  "academicYear" TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'archived')),
  "approvedBy" UUID REFERENCES school."Profile"(id),
  "approvedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("classId", "subjectId", "academicYear")
);

CREATE TABLE school."SyllabusItem" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "syllabusId" UUID NOT NULL REFERENCES school."Syllabus"(id) ON DELETE CASCADE,
  "chapterNumber" INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  "learningObjectives" TEXT[],
  "estimatedDays" INTEGER DEFAULT 5,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE school."SyllabusProgress" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "syllabusItemId" UUID NOT NULL REFERENCES school."SyllabusItem"(id) ON DELETE CASCADE,
  "classId" UUID NOT NULL REFERENCES school."Class"(id),
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
  "startedDate" DATE,
  "completedDate" DATE,
  "actualDays" INTEGER,
  notes TEXT,
  "updatedBy" UUID REFERENCES school."Profile"(id),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("syllabusItemId", "classId")
);

-- ===== 2. NEXT DAY PLAN TABLES =====

CREATE TABLE school."NextDayPlan" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "classId" UUID NOT NULL REFERENCES school."Class"(id),
  "planDate" DATE NOT NULL,
  "generatedAt" TIMESTAMPTZ,
  "editedAt" TIMESTAMPTZ,
  "editedBy" UUID REFERENCES school."Profile"(id),
  status TEXT NOT NULL DEFAULT 'ai_generated'
    CHECK (status IN ('ai_generated', 'teacher_edited', 'finalized', 'materialized')),
  "materialized" BOOLEAN NOT NULL DEFAULT false,
  "materializedAt" TIMESTAMPTZ,
  "aiRawResponse" JSONB,
  "dayScore" INTEGER,
  "dayFeedback" TEXT,
  "improvements" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("classId", "planDate")
);

CREATE TABLE school."NextDayPlanItem" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "planId" UUID NOT NULL REFERENCES school."NextDayPlan"(id) ON DELETE CASCADE,
  "subjectId" UUID NOT NULL REFERENCES school."Subject"(id),
  "syllabusItemId" UUID REFERENCES school."SyllabusItem"(id),
  "chapterName" TEXT,
  "oralWork" TEXT,
  "oralDetails" TEXT,
  "writingWork" TEXT,
  "writingDetails" TEXT,
  "homeworkTitle" TEXT,
  "homeworkDescription" TEXT,
  "homeworkDueDate" DATE,
  "aiRationale" TEXT,
  "teacherNotes" TEXT,
  "carryForward" BOOLEAN DEFAULT false,
  "carryForwardReason" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "subjectScore" INTEGER,
  "subjectFeedback" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===== 3. AI FLAGS TABLE =====

CREATE TABLE school."AiFlag" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "classId" UUID NOT NULL REFERENCES school."Class"(id),
  "planId" UUID REFERENCES school."NextDayPlan"(id),
  "subjectId" UUID REFERENCES school."Subject"(id),
  "syllabusItemId" UUID REFERENCES school."SyllabusItem"(id),
  "flagType" TEXT NOT NULL
    CHECK ("flagType" IN (
      'behind_schedule', 'ahead_of_schedule', 'gap_detected',
      'festival_upcoming', 'improvement_needed', 'revision_suggested',
      'balance_alert', 'content_mismatch', 'errors_in_work', 'incomplete_work'
    )),
  severity TEXT NOT NULL DEFAULT 'info'
    CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  "suggestedAction" TEXT,
  "isResolved" BOOLEAN NOT NULL DEFAULT false,
  "resolvedAt" TIMESTAMPTZ,
  "resolvedBy" UUID REFERENCES school."Profile"(id),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===== 4. EXTEND EXISTING TABLES =====

-- Add oral/writing categorization + syllabus link + plan link to Classwork
ALTER TABLE school."Classwork"
  ADD COLUMN "workType" TEXT DEFAULT 'writing'
    CHECK ("workType" IN ('oral', 'writing')),
  ADD COLUMN "chapterName" TEXT,
  ADD COLUMN "subjectId" UUID REFERENCES school."Subject"(id),
  ADD COLUMN "syllabusItemId" UUID REFERENCES school."SyllabusItem"(id),
  ADD COLUMN "completionStatus" TEXT DEFAULT 'manual'
    CHECK ("completionStatus" IN ('planned', 'in_progress', 'completed', 'skipped', 'manual')),
  ADD COLUMN "sourcePlanItemId" UUID REFERENCES school."NextDayPlanItem"(id),
  ADD COLUMN "photoValidation" JSONB;    -- stores AI validation result per entry
  -- e.g. { matchScore: 95, matchStatus: 'full_match', whatPhotoShows: '...', errorsSpotted: [...] }

-- Add syllabus link + plan link + photo validation to Homework
ALTER TABLE school."Homework"
  ADD COLUMN "syllabusItemId" UUID REFERENCES school."SyllabusItem"(id),
  ADD COLUMN "chapterName" TEXT,
  ADD COLUMN "sourcePlanItemId" UUID REFERENCES school."NextDayPlanItem"(id),
  ADD COLUMN "photoValidation" JSONB;    -- same as Classwork

-- Link File to Syllabus for PDF uploads
ALTER TABLE school."File"
  ADD COLUMN "syllabusId" UUID REFERENCES school."Syllabus"(id);

-- ===== 5. ENABLE RLS =====

ALTER TABLE school."Syllabus" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."SyllabusItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."SyllabusProgress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."NextDayPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."NextDayPlanItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE school."AiFlag" ENABLE ROW LEVEL SECURITY;

-- ===== 6. RLS POLICIES =====

-- Authenticated users can read/write (refine per role later)
CREATE POLICY "Authenticated access" ON school."Syllabus" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON school."SyllabusItem" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON school."SyllabusProgress" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON school."NextDayPlan" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON school."NextDayPlanItem" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated access" ON school."AiFlag" FOR ALL USING (true) WITH CHECK (true);

-- ===== 7. INDEXES =====

CREATE INDEX idx_syllabus_class_subject ON school."Syllabus"("classId", "subjectId");
CREATE INDEX idx_syllabus_progress_item ON school."SyllabusProgress"("syllabusItemId");
CREATE INDEX idx_next_day_plan_class_date ON school."NextDayPlan"("classId", "planDate");
CREATE INDEX idx_ai_flag_class ON school."AiFlag"("classId", "isResolved");
CREATE INDEX idx_classwork_subject ON school."Classwork"("subjectId");
CREATE INDEX idx_classwork_syllabus_item ON school."Classwork"("syllabusItemId");
CREATE INDEX idx_classwork_plan_item ON school."Classwork"("sourcePlanItemId");
CREATE INDEX idx_classwork_date ON school."Classwork"(date);
CREATE INDEX idx_classwork_status ON school."Classwork"("completionStatus");
CREATE INDEX idx_homework_plan_item ON school."Homework"("sourcePlanItemId");
CREATE INDEX idx_homework_syllabus_item ON school."Homework"("syllabusItemId");
```

---

## 10. Complete File Map

### New Files (17)

| # | File Path | Purpose |
|---|-----------|---------|
| 1 | `migrations/20260416_add_ai_planning_syllabus.sql` | All new tables + alterations |
| 2 | `src/services/llmProvider.ts` | **LLM abstraction layer** — single file to swap Groq↔Claude↔OpenAI. Exports `llm.complete()` and `llm.completeWithVision()` |
| 3 | `src/services/aiService.ts` | AI orchestration — plan generation, end-of-day report, photo validation, syllabus extraction, materialization. Calls `llm.*` methods from llmProvider |
| 4 | `src/services/syllabusService.ts` | CRUD for Syllabus + SyllabusItem + SyllabusProgress |
| 5 | `src/services/nextDayPlanService.ts` | CRUD for NextDayPlan + NextDayPlanItem + materialization logic |
| 6 | `src/services/aiFlagService.ts` | CRUD for AiFlag — create, resolve, list |
| 7 | `src/services/calendarService.ts` | Calendarific API + caching + school day logic |
| 8 | `src/pages/NextDayPlan.tsx` | Morning plan view + End-of-day report + plan generation (combined page with mode toggle) |
| 9 | `src/pages/Syllabus.tsx` | Admin: manage syllabus; Teacher: view + track |
| 10 | `src/pages/SyllabusDetail.tsx` | Chapter list + progress tracking per subject |
| 11 | `src/pages/ClassWorkbook.tsx` | Read-only aggregated weekly view |
| 12 | `src/components/forms/syllabus-form.tsx` | Admin: create/upload/edit syllabus |
| 13 | `src/components/NextDayPlanCard.tsx` | Per-subject plan card with oral+writing+homework+upload buttons |
| 14 | `src/components/EndOfDayReport.tsx` | Scores, flags, improvements, generate next plan button |
| 15 | `src/components/AiFlagBanner.tsx` | Alert banner for AI flags |
| 16 | `src/components/SyllabusProgressCard.tsx` | Chapter with progress toggle |
| 17 | `src/components/DashboardCalendar.tsx` | Calendar with festivals + plan status |

### Modified Files (7)

| # | File Path | Change |
|---|-----------|--------|
| 1 | `src/lib/constants.ts` | Add table constants: `SYLLABUS_TABLE`, `SYLLABUS_ITEM_TABLE`, `SYLLABUS_PROGRESS_TABLE`, `NEXT_DAY_PLAN_TABLE`, `NEXT_DAY_PLAN_ITEM_TABLE`, `AI_FLAG_TABLE` |
| 2 | `src/constants/app-constants.ts` | Add routes: `NEXT_DAY_PLAN`, `SYLLABUS`, `SYLLABUS_DETAIL`, `CLASS_WORKBOOK` |
| 3 | `src/App.tsx` | Add 4 new lazy-loaded routes |
| 4 | `src/components/forms/classwork-form.tsx` | Add `workType` radio, `subject` select, `chapter` select (from syllabus), `completionStatus` tracking, AI analyze button |
| 5 | `src/services/classworkService.ts` | Add `getByClassAndDate()`, `updateStatus()` methods, support new columns in create/update |
| 6 | `src/pages/Dashboard.tsx` | Replace calendar placeholder with `DashboardCalendar`, add plan status widget, add AI flags summary |
| 7 | `src/database.types.ts` | Regenerate after migration |

---

## 11. Implementation Phases

### Phase 1 — Syllabus Foundation (Week 1)
- [ ] Create database migration and run it
- [ ] Regenerate types (`npm run supabase:generate-types`)
- [ ] Build `syllabusService.ts`
- [ ] Build admin syllabus pages (create, upload PDF, approve)
- [ ] Build teacher syllabus view with progress tracking

### Phase 2 — Classwork Enhancement (Week 2)
- [ ] Add `workType`, `subjectId`, `chapterName` fields to classwork form
- [ ] Chapter dropdown auto-populates from syllabus
- [ ] Add oral/writing filter tabs to classwork list page
- [ ] Auto-update syllabus progress when classwork is created for a chapter

### Phase 3 — AI Engine + Next Day Plan (Week 3-4)
- [ ] Create `llmProvider.ts` with Groq as default provider
- [ ] Set up backend proxy for LLM calls (Edge Function or Java)
- [ ] Build `aiService.ts` with context gathering + plan generation
- [ ] Build `NextDayPlan.tsx` page — show AI plan, allow edits, finalize
- [ ] Build AI photo analysis — auto-suggest title/chapter/workType from uploaded photo
- [ ] Build `aiFlagService.ts` — flags for behind schedule, festivals, gaps

### Phase 4 — Calendar + Dashboard (Week 5)
- [ ] Integrate Calendarific API in `calendarService.ts`
- [ ] Build `DashboardCalendar.tsx` with holidays + plan status
- [ ] Add AI flags summary to dashboard
- [ ] Add syllabus progress overview widget to dashboard

### Phase 5 — Class Workbook + Polish (Week 6)
- [ ] Build `ClassWorkbook.tsx` — weekly aggregation view
- [ ] Add share/print for workbook and plans
- [ ] Refine AI prompts based on testing
- [ ] Add proper RLS policies per role

---

## 12. AI Cost Estimation

**With Groq (default — free tier):**

| Operation | Tokens (est.) | Frequency | Groq Cost |
|-----------|--------------|-----------|----------|
| Next day plan generation | ~4000 in + ~2000 out | 10 classes × 22 days = 220/mo | **FREE** (within 14,400 RPD) |
| Photo validation (classwork) | ~1500 in + ~500 out | 20/day × 22 days = 440/mo | **FREE** (within limits) |
| End-of-day report | ~3000 in + ~1500 out | 10 classes × 22 days = 220/mo | **FREE** |
| Syllabus PDF extraction | ~3000 in + ~1500 out | ~30/year | **FREE** |
| **Total (Groq free tier)** | | **~880 requests/month** | **$0/month** |

Groq free tier: 30 requests/min, 14,400 requests/day. School usage (~40 requests/day for 10 classes) fits comfortably.

**If switching to paid providers later:**

| Provider | Model | Cost per month (est.) |
|----------|-------|----------------------|
| Groq (paid) | Llama 3.3 70B | ~$0.80/month |
| Anthropic | Claude Sonnet | ~$6/month |
| OpenAI | GPT-4o mini | ~$2/month |
| OpenAI | GPT-4o | ~$12/month |

The `llmProvider.ts` abstraction means switching is a 5-minute config change.

---

## 13. Environment Variables Required

```env
# ─── LLM Provider (stored in backend only, NOT in frontend) ───
# Currently using Groq. To switch, also update llmProvider.ts
GROQ_API_KEY=gsk_...

# Uncomment the one you switch to:
# ANTHROPIC_API_KEY=sk-ant-...
# OPENAI_API_KEY=sk-...

# ─── Calendar API ───
# Calendarific — can be in frontend (public API, rate-limited)
VITE_CALENDARIFIC_API_KEY=...

# ─── Backend proxy URL ───
VITE_AI_PROXY_URL=https://your-project.supabase.co/functions/v1/ai-plan
```

---

## 14. Security Considerations

1. **API Key Protection**: LLM API key (Groq/Anthropic/OpenAI) lives ONLY in backend (Edge Function / Java). Frontend calls the proxy.
2. **Rate Limiting**: Max 5 AI plan generations per class per day to prevent abuse/cost overrun.
3. **Input Sanitization**: All text inputs sanitized before sending to AI (strip scripts, limit length).
4. **RLS Policies**: Refine from permissive to role-specific after MVP:
   - Admin: full CRUD on Syllabus
   - Teacher: read Syllabus, write SyllabusProgress, write NextDayPlan for own classes
   - Parent/Student: read-only access to finalized plans
5. **Image Validation**: Existing `fileService.ts` validation (type + 5MB max) applies to all uploads including syllabus PDFs.
6. **AI Output Sanitization**: Never render AI output as raw HTML. Always treat as text/markdown.

---

## 15. Key Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Extend `Classwork` vs new `DailyWork` table | Extend Classwork | Avoids data fragmentation; teachers already know the flow |
| AI runs server-side vs client-side | Server-side (Edge Function) | API key security; can add caching and rate limiting |
| Separate NextDayPlan table vs extend Classwork | Separate table | Plans are future-looking; classwork is records of what happened |
| Calendarific vs Google Calendar API | Calendarific | Simpler, India-specific, free tier sufficient |
| Service pattern | Object-based (like classworkService) | Consistent with 95% of existing codebase |
| LLM Provider | Groq (Llama 3.3 70B) default, swappable | Free tier covers school usage; `llmProvider.ts` single-file swap |
| LLM abstraction | Single `llmProvider.ts` file | All AI calls go through `llm.complete()` / `llm.completeWithVision()` — provider-agnostic |
