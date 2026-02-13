import { createClient, RealtimeChannel } from '@supabase/supabase-js';

// Vite uses import.meta.env for environment variables with VITE_ prefix
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(`Supabase credentials are not configured. 
    Please create a .env.local file with:
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
});

// Helper to get environment variable (for backwards compatibility)
export const getEnvVar = (key: string, defaultValue: string = '') => {
    return import.meta.env[key] || defaultValue;
};