# Image Generation Prompts for The AI Capability Atlas

## Overview

This document provides detailed prompts for generating all required infographics for The AI Capability Atlas. All images should follow the **serious investigative newspaper aesthetic** – clean typography, minimalist but authoritative editorial infographics, no cartoon style.

### Style Guidelines

- **Tone**: Serious, authoritative, like The Economist or The New York Times.
- **Color Palette**: Predominantly neutral (black, white, grays) with strategic use of accent colors (blue `#0056B3`, teal `#007A87`, orange `#D35400`).
- **Typography**: Use clean, readable serif fonts for labels; sans-serif for UI elements.
- **Layout**: Grid‑based, aligned, ample whitespace.
- **Illustration Style**: Flat, vector‑style graphics with minimal gradients, no photorealism, no decorative flourishes.
- **Data Visualization**: Editorial‑style charts (like newspaper infographics) with clear labeling, legends, and source notes.

### Technical Requirements

- **Dimensions**: 1200×800 pixels (landscape) unless otherwise specified.
- **Format**: SVG (preferred) or PNG with transparent background.
- **Resolution**: 72 DPI for web, 300 DPI for print versions.
- **Alt Text**: Provided for each image; include in HTML `alt` attribute.

---

## 1. Capability Taxonomy Map (4+ layer hierarchy)

**Purpose**: Visualize the complete hierarchy of AI capabilities: Domains → Categories → Capabilities → Use Cases.

**Visual Description**: A tree‑like diagram with root at left, branching to the right. Four distinct layers (columns) representing each hierarchical level. Each domain is a large rectangle with its categories as nested rectangles inside, capabilities as smaller rectangles, and use cases as dots or small circles. Connectors show parent‑child relationships.

**Prompt**:

```
Create an editorial‑style infographic showing a hierarchical taxonomy tree with four layers.

Leftmost column: "Domains" – four large rectangles labeled:
1. KNOWLEDGE & LEARNING (light blue background #E6F2FF)
2. CREATIVITY & CONTENT (light green background #E6F7ED)
3. ANALYSIS & PROBLEM SOLVING (light orange background #FFEEDD)
4. EVERYDAY LIFE (light purple background #F5E6FF)

Second column: "Categories" – rectangles grouped under each domain:
- Under KNOWLEDGE & LEARNING: Learn New Things, Research & Analyze, Evaluate Information
- Under CREATIVITY & CONTENT: Create Things, Transform Content, Improve Work
- Under ANALYSIS & PROBLEM SOLVING: Make Decisions, Solve Problems, Analyze Systems
- Under EVERYDAY LIFE: Practical Skills, Social & Emotional, Personal Wellness, Entertainment & Leisure

Third column: "Capabilities" – smaller rectangles (one row per category) showing example capabilities:
- Under Learn New Things: Explain complex concepts, Answer factual questions, Compare concepts, Provide examples, Translate concepts, Teach step‑by‑step
- Under Create Things: Brainstorm ideas, Create outlines, Generate stories, Create dialogue, Develop characters, Design scenarios
- (Show 2‑3 example capabilities per category; use muted colors.)

Fourth column: "Use Cases" – small circles with icons representing specific scenarios:
- Under Explain complex concepts: Explain academic concept, Explain technical term, Explain current event
- (Show 1‑2 example use cases per capability.)

Use clean lines to connect each parent to its children. The overall layout is a tree that fans out from left to right. Use a grid for alignment. Labels are in a clean serif font (Georgia or similar). The title at top: "AI Capability Taxonomy: A Hierarchical View". Subtitle: "Four layers from broad domains to specific use cases". Include a legend explaining color coding: domains have colored backgrounds, categories white, capabilities light gray, use cases accent‑colored dots.

Style: serious newspaper infographic, no decorative elements, minimal shadows. Use black text on light backgrounds, borders in #DDDDDD. Accent lines in #0056B3.
```

**Alt Text**:

