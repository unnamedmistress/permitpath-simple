# Mobile-First Optimization Plan - PermitPath

**Target:** Perfect experience on all devices, optimized for iPhone 7 (375x667px) and up  
**Strategy:** Mobile-first design, progressive enhancement, touch-optimized  
**Timeline:** 1-2 days implementation

---

## 📱 Target Devices & Breakpoints

### Primary Test Devices:
- **iPhone 7** - 375x667px (smallest modern phone)
- **iPhone 12/13/14** - 390x844px (current standard)
- **iPhone 14 Pro Max** - 430x932px (large phone)
- **iPad Mini** - 768x1024px (small tablet)
- **iPad Pro** - 1024x1366px (large tablet)
- **Desktop** - 1280px+ (standard desktop)

### Breakpoint Strategy:
```css
/* Mobile First - Base styles for 375px+ */
/* Default: 375px - 767px (phones) */

@media (min-width: 768px) {
  /* Tablets */
}

@media (min-width: 1024px) {
  /* Desktop */
}

@media (min-width: 1280px) {
  /* Large desktop */
}
```

---

## 🎯 Mobile-First Design Principles

### 1. Touch-First Interactions
- **Minimum tap targets:** 44x44px (Apple HIG guideline)
- **Spacing:** 8px minimum between interactive elements
- **Swipe gestures:** Consider for navigation
- **Avoid hover states:** Use active/focus instead

### 2. Content Priority
- **Most important content first:** Address input, project selection
- **Progressive disclosure:** Show details as needed
- **Vertical scrolling:** Natural mobile behavior
- **Minimal horizontal scrolling:** None except intentional carousels

### 3. Performance
- **Fast load time:** < 3 seconds on 3G
- **Optimized images:** Responsive images, WebP format
- **Minimal JavaScript:** Progressive enhancement
- **Lazy loading:** Load results only when needed

### 4. Visual Hierarchy
- **Large, readable text:** 16px minimum body text
- **Clear CTAs:** Big buttons, obvious next steps
- **Sufficient contrast:** WCAG AA minimum
- **Whitespace:** Breathing room between sections

---

## 🔧 Implementation Plan

### Phase 1: Foundation (2-3 hours)

#### 1.1 Viewport & Meta Tags
**File:** `public/index.html`

```html
<!-- Enhanced viewport settings -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="format-detection" content="telephone=yes">

<!-- iOS icons -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">

<!-- Theme color for mobile browsers -->
<meta name="theme-color" content="#0B5FB5">
```

#### 1.2 Mobile-First CSS Reset
**File:** `public/style.css` (add at top)

```css
/* ===== MOBILE-FIRST RESET ===== */
* {
  /* Better box model */
  box-sizing: border-box;
  
  /* Prevent text size adjustment on iOS */
  -webkit-text-size-adjust: 100%;
  
  /* Smooth scrolling */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html {
  /* Prevent iOS zoom on focus */
  font-size: 16px;
  
  /* Better tap highlighting */
  -webkit-tap-highlight-color: rgba(11, 95, 181, 0.2);
}

body {
  /* Prevent bounce scroll on iOS */
  overscroll-behavior-y: none;
  
  /* Safe area for notch */
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}

/* Remove default button styles */
button {
  -webkit-appearance: none;
  appearance: none;
  border: none;
  background: none;
  font-family: inherit;
}

/* Better input styling on iOS */
input,
textarea,
select {
  -webkit-appearance: none;
  appearance: none;
  border-radius: 0;
  font-size: 16px; /* Prevents zoom on iOS */
}

/* Remove tap delay on iOS */
a, button, input, select, textarea {
  touch-action: manipulation;
}
```

#### 1.3 Responsive Container
**Update:** `public/style.css`

```css
/* ===== MOBILE-FIRST CONTAINERS ===== */
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem; /* 16px on mobile */
}

@media (min-width: 768px) {
  .container {
    padding: 0 2rem; /* 32px on tablet */
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 3rem; /* 48px on desktop */
  }
}

.container-narrow {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .container-narrow {
    padding: 0 2rem;
  }
}
```

---

### Phase 2: Touch-Optimized Interactions (3-4 hours)

#### 2.1 Button Sizing
**Update:** `public/style.css`

