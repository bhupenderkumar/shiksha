#!/usr/bin/env node
/**
 * Generate Supabase API Keys
 * 
 * This script generates ANON_KEY and SERVICE_ROLE_KEY for self-hosted Supabase
 * based on the JWT_SECRET in your .env file.
 * 
 * Usage: node generate-keys.js [JWT_SECRET]
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple JWT implementation (no external dependencies)
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function createJWT(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Get JWT_SECRET from argument or .env file
let jwtSecret = process.argv[2];

if (!jwtSecret) {
  // Try to read from .env file
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/JWT_SECRET=(.+)/);
    if (match) {
      jwtSecret = match[1].trim();
    }
  }
}

if (!jwtSecret || jwtSecret === 'your-super-secret-jwt-token-with-at-least-32-characters') {
  console.error('Error: JWT_SECRET is required');
  console.log('');
  console.log('Usage: node generate-keys.js [JWT_SECRET]');
  console.log('');
  console.log('Or set JWT_SECRET in your .env file first');
  process.exit(1);
}

// Generate tokens
const anonPayload = {
  role: 'anon',
  iss: 'supabase',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 years
};

const serviceRolePayload = {
  role: 'service_role',
  iss: 'supabase',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 years
};

const anonKey = createJWT(anonPayload, jwtSecret);
const serviceRoleKey = createJWT(serviceRolePayload, jwtSecret);

console.log('Generated Supabase API Keys');
console.log('===========================');
console.log('');
console.log('Add these to your .env file:');
console.log('');
console.log(`ANON_KEY=${anonKey}`);
console.log('');
console.log(`SERVICE_ROLE_KEY=${serviceRoleKey}`);
console.log('');
console.log('For the React app (.env in project root):');
console.log('');
console.log(`VITE_SUPABASE_ANON_KEY=${anonKey}`);
console.log(`VITE_SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}`);
