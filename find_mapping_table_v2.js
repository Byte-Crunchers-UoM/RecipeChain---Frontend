const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://jswjmlladshtwydmyqpv.supabase.co";
const supabaseKey = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const possibleMappingTables = [
    'chef_tags', 'seller_tags', 'recipe_tags', 'chef_specialties', 
    'seller_specialties', 'user_tags', 'user_specialties',
    'specialties', 'chef_dietary_tags', 'seller_dietary_tags'
  ];
  
  for (const table of possibleMappingTables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (!error) {
      console.log(`Table ${table} exists! Data:`, data);
    }
  }
}
test();
