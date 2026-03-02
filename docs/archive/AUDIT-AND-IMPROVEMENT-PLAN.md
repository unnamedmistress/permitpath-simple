# PermitPath Audit & Improvement Plan

**Repository:** `unnamedmistress/permitpath-simple`  
**Date:** March 2, 2026  
**Audited By:** OpenClaw Agent  
**App URL:** https://permitpath-simple.vercel.app

---

## 📊 Executive Summary

PermitPath is an AI-powered permit assistance application targeting contractors in Pinellas County, Florida. The app provides guided permit workflows, AI-generated requirements, and cost/timeline estimates. While the concept is solid and significant work has been done, there are critical infrastructure, code quality, and architectural issues that need immediate attention.

**Overall Health Score:** 🟡 **6.5/10** (Functional but needs significant cleanup)

---

## 🔴 Critical Issues (Must Fix)

### 1. Build System Broken
**Severity:** Critical  
**Status:** 🔴 **BLOCKING**

**Problem:**
- `vite` is listed as a devDependency but is **not being installed**
- `npm install` only installs 230 packages (should be ~1000+)
- `npm run build` fails with "vite: Permission denied"
- Package-lock.json appears corrupted or incomplete

**Evidence:**
```bash
$ npm run build
sh: 1: vite: Permission denied

$ ls node_modules/.bin/
loose-envify openai proto-loader-gen-types uuid
# vite is MISSING
```

**Impact:**
- Cannot build for production
- Cannot run dev server
- Cannot deploy updates

**Fix:**
```bash
# Nuclear option - reset dependencies
rm -rf node_modules package-lock.json bun.lockb
npm cache clean --force

# Reinstall with legacy peer deps to resolve conflicts
npm install --legacy-peer-deps

# Verify vite is installed
ls node_modules/.bin/vite
```

**Root Cause:** Package-lock.json was likely generated incorrectly or there are unresolved peer dependency conflicts between React 18.3.1 and Radix UI components.

---

### 2. No Test Coverage
**Severity:** Critical  
**Status:** 🔴 **MISSING**

**Problem:**
- Only has a placeholder test: `src/test/example.test.ts`
- No unit tests for services (ai.ts, requirements.ts)
- No integration tests for permit workflows
- No e2e tests for critical user paths

**Test Files Found:**
- `src/test/example.test.ts` - Only contains `expect(true).toBe(true)`
- `src/test/setup.ts` - Empty test setup

**Impact:**
- No safety net for refactoring
- Cannot verify AI response parsing logic
- Cannot ensure permit calculation accuracy
- Risk of regressions in production

**Fix:**
1. Add tests for `ai.ts`:
   - Mock OpenAI responses
   - Test fallback requirements
   - Test error handling

2. Add tests for `requirements.ts`:
   - Test caching logic
   - Test categorization
   - Test progress calculation

3. Add integration tests:
   - Full permit workflow
   - AI failure scenarios

---

### 3. Dependency Version Conflicts
**Severity:** High  
**Status:** 🟡 **WARNING**

**Problem:**
Multiple peer dependency warnings during install:
```
npm warn Could not resolve dependency:
npm warn peer react@"^18.3.1" from react-dom@18.3.1
npm warn ERESOLVE overriding peer dependency
```

**Dependencies with Issues:**
- React 18.3.1 vs peer dependency expectations
- Radix UI components expecting different React versions
- Tailwind CSS v3 with PostCSS v4 plugin

