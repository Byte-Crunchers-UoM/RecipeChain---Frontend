const url = "https://jswjmlladshtwydmyqpv.supabase.co/rest/v1/sellers?select=*";
const key = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";

async function run() {
  const res = await fetch(url, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const data = await res.json();
  console.log(data.map(d => ({name: d.display_name, verify: d.verify_badge_status})));
}
run();
