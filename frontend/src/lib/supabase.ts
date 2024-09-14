import { createClient } from '@supabase/supabase-js';
import { Database } from '../../database.types';

// Create a single supabase client for interacting with your database
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log(supabaseUrl, supabaseKey);

const supabase = createClient<Database>(supabaseUrl, supabaseKey);
export default supabase;