```
Diagram showing AI capability taxonomy hierarchy with four layers. From left to right: four Domains (Knowledge & Learning, Creativity & Content, Analysis & Problem Solving, Everyday Life). Each domain branches to Categories (e.g., Learn New Things, Research & Analyze). Each category branches to Capabilities (e.g., Explain complex concepts, Answer factual questions). Each capability branches to Use Cases (e.g., Explain academic concept, Explain technical term). Connections shown with clean lines.
```

**Dimensions**: 1600×1000 (wide to accommodate four columns).

---

## 2. Decision Tree Diagram (visualizing branching logic)

**Purpose**: Illustrate the decision‑engine flow that guides users from high‑level goals to specific capability recommendations in maximum 3 clicks.

**Visual Description**: A flowchart with diamond‑shaped decision nodes and rectangular terminal nodes. Start with root question "What are you trying to do?" with 9 options. Show example path: "Learn or understand something" → "Learn New Things" → "Explain complex concepts". Highlight the "maximum 3 clicks" principle.

**Prompt**:

```
Create a newspaper‑style flowchart showing a decision tree with three levels.

Top level: Diamond‑shaped node labeled "What are you trying to do?" with 9 outgoing arrows to rectangular option nodes (arranged in a grid): Learn or understand something, Create something new, Make a decision or solve a problem, Improve or refine existing work, Get practical help with daily tasks, Have fun or be entertained, Work on personal development, Communicate or interact with others, Not sure / Explore capabilities.

Second level: Focus on the "Learn or understand something" branch. A diamond node labeled "What kind of learn or understand something task do you have?" with three outgoing arrows to: Learn New Things, Research & Analyze, Evaluate Information.

Third level: Focus on "Learn New Things" branch. A diamond node labeled "What specific learn new things capability do you need?" with six outgoing arrows to: Explain complex concepts, Answer factual questions, Compare concepts, Provide examples, Translate concepts, Teach step‑by‑step.

Terminal node: Rectangle with thick border and green accent labeled "Explain complex concepts" with description: "Breaking down complicated topics into understandable parts". Include a "Recommended Capability" badge.

Highlight the path from root to terminal with a bolder, blue line. Annotate with "Click 1", "Click 2", "Click 3". The rest of the tree should be visible but grayed out.

Use a clean sans‑serif font for node labels. Decision diamonds are light blue fill (#E6F2FF), option rectangles are white with gray border (#DDDDDD), terminal rectangle is white with green border (#007A5E). Arrows are solid gray lines with arrowheads.

Title: "Decision Engine: Maximum 3 Clicks to a Recommendation". Subtitle: "Example path from goal to capability". Include a legend explaining node types.
```

**Alt Text**:

```
Flowchart of decision tree showing how users navigate from a high‑level goal to a specific AI capability. Starting with question 'What are you trying to do?' with nine options. Following the 'Learn or understand something' branch leads to question 'What kind of learn or understand something task do you have?' with three options. Selecting 'Learn New Things' leads to question 'What specific learn new things capability do you need?' with six options, ending with recommended capability 'Explain complex concepts'. The path is highlighted; other branches are grayed out.
```

**Dimensions**: 1200×800.

---

## 3. Cognitive Model Diagrams (skill ladder, mental models)

**Purpose**: Visualize the cognitive framing elements: skill ladder (novice → competent → proficient) and mental models (AI as a Thinking Partner, Capability Stack, etc.).

**Visual Description**: Two side‑by‑side diagrams. Left: a skill ladder with three steps, each step labeled with characteristics and typical behaviors. Right: four overlapping circles representing mental models, with brief descriptions.

**Prompt**:

