const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://jswjmlladshtwydmyqpv.supabase.co";
const supabaseKey = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const possibleTables = ['social_links', 'seller_socials', 'chef_socials', 'social_media', 'links'];
  for (const table of possibleTables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (!error) {
       console.log(`Table ${table} exists!`);
       if (data && data[0]) console.log(`Columns:`, Object.keys(data[0]));
    }
  }
}
test();
