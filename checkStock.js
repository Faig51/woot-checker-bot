const axios = require('axios');
const sendTelegram = require('./telegram');
const { createClient} = require('@supabase/supabase-js');

// 🔗 Supabase bağlantısı
const supabaseUrl = 'https://mefhicaqghykerfyuola.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lZmhpY2FxZ2h5a2VyZnl1b2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MDQzMzEsImV4cCI6MjA2OTE4MDMzMX0._A2z39hLZ1xmj8kkDwJpfsl6mpiHX5-SEw9OfULHfIU';

const supabase = createClient(supabaseUrl, supabaseKey);

// 🔍 Link daha əvvəl bildirilibmi?
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

// 💾 Yeni bildirilmiş linki cədvələ yaz
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

// 📦 Stok yoxlayıcı əsas funksiya
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

