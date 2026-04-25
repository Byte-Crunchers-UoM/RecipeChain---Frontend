const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://jswjmlladshtwydmyqpv.supabase.co";
const supabaseKey = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const chefId = "9be5e777-594a-4a3c-bdaa-08f9c3e66eb7";
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      tag_id,
      tags (
        tag_id,
        dietary_tags
      )
    `)
    .eq('chef_id', chefId);
    
  console.log('Chef specialties result:', JSON.stringify(data, null, 2), error);
}
test();