```
Create a two‑panel editorial infographic about cognitive models.

Left panel: "Skill Ladder: Progressive Competency". Show a ladder with three distinct steps:
- Step 1 (Novice): Rule‑based, follows instructions, uses example prompts verbatim. Represented as a rectangle with light blue fill (#E6F2FF), labeled "NOVICE" with icon of a person reading a manual.
- Step 2 (Competent): Understands principles, adapts prompts, handles multi‑step tasks. Rectangle with medium blue fill (#99CCFF), labeled "COMPETENT" with icon of a person adjusting settings.
- Step 3 (Proficient): Intuitive, strategic, teaches others, designs novel prompts. Rectangle with dark blue fill (#0056B3), white text, labeled "PROFICIENT" with icon of a person mentoring another.

Arrows point upward between steps. Sidebars list "Typical Behaviors" for each level. Title: "From Novice to Proficient: Building AI Capability Mastery".

Right panel: "Mental Models for AI Interaction". Four overlapping circles (Venn‑style) in a grid:
1. AI as a Thinking Partner – icon: two speech bubbles. Description: "Collaborator that extends your cognitive abilities".
2. Capability Stack – icon: layered blocks. Description: "Layered capabilities from foundation to strategy".
3. Prompt‑as‑Specification – icon: document with magnifying glass. Description: "Prompt as a specification for cognitive process".
4. Iterative Refinement – icon: circular arrows. Description: "AI interaction is a dialogue, not a one‑shot command".

Circles have light fill colors (pastel blue, green, orange, purple). Connections shown with thin lines. Title: "Four Mental Models for Effective AI Use".

Overall layout: grid‑based, clean typography, serious newspaper aesthetic. Use neutral backgrounds, borders in #DDDDDD.
```

**Alt Text**:

```
Left: Skill ladder showing three levels of AI capability mastery: Novice (follows instructions), Competent (adapts prompts), Proficient (teaches others). Right: Four mental models for AI interaction: AI as a Thinking Partner, Capability Stack, Prompt‑as‑Specification, Iterative Refinement, each with a brief description.
```

**Dimensions**: 1200×600.

---

## 4. AI vs Human Strength Comparison Chart

**Purpose**: Compare where AI excels versus where human strengths remain superior across capability categories.

**Visual Description**: A paired bar chart or radar chart showing relative strengths for 6‑8 key capability categories. AI strength bars in blue, human strength bars in teal. Include explanatory annotations.

**Prompt**:

```
Create a newspaper‑style paired bar chart comparing AI and human strengths across six capability categories.

Categories (vertical axis):
1. Factual Information Retrieval
2. Complex Concept Explanation
3. Creative Idea Generation
4. Decision‑Making with Multiple Criteria
5. Emotional Intelligence & Empathy
6. Physical Task Execution

For each category, two horizontal bars:
- AI Strength (blue #0056B3): lengths: 90%, 85%, 70%, 60%, 10%, 5%
- Human Strength (teal #007A87): lengths: 10%, 15%, 30%, 40%, 90%, 95%

Label each bar with percentage. Add icons above each category (e.g., magnifying glass for retrieval, lightbulb for creativity, heart for empathy, hand for physical).

Title: "AI vs Human Strengths: Where Each Excels". Subtitle: "Comparison across six key capability categories". Include a note: "Based on current AI capabilities (2026)". Legend: Blue = AI strength, Teal = Human strength.

Style: Clean, minimal chart. Grid lines in #EEEEEE. Axis labels in sans‑serif. Use a neutral background. Add call‑out boxes for key insights: "AI excels at information‑dense tasks", "Human advantage remains in emotional and physical domains".
```

**Alt Text**:

```
Paired bar chart comparing AI and human strengths across six categories: Factual Information Retrieval (AI 90%, Human 10%), Complex Concept Explanation (AI 85%, Human 15%), Creative Idea Generation (AI 70%, Human 30%), Decision‑Making with Multiple Criteria (AI 60%, Human 40%), Emotional Intelligence & Empathy (AI 10%, Human 90%), Physical Task Execution (AI 5%, Human 95%).
```

**Dimensions**: 1200×800.

---

## 5. Problem Decomposition Flowcharts

**Purpose**: Illustrate the step‑by‑step structured thinking framework for approaching any AI‑assisted task.

