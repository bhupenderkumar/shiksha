# Environment Setup Guide

This guide explains how to set up the environment variables required for the admission management system.

## Required Environment Variables

### Supabase Configuration

1. `VITE_SUPABASE_URL`
   - Your Supabase project URL
   - Found in: Supabase Dashboard > Project Settings > API
   - Example: https://xxxxxxxxxxxx.supabase.co

2. `VITE_SUPABASE_ANON_KEY`
   - Your Supabase project's anon/public key
   - Found in: Supabase Dashboard > Project Settings > API > Project API keys
   - Used for client-side operations

3. `VITE_SUPABASE_SERVICE_ROLE_KEY`
   - Your Supabase project's service role key
   - Found in: Supabase Dashboard > Project Settings > API > Project API keys
   - **WARNING**: Keep this secret! Never expose in client-side code
   - Used for administrative operations

### School Configuration

4. `VITE_SCHOOL_ID`
   - Your school's unique identifier in the system
   - This will be provided by the system administrator
   - Required for all admission-related operations

### File Storage Configuration

5. `VITE_MAX_FILE_SIZE`
   - Maximum allowed file size for uploads in bytes
   - Default: 5242880 (5MB)
   - Adjust based on your storage requirements

6. `VITE_ALLOWED_FILE_TYPES`
   - Comma-separated list of allowed MIME types
   - Default: image/jpeg,image/png,application/pdf
   - Used for document uploads in admission process

### Application Configuration

7. `VITE_API_BASE_URL`
   - Base URL for API endpoints
   - Development: http://localhost:3000
   - Production: Your production API URL

8. `VITE_APP_ENV`
   - Application environment
   - Values: development, staging, production
   - Controls logging and feature flags

## Setup Instructions

1. Copy `.env.example` to create a new `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Get your Supabase credentials:
   - Go to [Supabase Dashboard](https://app.supabase.io)
   - Select your project
   - Go to Project Settings > API
   - Copy the required credentials

3. Update `.env` file:
   - Replace placeholder values with your actual credentials
   - Ensure all required variables are set
   - Double-check the service role key is correct

4. Database Setup:
   - Run the migration script to create required tables:
   ```bash
   npm run migrate
   ```

## Troubleshooting

### Common Issues

1. "Failed to connect to Supabase"
   - Check if VITE_SUPABASE_URL is correct
   - Verify VITE_SUPABASE_ANON_KEY is valid
   - Ensure your IP is allowlisted in Supabase

2. "File upload failed"
   - Check VITE_MAX_FILE_SIZE value
   - Verify VITE_ALLOWED_FILE_TYPES includes needed formats
   - Check storage bucket permissions in Supabase

3. "Admission process error"
   - Verify VITE_SCHOOL_ID is set correctly
   - Check if all required tables are created
   - Ensure proper database permissions

## Security Notes

- Never commit `.env` file to version control
- Keep service role key strictly private
- Regularly rotate API keys
- Monitor API usage for suspicious activity

## Updating Environment Variables

When adding new environment variables:
1. Update `.env.example` with the new variable
2. Update this documentation
3. Notify all developers of the change
4. Update deployment configurations

For any issues or questions about environment setup, contact the system administrator.