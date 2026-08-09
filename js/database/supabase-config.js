// supabase project settings
const SUPABASE_URL = "https://mhzyxnejsevpbosrikhj.supabase.co";
const SUPABASE_KEY = "sb_publishable_YcjwNaQ_-7epoy6SJCjYzw_Ez9Y4aI-";

// the client everything else uses
let db = null;

if (window.supabase) {
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}
