# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This repo is a collection of Claude Code skills, organized by topic. Each top-level directory is a skill collection (a group of related skills). Skills follow the [Agent Skills](https://agentskills.io) open standard.

## Repo Layout

```
<collection>/
├── <skill-name>/
│   ├── SKILL.md          # Required: instructions with YAML frontmatter
│   ├── reference/        # Optional: detailed reference docs
│   ├── examples/         # Optional: example outputs
│   ├── templates/        # Optional: templates for Claude to fill in
│   └── scripts/          # Optional: executable helper scripts
├── <another-skill>/
│   └── SKILL.md
└── ...                   # Any shared files for the collection
```

## SKILL.md Format

```yaml
---
name: skill-name              # Lowercase, hyphens, max 64 chars. Defaults to directory name.
description: What it does      # 1-2 sentences. Claude uses this to decide when to auto-load.
argument-hint: [arg1] [arg2]   # Shown during autocomplete
disable-model-invocation: true # true = only users can invoke (not in Claude's context)
user-invocable: false          # false = only Claude can invoke (hidden from / menu)
allowed-tools: Read, Grep      # Tools auto-approved while skill is active
context: fork                  # Run in isolated subagent context
agent: Explore                 # Subagent type when context: fork (Explore, Plan, general-purpose)
model: sonnet                  # Override model (sonnet, opus, haiku)
effort: high                   # Override effort (low, medium, high, max)
paths: "src/**/*.ts"           # Auto-activate only for matching file patterns
shell: bash                    # Shell for !`command` blocks (bash or powershell)
hooks:                         # Lifecycle hooks scoped to this skill
  PreToolUse: [...]
---

Markdown instructions go here. Use $ARGUMENTS for all args, $0/$1 for positional args.
```

All frontmatter fields are optional. Only `description` is strongly recommended.

## String Substitutions

- `$ARGUMENTS` — all args passed when invoking the skill
- `$ARGUMENTS[N]` or `$N` — positional arg (0-indexed)
- `${CLAUDE_SESSION_ID}` — current session ID
- `${CLAUDE_SKILL_DIR}` — path to the skill's directory
- `` !`command` `` — inject live shell output into the prompt (preprocessing, not executed by Claude)

## Invocation Control

| Config | User can invoke | Claude can invoke |
|--------|:-:|:-:|
| (default) | Yes | Yes |
| `disable-model-invocation: true` | Yes | No |
| `user-invocable: false` | No | Yes |

## Installation

To use skills from this repo, symlink or copy individual skill directories into one of these locations:

| Location | Scope |
|----------|-------|
| `~/.claude/skills/<name>/SKILL.md` | Personal (all projects) |
| `.claude/skills/<name>/SKILL.md` | Project-specific (committed to repo) |

Higher-priority locations (personal) override lower-priority (project) when names collide.

## Writing Good Skills

- Keep `SKILL.md` under 500 lines; move detailed reference to supporting files
- Write descriptions with action verbs and context: "Generate type-safe API clients from OpenAPI specs"
- Reference supporting files with relative links: `[see reference](reference/api-spec.md)`
- Use `context: fork` for research/review tasks that produce verbose output
- Use `allowed-tools` to auto-approve safe tools and reduce permission prompts
- Use `disable-model-invocation: true` for skills with side effects (deploy, send messages)
- Include "ultrathink" in content to enable extended thinking mode
