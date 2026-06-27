const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://jswjmlladshtwydmyqpv.supabase.co";
const supabaseKey = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('followed_chefs').select('*').limit(1);
  if (error) {
      console.log('followed_chefs table error:', error.message);
  } else {
      console.log('followed_chefs columns:', data.length > 0 ? Object.keys(data[0]) : 'empty table');
  }
}
test();
