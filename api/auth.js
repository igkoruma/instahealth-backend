export default async function handler(req, res) {
  const APP_ID = process.env.INSTAGRAM_APP_ID;
  const APP_SECRET = process.env.INSTAGRAM_APP_SECRET;
  const REDIRECT_URI = 'https://instahealth-backend.vercel.app/api/auth';
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Code yok' });

  try {
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_secret=${APP_SECRET}&code=${code}`;
    
    // BUNU LOGDA GÖRECEĞİZ
    console.log('KULLANILAN REDIRECT_URI:', REDIRECT_URI);
    console.log('FULL TOKEN URL:', tokenUrl);
    
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();
    
    console.log('FACEBOOK CEVABI:', JSON.stringify(tokenData));
    
    if (tokenData.error) throw new Error(tokenData.error.message);

    const userRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${tokenData.access_token}`);
    const userData = await userRes.json();

    res.status(200).json({ access_token: tokenData.access_token, user: userData });
  } catch (err) {
    console.log('CATCH HATA:', err.message);
    res.status(500).json({ error: err.message });
  }
}
