import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};

const supabaseUrl = 
  metaEnv.VITE_SUPABASE_URL || 
  metaEnv.NEXT_PUBLIC_SUPABASE_URL || 
  'https://kfnadikrzgxruaszksxh.supabase.co';

const supabaseAnonKey = 
  metaEnv.VITE_SUPABASE_ANON_KEY || 
  metaEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  'sb_publishable_B0y0iAFtxZxdeietVzd1Og_p6NTKyWR';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