```css
/* ===== MOBILE-FIRST BUTTONS ===== */
.btn {
  /* Minimum 44px height for iOS */
  min-height: 48px;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  
  /* Touch feedback */
  transition: transform 0.1s, box-shadow 0.2s;
  user-select: none;
  -webkit-user-select: none;
}

.btn:active {
  transform: scale(0.98);
}

.btn-large {
  min-height: 56px;
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

@media (min-width: 768px) {
  .btn {
    min-height: 44px;
    padding: 0.75rem 1.5rem;
  }
  
  .btn-large {
    min-height: 52px;
  }
}

/* Project type buttons - MOBILE FIRST */
.project-type-btn {
  min-height: 100px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.3;
  text-align: center;
}

@media (min-width: 375px) {
  .project-type-btn {
    font-size: 1rem;
  }
}

@media (min-width: 768px) {
  .project-type-btn {
    min-height: 120px;
    font-size: 1.1rem;
  }
}

/* Yes/No choice buttons */
.choice-btn {
  min-height: 60px;
  padding: 1rem;
  font-size: 1.125rem;
}

@media (min-width: 768px) {
  .choice-btn {
    padding: 1.5rem;
  }
}
```

#### 2.2 Input Fields
**Update:** `public/style.css`

```css
/* ===== MOBILE-FIRST INPUTS ===== */
.input,
input[type="text"],
input[type="number"],
select,
textarea {
  width: 100%;
  min-height: 48px;
  padding: 0.875rem 1rem;
  font-size: 16px; /* CRITICAL: Prevents iOS zoom */
  border: 2px solid var(--gray-300);
  border-radius: 12px;
  background: white;
  transition: border-color 0.2s;
}

.input:focus,
input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--blue-bright);
  box-shadow: 0 0 0 3px rgba(11, 95, 181, 0.1);
}

/* Larger text on mobile for better readability */
@media (max-width: 767px) {
  .input,
  input,
  select,
  textarea {
    font-size: 16px;
    line-height: 1.5;
  }
}

@media (min-width: 768px) {
  .input,
  input,
  select,
  textarea {
    font-size: 1rem;
  }
}

/* Select dropdown - mobile friendly */
select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 3rem;
}
```

#### 2.3 Checkbox & Radio Sizing
**Update:** `public/style.css`

```css
/* ===== MOBILE-FIRST CHECKBOXES ===== */
.checkbox,
input[type="checkbox"],
input[type="radio"] {
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
  cursor: pointer;
}

.checkbox-label {
  min-height: 56px;
  padding: 1rem;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 1rem;
}

/* Larger hit area on mobile */
@media (max-width: 767px) {
  .checkbox-label {
    min-height: 64px;
    padding: 1.25rem;
    font-size: 1rem;
  }
}
```

---

### Phase 3: Layout Optimization (2-3 hours)

#### 3.1 Grid Layouts
**Update:** `public/style.css`

```css
/* ===== MOBILE-FIRST GRIDS ===== */

/* Project types grid - MOBILE FIRST */
.project-types {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin: 1.5rem 0;
}

@media (min-width: 480px) {
  .project-types {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
}

@media (min-width: 768px) {
  .project-types {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem;
  }
}

@media (min-width: 1024px) {
  .project-types {
    grid-template-columns: repeat(5, 1fr);
    gap: 1.5rem;
  }
}

/* Yes/No buttons - stack on small phones */
.yes-no-buttons {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

@media (min-width: 375px) {
  .yes-no-buttons {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
}

/* Multi-select - always stack */
.multi-select {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Question actions - stack on mobile */
.question-actions {
  display: flex;
  flex-direction: column-reverse;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

@media (min-width: 768px) {
  .question-actions {
    flex-direction: row;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 2rem;
  }
}

/* Card actions - stack on mobile */
.card-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

@media (min-width: 768px) {
  .card-actions {
    flex-direction: row;
    justify-content: space-between;
    gap: 1rem;
  }
}

/* Result actions - stack on mobile */
.result-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
}

@media (min-width: 768px) {
  .result-actions {
    flex-direction: row;
    justify-content: center;
    padding: 2rem;
  }
}
```

#### 3.2 Cards & Sections
**Update:** `public/style.css`

