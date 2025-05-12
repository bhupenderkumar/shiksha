# Sample Data Scripts

This directory contains scripts to populate your database with sample data for testing purposes.

## Add Sample Parent Feedback

The `add-sample-feedback.js` script adds sample parent feedback data to your Supabase database for all students in all classes.

### Prerequisites

1. Node.js installed on your machine
2. Supabase project with the following tables in the `school` schema:
   - `Class` - Contains class information
   - `IDCard` - Contains student information
   - `ParentFeedback` - Will store the feedback data

### Setup

1. Copy the `.env.sample` file to `.env` in the root directory:
   ```
   cp .env.sample .env
   ```

2. Edit the `.env` file and add your Supabase anon key:
   ```
   VITE_SUPABASE_URL=https://ytfzqzjuhcdgcvvqihda.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. Install the required dependencies:
   ```
   npm install @supabase/supabase-js dotenv
   ```

### Running the Script

Run the script using Node.js:

```
node scripts/add-sample-feedback.js
```

### What the Script Does

1. Fetches all classes from the `Class` table
2. For each class, fetches all students from the `IDCard` table
3. For each student:
   - Adds feedback for the previous month
   - Has a 70% chance of adding feedback for the current month
4. Each feedback entry includes:
   - Random good things about the student
   - Random areas that need improvement
   - Random suggestions for what the student can do
   - Random attendance percentage between 80% and 100%

### Sample Data

The script uses predefined templates for feedback text to ensure realistic and varied feedback entries.

### Troubleshooting

If you encounter any issues:

1. Make sure your Supabase URL and anon key are correct in the `.env` file
2. Check that your database has the required tables in the `school` schema
3. Ensure the tables have the expected structure
4. Check the console output for specific error messages
