import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// If keys are missing, we export a proxy that fails gracefully or returns nulls
// This prevents the application from crashing on load before keys are provided.
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      from: () => {
        const mock = {
          select: () => mock,
          insert: () => mock,
          update: () => mock,
          delete: () => mock,
          eq: () => mock,
          order: () => mock,
          then: (cb: any) => Promise.resolve({ data: null, error: new Error('Supabase URL required') }).then(cb),
          catch: (cb: any) => Promise.resolve({ data: null, error: new Error('Supabase URL required') }).catch(cb),
        };
        return mock;
      }
    } as any;

// Extend mock with channel for Realtime support
if (!supabase.channel) {
  supabase.channel = () => ({
    on: () => supabase.channel(),
    subscribe: () => ({ unsubscribe: () => {} }),
    send: () => Promise.resolve(),
  });
}
