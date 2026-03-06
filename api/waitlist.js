export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, email, _trap, cfToken } = req.body || {};

  // Honeypot — bots fill this field, humans don't see it
  if (_trap) {
    return res.status(200).json({ ok: true }); // Silently succeed so bots don't retry
  }

  // Basic validation
  const emailClean = (email || '').toLowerCase().trim();
  const firstClean = (firstName || '').trim();
  const lastClean  = (lastName  || '').trim();

  if (!firstClean || !lastClean || !emailClean.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return res.status(400).json({ error: 'Please fill in all fields with a valid email.' });
  }

  // Cloudflare Turnstile verification (optional — skip if key not set)
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret && cfToken) {
    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: turnstileSecret, response: cfToken }),
    });
    const { success } = await verify.json();
    if (!success) {
      return res.status(400).json({ error: 'Spam check failed. Please try again.' });
    }
  }

  // Write to Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  const dbRes = await fetch(`${supabaseUrl}/rest/v1/waitlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({
      email: emailClean,
      name: `${firstClean} ${lastClean}`,
      type: 'consumer',
    }),
  });

  if (dbRes.status === 409) {
    // Already on the list — treat as success
    return res.status(200).json({ ok: true });
  }

  if (!dbRes.ok) {
    const errText = await dbRes.text();
    console.error('Supabase error:', errText);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }

  return res.status(200).json({ ok: true });
}
