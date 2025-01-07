import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function syncWithSupabase() {
  try {
    // Generate policies SQL
    execSync('ts-node scripts/generate-policies.ts', {
      stdio: 'inherit'
    });

    // Apply to Supabase
    execSync('supabase db reset', { stdio: 'inherit' });

    console.log('Successfully synced policies with Supabase!');
  } catch (error) {
    console.error('Error syncing with Supabase:', error);
    process.exit(1);
  }
}

syncWithSupabase();
