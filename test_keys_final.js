const { createClient } = require('@supabase/supabase-js');
const url = "https://jswjmlladshtwydmyqpv.supabase.co";

const shortKey = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW";
const longKey = "sb_publishable_sAbJ4DJwHPK2mD36AArG5A_bcGWCkFW.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzd2ptbGxhZHNodHd5ZG15cXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MzcxODcsImV4cCI6MjA4MzExMzE4N30.aHAqrArVB8SuywXF9515EQ2OK_LYBsNcGC9it8H5Pxg";

async function runTest() {
  console.log('Testing SHORT key...');
  const sClient = createClient(url, shortKey);
  const { data: d1, error: e1 } = await sClient.from('sellers').select('count').limit(1);
  console.log('Short Key Result:', e1 ? e1.message : 'Success!');

  console.log('\nTesting LONG key...');
  const lClient = createClient(url, longKey);
  const { data: d2, error: e2 } = await lClient.from('sellers').select('count').limit(1);
  console.log('Long Key Result:', e2 ? e2.message : 'Success!');
}
runTest();
