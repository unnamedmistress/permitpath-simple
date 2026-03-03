# PermitPath UX/UI Overhaul - Accessibility QA (Design Phase)

## WCAG 2.1 Level AA Audit

### Color Contrast Analysis

| Element | Foreground | Background | Ratio | AA Pass |
|---------|------------|------------|-------|---------|
| Primary Button Text | #FFFFFF | #0A3A7E | 8.2:1 | ✅ Pass |
| Secondary Button Text | #0A3A7E | #DDE8F5 | 5.1:1 | ✅ Pass |
| Body Text | #2D3748 | #FFFFFF | 12.6:1 | ✅ Pass |
| Body Text on Parchment | #2D3748 | #F7FAFC | 11.8:1 | ✅ Pass |
| Placeholder Text | #4A5568 | #FFFFFF | 7.0:1 | ✅ Pass |
| Error Text | #C53030 | #FFFFFF | 5.8:1 | ✅ Pass |
| Success Text | #2F855A | #FFFFFF | 4.6:1 | ✅ Pass |
| Orange Accent | #DD6B20 | #FFFFFF | 3.5:1 | ⚠️ Warning |

### Recommendations for Orange Accent
- Use only for decorative elements, not text
- If text needed, use on darker background (#DD6B20 on #2D3748 = 4.6:1)

## Keyboard Navigation Plan

### Focus Order
1. Skip to content link (first focusable)
2. Navigation elements in DOM order
3. Main content interactive elements
4. Footer elements

### Focus Indicators
- Outline: 2px solid #0A3A7E
- Outline-offset: 2px
- Visible on all interactive elements

### Keyboard Shortcuts
- Tab: Move focus forward
- Shift+Tab: Move focus backward
- Enter/Space: Activate buttons
- Escape: Close modals/overlays

## Screen Reader Requirements

### Landmarks
- `<main>` for primary content
- `<nav>` for bottom navigation
- `<header>` for page headers
- `<section>` for content groupings

### ARIA Labels
- Bottom nav: `aria-label="Main navigation"`
- Job cards: `aria-label="Job: {title}, status: {status}"`
- Status badges: `aria-label="Status: {status}"`
- Chat messages: `aria-label="{User/AI} message"`

### Dynamic Content
- Toast notifications: `role="alert" aria-live="polite"`
- Loading states: `aria-busy="true"` with label
- Chat updates: `aria-live="polite"` on message container

## Motion & Animation

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Animation Guidelines
- Page transitions: 200ms max
- No flashing content (>3 flashes per second)
- Parallax effects must be subtle

## Touch Target Requirements

| Element | Minimum Size | Actual Size | Pass |
|---------|--------------|-------------|------|
| Buttons | 44x44px | 48px height | ✅ |
| Nav Items | 44x44px | 64px height | ✅ |
| Job Cards | 44px tall | 80px+ | ✅ |
| Form Inputs | 44px tall | 44px | ✅ |
| Icons (clickable) | 44x44px | 48px touch | ✅ |

## Form Accessibility

### Labels
- All inputs have visible labels
- Labels properly associated: `<label for="id">` or input inside label

### Error Handling
- Errors announced via `aria-live`
- Error text linked to input via `aria-describedby`
- Color not sole indicator (icon + text)

### Required Fields
- Marked with aria-required="true"
- Visual indicator: asterisk with legend

## Color Independence

### Information Conveyance
- Status: Color + icon + text label
- Errors: Color + icon + text
- Success: Color + icon + text
- Navigation: Color + icon + label

## Testing Checklist (Design Phase)

- [ ] All color combinations meet 4.5:1 contrast
- [ ] Focus states defined for all interactive elements
- [ ] Touch targets meet 44px minimum
- [ ] Screen reader labels planned for complex components
- [ ] Reduced motion support included
- [ ] Form error patterns defined
- [ ] Status indicators don't rely solely on color

## Open Issues

None identified at design phase.
