#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple markdown parser
function parseMarkdown(content) {
  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!frontmatterMatch) throw new Error('No frontmatter found');
  
  const [, frontmatterStr, body] = frontmatterMatch;
  const frontmatter = {};
  frontmatterStr.split('\n').forEach(line => {
    const match = line.match(/^(\w+):\s*"?([^"]*)"?$/);
    if (match) {
      frontmatter[match[1]] = match[2].replace(/^"|"$/g, '');
    }
  });

  // Split on gate marker
  const [publicContent, gatedContent] = body.split('[HUBSPOT GATE]');
  
  return { frontmatter, publicContent, gatedContent };
}

// Convert markdown to HTML (simple implementation)
function markdownToHtml(md) {
  if (!md) return '';
  
  let html = md
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Blockquotes (multiline)
    .replace(/^> (.*)$/gim, '<blockquote>$1</blockquote>')
    // Paragraphs (not after headers or blockquotes)
    .split('\n\n')
    .map(para => {
      para = para.trim();
      if (!para) return '';
      if (para.startsWith('<h') || para.startsWith('<blockquote') || para.startsWith('<ul') || para.startsWith('<ol')) {
        return para;
      }
      return `<p>${para}</p>`;
    })
    .join('\n');

  return html;
}

// Generate excerpt
function generateExcerpt(content, maxLength = 180) {
  const text = content
    .replace(/<[^>]+>/g, '')
    .replace(/\n/g, ' ')
    .trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

// Read all blog posts
const blogDir = path.join(__dirname, 'content', 'blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));

const posts = files.map(file => {
  const content = fs.readFileSync(path.join(blogDir, file), 'utf8');
  const { frontmatter, publicContent, gatedContent } = parseMarkdown(content);
  const publicHtml = markdownToHtml(publicContent);
  const gatedHtml = markdownToHtml(gatedContent || '');
  const excerpt = generateExcerpt(publicHtml);
  
  return {
    ...frontmatter,
    slug: frontmatter.slug,
    publicHtml,
    gatedHtml,
    excerpt,
    hasGate: !!gatedContent
  };
}).sort((a, b) => parseInt(a.post_number) - parseInt(b.post_number));

// Create blog directory
const blogOutputDir = path.join(__dirname, 'blog');
if (!fs.existsSync(blogOutputDir)) {
  fs.mkdirSync(blogOutputDir, { recursive: true });
}

// Template for blog post page
function generatePostPage(post) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${post.title} | Perkalate</title>
<meta name="description" content="${post.meta_description}">
<meta property="og:title" content="${post.title}">
<meta property="og:description" content="${post.meta_description}">
<meta property="og:image" content="/og-image.png">
<meta name="color-scheme" content="dark light">
<link rel="icon" href="/favicon.ico">
<script>
  (function () {
    var q = new URLSearchParams(location.search).get('theme');
    var s = null; try { s = localStorage.getItem('pk-theme'); } catch (e) {}
    var t = q || s || 'dark';
    document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
  })();
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
<style>
.blog-post{max-width:780px;margin:0 auto;padding:80px 24px 64px}
.blog-back{display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:var(--muted);text-decoration:none;margin-bottom:32px;transition:color .2s}
.blog-back:hover{color:var(--text)}
.blog-title{font-size:clamp(32px,5vw,48px);line-height:1.1;letter-spacing:-.03em;font-weight:800;margin:0 0 24px}
.blog-content{font-size:17px;line-height:1.7;color:var(--text)}
.blog-content h2{font-size:28px;margin:48px 0 16px;font-weight:700;letter-spacing:-.02em}
.blog-content h3{font-size:22px;margin:32px 0 12px;font-weight:600;letter-spacing:-.01em}
.blog-content p{margin:0 0 20px}
.blog-content a{color:var(--accent-text);text-decoration:none;border-bottom:1px solid var(--accent-border);transition:border-color .2s}
.blog-content a:hover{border-color:var(--accent-text)}
.blog-content strong{font-weight:600;color:var(--text)}
.blog-content blockquote{margin:32px 0;padding:20px 24px;border-left:3px solid var(--accent-border);background:var(--surface);border-radius:0 12px 12px 0;color:var(--muted);font-size:15px}
.gate-wall{margin:48px 0;padding:40px 32px;border-radius:18px;background:var(--surface);border:1px solid var(--border)}
.gate-wall.unlocked{display:none}
.gate-title{font-size:24px;font-weight:700;margin:0 0 12px;text-align:center}
.gate-subtitle{color:var(--muted);text-align:center;margin:0 0 32px;font-size:16px}
.gate-form{max-width:480px;margin:0 auto}
.form-section{margin-bottom:32px}
.form-section-title{font-size:15px;font-weight:600;margin:0 0 16px;color:var(--text)}
.field{margin-bottom:16px}
.field label{display:block;font-size:14px;font-weight:600;margin-bottom:7px}
.field .opt{color:var(--faint);font-weight:500}
.field input,.field select{width:100%;height:48px;border-radius:12px;border:1px solid var(--border-strong);background:var(--bg);padding:0 14px;font-size:16px;transition:border-color .15s,box-shadow .15s;appearance:none}
html[data-theme="dark"] .field input,html[data-theme="dark"] .field select{background:rgba(0,0,0,.28)}
.field input::placeholder{color:var(--faint)}
.field input:focus,.field select:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 4px var(--accent-soft)}
.field select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%238A839E' stroke-width='2'%3E%3Cpath d='M2 4l4 4 4-4'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:36px}
html[data-theme="dark"] .field select option{background:#15111F}
.gate-submit{width:100%;height:52px;border:0;border-radius:12px;font-weight:600;font-size:16px;background:var(--btn-bg);color:var(--btn-fg);box-shadow:var(--btn-shadow);cursor:pointer;transition:transform .15s}
.gate-submit:hover{transform:translateY(-1px)}
.gate-submit:disabled{opacity:.7;cursor:not-allowed;transform:none}
.gate-error{margin:16px 0 0;padding:12px 16px;border-radius:10px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.4);color:#DC2626;font-size:14px;display:none}
html[data-theme="dark"] .gate-error{color:#FCA5A5}
.gate-error.show{display:block}
.gated-content{display:none}
.gated-content.unlocked{display:block}
</style>
</head>
<body>
<nav class="nav">
<div class="wrap">
<a href="/" class="brand">
<div class="brand-mark">
<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L14 5v6l-6 4-6-4V5l6-4z" fill="#fff" fill-opacity=".85"/></svg>
</div>
<span>Perkalate <span class="brand-sub">for brands</span></span>
</a>
<div class="nav-right">
<button class="icon-btn" id="theme-toggle" aria-label="Toggle theme">
<svg class="i-sun" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="4"/><path d="M9 1v2m0 10v2M1 9h2m10 0h2m-2.05-5.95l-1.41 1.41M5.46 11.54l-1.41 1.41m9.9 0l-1.41-1.41M5.46 4.46L4.05 3.05"/></svg>
<svg class="i-moon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 1.05a7 7 0 107.95 7.95A7 7 0 009 1.05z"/></svg>
</button>
</div>
</div>
</nav>

<main class="blog-post">
<a href="/brands#blog" class="blog-back">
<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 14L4 8l6-6"/></svg>
Back to blog
</a>

<h1 class="blog-title">${post.title}</h1>

<div class="blog-content">
${post.publicHtml}
</div>

${post.hasGate ? `
<div class="gate-wall" id="gate">
<h2 class="gate-title">Continue reading</h2>
<p class="gate-subtitle">Answer a few quick questions to unlock the full article.</p>

<form class="gate-form" id="gate-form">
<div class="form-section">
<div class="field">
<label for="firstname">First name</label>
<input type="text" id="firstname" name="firstname" required>
</div>
<div class="field">
<label for="lastname">Last name</label>
<input type="text" id="lastname" name="lastname" required>
</div>
<div class="field">
<label for="email">Work email</label>
<input type="email" id="email" name="email" required>
</div>
<div class="field">
<label for="company">Company</label>
<input type="text" id="company" name="company" required>
</div>
</div>

<div class="form-section">
<div class="form-section-title">Help us understand your needs</div>
<div class="field">
<label for="role">What's your role?</label>
<select id="role" name="perkalate_role_level" required>
<option value="">Select...</option>
<option value="founder_ceo">Founder / CEO</option>
<option value="vp_head">VP / Head of marketing, CRM, loyalty</option>
<option value="director_manager">Director / Manager</option>
<option value="individual_contributor">Individual contributor</option>
<option value="agency_other">Agency / Other</option>
</select>
</div>

<div class="field">
<label for="website">Company website</label>
<input type="url" id="website" name="website" placeholder="https://yourbrand.com" required>
</div>

<div class="field">
<label for="revenue">Annual online revenue</label>
<select id="revenue" name="perkalate_online_revenue_band" required>
<option value="">Select...</option>
<option value="under_1m">Under $1M</option>
<option value="1m_5m">$1M-$5M</option>
<option value="5m_20m">$5M-$20M</option>
<option value="20m_100m">$20M-$100M</option>
<option value="100m_plus">$100M+</option>
</select>
</div>

<div class="field">
<label for="loyalty_program">Do you run a loyalty program?</label>
<select id="loyalty_program" name="has_loyalty_program" required>
<option value="">Select...</option>
<option value="yes_platform">Yes, on a platform (Yotpo, LoyaltyLion, Smile, Klaviyo, etc.)</option>
<option value="yes_custom">Yes, custom built</option>
<option value="no_planning">No, but planning to launch one</option>
<option value="no">No</option>
</select>
</div>

<div class="field">
<label for="orders">Monthly orders</label>
<select id="orders" name="perkalate_monthly_orders_band" required>
<option value="">Select...</option>
<option value="under_500">Under 500</option>
<option value="500_2000">500-2,000</option>
<option value="2000_10000">2,000-10,000</option>
<option value="10000_plus">10,000+</option>
</select>
</div>

<div class="field">
<label for="timeline">When would you want to launch rewards?</label>
<select id="timeline" name="perkalate_launch_timeline" required>
<option value="">Select...</option>
<option value="within_30_days">Within 30 days</option>
<option value="1_3_months">1-3 months</option>
<option value="3_6_months">3-6 months</option>
<option value="just_researching">Just researching</option>
</select>
</div>

<div class="field">
<label for="budget">Monthly rewards budget</label>
<select id="budget" name="perkalate_rewards_budget_band" required>
<option value="">Select...</option>
<option value="under_1k">Under $1K</option>
<option value="1k_5k">$1K-$5K</option>
<option value="5k_20k">$5K-$20K</option>
<option value="20k_plus">$20K+</option>
</select>
</div>
</div>

<button type="submit" class="gate-submit">Continue reading</button>
<div class="gate-error" id="gate-error"></div>
</form>
</div>

<div class="gated-content" id="gated-content">
${post.gatedHtml}
</div>
` : ''}
</main>

<script src="/script.js"></script>
<script>
// Gate form logic
(function() {
  const hasGate = ${post.hasGate ? 'true' : 'false'};
  if (!hasGate) return;

  const gate = document.getElementById('gate');
  const gatedContent = document.getElementById('gated-content');
  const form = document.getElementById('gate-form');
  const errorDiv = document.getElementById('gate-error');

  // Check if already unlocked
  try {
    if (localStorage.getItem('pk-blog-unlocked') === 'true') {
      gate.classList.add('unlocked');
      gatedContent.classList.add('unlocked');
    }
  } catch (e) {}

  // Scoring logic per plan.md
  function calculateScore(formData) {
    let score = 0;
    const email = formData.get('email');
    const website = formData.get('website');
    
    // Check for competitor/agency/student domains (-50)
    const blockedDomains = ['competitor.com', 'agency.com', '.edu'];
    const emailLower = email.toLowerCase();
    if (blockedDomains.some(d => emailLower.includes(d))) {
      score -= 50;
    }

    // Q1: Role scoring
    const roleScores = {
      'founder_ceo': 20,
      'vp_head': 20,
      'director_manager': 12,
      'individual_contributor': 5,
      'agency_other': 0
    };
    score += roleScores[formData.get('perkalate_role_level')] || 0;

    // Q2: Website scoring (5 if present and matches email domain)
    if (website && website.trim()) {
      try {
        const websiteUrl = new URL(website.trim());
        const websiteDomain = websiteUrl.hostname.replace(/^www\./, '');
        const emailDomain = email.split('@')[1];
        // Award 5 points if domain matches and not free webmail
        const freeMailProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
        if (emailDomain && !freeMailProviders.includes(emailDomain.toLowerCase()) && 
            websiteDomain.includes(emailDomain)) {
          score += 5;
        }
      } catch (e) {
        // Invalid URL, no points
      }
    }

    // Q3: Revenue scoring
    const revenueScores = {
      'under_1m': 2,
      '1m_5m': 8,
      '5m_20m': 15,
      '20m_100m': 20,
      '100m_plus': 20
    };
    score += revenueScores[formData.get('perkalate_online_revenue_band')] || 0;

    // Q4: Loyalty program scoring
    const loyaltyScores = {
      'yes_platform': 15,
      'yes_custom': 15,
      'no_planning': 10,
      'no': 5
    };
    score += loyaltyScores[formData.get('has_loyalty_program')] || 0;

    // Q5: Orders scoring
    const orderScores = {
      'under_500': 2,
      '500_2000': 8,
      '2000_10000': 15,
      '10000_plus': 20
    };
    score += orderScores[formData.get('perkalate_monthly_orders_band')] || 0;

    // Q6: Timeline scoring
    const timelineScores = {
      'within_30_days': 20,
      '1_3_months': 15,
      '3_6_months': 8,
      'just_researching': 0
    };
    score += timelineScores[formData.get('perkalate_launch_timeline')] || 0;

    // Q7: Budget scoring
    const budgetScores = {
      'under_1k': 2,
      '1k_5k': 10,
      '5k_20k': 18,
      '20k_plus': 20
    };
    score += budgetScores[formData.get('perkalate_rewards_budget_band')] || 0;

    return score;
  }

  function getTier(score, timeline) {
    // MQL rule: score >= 60 AND timeline != "Just researching"
    // Just researching caps tier at C regardless of score
    if (timeline === 'just_researching') {
      return 'C';
    }
    if (score >= 85) return 'A';
    if (score >= 60) return 'B';
    return 'C';
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    errorDiv.classList.remove('show');
    
    const submitBtn = form.querySelector('.gate-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      const formData = new FormData(form);
      const score = calculateScore(formData);
      const timeline = formData.get('perkalate_launch_timeline');
      const tier = getTier(score, timeline);

      // Get HubSpot tracking cookie
      let hutk = '';
      try {
        const cookies = document.cookie.split(';');
        const hutkCookie = cookies.find(c => c.trim().startsWith('hubspotutk='));
        if (hutkCookie) {
          hutk = hutkCookie.split('=')[1];
        }
      } catch (e) {}

      // Build submission payload
      const formGuid = '${process.env.NEXT_PUBLIC_HUBSPOT_FORM_GUID || ''}';
      
      if (!formGuid) {
        console.warn('HubSpot form GUID not configured. Unlocking content without submission.');
        unlockContent();
        return;
      }

      const payload = {
        submittedAt: Date.now(),
        fields: [
          { name: 'firstname', value: formData.get('firstname') },
          { name: 'lastname', value: formData.get('lastname') },
          { name: 'email', value: formData.get('email') },
          { name: 'company', value: formData.get('company') },
          { name: 'website', value: formData.get('website') },
          { name: 'perkalate_role_level', value: formData.get('perkalate_role_level') },
          { name: 'perkalate_online_revenue_band', value: formData.get('perkalate_online_revenue_band') },
          { name: 'has_loyalty_program', value: formData.get('has_loyalty_program') },
          { name: 'perkalate_monthly_orders_band', value: formData.get('perkalate_monthly_orders_band') },
          { name: 'perkalate_launch_timeline', value: formData.get('perkalate_launch_timeline') },
          { name: 'perkalate_rewards_budget_band', value: formData.get('perkalate_rewards_budget_band') },
          { name: 'perkalate_lead_score', value: score.toString() },
          { name: 'perkalate_lead_tier', value: tier }
        ],
        context: {
          hutk: hutk,
          pageUri: window.location.href,
          pageName: document.title
        }
      };

      const response = await fetch('https://api.hsforms.com/submissions/v3/integration/submit/247667002/' + formGuid, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        unlockContent();
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      errorDiv.textContent = 'Something went wrong. Please try again or contact support.';
      errorDiv.classList.add('show');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Continue reading';
    }
  });

  function unlockContent() {
    gate.classList.add('unlocked');
    gatedContent.classList.add('unlocked');
    try {
      localStorage.setItem('pk-blog-unlocked', 'true');
    } catch (e) {}
    
    // Scroll to gated content
    setTimeout(() => {
      gatedContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
})();
</script>
</body>
</html>`;
}

// Generate each post page
posts.forEach(post => {
  const html = generatePostPage(post);
  const outputPath = path.join(blogOutputDir, `${post.slug}.html`);
  fs.writeFileSync(outputPath, html);
  console.log(`Generated: ${outputPath}`);
});

// Generate blog index data
const indexData = {
  posts: posts.map(p => ({
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    postNumber: p.post_number
  }))
};

fs.writeFileSync(
  path.join(__dirname, 'blog-index.json'),
  JSON.stringify(indexData, null, 2)
);

console.log(`\nGenerated ${posts.length} blog posts`);
console.log('Blog index data: blog-index.json');
