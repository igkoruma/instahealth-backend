export default async function handler(req, res) {
  // VERCEL'DEKİ ENV İSMİ NEYSE ONU KULLAN
  const APP_ID = process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID;
  const APP_SECRET = process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET;
  const REDIRECT_URI = 'https://instahealth-backend.vercel.app/api/auth';
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Code parametresi yok' });

  console.log('GELEN CODE:', code);
  console.log('KULLANILAN APP_ID:', APP_ID);
  console.log('KULLANILAN REDIRECT_URI:', REDIRECT_URI);

  try {
    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: APP_ID,
        client_secret: APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code: code
      })
    });
    
    const tokenData = await tokenRes.json();
    console.log('INSTAGRAM CEVAP:', tokenData);
    
    if (tokenData.error_message) throw new Error(tokenData.error_message);

    const userRes = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${tokenData.access_token}`);
    const userData = await userRes.json();

    res.status(200).json({ 
      access_token: tokenData.access_token, 
      user: userData 
    });
  } catch (err) {
    console.error('HATA DETAY:', err);
    res.status(500).json({ error: err.message, debug: 'Vercel logs kontrol et' });
  }
}
