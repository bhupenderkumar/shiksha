import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function syncWithSupabase() {
  try {
    // Generate schema SQL
    execSync('npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migration.sql', { 
      stdio: 'inherit' 
    });

    // Generate policies SQL
    execSync('ts-node scripts/generate-policies.ts', {
      stdio: 'inherit'
    });

    // Combine migrations
    const schemaSql = fs.readFileSync('migration.sql', 'utf8');
    const policiesSql = fs.readFileSync('supabase/migrations/policies.sql', 'utf8');
    const combinedSql = schemaSql + '\n\n' + policiesSql;

    // Format and save
    const formattedSQL = combinedSql
      .replace(/public\./g, '')
      .replace(/PRIMARY KEY,/g, 'PRIMARY KEY DEFAULT uuid_generate_v4(),');

    fs.writeFileSync('supabase/migrations/latest.sql', formattedSQL);

    // Apply to Supabase
    execSync('supabase db reset', { stdio: 'inherit' });

    // Cleanup
    fs.unlinkSync('migration.sql');
    console.log('Successfully synced schema and policies with Supabase!');
  } catch (error) {
    console.error('Error syncing with Supabase:', error);
    process.exit(1);
  }
}

syncWithSupabase();
