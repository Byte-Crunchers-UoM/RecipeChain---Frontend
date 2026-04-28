const { createClient } = require('@supabase/supabase-js');
const url = "https://jswjmlladshtwydmyqpv.supabase.co";
const key = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";
const supabase = createClient(url, key);

async function checkRecipes() {
  const chefId = "9be5e777-594a-4a3c-bdaa-08f9c3e66eb7";
  console.log(`Checking recipes for chef: ${chefId}`);
  
  const { data, error } = await supabase.from('recipes').select('recipe_id, title, chef_id').eq('chef_id', chefId);
  if (data) {
    console.log(`Found ${data.length} recipes:`);
    data.forEach(r => console.log(`- ${r.title}`));
  } else {
    console.log('Error:', error.message);
  }
}
checkRecipes();
