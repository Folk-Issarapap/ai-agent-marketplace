#!/usr/bin/env node

/**
 * Check environment variables
 * Usage: node scripts/check-env.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking environment variables...\n');

// Check root .env
const rootEnvPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(rootEnvPath)) {
  console.log('✅ Root .env found');
  const rootEnv = fs.readFileSync(rootEnvPath, 'utf-8');
  const hasDatabaseUrl = rootEnv.includes('DATABASE_URL');
  const hasServiceRoleKey = rootEnv.includes('SUPABASE_SERVICE_ROLE_KEY');
  
  console.log(`   DATABASE_URL: ${hasDatabaseUrl ? '✅' : '❌'}`);
  console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${hasServiceRoleKey ? '✅' : '❌'}`);
  
  if (hasDatabaseUrl) {
    const dbUrlMatch = rootEnv.match(/DATABASE_URL=(.+)/);
    if (dbUrlMatch) {
      const dbUrl = dbUrlMatch[1].trim();
      // Mask password
      const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':***@');
      console.log(`   Value: ${maskedUrl}`);
    }
  }
} else {
  console.log('❌ Root .env not found');
  console.log('   Create .env file at root directory with DATABASE_URL');
}

console.log('');

// Check marketplace .env.local
const marketplaceEnvPath = path.join(__dirname, '..', 'apps', 'marketplace', '.env.local');
if (fs.existsSync(marketplaceEnvPath)) {
  console.log('✅ Marketplace .env.local found');
  const marketplaceEnv = fs.readFileSync(marketplaceEnvPath, 'utf-8');
  const hasSupabaseUrl = marketplaceEnv.includes('NEXT_PUBLIC_SUPABASE_URL');
  const hasSupabaseKey = marketplaceEnv.includes('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY');
  
  console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${hasSupabaseUrl ? '✅' : '❌'}`);
  console.log(`   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: ${hasSupabaseKey ? '✅' : '❌'}`);
} else {
  console.log('❌ Marketplace .env.local not found');
  console.log('   Create .env.local file at apps/marketplace/.env.local');
}

console.log('\n📝 Note: Make sure to restart dev server after updating .env files');
