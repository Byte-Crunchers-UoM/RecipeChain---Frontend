import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jswjmlladshtwydmyqpv.supabase.co";
const supabaseKey = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";

export const supabase = createClient(supabaseUrl, supabaseKey);
