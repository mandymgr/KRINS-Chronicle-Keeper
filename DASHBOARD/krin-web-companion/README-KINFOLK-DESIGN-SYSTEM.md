# Kinfolk Editorial Design System

A comprehensive Nordic/Scandinavian design system inspired by Kinfolk Magazine and RUM International, featuring warm earth tones, editorial typography, and generous spacing.

## 🎨 Design Philosophy

This design system embodies the essence of Nordic design principles:

- **Minimalism**: Clean, uncluttered interfaces with purposeful elements
- **Natural Colors**: Warm earth tones inspired by Nordic landscapes
- **Editorial Typography**: Georgia serif for readability and elegance
- **Generous Spacing**: Abundant white space for visual breathing room
- **Functional Beauty**: Every element serves both aesthetic and functional purposes

## 📁 Files Structure

```
krin-web-companion/
├── styles/
│   └── kinfolk-design-system.css    # Complete design system
├── components/
│   └── KinfolfDesignShowcase.tsx    # Component examples
└── README-KINFOLK-DESIGN-SYSTEM.md # This documentation
```

## 🎯 Quick Start

### 1. Import the Design System

```css
@import url('./styles/kinfolk-design-system.css');
```

### 2. Use Container Class

```jsx
<div className="kinfolk-container">
  {/* Your content */}
</div>
```

### 3. Apply Typography Classes

```jsx
<h1 className="kinfolk-heading-display">Display Heading</h1>
<p className="kinfolk-body-large">Editorial body text</p>
```

## 🎨 Color Tokens

### Primary Colors
- `--kinfolk-primary`: `#8b7355` - Warm brown (main brand color)
- `--kinfolk-primary-dark`: `#6b5b4f` - Darker brown (accents)
- `--kinfolk-primary-light`: `#a68b73` - Light brown (hover states)

### Neutral Colors
- `--kinfolk-neutral-900`: `#2d2d2d` - Deep charcoal (primary text)
- `--kinfolk-neutral-700`: `#4a4a4a` - Medium gray (secondary text)
- `--kinfolk-neutral-500`: `#6b5b4f` - Brown-gray (muted text)
- `--kinfolk-neutral-300`: `#8b7355` - Light brown-gray (disabled)
- `--kinfolk-neutral-200`: `#d4c4b0` - Light beige (borders)
- `--kinfolk-neutral-100`: `#efefef` - Very light gray (subtle borders)

### Surface Colors
- `--kinfolk-surface-primary`: `#ffffff` - Pure white (cards/content)
- `--kinfolk-surface-secondary`: `#fefefe` - Almost white (body background)
- `--kinfolk-surface-muted`: `#f8f6f2` - Warm off-white (sections)

## ✍️ Typography System

### Font Families
- **Primary**: Georgia, "Times New Roman", Times, serif
- **Secondary**: "Helvetica Neue", Arial, Helvetica, sans-serif
- **Monospace**: "Courier New", Courier, monospace

### Typography Classes

#### Headings
- `.kinfolk-heading-display` - 48px, light weight, tight line-height
- `.kinfolk-heading-hero` - 40px, normal weight, snug line-height
- `.kinfolk-heading-section` - 32px, normal weight
- `.kinfolk-heading-subsection` - 24px, normal weight
- `.kinfolk-heading-card` - 20px, uppercase, wide letter-spacing

#### Body Text
- `.kinfolk-body-large` - 18px, italic, loose line-height
- `.kinfolk-body-normal` - 16px, relaxed line-height
- `.kinfolk-body-small` - 14px, normal line-height

#### Navigation & Labels
- `.kinfolk-nav-primary` - Uppercase, wide letter-spacing
- `.kinfolk-nav-secondary` - Smaller, ultra-wide letter-spacing
- `.kinfolk-label` - Small caps, status labels
- `.kinfolk-caption` - Fine print, italic

## 📐 Spacing System

### Space Tokens
```css
--kinfolk-space-1: 0.25rem;  /* 4px */
--kinfolk-space-2: 0.5rem;   /* 8px */
--kinfolk-space-3: 0.75rem;  /* 12px */
--kinfolk-space-4: 1rem;     /* 16px */
--kinfolk-space-6: 1.5rem;   /* 24px */
--kinfolk-space-8: 2rem;     /* 32px */
--kinfolk-space-12: 3rem;    /* 48px */
--kinfolk-space-16: 4rem;    /* 64px */
--kinfolk-space-20: 5rem;    /* 80px */
--kinfolk-space-24: 6rem;    /* 96px */
```

### Section Spacing
- `--kinfolk-section-xs`: 32px
- `--kinfolk-section-sm`: 48px
- `--kinfolk-section-md`: 64px
- `--kinfolk-section-lg`: 80px
- `--kinfolk-section-xl`: 96px
- `--kinfolk-section-2xl`: 128px

## 🧩 Component Classes

### Layout
- `.kinfolk-container` - Main container with base styling
- `.kinfolk-section` - Standard section with large padding
- `.kinfolk-section-hero` - Hero section with extra padding
- `.kinfolk-content-wrapper` - Content container (1000px max-width)

### Header
- `.kinfolk-header` - Main header styling
- `.kinfolk-header-content` - Header content wrapper
- `.kinfolk-header-brand` - Brand section
- `.kinfolk-header-nav` - Navigation section

### Avatar
- `.kinfolk-avatar` - Avatar container
- `.kinfolk-avatar-image` - Avatar circle (56px)
- `.kinfolk-avatar-status` - Status indicator

### Buttons
- `.kinfolk-button` - Basic button (transparent)
- `.kinfolk-button-primary` - Primary button with border

