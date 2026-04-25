const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://jswjmlladshtwydmyqpv.supabase.co";
const supabaseKey = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('social_links').select('user_id').limit(1);
  console.log('user_id exists?', !error);
  
  const { data: d2, error: e2 } = await supabase.from('social_links').select('social_media_name').limit(1);
  console.log('social_media_name exists?', !e2);
}
test();
