# Visual Specification for The AI Capability Atlas

## 1. Design System Overview

The AI Capability Atlas adopts a serious investigative newspaper aesthetic, similar to The Economist, The New York Times, and The Guardian. The visual system prioritizes clarity, authority, and cognitive ease, supporting users in navigating complex AI capability taxonomies without overwhelm.

### Core Principles

- **Serious & Authoritative**: No cartoonish or playful elements; maintain gravitas of investigative journalism.
- **Clean & Readable**: Prioritize typographic hierarchy and ample whitespace.
- **Editorial Infographics**: Data visualizations should feel like newspaper graphics, not marketing material.
- **Minimalist Color Palette**: Use restrained colors with strategic accents for emphasis.
- **Grid-Based Layout**: Employ a consistent column grid for structure and alignment.
- **Cognitive Support**: Visuals reduce cognitive load through chunking, clear labeling, and progressive disclosure.

---

## 2. Typography

### Font Families
- **Primary Serif**: A classic, high‑readability serif font for body text (e.g., **Georgia**, **Merriweather**, **Source Serif Pro**). Conveys tradition and credibility.
- **Secondary Sans‑Serif**: A clean, neutral sans‑serif for UI elements, labels, and small text (e.g., **Inter**, **Roboto**, **Helvetica Neue**).
- **Accent Monospace**: A monospaced font for code snippets, technical terms, and metadata (e.g., **Courier New**, **Source Code Pro**).

### Scale (Modular Scale 1.25)

| Role | Size (rem) | Weight | Line Height | Example |
|------|------------|--------|-------------|---------|
| Headline (H1) | 2.5rem (40px) | 700 | 1.2 | Main page title |
| Subheadline (H2) | 2rem (32px) | 600 | 1.3 | Section headers |
| Section Title (H3) | 1.75rem (28px) | 600 | 1.3 | Capability group |
| Card Title (H4) | 1.5rem (24px) | 600 | 1.4 | Capability name |
| Body Large | 1.25rem (20px) | 400 | 1.5 | Lead paragraphs |
| Body Regular | 1rem (16px) | 400 | 1.6 | Main content |
| Body Small | 0.875rem (14px) | 400 | 1.6 | Captions, footnotes |
| UI Labels | 0.875rem (14px) | 500 | 1.4 | Buttons, tags |
| Metadata | 0.75rem (12px) | 400 | 1.4 | Timestamps, source notes |

### Usage Guidelines
- **Headlines**: Always sentence case, no all‑caps.
- **Body Text**: Maximum line length 70 characters for optimal reading.
- **Hierarchy**: Use consistent spacing between sections (e.g., 2rem after H1, 1.5rem after H2).
- **Color**: Body text is near‑black (`#222222`) on light background (`#FFFFFF` or `#F9F9F9`).
- **Links**: Underlined, accent color (`#0056B3`), no underline on hover (color darkens).

---

## 3. Color Palette

### Neutral Foundation
| Role | Hex | Usage |
|------|-----|-------|
| Background Primary | `#FFFFFF` | Main content area |
| Background Secondary | `#F9F9F9` | Sidebars, card backgrounds |
| Background Tertiary | `#F0F0F0` | Hover states, subtle shading |
| Text Primary | `#222222` | Body text, headlines |
| Text Secondary | `#555555` | Subtitles, captions |
| Text Tertiary | `#888888` | Metadata, disabled text |
| Borders / Dividers | `#DDDDDD` | Separators, card borders |
| Borders Light | `#EEEEEE` | Subtle outlines |

### Accent Colors (Used sparingly)
| Role | Hex | Usage |
|------|-----|-------|
| Primary Accent (Blue) | `#0056B3` | Interactive elements, primary buttons, key highlights |
| Secondary Accent (Teal) | `#007A87` | Secondary actions, informational accents |
| Cognitive Highlight (Orange) | `#D35400` | Cognitive skill indicators, warnings, important notes |
| Success (Green) | `#007A5E` | Positive states, completion indicators |
| Warning (Amber) | `#B35E00` | Cautionary notes, medium‑priority alerts |
| Error (Red) | `#B30000` | Errors, high‑priority alerts |