### Cards
- `.kinfolk-card` - Basic card styling
- `.kinfolk-card-header` - Card header section
- `.kinfolk-card-content` - Card main content
- `.kinfolk-card-footer` - Card footer section

### Grid System
- `.kinfolk-grid` - Auto-fit grid (360px minimum)
- `.kinfolk-grid-2` - 2-column grid (480px minimum)
- `.kinfolk-grid-3` - 3-column grid (320px minimum)

### Editorial Sections
- `.kinfolk-editorial-section` - Centered editorial content
- `.kinfolk-editorial-intro` - Intro text container (520px max)
- `.kinfolk-actions` - Action buttons container
- `.kinfolk-actions-list` - Flex container for action buttons

## 🎛️ Utility Classes

### Text Alignment
- `.kinfolk-text-left`
- `.kinfolk-text-center`
- `.kinfolk-text-right`

### Text Transform
- `.kinfolk-uppercase`
- `.kinfolk-lowercase`
- `.kinfolk-capitalize`

### Font Styles
- `.kinfolk-italic`
- `.kinfolk-not-italic`

### Font Weights
- `.kinfolk-font-light` (300)
- `.kinfolk-font-normal` (400)
- `.kinfolk-font-medium` (500)
- `.kinfolk-font-semibold` (600)

### Letter Spacing
- `.kinfolk-tracking-tight`
- `.kinfolk-tracking-normal`
- `.kinfolk-tracking-wide`
- `.kinfolk-tracking-wider`
- `.kinfolk-tracking-widest`

### Colors
- `.kinfolk-text-primary`
- `.kinfolk-text-neutral-900`
- `.kinfolk-text-neutral-500`
- `.kinfolk-bg-primary`
- `.kinfolk-bg-secondary`
- `.kinfolk-bg-muted`

## 📱 Responsive Design

The system includes responsive breakpoints:

- **Mobile**: `max-width: 480px`
- **Tablet**: `max-width: 768px`
- **Desktop**: `1000px+ max-width`

### Mobile Adaptations
- Reduced text sizes for headings
- Stack navigation vertically
- Single column grids
- Reduced section padding

## 🖨️ Print Styles

Optimized print styles included:
- High contrast colors
- Hide interactive elements
- Simplified card borders
- Clean typography

## 💡 Usage Examples

### Basic Page Structure
```jsx
<div className="kinfolk-container">
  <header className="kinfolk-header">
    <div className="kinfolk-header-content">
      <div className="kinfolk-header-brand">
        <div className="kinfolk-avatar">
          <div className="kinfolk-avatar-image">K</div>
          <div className="kinfolk-avatar-status"></div>
        </div>
        <div>
          <h1 className="kinfolk-brand-title">Brand</h1>
          <p className="kinfolk-brand-subtitle">Tagline</p>
        </div>
      </div>
      <nav className="kinfolk-header-nav">
        <button className="kinfolk-button">Home</button>
        <button className="kinfolk-button">About</button>
      </nav>
    </div>
  </header>
  
  <main className="kinfolk-content-wrapper">
    <section className="kinfolk-section-hero">
      <div className="kinfolk-editorial-section">
        <h1 className="kinfolk-heading-display">Welcome</h1>
        <div className="kinfolk-editorial-intro">
          <p className="kinfolk-body-large">Introduction text</p>
        </div>
      </div>
    </section>
  </main>
</div>
```

### Card Grid
```jsx
<div className="kinfolk-grid">
  <div className="kinfolk-card">
    <div className="kinfolk-card-header">
      <h3 className="kinfolk-heading-card">Title</h3>
    </div>
    <div className="kinfolk-card-content">
      <p className="kinfolk-body-normal">Content</p>
    </div>
    <div className="kinfolk-card-footer">
      <span className="kinfolk-label">Status</span>
    </div>
  </div>
</div>
```

### Action Buttons
```jsx
<div className="kinfolk-actions">
  <div className="kinfolk-actions-list">
    <button className="kinfolk-button-primary">Primary</button>
    <button className="kinfolk-button-primary">Secondary</button>
  </div>
</div>
```

## 🔧 Customization

### Extending Colors
Add custom color tokens in your CSS:

```css
:root {
  --kinfolk-custom-accent: #your-color;
  --kinfolk-custom-surface: #your-surface;
}

.kinfolk-text-custom {
  color: var(--kinfolk-custom-accent);
}
```

### Creating Custom Components
Follow the naming convention:

```css
.kinfolk-your-component {
  /* Use design tokens */
  padding: var(--kinfolk-space-8);
  color: var(--kinfolk-primary);
  font-family: var(--kinfolk-font-serif);
}
```

## 📋 Best Practices

### Typography
- Use serif fonts for body text and headings
- Apply generous letter-spacing to uppercase text
- Maintain consistent line-height ratios
- Use italic for emphasis and editorial content

### Color Usage
- Primary brown for brand elements and CTAs
- Neutral grays for text hierarchy
- Warm off-whites for backgrounds
- Maintain sufficient contrast ratios

### Spacing
- Use editorial spacing (large sections, generous padding)
- Apply consistent spacing tokens
- Create visual hierarchy through spacing
- Allow content to breathe with white space

### Components
- Keep borders sharp (no border-radius)
- Use subtle shadows sparingly
- Center-align editorial content
- Apply consistent hover states

## 🚀 Performance

- CSS file is optimized for production
- Uses CSS custom properties for theming
- Minimal specificity for easy customization
- Print styles included for complete coverage

---

**Version**: 1.0.0  
**Last Updated**: September 1, 2025  
**Compatible**: Modern browsers with CSS custom properties support