**Visual Description**: A linear flowchart with six numbered steps (circles) connected by arrows. Each step includes a brief description and sub‑steps. Cognitive load indicators (low/medium/high) shown as badges.

**Prompt**:

```
Create a linear process diagram showing six steps of problem decomposition for AI tasks.

Step 1 (circle, #0056B3 fill, white number): "Define the Goal". Sub‑steps: What exactly do I want? What does success look like?
Step 2 (circle, #007A87 fill): "Analyze the Cognitive Demand". Sub‑steps: Which domain/capability? What thinking skills are required?
Step 3 (circle, #D35400 fill): "Specify the Prompt". Sub‑steps: Use SPEC framework (Situation, Purpose, Expectations, Constraints).
Step 4 (circle, #007A5E fill): "Execute and Evaluate". Sub‑steps: Run prompt, assess output, identify gaps.
Step 5 (circle, #B35E00 fill): "Iterate and Refine". Sub‑steps: Ask follow‑ups, adjust constraints, consider alternatives.
Step 6 (circle, #B30000 fill): "Reflect and Learn". Sub‑steps: What worked? What could be improved? Document insights.

Connect circles with straight arrows. Below each step, include a small badge indicating cognitive load: Low, Medium, or High (use color coding: green, amber, red). Add icons for each step (target, brain, document, play, refresh, notebook).

Title: "Structured Thinking Framework for AI Tasks". Subtitle: "A six‑step process to decompose problems and use AI effectively". Use a clean grid layout, ample whitespace. Style: editorial infographic, no superfluous decoration.
```

**Alt Text**:

```
Flowchart of six‑step problem decomposition process: 1. Define the Goal, 2. Analyze the Cognitive Demand, 3. Specify the Prompt, 4. Execute and Evaluate, 5. Iterate and Refine, 6. Reflect and Learn. Each step includes sub‑steps and a cognitive load indicator (Low, Medium, High).
```

**Dimensions**: 1400×600.

---

## 6. Heatmaps of AI Strengths

**Purpose**: Show relative AI strength across capabilities and cognitive dimensions using a color‑coded grid.

**Visual Description**: A matrix with capabilities as rows and dimensions (e.g., "Information Processing", "Creativity", "Logical Reasoning", "Emotional Intelligence") as columns. Cells colored from light blue (weak) to dark blue (strong).

**Prompt**:

```
Create a heatmap grid showing AI strength across 12 capabilities and 4 cognitive dimensions.

Rows (capabilities – select 12 from taxonomy, e.g.):
- Explain complex concepts
- Answer factual questions
- Compare concepts
- Brainstorm ideas
- Create outlines
- Generate stories
- Compare options
- Identify root causes
- Improve clarity
- Cooking recipes
- Tell stories
- Goal setting

Columns (cognitive dimensions):
- Information Processing
- Creativity & Divergent Thinking
- Logical & Analytical Reasoning
- Emotional & Social Intelligence

Color each cell based on estimated AI strength (0‑100%). Use a sequential blue gradient from #E6F2FF (weak) to #0056B3 (strong). Add percentage labels in each cell (e.g., 85%, 40%). Use a neutral background, grid lines in #DDDDDD.

Title: "AI Strength Heatmap: Capabilities vs Cognitive Dimensions". Subtitle: "Darker blue indicates higher AI proficiency". Include a color scale legend. Use clean sans‑serif labels, left‑aligned rows, centered columns.

Style: Serious newspaper data visualization, no rounded corners, minimal embellishment.
```

**Alt Text**:

```
Heatmap grid with rows representing AI capabilities (e.g., Explain complex concepts, Brainstorm ideas) and columns representing cognitive dimensions (Information Processing, Creativity, Logical Reasoning, Emotional Intelligence). Cells are shaded blue from light to dark indicating AI strength percentage from weak to strong.
```

**Dimensions**: 1200×1000.

---

## 7. Menu‑Style Grid Visuals

