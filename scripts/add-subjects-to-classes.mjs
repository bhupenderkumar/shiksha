/**
 * Script: Add all subjects to all classes
 * Run: node scripts/add-subjects-to-classes.mjs
 *
 * This script fetches all classes, then inserts standard subjects for each class
 * (skipping subjects that already exist by code+classId).
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load .env
const envContent = readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) env[key.trim()] = rest.join('=').trim();
});

const url = env['VITE_SUPABASE_URL'];
const key = env['VITE_SUPABASE_ANON_KEY'];

if (!url || !key) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(url, key, { db: { schema: 'school' } });

// Authenticate - required for insert permissions (RLS)
const email = env['ADMIN_EMAIL'] || process.argv[2];
const password = env['ADMIN_PASSWORD'] || process.argv[3];

if (!email || !password) {
  console.error('❌ Login required. Provide credentials via:');
  console.error('   node scripts/add-subjects-to-classes.mjs <email> <password>');
  console.error('   Or set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
  process.exit(1);
}

const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
if (authErr) {
  console.error('❌ Login failed:', authErr.message);
  process.exit(1);
}
console.log(`✅ Authenticated as ${email}\n`);

// Standard subjects for all classes
const SUBJECTS = [
  { name: 'English', code: 'ENG' },
  { name: 'Hindi', code: 'HIN' },
  { name: 'Maths', code: 'MATH' },
  { name: 'EVS', code: 'EVS' },
  { name: 'Computer', code: 'COMP' },
  { name: 'Extra Curricular', code: 'EC' },
  { name: 'General Knowledge', code: 'GK' },
  { name: 'Art & Craft', code: 'ART' },
  { name: 'Physical Education', code: 'PE' },
  { name: 'Moral Science', code: 'MS' },
];

// Default teacher ID (matches existing convention in the database)
const DEFAULT_TEACHER_ID = 'STF201';

async function main() {
  console.log('📚 Adding subjects to all classes...\n');

  // 1. Fetch all classes
  const { data: classes, error: classErr } = await supabase
    .from('Class')
    .select('id, name, section')
    .order('name');

  if (classErr) {
    console.error('❌ Failed to fetch classes:', classErr.message);
    process.exit(1);
  }
  console.log(`Found ${classes.length} classes:`);
  classes.forEach(c => console.log(`  • ${c.name} ${c.section || ''}`));

  // 2. Fetch existing subjects to avoid duplicates
  const { data: existingSubjects, error: existErr } = await supabase
    .from('Subject')
    .select('classId, code, name');

  if (existErr) {
    console.error('❌ Failed to fetch existing subjects:', existErr.message);
    process.exit(1);
  }

  // Build set of existing classId::code pairs
  const existingSet = new Set(
    (existingSubjects || []).map(s => `${s.classId}::${s.code}`)
  );
  // Also match by name to avoid near-duplicates like ENG vs ENG101
  const existingByName = new Set(
    (existingSubjects || []).map(s => `${s.classId}::${s.name}`)
  );

  console.log(`\nExisting subjects in DB: ${existingSubjects?.length || 0}`);

  // 3. Extract class number suffix for ID generation
  function getClassSuffix(classId) {
    // CLS201 -> 201, CLS205 -> 205
    return classId.replace('CLS', '');
  }

  // 4. Build insert list
  const now = new Date().toISOString();
  const toInsert = [];

  for (const cls of classes) {
    const suffix = getClassSuffix(cls.id);
    let subjectCounter = 1;

    for (const subj of SUBJECTS) {
      const codeWithSuffix = `${subj.code}${suffix}`;

      // Skip if exact code or name already exists for this class
      if (existingSet.has(`${cls.id}::${codeWithSuffix}`) ||
          existingSet.has(`${cls.id}::${subj.code}`) ||
          existingByName.has(`${cls.id}::${subj.name}`)) {
        continue;
      }

      toInsert.push({
        id: `SUB${suffix}${String(subjectCounter).padStart(2, '0')}`,
        classId: cls.id,
        name: subj.name,
        code: codeWithSuffix,
        teacherId: DEFAULT_TEACHER_ID,
        createdAt: now,
        updatedAt: now,
      });
      subjectCounter++;
    }
  }

  if (toInsert.length === 0) {
    console.log('\n✅ All subjects already exist for all classes. Nothing to insert.');
    return;
  }

  console.log(`\nInserting ${toInsert.length} new subject entries...\n`);

  // 5. Insert in batches of 50
  const BATCH_SIZE = 50;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    const { error: insertErr } = await supabase
      .from('Subject')
      .insert(batch);

    if (insertErr) {
      console.error(`❌ Batch insert failed at offset ${i}:`, insertErr.message);
      console.error('   First item in batch:', JSON.stringify(batch[0], null, 2));
      process.exit(1);
    }
    inserted += batch.length;
    console.log(`  ✅ Inserted ${inserted}/${toInsert.length}`);
  }

  console.log(`\n🎉 Done! Added ${inserted} subjects across ${classes.length} classes.`);

  // 6. Summary
  console.log('\nSummary per class:');
  for (const cls of classes) {
    const added = toInsert.filter(s => s.classId === cls.id);
    const existingCount = SUBJECTS.length - added.length;
    console.log(`  ${cls.name} ${cls.section || ''}: +${added.length} new, ${existingCount} already existed`);
    if (added.length) {
      console.log(`    Added: ${added.map(s => s.name).join(', ')}`);
    }
  }
}

main().catch(err => {
  console.error('💥 Unexpected error:', err);
  process.exit(1);
});