**Fix:**
```json
// Update package.json to use compatible versions
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

Or use `--legacy-peer-deps` flag consistently.

---

## 🟡 High Priority Issues

### 4. No Environment Validation
**Severity:** High  

**Problem:**
The app starts even when required environment variables are missing:

```typescript
// src/services/ai.ts - No validation
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
console.log('OpenAI API Key exists:', !!apiKey);
```

**Required Variables:**
- `VITE_OPENAI_API_KEY` - For AI features
- `VITE_FIREBASE_*` - For Firebase integration
- `VITE_GOOGLE_PLACES_API_KEY` - For address autocomplete

**Fix:**
Create a validation utility:
```typescript
// src/config/env.ts
export function validateEnv() {
  const required = ['VITE_OPENAI_API_KEY'];
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    return false;
  }
  return true;
}
```

---

### 5. AI Error Handling Inadequate
**Severity:** High  

**Problem:**
In `src/services/ai.ts`, AI failures silently fall back without proper logging:

```typescript
catch (error) {
  console.error('AI analysis failed:', error);
  // Returns fallback but doesn't track failure rate
  return getFallbackRequirements(request.jobType);
}
```

**Issues:**
- No retry logic
- No circuit breaker pattern
- No metrics on AI failure rates
- Silent degradation hides problems

**Fix:**
```typescript
// Add retry with exponential backoff
async function analyzeWithRetry(request: JobAnalysisRequest, retries = 3): Promise<JobAnalysisResponse> {
  for (let i = 0; i < retries; i++) {
    try {
      return await analyzeJobRequirements(request);
    } catch (error) {
      if (i === retries - 1) {
        analytics.track('ai_analysis_failed', { error: error.message });
        return getFallbackRequirements(request.jobType);
      }
      await delay(Math.pow(2, i) * 1000);
    }
  }
}
```

---

### 6. Type Safety Issues
**Severity:** Medium-High  

**Problem:**
Multiple areas with `any` types and unsafe casts:

```typescript
// src/services/ai.ts
const result = JSON.parse(response.choices[0]?.message?.content || '{}');
// No validation that result matches expected shape

