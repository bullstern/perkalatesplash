# Deployment Guide: Getting Changes to perkalate.com

## Current Status

All changes have been made to your local files:
- ✅ `index.html` - Single-step simplified form
- ✅ `script.js` - Updated form submission logic
- ✅ `styles.css` - Form styling
- ✅ Database migration SQL ready

## Files Ready to Deploy

These files need to be uploaded to your web server:
1. `index.html`
2. `script.js`
3. `styles.css`
4. `assets/` folder (if logos are used)

## Deployment Methods

### Option 1: If using Vercel/Netlify/GitHub Pages

**If connected to Git:**
```bash
# Commit and push changes
git add .
git commit -m "Simplify waitlist forms to single-step"
git push
# Auto-deploys if connected
```

**If using drag-and-drop:**
1. Go to your hosting dashboard
2. Upload the updated files
3. Wait for deployment to complete

### Option 2: If using FTP/SFTP

**Using FileZilla or similar:**
1. Connect to your server
2. Navigate to your website's root directory
3. Upload these files (overwrite existing):
   - `index.html`
   - `script.js`
   - `styles.css`

**Using command line (SFTP):**
```bash
# Replace with your server details
sftp user@perkalate.com
put index.html
put script.js
put styles.css
quit
```

### Option 3: If using a CMS/Website Builder

1. Access your website's file manager or editor
2. Replace the content of:
   - `index.html` (or main page template)
   - `script.js` (or custom JS section)
   - `styles.css` (or custom CSS section)

### Option 4: If using a Git Repository

**If you have a repo connected:**
```bash
cd /Users/tomstern/Downloads/perkalatesplash
git add index.html script.js styles.css
git commit -m "Simplify waitlist forms - single step with all fields"
git push origin main
```

## Verification Steps

After deployment:

1. **Visit perkalate.com** and check:
   - Form shows all fields on one page
   - Consumer/Brand tabs work
   - Form submits correctly
   - No JavaScript errors in console

2. **Test the form:**
   - Fill out consumer form
   - Submit and verify it reaches your backend
   - Test brand form as well

3. **Check browser console** (F12):
   - No errors should appear
   - Form submission should show network request to `/api/waitlist`

## Important Notes

- **Database**: Make sure you've run the SQL migration in Supabase (see `SUPABASE_MIGRATION_GUIDE.md`)
- **Backend**: Ensure `/api/waitlist` endpoint accepts the new fields:
  - `first_name`, `last_name` (or combined `name`)
  - `email`
  - `phone` (optional)
  - `zip_code`
  - `favorite_brand` (optional, for consumer)
  - `company_name` (for brand)
  - `brand_type` (optional, for brand)
  - `type` ('consumer' or 'brand')

## Troubleshooting

**If changes don't appear:**
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Check if files were uploaded correctly
3. Verify file permissions on server
4. Check for deployment errors in hosting dashboard

**If form doesn't submit:**
1. Check browser console for errors
2. Verify API endpoint URL in `script.js` (currently `/api/waitlist`)
3. Ensure backend accepts the new field structure
4. Check CORS settings if API is on different domain

## Need Help?

If you're unsure about your hosting setup, provide:
- Your hosting provider name
- How you normally update the website
- Whether you have FTP/SSH access
- Whether it's connected to Git
