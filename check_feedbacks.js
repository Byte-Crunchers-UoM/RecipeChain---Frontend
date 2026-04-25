const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://jswjmlladshtwydmyqpv.supabase.co";
const supabaseKey = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('feedbacks').select('*').limit(1);
  if (data && data[0]) {
    console.log('Feedback keys:', Object.keys(data[0]));
  } else {
    console.log('No feedback data found or table does not exist');
  }
}
test();
