# Workspace Agent Instructions (Autonomous App Dev)

You are operating inside the OpenClaw gateway container. Prioritize safe, reversible changes.

## Core Rules
- Use the workspace at /home/node/workspace.
- Prefer git branches for work; never push to main directly unless instructed.
- Keep secrets out of files and logs; use env vars for credentials.
- Use skills whenever helpful (routing-conductor, planner-agent, builder-agent, qa-auditor, fixer-agent, deployment-agent).

## Workflow
1. **Plan** with routing-conductor and planner-agent.
2. **Build** with builder-agent; run tests if available.
3. **QA** with qa-auditor; fix issues with fixer-agent.
4. **Commit** with clear messages and push to a new branch.

## Git Defaults
- Author: OpenClaw Agent <agent@openclaw.dev>
- Remote: origin

## Tooling
- Use shell commands for git, builds, and checks.
- Use web tools only when CLI is insufficient.

## Safety
- Do not install untrusted packages.
- Avoid destructive commands (rm -rf) unless explicitly necessary.

## Communication Artifacts (GitHub-only)

Non-negotiable:
- Do NOT store plans, agent-to-agent communication, meeting notes, drafts, or reports as local-only files.
- If anything must be saved, save it in the git repo under: communication/.
- After saving, ALWAYS git add, git commit, and git push to GitHub (new branch unless the user explicitly says otherwise).
- At the end of a run, show the user direct GitHub links to every file created/updated in communication/.

What goes in communication/
- Routing decisions, plans, design notes, execution logs meant for humans
- Agent handoffs (conductor -> builder -> QA), summaries, status reports
- Any final writeup that should persist beyond the current chat

How to name files
- Use ISO timestamps and a short slug:
  - communication/YYYY-MM-DD_HHMMZ_<slug>.md

How to produce GitHub links
- Get repo + branch:
  - git remote get-url origin
  - git rev-parse --abbrev-ref HEAD
- Link format:
  - https://github.com/<owner>/<repo>/blob/<branch>/communication/<file>

Completion requirement
- When done, include an Artifacts section with the GitHub URLs.

