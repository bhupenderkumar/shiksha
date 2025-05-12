# Fixing Parent Feedback Table Errors

This guide will help you fix the errors you're encountering with the `ParentSubmittedFeedback` table.

## Understanding the Errors

You're seeing several errors:

1. **PGRST116**: "JSON object requested, multiple (or no) rows returned"
   - This means your query is expecting a single row, but no data was found
   - This is not a permissions error, but indicates no matching data exists

2. **PGRST204**: "Could not find the 'feedback' column of 'ParentSubmittedFeedback'"
   - This suggests the table structure might be incorrect or the schema cache is outdated

3. **22P02**: "invalid input syntax for type uuid: 'CLS201'"
   - This indicates that 'CLS201' is not a valid UUID format
   - Class IDs in your database are likely UUIDs, not string identifiers like 'CLS201'

## Step 1: Fix the Table Structure

First, let's check and fix the table structure:

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Run the `fix_table_structure.sql` script
4. This will:
   - Check if the 'feedback' column exists
   - Add it if it's missing
   - Refresh the schema cache

## Step 2: Find the Correct Class ID and Insert Test Data

The error about invalid UUID syntax indicates that 'CLS201' is not a valid UUID. We need to find the correct UUID for the class:

1. In the SQL Editor, run the `check_and_insert_data.sql` script
2. This will:
   - Check the format of class IDs in your database
   - Look for a class with a name or ID similar to 'CLS201'
   - Find the correct class ID for the student 'AVYUKT SURESH DHONI'
   - Insert a test record using the correct class ID
   - Show you the data that should now be available

## Step 3: Refresh the Schema Cache

To ensure Supabase's API is using the latest table structure:

1. In the SQL Editor, run:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
2. Wait a few seconds for the cache to refresh

## Step 4: Modify Your API Query

You need to update your API queries to use the correct UUID format for class_id, not the string 'CLS201':

```typescript
// First, get the correct class ID
const { data: classData } = await supabase
  .schema(SCHEMA)
  .from('Class')
  .select('id')
  .eq('name', 'CLS201')  // Or whatever identifies this class
  .single();

if (!classData) {
  console.error('Class not found');
  return null;
}

const correctClassId = classData.id;

// Then use this ID in your query
const { data, error } = await supabase
  .schema(SCHEMA)
  .from(PARENT_SUBMITTED_FEEDBACK_TABLE)
  .select(`
    *,
    Class:class_id (
      id,
      name,
      section
    )
  `)
  .eq('class_id', correctClassId)  // Use the UUID, not the string 'CLS201'
  .eq('student_name', student_name)
  .eq('month', month);

// Then check if data exists
if (data && data.length > 0) {
  // Use the first row
  const feedback = data[0];
  // ...
} else {
  // No data found, handle accordingly
  // ...
}
```

## Step 5: Update Your API URL

When making direct API calls, you need to use the correct UUID for the class_id parameter:

1. First, find the correct UUID for the class:
   ```sql
   SELECT id FROM school."Class" WHERE name = 'CLS201' LIMIT 1;
   ```

2. Then use that UUID in your API URL:
   ```
   https://ytfzqzjuhcdgcvvqihda.supabase.co/rest/v1/ParentSubmittedFeedback?select=*%2CClass%3Aclass_id%28id%2Cname%2Csection%29&class_id=eq.123e4567-e89b-12d3-a456-426614174000&student_name=eq.AVYUKT+SURESH+DHONI&month=eq.April
   ```
   (Replace the UUID with the actual UUID from your database)

## Troubleshooting

If you're still having issues:

1. **Verify the class ID format**: Class IDs should be UUIDs like '123e4567-e89b-12d3-a456-426614174000', not strings like 'CLS201'
2. **Verify the student name**: Ensure 'AVYUKT SURESH DHONI' is spelled exactly as it appears in the database
3. **Try without filters**: Remove the filters to see if any data is returned at all

```
https://ytfzqzjuhcdgcvvqihda.supabase.co/rest/v1/ParentSubmittedFeedback?select=*
```

4. **Check the API key**: Make sure you're using the correct API key in your requests
