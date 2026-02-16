# Interaction Specification for The AI Capability Atlas

## 1. Static Site Architecture

### 1.1 Framework Selection
- **React/Vite** for static site generation with fast development and zero-backend deployment.
- **TypeScript** for type safety across complex data structures.
- **Tailwind CSS** for utility-first styling aligned with visual specification.
- **Static Export**: Build outputs to static HTML/JS/CSS for GitHub Pages compatibility.

### 1.2 File/Folder Structure
```
public/
├── images/           # Generated infographics (SVG/PNG)
├── favicon.ico
└── robots.txt

src/
├── components/       # React components
│   ├── layout/      # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── GridContainer.tsx
│   ├── interactive/ # Interactive components
│   │   ├── AccordionSection.tsx
│   │   ├── CapabilityExplorer.tsx
│   │   ├── DecisionWizard.tsx
│   │   ├── DecompositionTrainer.tsx
│   │   ├── ScenarioSelector.tsx
│   │   └── ProgressiveReveal.tsx
│   ├── data/        # Data visualization components
│   │   ├── TaxonomyMap.tsx
│   │   ├── SkillLadder.tsx
│   │   ├── CognitiveModelDiagram.tsx
│   │   └── Heatmap.tsx
│   └── ui/          # UI primitives
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Tag.tsx
│       ├── Breadcrumbs.tsx
│       └── Tooltip.tsx
├── pages/           # Static page components
│   ├── Home.tsx
│   ├── Taxonomy.tsx
│   ├── DecisionEngine.tsx
│   ├── CognitiveModel.tsx
│   ├── UseCaseLibrary.tsx
│   └── About.tsx
├── data/            # Static JSON data
│   ├── taxonomy.json         # Full taxonomy v2
│   ├── decision-engine.json  # Decision engine nodes
│   ├── cognitive-model.json  # Cognitive model data
│   └── use-cases.json        # All use cases indexed
├── hooks/           # Custom React hooks
│   ├── useTaxonomy.ts
│   ├── useDecisionEngine.ts
│   ├── useLocalStorage.ts
│   └── useResponsive.ts
├── utils/           # Utility functions
│   ├── dataLoaders.ts
│   ├── search.ts
│   ├── cognitiveHelpers.ts
│   └── analytics.ts
├── styles/          # Global styles
│   ├── globals.css
│   └── design-tokens.css
├── App.tsx          # Root component
└── main.tsx         # Entry point
```

### 1.3 Component Breakdown with Responsibilities

#### Layout Components
- **Header**: Logo, main navigation, search bar, user skill level selector.
- **Footer**: Copyright, links to GitHub, feedback form, version info.
- **Sidebar**: Contextual navigation for current section (taxonomy tree, decision engine progress, cognitive model menu).
- **GridContainer**: Responsive grid wrapper for content cards.

#### Interactive Components
- **AccordionSection**: Expandable content sections for domains/categories with smooth animations.
- **CapabilityExplorer**: Interactive tree visualization of taxonomy with click-to-expand nodes, filtering, and search.
- **DecisionWizard**: Step-by-step decision engine UI with back/next navigation, progress indicator, and result display.
- **DecompositionTrainer**: Guided step-by-step breakdown of AI tasks with thinking prompts and examples.
- **ScenarioSelector**: Grid of use case cards with filtering by domain, category, cognitive load, and skill level.
- **ProgressiveReveal**: Component that reveals additional details (thinking steps, pitfalls, metacognitive check-ins) on user interaction.

#### Data Visualization Components
- **TaxonomyMap**: SVG-based hierarchical tree diagram of domains → categories → capabilities.
- **SkillLadder**: Interactive staircase visualization showing novice → competent → proficient progression with clickable levels.
- **CognitiveModelDiagram**: SVG diagram of thinking lenses, mental models, and structured thinking framework.
- **Heatmap**: Grid visualization of AI strengths across capabilities with color intensity encoding.

#### UI Primitives
- **Button**: Primary/secondary/tertiary styles per visual spec.
- **Card**: Content cards with hover/selected states.
- **Tag**: Small badges for cognitive load rating, skill level, domain labels.
- **Breadcrumbs**: Navigation trail for deep taxonomy exploration.
- **Tooltip**: Information tooltips on hover for key terms and icons.

