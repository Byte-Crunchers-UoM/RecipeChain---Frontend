const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://jswjmlladshtwydmyqpv.supabase.co";
const supabaseKey = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('sellers').select('*').limit(1);
  console.log('sellers data:', data);
  if (error) console.error('sellers error:', error);
}
test();
