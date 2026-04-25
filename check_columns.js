const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://jswjmlladshtwydmyqpv.supabase.co";
const supabaseKey = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('tags').select('*').limit(1);
  console.log('tags columns:', data ? Object.keys(data[0]) : 'no data', error);
  
  // Also check if sellers table has anything related to specialties
  const { data: sData } = await supabase.from('sellers').select('*').limit(1);
  console.log('sellers columns:', sData ? Object.keys(sData[0]) : 'no data');
}
test();