### 1.4 Data Flow
- **Static JSON Loading**: All data files are imported at build time and bundled into the JavaScript bundle (no runtime fetch). Use `import taxonomy from './data/taxonomy.json'`.
- **Component Data Injection**: Top-level pages pass data down via props/context. Use React Context for global state (e.g., selected skill level, current domain).
- **Client‑Side Filtering/Search**: All interactivity happens in browser using loaded JSON data; no server requests.
- **State Management**: Use React `useState` and `useReducer` for component‑local state; `useContext` for shared state (user preferences, selected capability).

### 1.5 Build Configuration (Vite)
```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/ai-capability-atlas/', // GitHub Pages repo path
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          data: ['./src/data/taxonomy.json', './src/data/decision-engine.json'],
        }
      }
    }
  },
  server: {
    port: 3000
  }
});
```

### 1.6 Deployment
- **GitHub Pages**: Deploy `dist` folder to `gh‑pages` branch via GitHub Actions.
- **Zero‑Backend**: All functionality works offline after initial load; no API calls.
- **CDN Hosting**: Optionally deploy to Netlify/Vercel for automatic previews.

---

## 2. Interactive Components Specification

### 2.1 Accordion Sections (Expandable Content)
**Purpose**: Manage cognitive load by hiding detailed content until requested.

**Behavior**:
- Click header to expand/collapse.
- Smooth CSS transition (height/max-height).
- Chevron icon rotates 90° on expand.
- Multiple accordions can be open simultaneously.
- State preserved in URL hash for bookmarking.

**Content Structure**:
```
┌─────────────────────────────┐
│ ▼ Domain: Knowledge & Learning │
├─────────────────────────────┤
│ Thinking Lens: Understanding… │
│ Skill Ladder Mapping…        │
│ Mental Models…               │
│ Categories:                  │
│ • Learn New Things           │
│ • Research & Analyze         │
└─────────────────────────────┘
```

**Implementation**: Use `<details>`/`<summary>` with polyfill for consistent styling.

### 2.2 Capability Explorer (Clickable Taxonomy Navigation)
**Purpose**: Visual hierarchical navigation of the full taxonomy.

**Behavior**:
- Initial view shows 6‑8 domain cards.
- Click domain → expands to show categories.
- Click category → expands to capabilities.
- Click capability → expands to use cases.
- Breadcrumbs update to show current location.
- Search bar filters tree in real‑time.
- Visual highlight of current selection.
- "Back to top" button resets view.

**Visual Design**: Inspired by newspaper section index: cards with icons, titles, brief descriptions, and cognitive load badges.

**Interaction States**:
- **Default**: Card with subtle border.
- **Hover**: Border color `#0056B3`, shadow elevation.
- **Selected**: Background `#E6F2FF`, thick left border `#0056B3`.
- **Expanded**: Card expands downward to show child items.

### 2.3 Decision Wizard (Interactive Branching)
**Purpose**: Guide users to appropriate capability via 3‑click maximum decision tree.

**Behavior**:
- **Step 1**: Show root question "What are you trying to do?" with 9 option cards.
- **Step 2**: Based on selection, show category‑level question.
- **Step 3**: Show capability‑level options.
- **Result**: Display recommended capability card with description, thinking prompts, and direct links to use cases.
- **Navigation**: Back button to revisit previous choices; progress dots (3 max).
- **Alternative Path**: "Not sure / Explore capabilities" launches guided discovery mode.

**UI Components**:
- **Question Card**: Large serif font question, optional description.
- **Option Cards**: Grid of secondary‑style buttons with icons and labels.
- **Progress Indicator**: Dots with connecting line, active dot in primary color.
- **Result Panel**: Green border (`#007A5E`), capability icon, "Recommended Capability" header.

### 2.4 Decomposition Trainer (Step‑by‑Step Guidance)
**Purpose**: Teach structured thinking framework through interactive exercises.

**Behavior**:
- **Step‑by‑Step Walkthrough**: 6 steps (Define Goal → Analyze Cognitive Demand → Specify Prompt → Execute & Evaluate → Iterate & Refine → Reflect & Learn).
- **Interactive Prompts**: Each step presents text input or multiple‑choice questions.
- **Examples**: Show worked examples for each step.
- **Progressive Disclosure**: Reveal next step only after current step completed.
- **Save & Export**: Allow users to save their decomposition for later reference.

