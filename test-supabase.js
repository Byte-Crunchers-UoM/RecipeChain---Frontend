const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://jswjmlladshtwydmyqpv.supabase.co";
const supabaseKey = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.rpc('get_tables');
  if (error) {
    // try querying pg_catalog via rest if possible, or just list common table names
    const common = ['profiles', 'user_profiles', 'chef_profiles', 'chef', 'user'];
    for (const table of common) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (!error) console.log(table, 'exists');
    }
  }
}
test();
