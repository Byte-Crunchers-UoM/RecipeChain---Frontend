const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://jswjmlladshtwydmyqpv.supabase.co";
const supabaseKey = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const chefId = "d41deb90-482a-4372-9855-c3eb1076538e";
  const { data, error } = await supabase.from('social_links').select('*').eq('user_id', chefId);
  console.log('social_links data for new chef:', data, error);
  if (data && data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
  }
}
test();
