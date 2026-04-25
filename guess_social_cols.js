const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://jswjmlladshtwydmyqpv.supabase.co";
const supabaseKey = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const variations = [
    'facebook_link', 'youtube_link', 'tiktok_link', 'instagram_link',
    'facebook_url', 'youtube_url', 'tiktok_url', 'instagram_url',
    'fb_link', 'yt_link', 'tk_link', 'ig_link',
    'facebook', 'youtube', 'tiktok', 'instagram'
  ];
  
  for (const col of variations) {
    const { data, error } = await supabase.from('social_links').select(col).limit(1);
    if (!error) {
      console.log(`Column ${col} exists!`);
    }
  }
}
test();
