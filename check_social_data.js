const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://jswjmlladshtwydmyqpv.supabase.co";
const supabaseKey = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('social_links').select('*').limit(10);
  console.log('social_links data:', data);
  if (data && data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
  } else {
    
    const { data: cols, error: colError } = await supabase.rpc('get_table_columns', { table_name: 'social_links' });
    console.log('RPC columns:', cols, colError);
  }
}
test();