const analysis = result.requirements.map((r: any, index: number) => ({
  // r: any - no type safety
```

**Impact:**
- Runtime errors when AI returns unexpected format
- No IntelliSense support
- Refactoring is dangerous

**Fix:**
Add Zod validation:
```typescript
import { z } from 'zod';

const RequirementSchema = z.object({
  category: z.enum(['document', 'drawing', 'inspection', 'fee', 'license', 'insurance']),
  title: z.string(),
  description: z.string(),
  isRequired: z.boolean()
});

const AnalysisResponseSchema = z.object({
  requirements: z.array(RequirementSchema),
  estimatedTimeline: z.string(),
  estimatedCost: z.string(),
  confidenceScore: z.number()
});

// Validate at runtime
const result = AnalysisResponseSchema.parse(JSON.parse(content));
```

---

### 7. Unused Legacy Files
**Severity:** Medium  

**Problem:**
Repository contains significant legacy/dead code:

**Files to Remove:**
- `app.js` - Old vanilla JS implementation (1,150+ lines)
- `index.html` - Redirects to nothing meaningful
- `index-static-demo.html` - 20,000+ lines of demo HTML
- `index-v2.html` - Another old version
- `server.js` - Unused Express server
- `permitService.js` - Node version not used by React app
- `locationService.js` - Potentially unused
- `style.css`, `style-base.css`, `style-components.css` - Old CSS
- `PreviewPage_OLD.tsx` - Old component version
- `AGENTS.md.backup` - Backup file

**Impact:**
- Confuses developers
- Increases repo size
- Makes code review harder

**Fix:**
```bash
# Remove legacy files
git rm app.js index.html index-static-demo.html index-v2.html
git rm server.js permitService.js locationService.js
git rm style.css style-base.css style-components.css
git rm src/pages/PreviewPage_OLD.tsx
git rm AGENTS.md.backup

# Keep in git history but remove from working tree
```

---

## 🟢 Medium Priority Issues

### 8. Documentation Overload
**Severity:** Medium  

**Problem:**
41 markdown files in root directory, many redundant:

| File | Lines | Status |
|------|-------|--------|
| `PRODUCT-REQUIREMENTS-DOCUMENT.md` | 2,500+ | Outdated |
| `IMPLEMENTATION-PLAN-FULL.md` | 1,000+ | Partially done |
| `12-WEEK-VALIDATION-PLAN.md` | 800+ | Not followed |
| `GUIDED-QUESTIONS-PLAN.md` | 1,200+ | Partially implemented |
| `STRATEGIC-ANALYSIS.md` | 1,000+ | Planning doc |

**Total:** ~15,000 lines of documentation

**Fix:**
1. Create `docs/` directory
2. Move planning docs to `docs/archive/`
3. Keep only:
   - `README.md` (current)
   - `ARCHITECTURE.md` (current)
   - `SETUP.md` (current)

---

### 9. Duplicate State Management
**Severity:** Medium  

**Problem:**
Multiple contexts that could be consolidated:
- `AppContext` - Global state
- `PhotoContext` - Photo management
- React Query - Server state

**Evidence:**
```typescript
// App.tsx uses 3 different state systems
<QueryClientProvider client={queryClient}>  {/* Server state */}
  <AppProvider>                              {/* Global state */}
    <PhotoProvider>                          {/* Feature state */}
```

**Recommendation:**
Consider using Zustand for client state to simplify:
```typescript
// Single store instead of multiple contexts
const useStore = create((set) => ({
  jobs: [],
  photos: [],
  currentJob: null,
  // actions...
}));
```

---

### 10. No Error Boundaries
**Severity:** Medium  

**Problem:**
No React error boundaries to catch crashes:

```typescript
// App.tsx - No ErrorBoundary
<BrowserRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
    {/* Crashes here take down entire app */}
```

**Fix:**
```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

---

## ✅ Strengths

### What's Working Well:

1. **Modern Tech Stack**
   - React 18 + TypeScript
   - Vite for fast builds
   - Tailwind CSS for styling
   - Radix UI for accessible components

2. **Good AI Integration Pattern**
   - GPT-4o-mini for cost efficiency
   - Fallback requirements when AI fails
   - Token usage tracking

3. **Mobile-First Design**
   - Responsive layouts
   - Touch-friendly UI
   - Bottom navigation on mobile

4. **Accessibility Considerations**
   - Skip-to-content link
   - ARIA labels
   - Focus management

5. **Solid Architecture**
   - Component-based structure
   - Service layer separation
   - Type definitions

---

## 📋 Improvement Roadmap

### Phase 1: Fix Foundation (Week 1)
- [ ] Fix build system (reset node_modules)
- [ ] Add environment validation
- [ ] Remove legacy files
- [ ] Add basic error boundaries

### Phase 2: Quality Assurance (Week 2)
- [ ] Add unit tests for services
- [ ] Add integration tests for workflows
- [ ] Add Zod validation for AI responses
- [ ] Set up CI/CD pipeline

### Phase 3: Code Cleanup (Week 3)
- [ ] Consolidate contexts
- [ ] Remove dead code
- [ ] Organize documentation
- [ ] Add proper logging

### Phase 4: Enhancement (Week 4)
- [ ] Add retry logic for AI
- [ ] Implement offline support
- [ ] Add analytics
- [ ] Performance optimization

---

## 🎯 Immediate Action Items

1. **Fix build NOW** (Blocking everything else)
2. **Add at least 3 critical tests:**
   - AI service fallback behavior
   - Requirements caching
   - Permit calculation accuracy
3. **Clean up legacy files** before they confuse future developers
4. **Document environment variables** in README

---

## 📁 Recommended File Structure

```
permitpath-simple/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Route components
│   ├── services/         # API/AI calls
│   ├── hooks/            # Custom React hooks
│   ├── context/          # (Consolidated) Global state
│   ├── lib/              # Utilities
│   ├── types/            # TypeScript definitions
│   └── test/             # Test files
├── docs/                 # Documentation
│   ├── archive/          # Old planning docs
│   └── api/              # API documentation
├── public/               # Static assets
├── functions/            # Serverless functions
└── README.md
```

---

## 🔍 Code Quality Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Test Coverage | 0% | 70% |
| Type Safety | Partial | Full Zod |
| Build Success | ❌ | ✅ |
| Legacy Files | 15+ | 0 |
| Documentation | Overwhelming | Concise |

---

## 💡 Quick Wins

1. **Add this to package.json:**
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

2. **Add .nvmrc file:**
```
v20.11.0
```

3. **Update .gitignore:**
```
# Add these
*.log
.DS_Store
.env.local
.env.*.local
coverage/
.vscode/
.idea/
```

---

## Summary

PermitPath has a solid foundation but needs immediate attention to the build system and testing infrastructure. The AI integration is well-designed, but error handling needs improvement. Once the critical issues are resolved, this can be a production-ready application.

**Priority Order:**
1. Fix build system (🔴 Critical)
2. Add tests (🔴 Critical)
3. Clean up legacy files (🟡 High)
4. Improve error handling (🟡 High)
5. Consolidate state management (🟢 Medium)