**Cognitive Integration**:
- Each step includes thinking prompts from cognitive model.
- Metacognitive check‑ins as pop‑ups after critical steps.
- Zone of Proximal Development guidance: offer simplified or advanced versions.

### 2.5 Scenario Selector (Use Case Exploration)
**Purpose**: Browse concrete example prompts by filtering criteria.

**Behavior**:
- **Grid View**: Cards showing use case name, description, cognitive load rating, domain/category tags.
- **Filters**: Sidebar with checkboxes for:
  - Domain (Knowledge & Learning, Creativity & Content, etc.)
  - Cognitive load (Low, Medium, High)
  - Skill level (Novice, Competent, Proficient)
  - Capability type
- **Search**: Full‑text search across use case names, descriptions, example prompts.
- **Detail View**: Click card → modal with full details: thinking steps, ZPD guidance, example prompts (copy‑to‑clipboard button).

**Design**: Newspaper‑style card grid with subtle shadows and clean typography.

### 2.6 Progressive Reveal Mechanisms
**Purpose**: Reduce cognitive overload by hiding advanced content until users are ready.

**Types**:
1. **"Show thinking steps" button**: Reveals the cognitive process behind a capability.
2. **"See example prompts" toggle**: Expands to show 3‑5 example prompts.
3. **"Expert tips" disclosure**: Advanced insights appear after clicking "I want to go deeper".
4. **"Compare AI vs human" slider**: Interactive comparison that reveals strengths as slider moves.

**Implementation**: CSS transitions with `max‑height` and `overflow: hidden`.

---

## 3. User Flow Design

### 3.1 Onboarding Journey for New Visitors
**Landing Page (Home)**:
- Hero section: "The AI Capability Atlas: A newspaper‑style guide to what AI can do"
- Three primary entry points:
  1. **"I have a specific task"** → Decision Wizard
  2. **"I want to explore capabilities"** → Capability Explorer
  3. **"I want to learn how to think with AI"** → Cognitive Model
- "What you can try right now" section: 3‑4 high‑success‑rate example prompts with direct copy‑paste.

**First‑Time Visitor Path**:
```
Home → Decision Wizard (quick win) → Recommended Capability → Use Case Example → Copy prompt → Success!
```

**Returning Visitor Path**:
Persistent skill level preference stored in localStorage; content adapts to show more advanced features.

### 3.2 Multiple Entry Points Based on User Goals
| User Goal | Entry Point | Primary Component |
|-----------|-------------|-------------------|
| "I need help with a specific task" | Decision Wizard | Interactive branching decision tree |
| "I want to see everything AI can do" | Capability Explorer | Clickable taxonomy navigation |
| "I want example prompts I can use now" | Use Case Library | Filterable scenario selector |
| "I want to improve my AI thinking skills" | Cognitive Model | Interactive diagrams + decomposition trainer |
| "I'm just browsing" | Home | Curated highlights + "try now" prompts |

### 3.3 Guided Paths vs. Free Exploration
**Guided Paths**:
- **Decision Wizard**: Structured 3‑click path to specific capability.
- **Learning Pathways**: Curated sequences (e.g., "From Novice to Competent in Research Skills") with progress tracking.
- **Decomposition Trainer**: Step‑by‑step coaching through structured thinking.

**Free Exploration**:
- **Capability Explorer**: Hierarchical tree navigation at user's own pace.
- **Scenario Selector**: Filter‑and‑browse use cases.
- **Search**: Full‑text search across entire taxonomy.

**Hybrid**: Users can start guided and diverge to exploration via "Explore related capabilities" links.

### 3.4 "What You Can Try Right Now" Integration
**Location**: Prominent section on homepage and capability detail pages.

**Content**:
- 1‑2 concrete example prompts ready to copy‑paste into ChatGPT/Claude.
- Brief explanation of what the prompt does and what to expect.
- "Try it" button that copies to clipboard and shows "Copied!" confirmation.
- Link to full use case for more context.

**Implementation**: `navigator.clipboard.writeText()` with fallback for older browsers.

---

## 4. Interactivity Implementation

### 4.1 Client‑Side Only Architecture
**No Backend Requirements**:
- All data bundled at build time.
- Search/filtering performed on loaded JSON using `filter()`/`map()`.
- State persisted in `localStorage` (user preferences, saved decompositions).
- Analytics via plausible.io (external script) optional.

