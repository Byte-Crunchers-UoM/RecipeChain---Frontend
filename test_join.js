const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://jswjmlladshtwydmyqpv.supabase.co";
const supabaseKey = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const chefId = "d41deb90-482a-4372-9855-c3eb1076538e7";
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
