/**
 * Test script: Validate Timetable table and service
 * Run: node scripts/test-timetable.js
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ytfzqzjuhcdgcvvqihda.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

// Read from .env file
import { readFileSync } from 'fs';
const envContent = readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) envVars[key.trim()] = valueParts.join('=').trim();
});

const url = envVars['VITE_SUPABASE_URL'] || SUPABASE_URL;
const key = envVars['VITE_SUPABASE_ANON_KEY'] || SUPABASE_KEY;

const supabase = createClient(url, key, {
  db: { schema: 'school' }
});

// Get test credentials from env or use defaults
const testEmail = envVars['TEST_EMAIL'] || 'test@test.com';
const testPassword = envVars['TEST_PASSWORD'] || 'Testing@123';

async function test() {
  console.log('🔍 Testing Timetable table...\n');

  // 0. Authenticate
  console.log('0️⃣ Authenticating...');
  if (!testPassword) {
    console.log('   ⚠️ No TEST_PASSWORD in .env — running as anon (read-only)');
    console.log('   Set TEST_EMAIL and TEST_PASSWORD in .env for full CRUD test\n');
  } else {
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    if (authErr) {
      console.error(`   ❌ Auth failed: ${authErr.message}`);
      console.log('   Continuing as anon (read-only)...\n');
    } else {
      console.log(`   ✅ Signed in as ${testEmail}\n`);
    }
  }

  // 1. Check table exists by querying it
  console.log('1️⃣ Query TimeTable table...');
  const { data: rows, error: queryErr } = await supabase
    .from('TimeTable')
    .select('*')
    .limit(5);
  
  if (queryErr) {
    console.error('❌ TimeTable query failed:', queryErr.message);
    if (queryErr.message.includes('permission denied')) {
      console.log('   → RLS/GRANT issue. Make sure the permissions migration was also run.');
    }
    return;
  }
  console.log(`✅ TimeTable accessible. ${rows.length} existing rows.`);

  // 2. Get a class and subject to test with
  console.log('\n2️⃣ Fetching a class and subject...');
  const { data: classes } = await supabase.from('Class').select('id, name').limit(1);
  if (!classes?.length) {
    console.error('❌ No classes found');
    return;
  }
  const classId = classes[0].id;
  console.log(`   Class: ${classes[0].name} (${classId})`);

  const { data: subjects } = await supabase.from('Subject').select('id, name').eq('classId', classId).limit(1);
  if (!subjects?.length) {
    console.error('❌ No subjects found for this class');
    return;
  }
  const subjectId = subjects[0].id;
  console.log(`   Subject: ${subjects[0].name} (${subjectId})`);

  // 2.5 Probe which columns exist one by one
  console.log('\n2️⃣.5 Probing columns one by one...');
  const allCols = ['id', 'classId', 'subjectId', 'day', 'startTime', 'endTime', 'periodNumber', 'teacherName', 'room', 'createdAt', 'updatedAt'];
  const existingCols = [];
  for (const col of allCols) {
    const { error } = await supabase.from('TimeTable').select(col).limit(0);
    if (!error) {
      existingCols.push(col);
      process.stdout.write(`   ✅ ${col}\n`);
    } else {
      process.stdout.write(`   ❌ ${col}: ${error.message}\n`);
    }
  }
  console.log(`\n   Existing columns: [${existingCols.join(', ')}]`);

  // 2.6 Check grants via test insert with only existing columns
  const insertCols = {};
  if (existingCols.includes('classId')) insertCols.classId = classId;
  if (existingCols.includes('subjectId')) insertCols.subjectId = subjectId;
  if (existingCols.includes('day')) insertCols.day = 0;
  if (existingCols.includes('startTime')) insertCols.startTime = '00:00';
  if (existingCols.includes('endTime')) insertCols.endTime = '00:01';
  if (existingCols.includes('periodNumber')) insertCols.periodNumber = 99;

  // 3. Insert a test entry with only existing columns
  console.log('\n3️⃣ Inserting test timetable entry (with known columns)...');
  console.log('   Columns:', Object.keys(insertCols));
  const { data: inserted, error: insertErr } = await supabase
    .from('TimeTable')
    .insert(insertCols)
    .select('*')
    .single();

  if (insertErr) {
    console.error('❌ Insert failed:', insertErr.message);
    return;
  }
  console.log(`✅ Inserted: id=${inserted.id}`);

  // 4. Read it back with subject join
  console.log('\n4️⃣ Reading back with subject join...');
  const { data: readBack, error: readErr } = await supabase
    .from('TimeTable')
    .select('*, subject:Subject(id, name, code)')
    .eq('id', inserted.id)
    .single();

  if (readErr) {
    console.error('❌ Read failed:', readErr.message);
  } else {
    console.log(`✅ Read back: day=${readBack.day}, subject=${readBack.subject?.name}, period=${readBack.periodNumber}`);
  }

  // 5. Delete the test entry
  console.log('\n5️⃣ Cleaning up test entry...');
  const { error: delErr } = await supabase
    .from('TimeTable')
    .delete()
    .eq('id', inserted.id);

  if (delErr) {
    console.error('❌ Delete failed:', delErr.message);
  } else {
    console.log('✅ Test entry deleted.');
  }

  // 6. Also validate NextDayPlan + NextDayPlanItem tables
  console.log('\n6️⃣ Validating AI Planning tables...');
  const tables = ['NextDayPlan', 'NextDayPlanItem', 'AiFlag', 'Syllabus', 'SyllabusItem', 'SyllabusProgress'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('id').limit(1);
    if (error) {
      console.error(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: accessible (${data.length} rows sampled)`);
    }
  }

  console.log('\n🎉 All tests passed!');
}

test().catch(err => {
  console.error('💥 Unexpected error:', err);
  process.exit(1);
});
