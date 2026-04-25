const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://jswjmlladshtwydmyqpv.supabase.co";
const supabaseKey = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: sellers } = await supabase.from('sellers').select('user_id').limit(20);
  const userIds = sellers.map(s => s.user_id);
  
  const { data, error } = await supabase.from('social_links').select('*').in('user_id', userIds);
  console.log('social_links for sellers:', data, error);
}
test();
