# Row Level Security (RLS) Policy Implementation Guide

This guide will help you implement the necessary Row Level Security (RLS) policies for the `ParentSubmittedFeedback` table to allow anonymous users to create and view feedback data.

## What is Row Level Security?

Row Level Security (RLS) is a feature in PostgreSQL that allows you to control which rows in a table are visible or modifiable by different users. In Supabase, RLS policies are used to secure your data and ensure that users can only access the data they're authorized to see.

## Why You're Getting a Permission Error

The error you're seeing:
```
{
    "code": "42501",
    "details": null,
    "hint": null,
    "message": "permission denied for table ParentSubmittedFeedback"
}
```

This occurs because:
1. RLS is enabled on the `ParentSubmittedFeedback` table
2. There are no policies that allow anonymous users to access the data
3. The anonymous role doesn't have the necessary permissions

## How to Apply the RLS Policies

### Option 1: Using the Supabase SQL Editor

1. Log in to your Supabase dashboard at [https://app.supabase.io/](https://app.supabase.io/)
2. Select your project (`ytfzqzjuhcdgcvvqihda`)
3. Go to the SQL Editor (left sidebar)
4. Create a new query
5. Copy and paste the entire content of the `parent_feedback_rls_policies.sql` file
6. Run the query

### Option 2: Using the Supabase CLI

If you have the Supabase CLI installed:

1. Save the `parent_feedback_rls_policies.sql` file to your project directory
2. Open a terminal and navigate to your project directory
3. Run the following command:
   ```
   supabase db push -f parent_feedback_rls_policies.sql
   ```

## Verifying the Policies

After applying the policies, you can verify they're working correctly:

1. Go to the Authentication section in your Supabase dashboard
2. Click on "Policies"
3. Look for the `ParentSubmittedFeedback` table
4. You should see the policies you just created:
   - `parent_feedback_select_policy`
   - `parent_feedback_insert_policy`
   - `parent_feedback_update_policy`
   - `parent_feedback_select_auth_policy`
   - `parent_feedback_update_auth_policy`
   - `parent_feedback_delete_auth_policy`

## Testing the Policies

You can test if the policies are working by:

1. Using the API URL that was previously giving you a 403 error:
   ```
   https://ytfzqzjuhcdgcvvqihda.supabase.co/rest/v1/ParentSubmittedFeedback?select=*%2CClass%3Aclass_id%28id%2Cname%2Csection%29&class_id=eq.CLS201&student_name=eq.AVYUKT+SURESH+DHONI&month=eq.April
   ```

2. Trying to submit feedback through your application as an anonymous user

## Understanding the Policies

The policies we've created allow:

1. **Anonymous users** to:
   - View all feedback (to simplify the implementation)
   - Insert new feedback
   - Update any feedback (to simplify the implementation)

2. **Authenticated users** (school staff) to:
   - View all feedback
   - Update any feedback (including changing status)
   - Delete feedback if necessary

## Security Considerations

The current policies are quite permissive to ensure your application works correctly. In a production environment, you might want to:

1. Restrict anonymous users to only view feedback they've submitted (using a client-side identifier)
2. Restrict anonymous users to only update feedback they've submitted
3. Add rate limiting to prevent abuse

## Troubleshooting

If you're still experiencing issues after applying these policies:

1. Check the browser console for any errors
2. Verify that your API requests include the correct Supabase API key
3. Make sure the table name and schema are correct in your queries
4. Check that the columns in your insert/update operations match the table schema