### Data Visualization Palette (Sequential)
| Purpose | Hex Range | Usage |
|---------|-----------|-------|
| Low → High (Blue) | `#E6F2FF` → `#0056B3` | Heatmaps, strength scales |
| Low → High (Green) | `#E6F7ED` → `#007A5E` | Positive progression, skill ladder |
| Low → High (Orange) | `#FFEEDD` → `#D35400` | Cognitive load indicators |
| Diverging (Red‑Blue) | `#B30000` → `#FFFFFF` → `#0056B3` | AI vs Human strength comparison |

### Accessibility
- All text meets WCAG 2.1 AA contrast ratios (≥ 4.5:1 for normal text, ≥ 3:1 for large text).
- Color is never the sole means of conveying information (supported by icons, patterns, labels).
- Focus indicators are clearly visible (`#0056B3` with 2px outline).

---

## 4. Spacing & Grid

### Base Unit
**8px grid system** – All spacing is multiples of 8px.

### Scale
| Size | Pixels | Rem | Usage |
|------|--------|-----|-------|
| XS | 4px | 0.25rem | Tight grouping |
| S | 8px | 0.5rem | Icon padding, small gaps |
| M | 16px | 1rem | Default padding, margins |
| L | 24px | 1.5rem | Section spacing |
| XL | 32px | 2rem | Major section separation |
| XXL | 48px | 3rem | Page‑level margins |

### Layout Grid
- **Desktop**: 12‑column grid, 1120px max width, 24px gutters.
- **Tablet**: 8‑column grid, 90% width, 16px gutters.
- **Mobile**: 4‑column grid, 100% width, 12px gutters.

### Component Spacing
- **Cards**: 24px padding, 16px margin‑bottom.
- **Buttons**: 12px horizontal, 8px vertical padding.
- **Form fields**: 12px padding, 8px margin‑bottom.
- **Lists**: 8px between items.

---

## 5. Infographic Styles

### 5.1 Capability Taxonomy Map (Hierarchy)
- **Visual Metaphor**: Root‑to‑leaf tree with clean lines and nested rectangles.
- **Structure**: 4+ layers (Domain → Category → Capability → Use Case).
- **Styling**:
  - Domains: Large rectangles with bold border (`#0056B3`), dark background (`#F0F0F0`), serif title.
  - Categories: Medium rectangles with light border (`#DDDDDD`), white background.
  - Capabilities: Rounded rectangles with subtle shadow, white background, small sans‑serif label.
  - Use Cases: Small circles with accent color fill, no border.
- **Connectors**: Solid gray lines (`#DDDDDD`) with arrowheads for parent‑child relationships.
- **Annotations**: Call‑out boxes for cognitive skill levels (foundational/intermediate) using colored badges.

### 5.2 Decision Tree Diagram (Branching Logic)
- **Visual Metaphor**: Flowchart with diamond‑shaped decision nodes and rectangular terminal nodes.
- **Styling**:
  - Decision Nodes (questions): Diamond shape, light blue fill (`#E6F2FF`), solid border (`#0056B3`), bold question text.
  - Terminal Nodes (capabilities): Rectangle, white fill, thick border (`#007A5E`), capability name and icon.
  - Options: Curved connecting lines with arrowheads, labeled with option text.
- **Layout**: Top‑down orientation, aligned to grid, compact to fit typical screen width.
- **Interactive Elements** (if implemented): Hover highlights path, click to navigate.

### 5.3 Cognitive Model Diagrams
#### Skill Ladder (Progressive Competency)
- **Visual Metaphor**: Staircase or ladder with three distinct steps (Novice → Competent → Proficient).
- **Styling**:
  - Each step: Rectangle with increasing height (representing elevation), gradient fill (light to dark accent).
  - Step labels: Large numbers (1,2,3) and level names.
  - Sidebar: Characteristics and typical behaviors listed beside each step.
