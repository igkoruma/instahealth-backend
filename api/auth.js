export default async function handler(req, res) {
  const APP_ID = process.env.INSTAGRAM_APP_ID;
  const APP_SECRET = process.env.INSTAGRAM_APP_SECRET;
  const REDIRECT_URI = 'https://instahealth-backend.vercel.app/api/auth';
  const SITE_URL = 'https://myinstahealth.pages.dev'; // CLOUDFLARE SİTEN
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { code } = req.query;
  if (!code) return res.redirect(302, `${SITE_URL}?error=Code_yok`);

  try {
    // 1. KISA TOKEN AL
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_secret=${APP_SECRET}&code=${code}`;
    const tokenRes = await fetch(tokenUrl);
    const shortToken = await tokenRes.json();
    if (shortToken.error) throw new Error(shortToken.error.message);

    // 2. UZUN TOKEN’A ÇEVİR
    const longTokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${shortToken.access_token}`;
    const longTokenRes = await fetch(longTokenUrl);
    const longToken = await longTokenRes.json();
    if (longToken.error) throw new Error(longToken.error.message);

    // 3. USER BİLGİSİ AL
    const userRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${longToken.access_token}`);
    const userData = await userRes.json();

    // 4. CLOUDFLARE SİTENE REDIRECT ET
    const redirectUrl = `${SITE_URL}?access_token=${longToken.access_token}&expires_in=${longToken.expires_in}&ig_user_id=${userData.id}&ig_user_name=${encodeURIComponent(userData.name)}`;
    res.redirect(302, redirectUrl);
    
  } catch (err) {
    console.log('CATCH HATA:', err.message);
    res.redirect(302, `${SITE_URL}?error=${encodeURIComponent(err.message)}`);
  }
}
