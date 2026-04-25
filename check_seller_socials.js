const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://jswjmlladshtwydmyqpv.supabase.co";
const supabaseKey = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const chefId = "d41deb90-482a-4372-9855-c3eb1076538e";
  const { data, error } = await supabase.from('sellers').select('social_links').eq('user_id', chefId).single();
  console.log('social_links content:', data, error);
}
test();