**Performance Considerations**:
- Lazy‑load heavy visualizations (taxonomy map, heatmap) with `React.lazy()`.
- Virtualize long lists in scenario selector for >100 items.
- Preload critical navigation JSON (<500KB total).

### 4.2 State Management Strategy
**Local Component State**:
- Accordion open/closed
- Decision wizard current step
- Filter selections

**Global Context (React Context)**:
- `UserPreferencesContext`: skill level, theme (light/dark), reduced motion.
- `NavigationContext`: current domain/category/capability for breadcrumbs.
- `TaxonomyContext`: loaded taxonomy data for search/filtering.

**Persistence**:
- `localStorage` for user preferences.
- URL hash/query parameters for deep linking (e.g., `/#/taxonomy/domain=knowledge_learning`).

### 4.3 Responsive Design Requirements
**Breakpoints** (matches visual spec):
- **Mobile**: ≤ 768px (4‑column grid)
- **Tablet**: 769px – 1024px (8‑column grid)
- **Desktop**: ≥ 1025px (12‑column grid)

**Adaptive Behaviors**:
- **Taxonomy Explorer**: Desktop → side‑by‑side tree + detail; Mobile → stacked cards.
- **Decision Wizard**: Desktop → horizontal progress bar; Mobile → vertical step indicator.
- **Scenario Selector**: Desktop → filters sidebar; Mobile → filters in modal.

**Touch Targets**: Minimum 44×44px for interactive elements on mobile.

### 4.4 Performance Considerations
**Bundle Size Optimization**:
- Code splitting by route (home, taxonomy, decision‑engine, etc.).
- Lazy‑load infographics (SVG).
- Compress JSON data (remove whitespace, use short keys).

**Loading Strategy**:
- Critical CSS inlined.
- Above‑the‑fold content loaded first.
- Images lazy‑loaded with `loading="lazy"`.

**Caching**:
- Service worker for offline capability (optional).
- `Cache‑Control` headers for GitHub Pages.

**Accessibility**:
- Semantic HTML, ARIA labels for interactive visuals.
- Keyboard navigation support for all interactive components.
- Screen‑reader‑friendly alternative text for infographics.
- Color‑blind friendly palette with patterns/textures.

---

## 5. Technical Feasibility Validation

### 5.1 Constraints Check
- ✅ **Static site framework**: React/Vite static export generates pure HTML/JS/CSS.
- ✅ **No server‑side code**: All logic runs in browser.
- ✅ **Fully client‑side interactivity**: State management via React hooks.
- ✅ **GitHub Pages compatible**: Build output is static files; base path configurable.

### 5.2 Data Volume Analysis
- **Taxonomy JSON**: ~400KB (estimated)
- **Decision Engine JSON**: ~50KB
- **Cognitive Model JSON**: ~30KB
- **Total data**: <500KB → acceptable for initial load.

### 5.3 Browser Compatibility
- Target: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+).
- Fallbacks: Basic functionality works without JavaScript (static accordions via `<details>`), enhanced with JS.

### 5.4 Development Timeline
- **Week 1**: Setup, basic components, taxonomy explorer.
- **Week 2**: Decision wizard, scenario selector.
- **Week 3**: Cognitive model integration, decomposition trainer.
- **Week 4**: Polish, responsive design, testing, deployment.

---

## 6. Success Metrics

### 6.1 User Experience Goals
- **Reduced cognitive load**: Users report feeling less overwhelmed.
- **Increased confidence**: Self‑efficacy scores improve after using decomposition trainer.
- **Task success**: Users find appropriate capability within 3 clicks (decision wizard).
- **Engagement**: Time spent exploring taxonomy, return visits.

### 6.2 Technical Goals
- **Performance**: First Contentful Paint < 1.5s on 3G.
- **Accessibility**: WCAG 2.1 AA compliance.
- **Cross‑browser compatibility**: Consistent experience across modern browsers.
- **Offline capability**: Basic navigation works without internet (optional).

### 6.3 Cognitive Goals
- **Metacognitive awareness**: Users demonstrate ability to reflect on their thinking process.
- **Skill progression**: Users advance along skill ladder (novice → competent → proficient).
- **Misconception reduction**: Fewer "AI knows everything" beliefs after using the atlas.

---

*Interaction Specification v1.0 – The AI Capability Atlas – Designed for serious investigative newspaper aesthetic with cognitive support.*