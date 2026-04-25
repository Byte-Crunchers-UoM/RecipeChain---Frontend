const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://jswjmlladshtwydmyqpv.supabase.co";
const supabaseKey = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const common = ['user_profiles', 'chef_profiles', 'verify_status', 'chef_details', 'chef_status', 'chefs', 'verifications'];
  for (const table of common) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (!error) {
        console.log(`Table ${table}:`, data);
    }
  }
}
test();
