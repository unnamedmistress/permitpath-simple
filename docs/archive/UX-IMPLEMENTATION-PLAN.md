# UX/UI Implementation Plan - PermitPath

**Created:** 2025-01-29  
**Status:** Phase 1 & 2 Complete ✅  
**Estimated Time:** 4-6 hours

---

## Phase 1: Critical Fixes (Priority 🔴)

### 1.1 Accessibility Foundation
- [x] Add `aria-labels` to all icon-only buttons
- [x] Add `aria-live="polite"` region for chat messages
- [x] Add `aria-busy` states for loading
- [x] Ensure all form inputs have proper labels
- [x] Add skip-to-content link
- [x] Add screen reader announcements for state changes

**Files:** All component files

### 1.2 Error Handling System
- [x] Create `useToast` hook integration with Sonner
- [x] Add error boundaries
- [x] Add user-facing error messages for API failures
- [x] Add offline detection with `navigator.onLine`
- [x] Add "Job not found" error state
- [x] Add network error retry mechanisms

**Files:** hooks/, pages/, components/shared/

### 1.3 iOS Keyboard & Input Fixes
- [x] Fix chat input keyboard handling with `visualViewport` API
- [x] Add `inputmode="text"` attributes
- [x] Ensure input stays visible when keyboard opens
- [ ] Add proper viewport meta tags (already correct in index.html)

**Files:** ChatPanel.tsx, index.html

### 1.4 Memory & State Fixes
- [x] Move `memoryPhotos` from module scope to React Context
- [x] Create `PhotoContext` provider
- [x] Fix potential memory leaks

**Files:** context/PhotoContext.tsx, WizardPage.tsx, PreviewPage.tsx

