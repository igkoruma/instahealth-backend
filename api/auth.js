export default async function handler(req, res) {
  const APP_ID = process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID;
  const APP_SECRET = process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET;
  const REDIRECT_URI = 'https://instahealth-backend.vercel.app/api/auth';
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Code parametresi yok' });

  try {
    // DOĞRU ENDPOINT: graph.facebook.com
    const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&client_secret=${APP_SECRET}&code=${code}`);
    
    const tokenData = await tokenRes.json();
    console.log('FACEBOOK TOKEN CEVAP:', tokenData);
    
    if (tokenData.error) throw new Error(tokenData.error.message);

    // Kullanıcı bilgisi
    const userRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${tokenData.access_token}`);
    const userData = await userRes.json();

    res.status(200).json({ 
      access_token: tokenData.access_token, 
      user: userData 
    });
  } catch (err) {
    console.error('HATA DETAY:', err);
    res.status(500).json({ error: err.message });
  }
}
