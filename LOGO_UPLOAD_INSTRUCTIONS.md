# Brand Logo Upload Instructions

## ✅ Setup Complete!

I've created an `assets/logos/` folder and configured the page to use your **exact brand logo files** with pixel-perfect accuracy.

---

## 📁 How to Add Your Logos:

### Step 1: Save Your Logo Files
Save each of the 9 brand logos you shared as **PNG, SVG, or JPG** files to:
```
/Users/tomstern/Downloads/perkalatesplash/assets/logos/
```

### Step 2: Name Them Exactly As Follows:
1. `starbucks` - The green Starbucks logo with white siren
2. `amc` - The red AMC Theatres logo
3. `nike` - The black Nike swoosh
4. `sephora` - The black Sephora flame
5. `sweetgreen` - The green Sweetgreen logo
6. `target` - The red Target bullseye
7. `delta` - The Delta Airlines red triangle or logo
8. `classpass` - The blue ClassPass chain links
9. `chipotle` - The red Chipotle logo with pepper

> Use any supported extension (`.svg`, `.png`, `.jpg`, `.jpeg`) with the exact names above—e.g., `starbucks.svg` or `starbucks.png`.

---

## 🎨 Technical Implementation:

### Aspect Ratio Preservation:
```css
.brand-logo-img {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;  /* Preserves original proportions */
    display: block;
}
```

### Tile Specifications:
- **Tile size**: 92px × 92px (large enough for all logos)
- **Padding**: 10px (equal spacing on all sides)
- **Background**: White
- **Border radius**: 18px (rounded corners)
- **Checkmark badge**: Purple circle in bottom-right corner

### What This Ensures:
✅ **No distortion** - Logos scale proportionally  
✅ **No stretching** - Original aspect ratios preserved  
✅ **No cropping** - Entire logo visible  
✅ **No color changes** - Original colors maintained  
✅ **Equal padding** - Balanced spacing  
✅ **Instant recognition** - Logos appear exactly as uploaded  

---

## 📱 Phone Display Configuration:

The logos will appear in a **3×3 grid** inside the "Connected Accounts" phone screen:

```
Row 1: Starbucks | AMC | Nike
Row 2: Sephora | Sweetgreen | Target  
Row 3: Delta | ClassPass | Chipotle
```

Each logo gets:
- White background tile
- Purple checkmark badge (bottom-right)
- Equal spacing and padding
- Isometric phone perspective

---

## 🚀 Once Logos Are Uploaded:

1. The page will **automatically display** your real logos (tries SVG → PNG → JPG/JPEG)
2. **No code changes needed** - just drop the files in the folder
3. Logos will be **pixel-perfect** with preserved aspect ratios
4. Fallback SVGs will be hidden

---

## 📋 Checklist:

- [ ] Create 9 logo files from your brand assets
- [ ] Name them exactly as specified above
- [ ] Save to `/Users/tomstern/Downloads/perkalatesplash/assets/logos/`
- [ ] Refresh the page - logos will appear automatically!

---

## 💡 Recommended Logo Specs:

- **Format**: SVG or PNG with transparent background (best). JPG/JPEG also works if transparency isn't available.
- **Minimum size**: 200×200px (or proportional)
- **Resolution**: 2x for retina displays (400×400px ideal)
- **File size**: Keep under 50KB each for fast loading

---

## Current Status:

✅ Folder structure created  
✅ HTML configured to reference logo files  
✅ CSS configured for aspect ratio preservation  
✅ Tiles sized appropriately (92×92px)  
✅ Ready for your logo uploads!  

**Next Step**: Upload your 9 brand logo files to `assets/logos/` and they'll appear instantly! 🎯

