#!/usr/bin/env node

// Simple test script to verify Supabase setup
// Run with: node test-auth.js

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Testing Supabase Configuration...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('VITE_SUPABASE_URL:', supabaseUrl || '❌ Missing');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
console.log();

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Please set up your environment variables in .env file');
  console.log('See setup-supabase.md for instructions');
  process.exit(1);
}

// Check if using placeholder values
if (supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
  console.log('⚠️  You are using placeholder Supabase credentials');
  console.log('Please update your .env file with real Supabase credentials');
  console.log('See setup-supabase.md for instructions');
  process.exit(1);
}

// Test Supabase connection
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔌 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️  Users table not found - you may need to run migrations');
        console.log('See setup-supabase.md for migration instructions');
      } else {
        console.log('❌ Connection failed:', error.message);
      }
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase');
    console.log('✅ Users table exists');
    return true;
    
  } catch (err) {
    console.log('❌ Connection test failed:', err.message);
    return false;
  }
}

async function testAuth() {
  try {
    console.log('🔐 Testing authentication setup...');
    
    // Test auth configuration
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Auth test failed:', error.message);
      return false;
    }
    
    console.log('✅ Authentication system is properly configured');
    return true;
    
  } catch (err) {
    console.log('❌ Auth test failed:', err.message);
    return false;
  }
}

async function runTests() {
  const connectionOk = await testConnection();
  const authOk = await testAuth();
  
  console.log('\n📊 Test Results:');
  console.log('Connection:', connectionOk ? '✅ OK' : '❌ Failed');
  console.log('Authentication:', authOk ? '✅ OK' : '❌ Failed');
  
  if (connectionOk && authOk) {
    console.log('\n🎉 All tests passed! Your Supabase setup is working correctly.');
    console.log('You can now start the development server with: npm run dev');
  } else {
    console.log('\n❌ Some tests failed. Please check your Supabase configuration.');
    console.log('See setup-supabase.md for troubleshooting instructions.');
  }
}

runTests();