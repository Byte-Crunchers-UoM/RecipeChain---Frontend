const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://jswjmlladshtwydmyqpv.supabase.co";
const supabaseKey = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const common = ['seller_tags', 'chef_tags', 'chef_specialties', 'seller_specialties', 'chef_dietary_tags'];
  for (const table of common) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (!error) {
        console.log(`Table ${table}:`, data);
    }
  }
}
test();
