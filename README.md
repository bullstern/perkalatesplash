# Perkalate Splash Page

A modern, conversion-optimized splash page for Perkalate - the unified loyalty platform that brings every reward and every brand into one wallet for the real world.

## Overview

Perkalate is a revolutionary loyalty rewards platform that allows users to connect their loyalty programs and payment methods to receive exclusive cross-brand perks in one unified app. This professionally-designed splash page showcases the key features and benefits while maximizing conversion through strategic copy, social proof, and modern UI/UX design.

## Features

- **Hero Section**: Conversion-focused headline with animated gradient shapes, trust signals, and compelling statistics
- **Features Grid**: Three key value propositions with glassmorphic cards:
  - Unify Every Loyalty Program (bank-level security)
  - Unlock Cross-Brand Rewards (up to 30% off)
  - Redeem Anywhere, Instantly (Apple/Google Pay integration)
- **How It Works**: Visual 3-step process with interactive mockups and refined copy
- **Brand Showcase**: Real SVG brand logos for Starbucks, Nike, Target, Delta, and more (100+ partners)
- **Social Proof**: Customer testimonials with 5-star ratings and real member feedback
- **Waitlist Form**: High-converting email capture with enhanced privacy messaging
- **Fully Responsive**: Mobile-first design optimized for all devices

## Design Features

- **Glassmorphic UI**: Modern frosted-glass effect on cards with backdrop-filter blur
- **Premium Color Palette**: Purple (#8b5cf6) to pink (#ec4899) gradients throughout
- **Smooth Animations**: Fade-ins, scroll-triggered reveals, and hover effects
- **Parallax Effects**: Interactive floating gradient shapes respond to mouse movement
- **Animated Counters**: Statistics animate on scroll into view
- **Scroll Progress Bar**: Visual indicator at top of page
- **Interactive Elements**: Enhanced form feedback, hover states, and micro-interactions
- **Real Brand Logos**: SVG implementations of Starbucks, Nike, Target, Delta, and more
- **Conversion-Optimized Copy**: Clear value propositions, benefit-focused messaging, and social proof

## Technologies Used

- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with gradients, animations, and flexbox/grid layouts
- **Vanilla JavaScript**: Interactive elements and smooth scrolling
- **Google Fonts**: Inter font family

## File Structure

```
perkalatesplash/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── script.js           # Interactive functionality
└── README.md           # Project documentation
```

## Getting Started

1. Open `index.html` in a modern web browser
2. No build process or dependencies required - it's pure HTML, CSS, and JavaScript!

## Customization

### Colors

The color scheme is defined using CSS custom properties in `styles.css`:

```css
:root {
    --purple-600: #8b5cf6;
    --purple-700: #7c3aed;
    --pink-500: #ec4899;
    --blue-500: #3b82f6;
    --orange-500: #f59e0b;
}
```

### Content

Edit the text content directly in `index.html`. Key sections include:
- Hero title and subtitle
- Feature cards
- Steps in "How It Works"
- Brand logos
- Footer links

### Form Integration

The waitlist form currently logs to console. To integrate with your backend:

1. Locate the form submission handler in `script.js`
2. Replace the console.log with your API call
3. Update the success/error handling as needed

Example:
```javascript
waitlistForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    
    // Replace with your API endpoint
    const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    
    // Handle response...
});
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Performance

- Lightweight: No external dependencies
- Fast loading: Minimal CSS and JavaScript
- Optimized animations using CSS transforms
- Lazy-loaded scroll animations

## Brand Logo Usage Notes

This page includes simplified SVG representations of brand logos for the following companies:
- Starbucks, Nike, Target, Delta (SVG icons)
- Sephora, AMC, Marriott, Sweetgreen, ClassPass, T-Mobile (text logos)

**Important**: These are placeholder implementations for demonstration purposes. For production use:
1. Obtain official brand assets from each company's media kit
2. Review and comply with each brand's logo usage guidelines
3. Ensure proper licensing and permissions are in place
4. Consider using a brand logo API service or CDN for official assets

## Future Enhancements

- Replace text brand logos with official SVG/PNG assets (pending licensing)
- Integrate with email marketing service (Mailchimp, ConvertKit, Klaviyo, etc.)
- Add animated product demo or explainer video
- Implement A/B testing for headlines and CTA buttons
- Analytics integration (Google Analytics, Mixpanel, Segment, etc.)
- Add FAQ accordion section
- Implement cookie consent banner
- Add app store badges (iOS/Android) when available

## License

© 2024 Perkalate. All rights reserved.

## Contact

For questions or feedback about Perkalate, visit [Perkalate.com](https://perkalate.com)

