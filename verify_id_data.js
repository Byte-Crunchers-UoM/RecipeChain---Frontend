const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://jswjmlladshtwydmyqpv.supabase.co";
const supabaseKey = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzd2ptbGxhZHNodHd5ZG15cXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MzcxODcsImV4cCI6MjA4MzExMzE4N30.aHAqrArVB8SuywXF9515EQ2OK_LYBsNcGC9it8H5Pxg";
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const chefId = "9be5e777-594a-4a3c-bdaa-08f9c3e66eb7";
  
  console.log('--- CHECKING SELLER ---');
  const { data: seller, error: sErr } = await supabase.from('sellers').select('*').eq('user_id', chefId).single();
  console.log('Seller Found:', seller ? seller.display_name : 'NO');
  if (sErr) console.log('Seller Error:', sErr.message);

  console.log('\n--- CHECKING RECIPES ---');
  // Check with chef_id
  const { data: r1 } = await supabase.from('recipes').select('recipe_id, title').eq('chef_id', chefId);
  console.log('Recipes with chef_id:', r1 ? r1.length : 0);
  
  // Check with user_id just in case
  const { data: r2 } = await supabase.from('recipes').select('recipe_id, title').eq('user_id', chefId);
  console.log('Recipes with user_id:', r2 ? r2.length : 0);
}
check();
