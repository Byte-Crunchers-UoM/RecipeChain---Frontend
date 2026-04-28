const { createClient } = require('@supabase/supabase-js');
const url = "https://jswjmlladshtwydmyqpv.supabase.co";
const key = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";
const supabase = createClient(url, key);

async function findId() {
  console.log('Finding valid Chef IDs...');
  const { data, error } = await supabase.from('sellers').select('user_id, display_name').limit(3);
  if (data) {
    console.log('Found Chefs:');
    data.forEach(c => console.log(`ID: ${c.user_id} (Name: ${c.display_name})`));
  } else {
    console.log('Error finding chefs:', error.message);
  }
}
findId();
