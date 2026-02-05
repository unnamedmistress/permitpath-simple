# AGENTS.md - Intelligent Task Routing

## Overview

This workspace has 11 specialized skills for different software development stages. When you receive a task, you should:

1. Identify the stage (vision, prd, architecture, build, qa, deployment)
2. Read the appropriate SKILL.md from /home/node/.openclaw/workspace/skills/
3. Follow that skill's instructions
4. Optionally spawn a subagent with the recommended model

## Available Skills

### 1. **routing_conductor** (skills/routing_conductor/SKILL.md)
- **Purpose:** Analyze tasks and route to appropriate stage/model
- **When to use:** Complex tasks requiring stage classification
- **Model:** gpt-4o-mini

### 2. **security_validator** (skills/security_validator/SKILL.md)
- **Purpose:** Validate security of proposed actions before execution
- **When to use:** Before running commands that access secrets, networks, or destructive operations
- **Model:** claude-sonnet-4-5

### 3. **visionary_agent** (skills/visionary_agent/SKILL.md)
- **Purpose:** Product vision and problem framing
- **When to use:** Understanding user needs, defining product goals
- **Model:** gpt-4o

### 4. **critic_agent** (skills/critic_agent/SKILL.md)
- **Purpose:** Stress-test ideas and identify risks
- **When to use:** After vision/PRD to find edge cases and assumptions
- **Model:** claude-sonnet-4-5

### 5. **prd_writer** (skills/prd_writer/SKILL.md)
- **Purpose:** Write structured product requirements
- **When to use:** Documenting features, requirements, use cases
- **Model:** kimi-k2.5 (long context)

### 6. **architect_agent** (skills/architect_agent/SKILL.md)
- **Purpose:** System design and architecture decisions
- **When to use:** Designing systems, evaluating trade-offs
- **Model:** claude-sonnet-4-5

### 7. **planner_agent** (skills/planner_agent/SKILL.md)
- **Purpose:** Break work into actionable tasks
- **When to use:** Converting architecture/PRD into implementation plan
- **Model:** gpt-4o

### 8. **builder_agent** (skills/builder_agent/SKILL.md)
- **Purpose:** Implement code according to specs
- **When to use:** Writing CRUD, APIs, UI components
- **Model:** gpt-4o (or codex for simple tasks)

### 9. **qa_auditor** (skills/qa_auditor/SKILL.md)
- **Purpose:** Security and quality audits
- **When to use:** Reviewing code for vulnerabilities, correctness
- **Model:** claude-sonnet-4-5

### 10. **fixer_agent** (skills/fixer_agent/SKILL.md)
- **Purpose:** Fix issues identified by QA
- **When to use:** Correcting bugs and security issues
- **Model:** gpt-4o

### 11. **deployment_agent** (skills/deployment_agent/SKILL.md)
- **Purpose:** Deployment configs and CI/CD
- **When to use:** Setting up deployment pipelines
- **Model:** gpt-4o-mini

## How to Use

### Simple Tasks
For straightforward requests, just follow the appropriate skill directly:

\\\
User:  Review this auth code for security issues
 You: Read skills/qa_auditor/SKILL.md
 Follow its instructions for security review
\\\

### Complex Multi-Stage Tasks
For complex work, spawn subagents with appropriate models:

\\\javascript
// Example: Architecture review
sessions_spawn({
  task: [ARCHITECTURE] Design microservices for e-commerce platform,
  agentId: main,
  model: anthropic/claude-sonnet-4-5,
  extraSystemPrompt: Follow skills/architect_agent/SKILL.md
})
\\\

### Routing Pattern
1. **Analyze:** Determine stage (vision/prd/architecture/build/qa/deployment)
2. **Read:** Load the appropriate SKILL.md
3. **Execute:** Follow the skill's instructions
4. **Spawn:** If task is complex, spawn subagent with recommended model

## Model Recommendations

| Stage | Model | Rationale |
|-------|-------|-----------|
| Vision/Architecture/QA | claude-sonnet-4-5 | Deep reasoning, security |
| PRD/Planning | kimi-k2.5 | Long context synthesis |
| Build | gpt-4o | Complex algorithms |
| Routing/Deployment | gpt-4o-mini | Simple orchestration |

## Security Rules

**ALWAYS** read skills/security_validator/SKILL.md before:
- Running shell commands with sensitive data
- Accessing .env, .ssh, API keys
- Making network requests to non-whitelisted domains
- Executing destructive operations (rm, chmod, DELETE)

## Examples

### Example 1: Product Feature Request
\\\
User: I want to add user authentication

Agent workflow:
1. Read skills/visionary_agent/SKILL.md
2. Clarify user needs and goals
3. Read skills/architect_agent/ SKILL.md
4. Propose architecture (session-based vs JWT vs OAuth)
5. Read skills/security_validator/SKILL.md
6. Identify security considerations
7. Read skills/builder_agent/SKILL.md
8. Implement with secure patterns
\\\

### Example 2: Code Review
\\\
User: Review this payment processing code

Agent workflow:
1. Read skills/security_validator/SKILL.md
2. Check for PCI compliance, injection risks
3. Read skills/qa_auditor/SKILL.md
4. Review error handling, edge cases
5. Provide P0-P3 prioritized findings
\\\

### Example 3: Deployment Setup
\\\
User: Set up CI/CD for this Next.js app

Agent workflow:
1. Read skills/deployment_agent/SKILL.md
2. Generate Vercel/Railway config
3. Read skills/security_validator/SKILL.md
4. Verify no secrets in configs
5. Provide deployment instructions
\\\

## Remember

- **Skills are guidance, not agents** - You read them and follow their instructions
- **One skill at a time** - Don't try to follow multiple skills simultaneously
- **Security first** - Always validate security before execution
- **Spawn when needed** - Use sessions_spawn for complex, long-running work with appropriate model overrides

---

**Current session model:** openrouter/moonshotai/kimi-k2.5
**Available for spawning:** anthropic/claude-sonnet-4-5, openai/gpt-4o, openai/gpt-4o-mini
