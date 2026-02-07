---
name: audience-empathy
description: Persona-based empathy simulator that surfaces conflicts and consensus in user needs.
---

# Audience Empathy Simulator - Technical Documentation

## Overview
The Audience Empathy Simulator spawns 4 distinct user personas who independently evaluate your app concept. Unlike traditional UX testing, this skill deliberately surfaces conflicts between different user needs.

## Core Innovation
**Conflict Detection**: The orchestrator explicitly looks for irreconcilable tradeoffs where one persona's ideal experience directly contradicts another's.

## The 4 Personas

### 1. The Skeptic
**Psychology**: Burned by bad software, trusts nothing  
**Behavior**: Reads privacy policies, tries to break features, questions all claims  
**Finds**: Security holes, overpromises, edge cases, legal issues  
**Conflicts with**: Speed-Runner (wants warnings vs skips warnings)

### 2. The Power User  
**Psychology**: Lives in this software category, demands efficiency  
**Behavior**: Skips onboarding, uses keyboard shortcuts, wants bulk actions  
**Finds**: Missing power features, inefficient workflows, baby-proofing  
**Conflicts with**: Anxious Beginner (wants complexity vs needs simplicity)

### 3. The Anxious Beginner
**Psychology**: New to category, fears irreversible mistakes  
**Behavior**: Reads everything, hovers before clicking, seeks undo buttons  
**Finds**: Missing explanations, scary actions without warnings, jargon  
**Conflicts with**: Power User & Speed-Runner (needs handholding vs wants freedom)

### 4. The Speed-Runner
**Psychology**: Goal-focused, learns by trial-and-error  
**Behavior**: Skips tutorials, ignores warnings, clicks first asks later  
**Finds**: Forced onboarding, confirmation dialogs, slow defaults  
**Conflicts with**: Skeptic & Beginner (wants instant access vs needs safety)

## Workflow Stages

### Phase 1: Independent Testing (Parallel)
Each persona receives the app concept and "uses" it independently for 4 turns max.

**Turn Structure:**
1. Initial impression
2. Try primary action
3. Explore edge cases
4. Final assessment

**Output**: Individual logs at `PERSONA_LOGS/{persona_name}.md`

### Phase 2: Conflict Detection (Sequential)
Orchestrator analyzes all 4 logs looking for:
- **Critical Conflicts**: Features where personas want opposite things
- **Universal Delight**: Features all personas loved
- **Universal Friction**: Issues that bothered everyone

**Conflict Types:**
- **Feature Presence**: One wants it, another wants it removed
- **Default Behavior**: Opposite preferred defaults
- **Information Density**: Too much vs too little text/options
- **Pacing**: Too fast vs too slow
- **Safety Rails**: Too restrictive vs too permissive

### Phase 3: Synthesis
Orchestrator produces `EMPATHY_REPORT.md` with:
1. Consensus findings (all personas agree)
2. Critical conflicts with specific quotes
3. Actionable recommendations that balance needs

## Output Format Examples

### Example Conflict
```markdown
## Critical Conflict: Onboarding Tutorial

### Positions
- **Anxious Beginner**: "I need to see how this works before I start. Where's the tutorial?"
- **Speed-Runner**: "If this forces me through a multi-step tutorial I'm closing the app."

### The Tradeoff
Cannot satisfy both. Must choose one of:
1. **Forced tutorial** - Serves beginners, loses speed-runners
2. **Optional tutorial** - Serves speed-runners, beginners might miss critical features  
3. **Contextual hints** - Middle ground but requires more design work

### Recommendation
Optional tutorial with:
- Persistent help icon (always accessible)
- Smart detection of struggle (offer help if stuck 30s)
- Progressive disclosure (show advanced features later)

**Cost**: +3 days design, +5 days implementation
```

## Configuration

### Turn Limits
- **4 turns per persona**: Prevents endless exploration
- **3 iteration cycles max**: Forces decision-making

### Conflict Detection
- Enabled by default
- Looks for opposing keywords: "too much/too little", "too fast/too slow"
- Surfaces minimum 2 conflicts per simulation

### Quality Gates
- Each persona must cite specific examples (no abstract complaints)
- Conflicts must be irreconcilable (not fixable with "make it better")
- Recommendations must be actionable (not principles)

## Success Criteria

### Good Simulation
- ✅ Identifies 2-4 critical conflicts
- ✅ All personas provide specific examples
- ✅ Recommendations include tradeoff acknowledgment
- ✅ Some consensus findings (not everything is conflict)

### Poor Simulation  
- ❌ All personas agree on everything
- ❌ Vague feedback ("confusing", "unclear")
- ❌ No actionable recommendations
- ❌ Conflicts are trivially resolvable

## Cost & Time

### Typical Simulation
- **Time**: 15-20 minutes
- **Cost**: $2-4 depending on concept complexity
- **Turns**: ~12-16 total (4 personas × 3-4 turns each)

### Complex Simulation (with iteration)
- **Time**: 30-45 minutes  
- **Cost**: $6-10
- **Cycles**: 2-3 iterations on specific conflicts

## Best Practices

### DO
- Provide concrete app concepts (not abstract ideas)
- Include target audience context
- Review conflicts before building anything
- Use conflicts to inform design priorities

### DON'T
- Test fully-built apps (use real users instead)
- Expect all personas to be satisfied
- Ignore conflicts in favor of "best practices"
- Ask personas to reach consensus (conflicts are the value)

## Integration with Other Skills

### Pairs Well With
- **Studio Beast**: Use empathy report as input to UX Architect agent
- **Tech Lead Review**: Surface technical constraints that affect persona conflicts
- **Accessibility Audit**: Anxious Beginner findings often align with a11y needs

### Sequence
1. **Empathy Simulator** - Identify conflicts
2. **Product Strategy** - Choose which personas to prioritize
3. **UX Design** - Design solutions for critical conflicts
4. **Implementation** - Build with explicit tradeoffs documented

## Version History
- **1.0.0** (Feb 2026): Initial release with 4 personas and conflict detection
