// Script to add sample parent feedback data to Supabase
// Run with: node scripts/add-sample-feedback.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ytfzqzjuhcdgcvvqihda.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('Error: Supabase anon key is required. Please set VITE_SUPABASE_ANON_KEY environment variable.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const SCHEMA = 'school';

// Sample feedback templates
const goodThingsTemplates = [
  "Shows excellent participation in class activities and discussions.",
  "Demonstrates strong problem-solving skills and critical thinking.",
  "Has shown significant improvement in reading comprehension this month.",
  "Consistently completes homework assignments on time and with care.",
  "Works well with classmates and contributes positively to group projects.",
  "Shows enthusiasm for learning and asks thoughtful questions.",
  "Demonstrates strong leadership qualities during group activities.",
  "Has excellent attendance and is always punctual.",
  "Shows creativity and originality in writing assignments.",
  "Demonstrates a positive attitude towards challenging tasks."
];

const needToImproveTemplates = [
  "Could benefit from more focused attention during class lectures.",
  "Should practice math skills more regularly at home.",
  "Needs to participate more actively in class discussions.",
  "Could improve handwriting and presentation of work.",
  "Should work on time management for longer assignments.",
  "Needs to read more regularly to improve vocabulary.",
  "Could benefit from more organized approach to homework.",
  "Should ask for help when concepts are unclear.",
  "Needs to improve test preparation strategies.",
  "Could work on following directions more carefully."
];

const bestCanDoTemplates = [
  "Continue reading daily and discussing books with family members.",
  "Practice multiplication tables for 10 minutes each day.",
  "Use a planner to track assignments and due dates.",
  "Set aside a quiet study space at home without distractions.",
  "Review class notes each evening for better retention.",
  "Join study groups or seek extra help for challenging subjects.",
  "Break larger assignments into smaller, manageable tasks.",
  "Participate in extracurricular activities related to areas of interest.",
  "Use online educational resources for additional practice.",
  "Maintain a positive attitude and growth mindset when facing challenges."
];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Get current and previous months
const currentDate = new Date();
const currentMonth = months[currentDate.getMonth()];
const previousMonth = months[(currentDate.getMonth() + 11) % 12]; // Previous month accounting for January

// Function to get a random item from an array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Function to generate random attendance percentage between 80 and 100
const getRandomAttendance = () => Math.floor(Math.random() * 21) + 80;

// Function to generate a UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Main function to add sample feedback
async function addSampleFeedback() {
  try {
    // Step 1: Get all classes
    const { data: classes, error: classError } = await supabase
      .schema(SCHEMA)
      .from('Class')
      .select('id, name, section');

    if (classError) {
      throw new Error(`Error fetching classes: ${classError.message}`);
    }

    if (!classes || classes.length === 0) {
      console.log('No classes found in the database.');
      return;
    }

    console.log(`Found ${classes.length} classes.`);

    // Step 2: For each class, get students and add feedback
    for (const classData of classes) {
      console.log(`Processing class: ${classData.name} ${classData.section || ''}`);

      // Get students from IDCard table which has student names
      const { data: students, error: studentError } = await supabase
        .schema(SCHEMA)
        .from('IDCard')
        .select('id, student_name, student_photo_url')
        .eq('class_id', classData.id);

      if (studentError) {
        console.error(`Error fetching students for class ${classData.id}: ${studentError.message}`);
        continue;
      }

      if (!students || students.length === 0) {
        console.log(`No students found for class ${classData.id}.`);
        continue;
      }

      console.log(`Found ${students.length} students in class ${classData.name}.`);

      // Add feedback for each student for current and previous month
      for (const student of students) {
        // Add feedback for previous month
        await addFeedbackForStudent(student, classData.id, previousMonth);
        
        // Add feedback for current month for some students (70% chance)
        if (Math.random() < 0.7) {
          await addFeedbackForStudent(student, classData.id, currentMonth);
        }
      }
    }

    console.log('Sample feedback data added successfully!');
  } catch (error) {
    console.error('Error adding sample feedback:', error);
  }
}

// Function to add feedback for a specific student and month
async function addFeedbackForStudent(student, classId, month) {
  const feedbackId = generateUUID();
  const now = new Date().toISOString();
  
  const feedbackData = {
    id: feedbackId,
    class_id: classId,
    student_name: student.student_name,
    month: month,
    good_things: getRandomItem(goodThingsTemplates),
    need_to_improve: getRandomItem(needToImproveTemplates),
    best_can_do: getRandomItem(bestCanDoTemplates),
    attendance_percentage: getRandomAttendance(),
    student_photo_url: student.student_photo_url || '',
    created_at: now,
    updated_at: now
  };

  const { error } = await supabase
    .schema(SCHEMA)
    .from('ParentFeedback')
    .insert([feedbackData]);

  if (error) {
    console.error(`Error adding feedback for ${student.student_name}: ${error.message}`);
    return false;
  }

  console.log(`Added ${month} feedback for ${student.student_name}`);
  return true;
}

// Run the main function
addSampleFeedback()
  .then(() => console.log('Script completed'))
  .catch(err => console.error('Script failed:', err));
