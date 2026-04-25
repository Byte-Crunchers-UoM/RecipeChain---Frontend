const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://jswjmlladshtwydmyqpv.supabase.co";
const supabaseKey = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('social_links').select('user_id, facebook, youtube, tiktok, instagram').limit(1);
  console.log('Result:', data, error ? error.message : 'no error');
  
  if (error) {
    const { data: d2, error: e2 } = await supabase.from('social_links').select('*').limit(1);
    console.log('Fallback result:', d2, e2);
  }
}
test();
