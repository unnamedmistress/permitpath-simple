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