**Purpose**: Display the main navigation menu of the Atlas as a card‑based grid, showing the eight primary starting points.

**Visual Description**: Eight cards arranged in a 4×2 grid, each representing a high‑level goal (Learn, Create, Decide, Improve, Practical, Entertain, Personal, Communicate). Each card includes an icon, title, short description, and example capabilities.

**Prompt**:

```
Create a menu‑style grid of eight cards representing the main entry points of the AI Capability Atlas.

Each card: white background, 1px border #DDDDDD, rounded corners (4px), subtle shadow, 24px padding.

Cards (4 per row on desktop, 2 rows):
1. LEARN OR UNDERSTAND SOMETHING – icon: graduation cap. Description: "Explain concepts, answer questions, compare ideas". Example: Explain complex concepts, Answer factual questions.
2. CREATE SOMETHING NEW – icon: pen tip. Description: "Generate ideas, outlines, stories, dialogue". Example: Brainstorm ideas, Create outlines.
3. MAKE A DECISION OR SOLVE A PROBLEM – icon: checkmark in circle. Description: "Compare options, evaluate pros/cons, prioritize". Example: Compare options, Identify root causes.
4. IMPROVE OR REFINE EXISTING WORK – icon: wrench. Description: "Improve clarity, conciseness, tone, structure". Example: Improve clarity, Improve tone.
5. GET PRACTICAL HELP WITH DAILY TASKS – icon: utensils. Description: "Cooking, DIY, budgeting, planning". Example: Cooking recipes, DIY instructions.
6. HAVE FUN OR BE ENTERTAINED – icon: smiley face. Description: "Stories, jokes, games, creative play". Example: Tell stories, Generate jokes.
7. WORK ON PERSONAL DEVELOPMENT – icon: heart. Description: "Health, fitness, mental wellness, habits". Example: Goal setting, Habit formation.
8. COMMUNICATE OR INTERACT WITH OTHERS – icon: speech bubbles. Description: "Draft messages, respond, practice conversations". Example: Draft messages, Practice conversations.

Each card's icon is in accent color (#0056B3). Title in bold serif, description in small sans‑serif, examples in tiny gray text.

Title above grid: "Where would you like to start?" Subtitle: "Eight entry points to AI capabilities". Layout: clean grid with consistent spacing.

Style: minimalist, authoritative, like a newspaper section index.
```

**Alt Text**:

```
Grid of eight cards representing entry points to AI capabilities: Learn or understand something, Create something new, Make a decision or solve a problem, Improve or refine existing work, Get practical help with daily tasks, Have fun or be entertained, Work on personal development, Communicate or interact with others. Each card includes an icon, brief description, and example capabilities.
```

**Dimensions**: 1200×800.

---

## 8. Layered Ecosystem Maps

**Purpose**: Visualize the AI capability ecosystem as stacked layers of abstraction, showing how domains, categories, capabilities, and use cases interrelate.

**Visual Description**: Four concentric circles or stacked horizontal layers. Innermost layer: "Foundational AI Abilities". Next: "Domains". Next: "Categories". Outer: "Capabilities & Use Cases". Arrows show flow between layers.

**Prompt**:

```
Create a layered ecosystem map showing four levels of AI capability abstraction.

Center: small circle labeled "FOUNDATIONAL AI ABILITIES" with icons for language, vision, reasoning. Background light gray.

First ring (surrounding center): split into four quadrants representing the four Domains: Knowledge & Learning (blue), Creativity & Content (green), Analysis & Problem Solving (orange), Everyday Life (purple). Each quadrant has domain name and icon.

Second ring: divided into 13 segments representing Categories (e.g., Learn New Things, Create Things, Make Decisions, Practical Skills). Each segment placed within its domain quadrant, labeled with category name.

Outer ring: contains small dots representing Capabilities (55 total) and Use Cases (81 total). Dots colored by domain, clustered near their category. Use subtle connecting lines from categories to capability clusters.

Arrows from center outward indicate "increasing specificity". Title: "AI Capability Ecosystem: From Foundations to Specific Use". Subtitle: "Concentric layers show domains, categories, and capabilities". Include a legend for domain colors.

Style: clean, vector‑style, no 3D effects. Use muted colors, thin lines, readable labels.
```