### 1.5 Form Validation
- [ ] Add real-time validation for address input (deferred - needs API)
- [x] Add photo size/type validation (max 10MB, image/* only)
- [ ] Add character limits where appropriate (not needed yet)
- [x] Show validation error messages inline

**Files:** NewJobPage.tsx, WizardPage.tsx

### 1.6 Upload Feedback
- [x] Add upload progress indicator
- [x] Add upload success/failure states
- [x] Add retry button for failed uploads

**Files:** WizardPage.tsx, components/wizard/PhotoGallery.tsx

---

## Phase 2: Important Improvements (Priority 🟡)

### 2.1 Visual Polish
- [x] Add gradient header to HomePage (match static demo)
- [x] Increase minimum font size to 12px (remove text-[10px])
- [x] Add visible focus states (`focus-visible:ring-2`)
- [ ] Improve color contrast on muted text (already good)
- [x] Standardize emoji vs icon usage (prefer icons)

**Files:** index.css, HomePage.tsx, multiple components

### 2.2 Job Management
- [x] Add job edit capability (navigate to wizard)
- [x] Add job delete with menu
- [x] Add confirmation dialogs for destructive actions

**Files:** HomePage.tsx, components/shared/ConfirmDialog.tsx

### 2.3 Navigation & Flow
- [x] Auto-select single jurisdiction (skip step)
- [x] Hide/relabel "Demo" nav item for production (shows "Examples")
- [ ] Add browser back button handling (already works via router)
- [x] Improve empty states with illustrations (NotFound page)

**Files:** NewJobPage.tsx, BottomNav.tsx, HomePage.tsx

### 2.4 Micro-interactions
- [x] Add success toast on job creation
- [x] Add photo delete confirmation
- [ ] Add completion celebration (confetti when checklist done) - deferred
- [x] Add haptic feedback for supported devices
- [x] Improve AI typing indicator (added sr-only text)

**Files:** Multiple, new confetti component

### 2.5 Chat Improvements
- [x] Add message timestamps
- [x] Support multi-line input (auto-grow textarea)
- [x] Add scroll indicators for quick replies
- [ ] Make AI responses context-aware (backend feature)

**Files:** ChatPanel.tsx, QuickReplies.tsx

### 2.6 Address Autocomplete
- [ ] Add Google Places API integration (or similar) - deferred, needs API key
- [ ] Add address format validation - deferred
- [ ] Add address suggestions dropdown - deferred

**Files:** NewJobPage.tsx, hooks/useAddressAutocomplete.ts

---

## Phase 3: Nice to Have (Priority 🟢)

### 3.1 Dark Mode
- [ ] Add dark mode CSS variables
- [ ] Add theme toggle in settings
- [ ] Respect system preference

**Files:** index.css, SettingsPage.tsx, context/ThemeContext.tsx

### 3.2 Enhanced UX
- [ ] Add page transitions with framer-motion
- [ ] Add swipe gestures between tabs
- [ ] Add pull-to-refresh on job list
- [ ] Add skeleton loading states
- [ ] Add photo zoom/fullscreen view

**Files:** Multiple

### 3.3 Export & Share
- [ ] Add PDF export for preview
- [ ] Add share functionality
- [ ] Add print-specific CSS
- [ ] Add copy-to-clipboard for requirements

**Files:** PreviewPage.tsx, print.css

---

## Implementation Order

```
Phase 1 (Critical) - ~2-3 hours
├── 1.4 Memory fixes (foundation for other work)
├── 1.1 Accessibility (parallel)
├── 1.2 Error handling (parallel)
├── 1.3 iOS keyboard fixes
├── 1.5 Form validation
└── 1.6 Upload feedback

Phase 2 (Important) - ~2-3 hours
├── 2.1 Visual polish
├── 2.3 Navigation flow
├── 2.2 Job management
├── 2.4 Micro-interactions
├── 2.5 Chat improvements
└── 2.6 Address autocomplete (optional - needs API key)

Phase 3 (Nice to Have) - Future
├── 3.1 Dark mode
├── 3.2 Enhanced UX
└── 3.3 Export & share
```

---

## Files to Create

1. `src/context/PhotoContext.tsx` - Photo state management
2. `src/context/ThemeContext.tsx` - Theme management (Phase 3)
3. `src/components/shared/ConfirmDialog.tsx` - Confirmation modal
4. `src/components/shared/ErrorBoundary.tsx` - Error boundary
5. `src/components/shared/OfflineIndicator.tsx` - Offline banner
6. `src/hooks/useOnlineStatus.ts` - Online/offline detection
7. `src/components/shared/Confetti.tsx` - Celebration animation

---

## Files to Modify

### Heavy Changes
- `src/pages/WizardPage.tsx` - Photo context, validation, feedback
- `src/pages/HomePage.tsx` - Visual polish, job management
- `src/pages/NewJobPage.tsx` - Auto-select, validation
- `src/components/wizard/ChatPanel.tsx` - Accessibility, keyboard, timestamps
- `src/index.css` - Focus states, font sizes, contrast

### Medium Changes
- `src/pages/PreviewPage.tsx` - Photo context integration
- `src/components/layout/BottomNav.tsx` - Hide demo
- `src/components/wizard/ActionBar.tsx` - Haptics
- `src/App.tsx` - Context providers, error boundary

### Light Changes
- `index.html` - Meta tags, viewport
- `src/pages/NotFound.tsx` - Improve content
- `src/components/shared/Button.tsx` - Accessibility
- `src/components/shared/LoadingSpinner.tsx` - Accessibility

---

## Testing Checklist

After implementation:
- [ ] Test on iPhone Safari (keyboard, safe areas)
- [ ] Test with VoiceOver/TalkBack
- [ ] Test offline behavior
- [ ] Test all error states
- [ ] Verify WCAG AA contrast
- [ ] Test photo upload edge cases
- [ ] Test job CRUD operations
- [ ] Cross-browser test (Chrome, Safari, Firefox)

---

## Notes

- Phase 3 items deferred to future sprint
- Address autocomplete requires API key - will stub interface
- Confetti library: use `canvas-confetti` (lightweight)
- Keep bundle size in check - lazy load where possible
