const axios = require('axios');
const fs = require('fs');
const sendTelegram = require('./telegram');
const { createClient} = require('@supabase/supabase-js');

// 🔗 Supabase bağlantısı
const supabaseUrl = 'https://mefhicaqghykerfyuola.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // sənin açarın

const supabase = createClient(supabaseUrl, supabaseKey);

// 🔧 URL formatını normallaşdırır
function normalizeURL(url) {
  return url.trim().toLowerCase()
.replace(/^https?:\/\//, '')
.replace(/^www\./, '')
.replace(/\/$/, '');
}

// 🔍 Link daha əvvəl bildirilibmi?
async function isAlreadyNotified(url) {
  const normalized = normalizeURL(url);

  const { data, error} = await supabase
.from('notified_links')
.select('url');

  if (error) {
    console.error(`❗ Supabase yoxlamasında xəta → ${url}: ${error.message}`);
    return false;
}

  return data.some(row => normalizeURL(row.url) === normalized);
}

// 💾 Yeni linki bazaya yazır
async function addToNotified(url) {
  const cleaned = normalizeURL(url);
  console.log(`🔄 Supabase insert cəhd edilir → ${url}`);

  const { data, error} = await supabase
.from('notified_links')
.insert({ url: cleaned})
.select();

  if (error) {
    console.error(`❌ Supabase insert XƏTASI → ${url}: ${error.message}`);
} else if (data && data.length> 0) {
    console.log(`✅ Supabase insert uğurlu oldu → ${url}`);
} else {
    console.warn(`⚠ Supabase insert heç nə qaytarmadı → ${url}`);
}
}

// 📦 Stok statusunu yoxlayır
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

// 📄 products.txt faylını oxuyur
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

// 🚀 Sistemi işə salır
async function run() {
  console.log(`🔍 ${productLinks.length} məhsul yoxlanır...`);
  for (const url of productLinks) {
    await checkStock(url);
}
  console.log('✅ Yoxlama tamamlandı.');
  process.exit(0);
}

run();