**Alt Text**:

```
Concentric circles showing AI capability ecosystem layers: center is Foundational AI Abilities; first ring shows four Domains (Knowledge & Learning, Creativity & Content, Analysis & Problem Solving, Everyday Life); second ring shows Categories within each domain; outer ring shows dots representing Capabilities and Use Cases. Arrows indicate increasing specificity from center outward.
```

**Dimensions**: 1200×1200 (square).

---

## 9. Skill Ladder Visual (Alternative)

**Purpose**: Show skill progression as a mountain climbing map with base camp, ascent, and summit.

**Visual Description**: A stylized mountain with a winding path. Base camp: "Novice" with foundational skills. Ascent: "Competent" with intermediate skills. Summit: "Proficient" with advanced skills. Waypoints along the path represent milestones.

**Prompt**:

```
Create a mountain‑climbing‑themed skill ladder visualization.

Background: stylized mountain silhouette in light gray (#F0F0F0). A winding path starts at base camp (bottom left) and climbs to summit (top right).

Three major sections along path:
1. BASE CAMP – labeled "NOVICE". Icon: tent. Description: "Rule‑based, follows instructions". List foundational skills: pattern recognition, information retrieval, following examples.
2. ASCENT – labeled "COMPETENT". Icon: hiker with walking stick. Description: "Adapts prompts, handles multi‑step tasks". List intermediate skills: abstraction, synthesis, evaluation.
3. SUMMIT – labeled "PROFICIENT". Icon: flag on peak. Description: "Intuitive, strategic, teaches others". List advanced skills: metacognitive regulation, creative problem solving, teaching.

Waypoints along path with milestone labels: "First successful prompt", "Adapts to new context", "Designs original prompts", "Teaches others". Use dotted lines to connect waypoints to skill lists.

Title: "Climbing the Skill Mountain: From Novice to Proficient". Subtitle: "Progressive mastery of AI capabilities". Use a serious but metaphorical style—no cartoonish elements. Color accents: blue for novice, teal for competent, dark blue for proficient.

Style: editorial infographic with clean lines, minimal detail, newspaper‑appropriate illustration.
```

**Alt Text**:

```
Mountain climbing map showing skill progression from Novice (base camp) to Competent (ascent) to Proficient (summit). Path winds up mountain with waypoints representing milestones. Each section lists characteristic skills: Novice – pattern recognition, following instructions; Competent – abstraction, synthesis; Proficient – metacognitive regulation, teaching.
```

**Dimensions**: 1200×900.

---

## Implementation Notes

### Generating Images
1. Use vector graphics software (Adobe Illustrator, Figma, Inkscape) or AI image generation tools (DALL‑E, Midjourney, Stable Diffusion) with the provided prompts.
2. Adjust colors to match the specified palette (`#0056B3`, `#007A87`, `#D35400`, etc.).
3. Ensure typography matches the serious newspaper aesthetic (serif for headlines, sans‑serif for labels).
4. Export as SVG for scalability, PNG for fallback.

### Accessibility
- Provide the alt text exactly as written for each image.
- Ensure color contrast meets WCAG AA standards.
- If using interactive visuals, provide keyboard navigation and ARIA labels.

### File Naming
Name files according to the following convention:
- `taxonomy-map.svg`
- `decision-tree.svg`
- `cognitive-model.svg`
- `ai-vs-human-strengths.svg`
- `problem-decomposition.svg`
- `heatmap.svg`
- `menu-grid.svg`
- `ecosystem-map.svg`
- `skill-ladder.svg`

---

*Image Prompts v1.0 – The AI Capability Atlas – Designed for serious investigative newspaper aesthetic.*