```css
/* ===== MOBILE-FIRST CARDS ===== */
.card,
.question-card,
.result-card {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  margin: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

@media (min-width: 768px) {
  .card,
  .question-card,
  .result-card {
    border-radius: 20px;
    padding: 2rem;
    margin: 1.5rem 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.result-section {
  padding: 1.25rem;
  border-bottom: 1px solid var(--gray-200);
}

@media (min-width: 768px) {
  .result-section {
    padding: 2rem;
  }
}

/* Header spacing */
.page-header {
  padding: 1.25rem 0;
}

@media (min-width: 768px) {
  .page-header {
    padding: 2rem 0;
  }
}

.page-header h1 {
  font-size: 1.75rem;
  margin: 0.25rem 0;
}

@media (min-width: 768px) {
  .page-header h1 {
    font-size: 2.5rem;
  }
}
```

#### 3.3 Typography Scale
**Update:** `public/style.css`

```css
/* ===== MOBILE-FIRST TYPOGRAPHY ===== */

/* Base font size - 16px on mobile prevents zoom */
html {
  font-size: 16px;
}

body {
  font-size: 1rem;
  line-height: 1.6;
}

/* Headings - mobile scale */
h1 {
  font-size: 1.75rem;
  line-height: 1.2;
  margin-bottom: 0.75rem;
}

h2 {
  font-size: 1.5rem;
  line-height: 1.3;
  margin-bottom: 0.75rem;
}

h3 {
  font-size: 1.25rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

/* Desktop scale */
@media (min-width: 768px) {
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
  }
}

/* Body text */
p {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  p {
    line-height: 1.7;
  }
}

/* Small text - minimum 14px for readability */
.small-text,
small {
  font-size: 0.875rem;
  line-height: 1.5;
}
```

---

### Phase 4: Component Optimization (3-4 hours)

#### 4.1 Question Renderer Updates
**File:** `public/components/question-renderer.js`

Add mobile detection and optimization:

```javascript
class QuestionRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.isMobile = window.innerWidth < 768;
    
    // Update on resize
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 768;
    });
  }
  
  render(questionData) {
    // ... existing code ...
    
    // Scroll to question on mobile
    if (this.isMobile) {
      setTimeout(() => {
        this.container.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }
  
  // Add mobile-specific validation feedback
  showError(questionId, message) {
    const errorEl = document.getElementById(`error-${questionId}`);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
      
      // Vibrate on mobile (if supported)
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
      
      // Scroll to error on mobile
      if (this.isMobile) {
        errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
}
```

#### 4.2 Result Display Updates
**File:** `public/components/result-display.js`

Add mobile-optimized rendering:

```javascript
class ResultDisplay {
  render(result) {
    // ... existing code ...
    
    // Scroll to top of results on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        this.container.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }
  
  // Add mobile-friendly cost display
  renderCostBreakdown(result) {
    if (!result.cost.total) return '';

    // Simplified layout for mobile
    return `
      <div class="result-section">
        <h3>💰 Cost Estimate</h3>
        <div class="cost-breakdown ${window.innerWidth < 768 ? 'mobile' : ''}">
          ${result.cost.permit ? `
            <div class="cost-item">
              <span class="cost-label">Permit Fee:</span>
              <span class="cost-value">${this.formatCost(result.cost.permit)}</span>
            </div>
          ` : ''}
          
          ${result.cost.engineering ? `
            <div class="cost-item">
              <span class="cost-label">Engineering:</span>
              <span class="cost-value">${result.cost.engineering.formatted}</span>
            </div>
          ` : ''}
          
          <div class="cost-item cost-total">
            <span class="cost-label">Total:</span>
            <span class="cost-value">${result.cost.total.formatted}</span>
          </div>
        </div>
      </div>
    `;
  }
}
```

---

### Phase 5: Performance Optimization (2-3 hours)

#### 5.1 Image Optimization
**Create:** `public/images/` directory with optimized assets

```bash
# Generate responsive images
# - Use WebP format with PNG fallback
# - Multiple sizes for different devices

# Logo: 180x180 for iOS
# Favicon: 32x32, 16x16
# Icons: SVG preferred for scalability
```

#### 5.2 CSS Optimization
**Update:** `public/style.css`

