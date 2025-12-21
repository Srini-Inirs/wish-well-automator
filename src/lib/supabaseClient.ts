import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// NOTE:
// Lovable Cloud injects these at build/runtime. In rare cases the preview can load
// before env injection is available; we provide safe fallbacks so the app doesn't
// crash with `supabaseUrl is required`.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ??
  "https://tdkrsgaauvsyvryyzrim.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRka3JzZ2FhdXZzeXZyeXl6cmltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTEzOTYsImV4cCI6MjA4MTEyNzM5Nn0.gT7ub7zw75kYNRes55x7lFifprJsYNwLqUMemZbxoGE";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