- **Connectors**: Arrows pointing upward with “progress” labels.

#### Mental Models (Conceptual Frameworks)
- **Visual Metaphor**: Interlocking gears or overlapping circles (Venn diagrams) for each model.
- **Styling**:
  - Each model: Circle with bold outline, icon in center, model name below.
  - Connections: Thin lines with explanatory text.
  - Background: Light gray (`#F9F9F9`) to separate from other content.

### 5.4 AI vs Human Strength Comparison Chart
- **Visual Metaphor**: Paired bar chart or radar chart.
- **Styling**:
  - Bars: AI strength in primary blue (`#0056B3`), human strength in secondary teal (`#007A87`).
  - Axes: Clean lines, labeled with capability categories.
  - Annotations: Icons for “AI advantage” and “Human advantage” with short explanations.
- **Layout**: Vertical bars for easier reading, sorted by relative advantage.

### 5.5 Problem Decomposition Flowcharts
- **Visual Metaphor**: Step‑by‑step process diagram with numbered circles.
- **Styling**:
  - Steps: Large numbered circles (1‑6) with white fill and accent border.
  - Content: Concise description inside each circle.
  - Arrows: Straight lines with arrowheads, colored gray.
  - Sub‑steps: Smaller circles branching from main steps, lighter color.
- **Cognitive Load Indicators**: Small badges showing load rating (Low/Medium/High) with color coding.

### 5.6 Heatmaps of AI Strengths
- **Visual Metaphor**: Grid of squares (capabilities × dimensions) with color intensity.
- **Styling**:
  - Grid: Light gray borders, each cell sized 60×60px.
  - Color Scale: Sequential blue (`#E6F2FF` to `#0056B3`) for strength.
  - Labels: Row and column headers in small caps.
  - Tooltip (if interactive): Shows exact strength score and explanation.

### 5.7 Menu‑Style Grid Visuals
- **Visual Metaphor**: Card‑based grid like a newspaper’s section index.
- **Styling**:
  - Cards: White background, subtle shadow, 1px border (`#DDDDDD`), rounded corners (4px).
  - Icon: Top‑left accent icon in primary color.
  - Title: Card Title style (H4).
  - Description: 1‑2 lines of body small text.
  - Metadata: Tags for domain and cognitive load.
- **Layout**: Responsive grid, 3‑4 columns on desktop, 2 on tablet, 1 on mobile.

### 5.8 Layered Ecosystem Maps
- **Visual Metaphor**: Concentric circles or stacked layers representing different abstraction levels.
- **Styling**:
  - Layers: Graduated fill colors (light to dark) from center outward.
  - Layer labels: Placed outside each ring with connecting lines.
  - Elements: Small icons or dots placed within appropriate layers.
  - Connectors: Dashed lines showing relationships across layers.

### 5.9 Skill Ladder Visual (Alternative)
- **Visual Metaphor**: Mountain climbing map with base camp, ascent, summit.
- **Styling**:
  - Path: Winding trail with waypoints (milestones).
  - Waypoints: Flag icons with skill names.
  - Elevation markers: Contour lines and altitude labels.
  - Annotations: “Foundational skills” at base, “Advanced skills” near summit.

---

## 6. Interactive Component Design

### Buttons
| Type | Background | Text Color | Border | Hover |
|------|------------|------------|--------|-------|
| Primary | `#0056B3` | `#FFFFFF` | `#0056B3` | `#004899` |
| Secondary | `#F0F0F0` | `#222222` | `#DDDDDD` | `#E0E0E0` |
| Tertiary (Text) | Transparent | `#0056B3` | None | `#004899` (text only) |
| Danger | `#B30000` | `#FFFFFF` | `#B30000` | `#990000` |

