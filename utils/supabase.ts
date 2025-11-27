import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yxekfldvqyzrrafscpdj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZWtmbGR2cXl6cnJhZnNjcGRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTMzODAsImV4cCI6MjA3ODAyOTM4MH0.rX3HSmHcrWbAgpHsg4BMe-AOlQQQ1qxdY7w-tYP2vjw';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});