export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, email, phone, zip, programs, _trap, cfToken } = req.body || {};

  // Honeypot — bots fill this, humans don't
  if (_trap) return res.status(200).json({ ok: true });

  // Validate
  const emailClean  = (email     || '').toLowerCase().trim();
  const firstClean  = (firstName || '').trim();
  const lastClean   = (lastName  || '').trim();

  if (!firstClean || !lastClean || !emailClean.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return res.status(400).json({ error: 'Please fill in your name and a valid email.' });
  }

  // Cloudflare Turnstile (optional)
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret && cfToken) {
    const v = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: turnstileSecret, response: cfToken }),
    });
    const { success } = await v.json();
    if (!success) return res.status(400).json({ error: 'Spam check failed. Please try again.' });
  }

  // Parse programs into array
  const programsArray = programs
    ? (typeof programs === 'string' ? programs.split(', ').filter(Boolean) : programs)
    : [];

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
      first_name: firstClean,
      last_name: lastClean,
      email: emailClean,
      phone: phone || null,
      zip_code: zip || null,
      favorite_brands: programsArray.length ? programsArray : null,
      type: 'consumer',
    }),
  });

  if (dbRes.status === 409) {
    // Already on list — still send confirmation (might be a re-sub)
    await sendConfirmation(emailClean, firstClean);
    return res.status(200).json({ ok: true });
  }

  if (!dbRes.ok) {
    const err = await dbRes.text();
    console.error('Supabase error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }

  // Send confirmation email
  await sendConfirmation(emailClean, firstClean);

  return res.status(200).json({ ok: true });
}

async function sendConfirmation(email, firstName) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  // Use verified domain if available, else Resend test sender
  const fromDomainVerified = process.env.RESEND_DOMAIN_VERIFIED === 'true';
  const from = fromDomainVerified
    ? 'Perkalate <hello@perkalate.com>'
    : 'Perkalate <onboarding@resend.dev>';

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: `You're on the Perkalate waitlist 🎉`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a14;color:#fff;max-width:520px;margin:0 auto;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#7c3aed,#06d6f4);padding:40px 32px;text-align:center;">
            <div style="font-size:40px;margin-bottom:12px;">🎉</div>
            <h1 style="margin:0;font-size:26px;font-weight:800;">You're on the list, ${firstName}!</h1>
          </div>
          <div style="padding:32px;">
            <p style="color:#c4b5fd;font-size:16px;line-height:1.6;margin:0 0 20px;">
              Welcome to Perkalate — the app that puts every loyalty reward you've ever earned in one place.
            </p>
            <p style="color:#a78bfa;font-size:15px;line-height:1.6;margin:0 0 28px;">
              We're building something special. When your spot opens up, you'll be the first to know. In the meantime, share with friends to move up faster.
            </p>
            <div style="text-align:center;margin-bottom:28px;">
              <a href="https://perkalate.com" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#06d6f4);color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:100px;">
                Visit Perkalate →
              </a>
            </div>
            <p style="color:#6b7280;font-size:12px;text-align:center;margin:0;">
              © 2026 Perkalate · <a href="https://perkalate.com" style="color:#7c3aed;">perkalate.com</a>
            </p>
          </div>
        </div>
      `,
    }),
  }).catch(e => console.error('Resend error:', e));
}
