# Guide to Fix Database Column Inconsistency

The interactive assignment system is experiencing issues due to inconsistency between camelCase and snake_case column names in the database. This guide will help you fix these issues.

## Problem

The `InteractiveQuestion` table has both camelCase and snake_case versions of the same columns, which causes confusion and potential data loss. For example:
- `questionType` and `question_type`
- `questionText` and `question_text`
- `questionData` and `question_data`

## Solution

We've prepared a SQL script that will:
1. Add any missing columns (both camelCase and snake_case versions)
2. Synchronize data between the column pairs
3. Create a trigger to keep the columns in sync going forward
4. Grant proper permissions
5. Refresh the schema cache

## How to Run the Fix

1. Open the Supabase dashboard for your project
2. Navigate to the SQL Editor
3. Copy and paste the contents of the `fix_interactive_question_columns.sql` file
4. Run the script
5. Verify that the columns are properly synchronized

## Verification

After running the script, you can verify that it worked by:
1. Checking the `InteractiveQuestion` table structure in the Table Editor
2. Creating or updating an interactive assignment with questions
3. Viewing the assignment to ensure questions are displayed correctly

## Troubleshooting

If you continue to experience issues after running the fix:
1. Check the browser console for any error messages
2. Look for specific error messages about missing columns or schema cache issues
3. Try refreshing the schema cache manually by running:
   ```sql
   SELECT pg_notify('pgrst', 'reload schema');
   ```
4. If problems persist, you may need to restart the Supabase service or contact support

## Long-term Solution

In the future, we plan to standardize on snake_case for all database columns and use camelCase only in the TypeScript/React code. This will be implemented in a future update.