```css
/* ===== PERFORMANCE OPTIMIZATIONS ===== */

/* Use will-change for animated elements */
.btn,
.choice-btn,
.project-type-btn {
  will-change: transform;
}

/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Optimize rendering */
.card,
.result-card,
.question-card {
  contain: content;
}

/* GPU acceleration for smooth scrolling */
.container,
.container-narrow {
  transform: translateZ(0);
  -webkit-overflow-scrolling: touch;
}
```

#### 5.3 JavaScript Optimization
**Update:** `public/app.js`

```javascript
// Debounce resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // Handle resize
    updateLayout();
  }, 150);
});

// Lazy load heavy components
function loadComponents() {
  if ('IntersectionObserver' in window) {
    // Use Intersection Observer for lazy loading
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('loaded');
        }
      });
    });
    
    document.querySelectorAll('.lazy-load').forEach(el => {
      observer.observe(el);
    });
  }
}

// Optimize scroll performance
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      handleScroll();
      ticking = false;
    });
    ticking = true;
  }
});
```

---

### Phase 6: Testing & QA (2-3 hours)

#### 6.1 Device Testing Matrix

**Physical Devices:**
- [ ] iPhone 7 (375x667) - iOS 15
- [ ] iPhone 12 (390x844) - iOS 16+
- [ ] iPhone 14 Pro Max (430x932) - iOS 17
- [ ] iPad Mini (768x1024) - iPadOS 16+
- [ ] Android phone (360x640) - Chrome
- [ ] Android tablet (768x1024) - Chrome

**Browser DevTools Testing:**
```
Chrome DevTools:
- [ ] iPhone 5/SE (320x568) - Smallest
- [ ] iPhone 6/7/8 (375x667) - Target
- [ ] iPhone 12 Pro (390x844) - Common
- [ ] iPhone 14 Pro Max (430x932) - Large
- [ ] iPad (768x1024) - Tablet
- [ ] iPad Pro (1024x1366) - Large tablet

Responsive Mode:
- [ ] 320px width (extreme small)
- [ ] 375px width (iPhone 7)
- [ ] 414px width (Plus phones)
- [ ] 768px width (iPad portrait)
- [ ] 1024px width (iPad landscape)
- [ ] 1280px width (desktop)
```

#### 6.2 Test Checklist

**Navigation & Flow:**
- [ ] Address input - keyboard doesn't obscure submit button
- [ ] Location confirmation - all text readable
- [ ] Project selection - all buttons reachable with thumb
- [ ] Question flow - progress bar visible
- [ ] Yes/No buttons - easy to tap without mistakes
- [ ] Multi-select - checkboxes easy to hit
- [ ] Number input - keyboard type correct (numeric)
- [ ] Results - all sections readable
- [ ] Portal links - open in new tab correctly
- [ ] Back navigation - works without losing data

**Typography:**
- [ ] All text 16px+ (body text)
- [ ] Headings scale appropriately
- [ ] Line height comfortable (1.5-1.7)
- [ ] No text overflow or truncation
- [ ] Links clearly identifiable

**Touch Interactions:**
- [ ] All buttons minimum 44x44px
- [ ] Adequate spacing between elements
- [ ] No accidental taps
- [ ] Active states visible
- [ ] Smooth animations (no jank)

**Visual:**
- [ ] No horizontal scroll
- [ ] Proper safe area padding (notch)
- [ ] Images don't overflow
- [ ] Consistent spacing
- [ ] Proper contrast ratios

**Performance:**
- [ ] Page loads < 3 seconds on 3G
- [ ] No layout shift (CLS < 0.1)
- [ ] Smooth scrolling (60fps)
- [ ] No janky animations
- [ ] Fast input response

**iOS Specific:**
- [ ] No zoom on input focus
- [ ] Address bar color matches theme
- [ ] Add to home screen works
- [ ] Landscape orientation works
- [ ] Safe area respected (notch/island)

**Android Specific:**
- [ ] Bottom nav visible
- [ ] Material design patterns work
- [ ] Back button functions correctly

---

## 🔥 Critical Fixes Needed

### Immediate Priority (Must Fix):

#### 1. Input Font Size (iOS Zoom Issue)
**Problem:** iOS zooms in when input font-size < 16px  
**Fix:** `public/style.css`

```css
input,
select,
textarea {
  font-size: 16px !important;
}
```

