import { policies } from '../supabase/policies/config';
import fs from 'fs';

function generatePolicySql() {
  let sql = '-- Dropping existing policies\n';
  
  // Drop existing policies
  Object.keys(policies).forEach(table => {
    sql += `DROP POLICY IF EXISTS ON "${table}";\n`;
  });

  sql += '\n-- Enabling RLS\n';
  
  // Enable RLS on all tables
  Object.keys(policies).forEach(table => {
    sql += `ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;\n`;
  });

  sql += '\n-- Creating new policies\n';
  
  // Create new policies
  Object.entries(policies).forEach(([table, tablePolicies]) => {
    tablePolicies.forEach(policy => {
      sql += `CREATE POLICY "${policy.name}" ON "${table}"\n`;
      sql += `FOR ${policy.operation}\n`;
      sql += `USING (${policy.expression});\n\n`;
    });
  });

  return sql;
}

// Generate and save policies
const policiesSql = generatePolicySql();
fs.writeFileSync('supabase/migrations/policies.sql', policiesSql);
