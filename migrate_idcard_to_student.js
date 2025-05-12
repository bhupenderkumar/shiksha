/**
 * Migration script to transfer data from IDCard table to Student table
 *
 * This script:
 * 1. Fetches all records from the IDCard table
 * 2. For each record, checks if a student with the same name and class exists
 * 3. If not, creates a new student record with data from the IDCard
 * 4. Logs the results of the migration
 */

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Initialize Supabase client
// NOTE: In a production environment, these values should be stored in environment variables
const supabaseUrl = 'https://ytfzqzjuhcdgcvvqihda.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0Znpxemp1aGNkZ2N2dnFpaGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5NTI5NzYsImV4cCI6MjAyOTUyODk3Nn0.Yd_QJfXXYGfIvHfVk7bjVZKJKgJJJzKSbYWsYLFXF-o';
const supabase = createClient(supabaseUrl, supabaseKey);

// Schema and table names
const SCHEMA = 'school';
const ID_CARD_TABLE = 'IDCard';
const STUDENT_TABLE = 'Student';

// Function to generate a unique student ID
function generateStudentId() {
  return `STU${Math.floor(Math.random() * 10000)}`;
}

// Function to generate a unique admission number
function generateAdmissionNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000);
  return `ADM${year}${random}`;
}

// Function to convert date format from YYYY-MM-DD to timestamp
function convertDateFormat(dateString) {
  if (!dateString) return new Date().toISOString();
  return new Date(dateString).toISOString();
}

// Main migration function
async function migrateIdCardToStudent() {
  console.log('Starting migration from IDCard to Student...');

  try {
    // Fetch all records from IDCard table
    const { data: idCards, error: fetchError } = await supabase
      .from(`${SCHEMA}.${ID_CARD_TABLE}`)
      .select('*');

    if (fetchError) {
      throw new Error(`Error fetching IDCard records: ${fetchError.message}`);
    }

    console.log(`Found ${idCards.length} records in IDCard table`);

    // Process each IDCard record
    const results = {
      total: idCards.length,
      inserted: 0,
      updated: 0,
      errors: 0
    };

    for (const idCard of idCards) {
      try {
        // Check if student with same name and class already exists
        const { data: existingStudents, error: checkError } = await supabase
          .from(`${SCHEMA}.${STUDENT_TABLE}`)
          .select('id')
          .eq('name', idCard.student_name)
          .eq('classId', idCard.class_id);

        if (checkError) {
          throw new Error(`Error checking for existing student: ${checkError.message}`);
        }

        // Prepare student data
        const studentData = {
          admissionNumber: generateAdmissionNumber(),
          name: idCard.student_name,
          dateOfBirth: convertDateFormat(idCard.date_of_birth),
          gender: 'Not Specified', // Default value as IDCard doesn't have gender
          address: idCard.address || 'Not Specified',
          contactNumber: idCard.father_mobile || idCard.mother_mobile || 'Not Specified',
          parentName: idCard.father_name || idCard.mother_name || 'Not Specified',
          parentContact: idCard.father_mobile || idCard.mother_mobile || 'Not Specified',
          parentEmail: `parent_${idCard.student_name.toLowerCase().replace(/\s+/g, '.')}@example.com`, // Generate a placeholder email
          bloodGroup: null,
          classId: idCard.class_id,
          updatedAt: new Date().toISOString()
        };

        if (existingStudents && existingStudents.length > 0) {
          // Update existing student
          const existingId = existingStudents[0].id;
          const { error: updateError } = await supabase
            .from(`${SCHEMA}.${STUDENT_TABLE}`)
            .update(studentData)
            .eq('id', existingId);

          if (updateError) {
            throw new Error(`Error updating student record: ${updateError.message}`);
          }

          console.log(`Successfully updated student: ${studentData.name} with ID: ${existingId}`);
          results.updated++;
        } else {
          // Add ID for new student
          const newStudentData = {
            ...studentData,
            id: generateStudentId(),
            createdAt: new Date().toISOString()
          };

          // Insert new student record
          const { error: insertError } = await supabase
            .from(`${SCHEMA}.${STUDENT_TABLE}`)
            .insert([newStudentData]);

          if (insertError) {
            throw new Error(`Error inserting student record: ${insertError.message}`);
          }

          console.log(`Successfully inserted student: ${newStudentData.name} with ID: ${newStudentData.id}`);
          results.inserted++;
        }

      } catch (error) {
        console.error(`Error processing IDCard record for ${idCard.student_name}:`, error);
        results.errors++;
      }
    }

    // Log final results
    console.log('Migration completed with the following results:');
    console.log(`Total records processed: ${results.total}`);
    console.log(`Records inserted: ${results.inserted}`);
    console.log(`Records updated: ${results.updated}`);
    console.log(`Errors encountered: ${results.errors}`);

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateIdCardToStudent();
