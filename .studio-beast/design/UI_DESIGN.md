# PermitPath UX/UI Overhaul - UI Creative Direction

## 1. Visual Direction Selected

### Selected Direction: Blueprint Professional

**Rationale:** The blueprint aesthetic directly connects to construction and permits. It evokes:
- Technical precision (contractors value accuracy)
- Official documentation (trustworthy authority)
- Professional expertise (not a toy app)
- Timeless quality (blueprints never go out of style)

**Alternative Directions Considered:**
- Modern SaaS: Too generic, doesn't differentiate
- Friendly Illustrative: Too casual for official permits

## 2. Design System Specifications

### Color Palette (Tailwind Config)

```javascript
colors: {
  blueprint: {
    DEFAULT: '#0A3A7E',
    50: '#E6EEF8',
    100: '#DDE8F5',
    200: '#B8D0EB',
    300: '#8FB8E0',
    400: '#5C94D1',
    500: '#3A7ABF',
    600: '#0A3A7E',
    700: '#082E65',
    800: '#06234C',
    900: '#041733',
  },
  sky: '#DDE8F5',
  steel: '#4A5568',
  orange: {
    DEFAULT: '#DD6B20',
    light: '#F6AD55',
  },
  parchment: '#F7FAFC',
  forest: '#2F855A',
  crimson: '#C53030',
}
```

### Typography Scale

| Level | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| Display | 48px | 56px | 700 | Hero headlines |
| H1 | 36px | 44px | 700 | Page titles |
| H2 | 28px | 36px | 700 | Section headers |
| H3 | 22px | 30px | 600 | Card titles |
| H4 | 18px | 26px | 600 | Subsection |
| Body Large | 18px | 28px | 400 | Lead text |
| Body | 16px | 24px | 400 | Standard text |
| Body Small | 14px | 20px | 400 | Secondary text |
| Caption | 12px | 16px | 500 | Labels, badges |

### Spacing Scale (8px base)

| Token | Value |
|-------|-------|
| space-1 | 4px |
| space-2 | 8px |
| space-3 | 12px |
| space-4 | 16px |
| space-6 | 24px |
| space-8 | 32px |
| space-12 | 48px |
| space-16 | 64px |

## 3. Component Specifications

### Buttons

**Primary Button**
- Background: blueprint-600 (#0A3A7E)
- Text: white
- Padding: 12px 24px
- Border-radius: 8px
- Hover: blueprint-700
- Active: blueprint-800
- Focus: ring-2 ring-blueprint-400 ring-offset-2

**Secondary Button**
- Background: sky (#DDE8F5)
- Text: blueprint-600
- Border: none
- Hover: blueprint-100

**Destructive Button**
- Background: crimson (#C53030)
- Text: white
- Hover: #9B2C2C

**Ghost Button**
- Background: transparent
- Text: blueprint-600
- Hover: sky background

### Input Fields

**Text Input**
- Background: white
- Border: 1px solid light-gray (#E2E8F0)
- Border-radius: 8px
- Padding: 12px 16px
- Height: 44px minimum
- Focus: border-blueprint-500, ring-2 ring-blueprint-200
- Error: border-crimson, crimson text below

### Cards

**Standard Card**
- Background: white
- Border: 1px solid light-gray
- Border-radius: 12px
- Padding: 24px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Hover: shadow elevation, border-blueprint-200

**Feature Card (Home)**
- Background: white
- Border-radius: 16px
- Padding: 32px
- Icon: 48px, blueprint color
- Title: H4
- Description: Body Small

### Navigation

**Bottom Nav**
- Background: white
- Border-top: 1px solid light-gray
- Height: 64px + safe area
- Icon size: 24px
- Label: Caption size
- Active: blueprint color
- Inactive: steel gray

## 4. Screen Designs

### Home Page

**Hero Section**
- Full-width background image (16:9, architect/blueprint)
- Overlay: Linear gradient (transparent to parchment)
- Headline: Display size, white with text-shadow
- Subheadline: Body Large, white
- CTA: Primary button, centered

**Features Section**
- 3-column grid (1 column mobile)
- Feature cards with icons
- Icons: Lucide icons in blueprint color

### New Job / Wizard

**Step 1: Job Type Selection**
- 2x2 grid of job type cards (1 column mobile)
- Each card: Icon (64px), Title, Description
- Selected state: Blueprint border, sky background

**Step Progress**
- Horizontal stepper
- Active: Blueprint circle with number
- Completed: Checkmark in blueprint circle
- Pending: Gray circle

### AI Assistant

**Banner**
- Full-width image (3:1 neural network + blueprint)
- Title overlaid: H2, white
- Subtitle: Body, white

**Chat Area**
- Messages in scrollable container
- User messages: Sky background, right-aligned
- AI messages: White background, left border 3px blueprint
- Input: Fixed at bottom with attachment button

### My Jobs

**Job Card**
- Horizontal layout with thumbnail/icon
- Title: H4, truncated
- Type badge: Caption, sky background
- Status badge: 
  - Draft: Steel gray
  - Submitted: Blueprint
  - Approved: Forest green
  - Rejected: Crimson
- Date: Caption, steel gray

### Help & Support

**Contact Grid**
- 3 cards: Chat AI, Call County, Email Support
- Each: Icon (48px), Title, Description, Action
- Icons in respective brand colors

### Settings

**Section Grouping**
- Section titles: H4, blueprint color
- Dividers between sections
- Toggles: Standard shadcn with blueprint active state
- Form inputs: Consistent spacing

## 5. Bold Choice

**Decision:** Use blueprint as primary button color instead of the more common orange/green.

**Justification:** 
- Differentiates from warning/error colors (orange/crimson)
- Reinforces the "blueprint" brand metaphor
- More professional than energetic colors
- Better accessibility contrast on white

## 6. Image Asset Specifications

### Hero Background
- **Dimensions:** 1920x1080 (16:9)
- **Style:** Architectural blueprint with construction site
- **Colors:** Blue/white primarily, matches palette
- **Subject:** Architect reviewing plans at construction site

### Job Type Icons
- **Format:** SVG or high-res PNG with transparency
- **Style:** Line icons, 2px stroke
- **Color:** Blueprint (#0A3A7E)
- **Size:** 64px display size

### AI Banner
- **Dimensions:** 1200x400 (3:1)
- **Style:** Neural network visualization merging with blueprint lines
- **Colors:** Blue tones, tech aesthetic
- **Subject:** Abstract AI + construction blueprint fusion

### Empty State
- **Dimensions:** 800x600 (4:3)
- **Style:** Friendly illustration, flat design
- **Subject:** Empty clipboard with friendly character or icon
- **Colors:** Soft blue/gray tones
