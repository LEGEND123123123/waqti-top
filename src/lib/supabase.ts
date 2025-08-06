import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Demo configuration that works immediately
const DEMO_URL = 'https://nfqbxpzxrrlqzgdygjcg.supabase.co';
const DEMO_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mcWJ4cHp4cnJscXpnZHlnamNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ3MzI2MjYsImV4cCI6MjAyMDMwODYyNn0.lqfSAOyqcFBmqKRKRfgYlKfCE4qhHR5K4Xq2VUQnWrU';

// Check if environment variables are properly configured
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const hasValidConfig = supabaseUrl && 
                      supabaseAnonKey && 
                      supabaseUrl !== 'your_supabase_url_here' &&
                      supabaseAnonKey !== 'your_supabase_anon_key_here' &&
                      !supabaseUrl.includes('placeholder') &&
                      isValidUrl(supabaseUrl);

let finalUrl = DEMO_URL;
let finalKey = DEMO_ANON_KEY;

if (hasValidConfig) {
  finalUrl = supabaseUrl;
  finalKey = supabaseAnonKey;
  console.log('✅ Using your Supabase configuration');
} else {
  console.log('🔧 Using demo Supabase configuration');
  console.log('ℹ️  To use your own Supabase project, update the .env file');
}

// Create Supabase client with working configuration
export const supabase = createClient(finalUrl, finalKey);