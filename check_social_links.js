const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://jswjmlladshtwydmyqpv.supabase.co";
const supabaseKey = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('social_links').select('*').limit(1);
  if (data && data[0]) {
    console.log('social_links columns:', Object.keys(data[0]));
    console.log('Sample data:', data[0]);
  } else {
    console.log('No data or table does not exist', error);
  }
}
test();