### Cards
- **Default**: White background, 1px border `#DDDDDD`, 4px border‑radius, subtle shadow (0 2px 8px rgba(0,0,0,0.05)).
- **Hover**: Shadow deepens (0 4px 12px rgba(0,0,0,0.1)), border color `#0056B3`.
- **Selected**: Border 2px `#0056B3`, background `#E6F2FF`.

### Navigation
- **Top Bar**: White background, 1px bottom border `#DDDDDD`, serif logo, sans‑serif menu.
- **Sidebar**: Light gray background (`#F9F9F9`), section headers in small caps, nested indentation.
- **Breadcrumbs**: Separator “/”, current page bold, previous pages linked.

### Decision Engine Interface
- **Question Card**: Large serif question, option buttons styled as secondary buttons with descriptive text.
- **Progress Indicator**: Step dots (3 max) with connecting line, active dot in primary color.
- **Result Panel**: Green border (`#007A5E`), capability icon, “Recommended Capability” header, thinking prompts in callout boxes.

### Search & Filter
- **Search Bar**: Rounded border, magnifying glass icon, clear “X” button.
- **Filter Chips**: Rounded rectangles with remove “×”, background `#F0F0F0`, hover `#E0E0E0`.

### Tooltips & Popovers
- **Tooltip**: Dark background (`#222222`), white text, 8px border‑radius, arrow.
- **Popover**: White background, shadow, border `#DDDDDD`, header with accent bar.

---

## 7. Iconography

### Style
- **Line icons** with 1.5px stroke weight, rounded ends.
- **Minimal detail**, consistent visual weight.
- **Two‑color scheme**: Primary gray (`#555555`) with accent color on interactive states.

### Key Icons
- **Capability categories**: Lightbulb (Learn), Pen (Create), Scale (Decide), Wrench (Improve), Utensils (Practical), Smile (Entertain), Heart (Personal), Speech Bubble (Communicate).
- **Cognitive concepts**: Brain (Thinking), Ladder (Skill progression), Puzzle (Problem solving), Magnifying Glass (Analysis).
- **Actions**: Expand/Collapse (chevron), Bookmark (save), Share (arrow), Print (printer), Download (arrow down).

### Implementation
- SVG sprites for scalability.
- Accessible with `aria‑label` and `role="img"`.

---

## 8. Accessibility & Responsiveness

### Accessibility
- **Semantic HTML**: Proper heading hierarchy, ARIA labels for interactive visuals.
- **Keyboard Navigation**: All interactive elements focusable and operable via keyboard.
- **Screen‑Reader Text**: Descriptive alt text for all infographics (provided in IMAGE_PROMPTS.md).
- **Color‑Blind Friendly**: Use patterns/textures in addition to color in charts.
- **Motion Sensitivity**: Provide option to reduce animations.

### Responsive Behavior
- **Breakpoints**:
  - Mobile: ≤ 768px
  - Tablet: 769px – 1024px
  - Desktop: ≥ 1025px
- **Adaptations**:
  - Infographics switch from side‑by‑side to stacked layout.
  - Font sizes scale down slightly on mobile.
  - Grid columns reduce.
  - Interactive elements enlarge touch targets (minimum 44×44px).

---

## 9. Implementation Notes

### Front‑End Framework
- Use CSS custom properties (variables) for colors, spacing, typography.
- Adopt a utility‑first CSS approach (e.g., Tailwind) for consistency.
- Component library built with React/Vue/Svelte for interactive elements.

### Assets
- All infographics generated as SVG (scalable) with PNG fallback.
- High‑resolution versions (2x) for retina displays.
- Lazy‑loading for images below the fold.

### Performance
- Optimize SVG with SVGO.
- Use modern image formats (WebP) where supported.
- Critical CSS inlined for above‑the‑fold content.

---

## 10. Example Application

See companion file `IMAGE_PROMPTS.md` for detailed generation prompts and alt‑text specifications for each required infographic.

---

*Visual Specification v1.0 – The AI Capability Atlas – Designed for serious investigative newspaper aesthetic.*