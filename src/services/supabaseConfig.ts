/* ============================================================
   SUPABASE CONFIG — GLOBAL LEADERBOARD
   ------------------------------------------------------------
   To activate the online leaderboard:
   1. Create a free project at https://supabase.com
   2. Run the SQL from SUPABASE_SETUP.md in the SQL editor
   3. Paste your Project URL and anon public key below:
        SUPABASE_URL:    https://xxxxxxxx.supabase.co
        SUPABASE_ANON_KEY: eyJhbGciOi... (anon/public key)
   4. Until configured, the game silently uses local records.
   You can also set these at runtime in the browser console:
        localStorage.setItem('bugout_supabase_url', 'https://...')
        localStorage.setItem('bugout_supabase_key', 'eyJ...')
   ============================================================ */

export const SUPABASE_URL: string = '';        // <-- paste project URL here
export const SUPABASE_ANON_KEY: string = '';   // <-- paste anon public key here

export const getSupabaseConfig = (): { url: string; key: string } | null => {
  let url = SUPABASE_URL;
  let key = SUPABASE_ANON_KEY;
  try {
    url = localStorage.getItem('bugout_supabase_url') || url;
    key = localStorage.getItem('bugout_supabase_key') || key;
  } catch {
    /* storage unavailable */
  }
  if (!url || !key) return null;
  return { url: url.replace(/\/+$/, ''), key };
};
