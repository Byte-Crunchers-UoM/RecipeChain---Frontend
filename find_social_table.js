const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://jswjmlladshtwydmyqpv.supabase.co";
const supabaseKey = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const possibleTables = ['social_links', 'seller_social_links', 'chef_social_links', 'socials', 'links'];
  for (const table of possibleTables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    console.log(`Table ${table}:`, data ? 'exists' : 'does not exist', error ? error.message : '');
    if (data && data[0]) console.log(`${table} columns:`, Object.keys(data[0]));
  }
}
test();