#### 2. Viewport Settings
**Problem:** Page can zoom too much  
**Fix:** `public/index.html`

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
```

#### 3. Button Sizing
**Problem:** Buttons too small on mobile  
**Fix:** `public/style.css`

```css
.btn {
  min-height: 48px;
  min-width: 48px;
}
```

#### 4. Grid Breakpoints
**Problem:** Project types cramped on small screens  
**Fix:** `public/style.css`

```css
.project-types {
  grid-template-columns: repeat(2, 1fr); /* Start with 2 columns */
}
```

#### 5. Question Actions
**Problem:** Back/Next buttons side-by-side on small screens  
**Fix:** Stack vertically on mobile

---

## 📊 Success Metrics

### Performance Targets:
- **First Contentful Paint:** < 1.5s on 3G
- **Largest Contentful Paint:** < 2.5s on 3G
- **Time to Interactive:** < 3.0s on 3G
- **Cumulative Layout Shift:** < 0.1
- **First Input Delay:** < 100ms

### Usability Targets:
- **Tap Success Rate:** > 95%
- **Form Completion Rate:** > 80%
- **Mobile Bounce Rate:** < 50%
- **Average Session Time:** > 2 minutes

---

## 🚀 Implementation Order

### Day 1 (4-5 hours):
1. ✅ Phase 1: Foundation (viewport, reset, containers)
2. ✅ Phase 2: Touch interactions (buttons, inputs)
3. ✅ Phase 3: Layout optimization (grids, cards)

### Day 2 (4-5 hours):
4. ✅ Phase 4: Component updates (mobile-specific logic)
5. ✅ Phase 5: Performance optimization
6. ✅ Phase 6: Testing on real devices

---

## 📝 Testing Script

### Manual Test Flow (iPhone 7):

```
1. Open app in Safari on iPhone 7
2. Enter address: "3701 60th St N, St Petersburg, FL 33710"
   - ✓ Keyboard doesn't cover submit button
   - ✓ Input text size 16px (no zoom)
   - ✓ Submit button easy to tap

3. Location confirmation
   - ✓ All text readable without zooming
   - ✓ Buttons easy to reach with thumb
   - ✓ Location info not truncated

4. Project selection
   - ✓ All 5 buttons visible without scrolling
   - ✓ Icons + text clear
   - ✓ Easy to tap without mistakes

5. Select "Bathroom Remodel"
   - ✓ First question loads smoothly
   - ✓ Progress bar visible
   - ✓ Question text readable

6. Answer questions
   - ✓ Multi-select checkboxes easy to hit
   - ✓ Options don't overflow
   - ✓ Next button always visible

7. View results
   - ✓ Header readable
   - ✓ All sections load
   - ✓ Portal link works
   - ✓ Contact info visible
   - ✓ Print works

8. Test landscape mode
   - ✓ Layout adapts
   - ✓ No weird scrolling
```

---

## 🔧 Quick Fixes Summary

### 1-Hour Critical Fixes:
```css
/* Add to top of style.css */

/* FIX 1: Prevent iOS zoom */
input, select, textarea {
  font-size: 16px !important;
}

/* FIX 2: Minimum touch targets */
.btn, button, a {
  min-height: 48px;
  min-width: 48px;
}

/* FIX 3: Stack on mobile */
.question-actions,
.card-actions,
.result-actions {
  flex-direction: column;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .question-actions,
  .card-actions,
  .result-actions {
    flex-direction: row;
  }
}

/* FIX 4: Better mobile grid */
.project-types {
  grid-template-columns: repeat(2, 1fr);
}

@media (min-width: 480px) {
  .project-types {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* FIX 5: Readable text */
body {
  font-size: 1rem;
  line-height: 1.6;
}

h2 {
  font-size: 1.5rem;
}

@media (min-width: 768px) {
  h2 {
    font-size: 2rem;
  }
}
```

---

## ✅ Deliverables

1. **Updated CSS** - Mobile-first styles
2. **Updated JavaScript** - Mobile detection & optimization
3. **Updated HTML** - Proper meta tags
4. **Test Report** - Device testing results
5. **Performance Report** - Lighthouse scores
6. **Documentation** - Mobile best practices

---

**Ready to implement?** Start with Phase 1 (Foundation) and test on iPhone 7 after each phase!
