// 🔧 Modullar
const axios = require('axios');
const sendTelegram = require('./telegram');
const fs = require('fs');
const { createClient} = require('@supabase/supabase-js');

// 🛠 Supabase bağlantısı
const supabaseUrl = 'https://YOUR_PROJECT_ID.supabase.co'; // öz URL-inlə əvəz et
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';              // öz public API açarınla əvəz et
const supabase = createClient(supabaseUrl, supabaseKey);

// 📄 Məhsul siyahısı
const productsTxtFile = './products.txt';

let productLinks = [];
if (fs.existsSync(productsTxtFile)) {
  try {
    const txtData = fs.readFileSync(productsTxtFile, 'utf-8');
    productLinks = txtData
.split('\n')
.map(line => line.trim())
.filter(line => line.length> 0);
} catch (e) {
    console.error('❌ products.txt oxunmadı:', e.message);
}
} else {
  console.error('❌ products.txt faylı tapılmadı!');
  process.exit(1);
}

// 🔍 Supabase ilə bildiriş yoxlama funksiyası
async function isAlreadyNotified(url) {
  const { data, error} = await supabase
.from('notified_links')
.select('url')
.eq('url', url)
.single();

  if (error && error.code!== 'PGRST116') {
    console.error(`❗ Supabase yoxlamasında xəta → ${url}: ${error.message}`);
}

  return!!data;
}

// 💾 Yeni linki bazaya yazan funksiya
async function addToNotified(url) {
  const { error} = await supabase
.from('notified_links')
.insert({ url});

  if (error) {
    console.error(`❌ Supabase yazılmadı → ${url}: ${error.message}`);
} else {
    console.log(`🗂 Supabase cədvəlinə əlavə olundu → ${url}`);
}
}

// 🧠 Stok yoxlama funksiyası
async function checkStock(url) {
  try {
    const res = await axios.get(url);
    const html = res.data;

    if (html.includes('Sold Out')) {
      const alreadySent = await isAlreadyNotified(url);
      if (!alreadySent) {
        await sendTelegram(`🚫 SOLD OUT\n${url}`);
        console.log(`📢 Yeni sold out tapıldı → ${url}`);
        await addToNotified(url);
} else {
        console.log(`⏳ Artıq bildirilmiş → ${url}`);
}
} else {
      console.log(`✅ Stokda var → ${url}`);
}
} catch (err) {
    console.error(`❌ Sorğuda xəta → ${url}: ${err.message}`);
}
}

// 🚀 Botu işə salırıq
async function run() {
  console.log(`🔍 ${productLinks.length} məhsul yoxlanır...`);
  for (const url of productLinks) {
    await checkStock(url);
}
  console.log('✅ Yoxlama tamamlandı.');
  process.exit(0);
}

run();
