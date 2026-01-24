# CLAUDE.md - AI Assistant Guide for 2026-PLAN

> **Last Updated**: 2026-01-24
> **Repository**: DongsooJung/2026-PLAN
> **Status**: Initial Setup Phase

## Table of Contents

1. [Repository Overview](#repository-overview)
2. [Current State](#current-state)
3. [Development Workflow](#development-workflow)
4. [Codebase Structure](#codebase-structure)
5. [Coding Conventions](#coding-conventions)
6. [Git Workflow](#git-workflow)
7. [AI Assistant Guidelines](#ai-assistant-guidelines)
8. [Common Tasks](#common-tasks)
9. [Future Roadmap](#future-roadmap)

---

## Repository Overview

### Purpose
This repository serves as a planning and development space for 2026 initiatives. As the project evolves, this section should be updated to reflect the specific goals and objectives.

### Current Phase
**Initial Setup** - Repository is in early stages with minimal structure.

### Key Stakeholders
- Primary maintainer: DongsooJung
- AI assistants: Claude (via Claude Code CLI)

---

## Current State

### Repository Contents
```
2026-PLAN/
├── .git/
├── .gitattributes
└── CLAUDE.md (this file)
```

### Technology Stack
*To be determined as project develops*

### Dependencies
*To be added as project requirements are established*

---

## Development Workflow

### Branch Strategy

#### Feature Branches
- All AI assistant work should be done on feature branches
- Branch naming convention: `claude/claude-md-<session-id>`
- Current development branch: `claude/claude-md-mks7n9l3hwc8abyd-XcbWI`

#### Main Branch
- Protected branch for stable code
- Requires pull request for merging
- Should maintain working state at all times

### Workflow Steps

1. **Planning Phase**
   - Use TodoWrite tool to break down tasks
   - Identify files that need to be modified or created
   - Plan implementation approach

2. **Implementation Phase**
   - Make changes on designated feature branch
   - Follow coding conventions (see below)
   - Test changes before committing

3. **Review Phase**
   - Commit changes with descriptive messages
   - Push to feature branch
   - Create pull request for review

---

## Codebase Structure

### Directory Organization
*To be established as project structure develops*

```
Suggested structure:
├── src/           # Source code
├── tests/         # Test files
├── docs/          # Documentation
├── config/        # Configuration files
└── scripts/       # Build and utility scripts
```

### File Naming Conventions
*To be defined based on project language/framework*

- Use clear, descriptive names
- Follow language-specific conventions (camelCase, snake_case, etc.)
- Avoid abbreviations unless widely understood

---

## Coding Conventions

### General Principles

1. **Simplicity First**
   - Don't over-engineer solutions
   - Implement only what's requested
   - Avoid premature abstractions

2. **Code Quality**
   - Write self-documenting code
   - Add comments only where logic isn't self-evident
   - Remove unused code completely (no comments like "// removed")

3. **Security**
   - Validate at system boundaries (user input, external APIs)
   - Avoid common vulnerabilities (XSS, SQL injection, command injection)
   - Don't add unnecessary error handling for impossible scenarios

4. **Testing**
   - Write tests for new functionality
   - Ensure tests pass before committing
   - Update tests when modifying existing code

### Language-Specific Guidelines
*To be added as project languages are chosen*

---

## Git Workflow

### Commit Messages

Follow conventional commit format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Test additions/modifications
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add user authentication system

Implements JWT-based authentication with refresh tokens.
Includes login, logout, and token refresh endpoints.

fix(api): resolve race condition in concurrent requests

refactor(utils): simplify date formatting logic

docs: update CLAUDE.md with current project structure
```

### Commit Best Practices

1. **Make Atomic Commits**
   - One logical change per commit
   - Should be reversible independently

2. **Write Meaningful Messages**
   - Focus on "why" not just "what"
   - Reference issues/PRs when relevant

3. **Before Committing**
   - Review `git status` for untracked files
   - Review `git diff` for changes
   - Ensure tests pass
   - Verify no secrets or credentials included

### Push Protocol

```bash
# Always use -u flag for feature branches
git push -u origin <branch-name>

# Branch must start with 'claude/' and end with session ID
# Example: claude/claude-md-mks7n9l3hwc8abyd-XcbWI
```

**Network Failure Handling:**
- Retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s)
- Apply to both push and fetch/pull operations

### Pull Request Guidelines

1. **Before Creating PR**
   - Ensure all commits are pushed
   - Run full test suite
   - Review all changes

2. **PR Description Should Include**
   - Summary of changes (1-3 bullet points)
   - Test plan with checklist
   - Any breaking changes
   - Related issues/references

3. **PR Title Format**
   - Clear, descriptive summary
   - Follow commit message conventions

---

## AI Assistant Guidelines

### Tool Usage Priorities

1. **File Operations**
   - Use `Read` tool instead of `cat/head/tail`
   - Use `Edit` tool instead of `sed/awk`
   - Use `Write` tool instead of `echo >` or heredocs
   - Reserve Bash for actual terminal operations

2. **Search Operations**
   - Use `Glob` for file pattern matching
   - Use `Grep` for content search
   - Use Task tool with `Explore` agent for codebase exploration

3. **Task Management**
   - ALWAYS use `TodoWrite` for multi-step tasks
   - Mark tasks in_progress before starting
   - Mark completed immediately after finishing
   - Keep only ONE task in_progress at a time

### Best Practices

1. **Read Before Modify**
   - NEVER propose changes to unread files
   - Understand existing code first
   - Check for related code that might be affected

2. **Parallel Tool Calls**
   - Execute independent operations in parallel
   - Single message with multiple tool calls when possible
   - Sequential only when dependencies exist

3. **Context Management**
   - Use Task tool for exploratory work to reduce context
   - Reference code locations as `file_path:line_number`
   - Keep responses concise and focused

4. **Error Handling**
   - If commit/push fails, fix and retry
   - Never mark tasks complete if errors occurred
   - Create new tasks for discovered blockers

### Communication Style

- Short, concise responses
- Use GitHub-flavored markdown
- No emojis unless requested
- Output text for communication, not bash echo
- Focus on facts over validation

---

## Common Tasks

### Starting New Feature

```bash
# 1. Create feature branch
git checkout -b claude/feature-name-<session-id>

# 2. Plan work using TodoWrite tool

# 3. Implement changes

# 4. Commit and push
git add <files>
git commit -m "feat: description"
git push -u origin claude/feature-name-<session-id>

# 5. Create pull request
gh pr create --title "Feature: Description" --body "$(cat <<'EOF'
## Summary
- Change 1
- Change 2

## Test plan
- [ ] Test item 1
- [ ] Test item 2
EOF
)"
```

### Bug Fix Workflow

```bash
# 1. Reproduce the bug
# 2. Identify root cause
# 3. Create fix
# 4. Verify fix resolves issue
# 5. Commit with descriptive message
git commit -m "fix(component): resolve issue description"
```

### Updating Documentation

```bash
# Always keep CLAUDE.md in sync with codebase
git commit -m "docs: update CLAUDE.md with recent changes"
```

---

## Future Roadmap

### Phase 1: Project Initialization
- [ ] Define project purpose and goals
- [ ] Establish technology stack
- [ ] Set up initial project structure
- [ ] Configure development environment
- [ ] Add linting and formatting tools

### Phase 2: Core Development
- [ ] Implement core functionality
- [ ] Set up testing framework
- [ ] Add CI/CD pipeline
- [ ] Create documentation

### Phase 3: Enhancement
- [ ] Performance optimization
- [ ] Additional features
- [ ] Comprehensive testing
- [ ] Production deployment

### Ongoing Maintenance
- [ ] Keep dependencies updated
- [ ] Monitor security vulnerabilities
- [ ] Refactor as needed
- [ ] Update documentation

---

## Maintenance Notes

### This Document Should Be Updated When:

- [ ] Project structure changes significantly
- [ ] New technologies/frameworks are adopted
- [ ] Coding conventions are established or modified
- [ ] New development processes are introduced
- [ ] Common patterns or solutions are identified
- [ ] Build or deployment processes change

### Review Schedule
- Monthly review recommended during active development
- Update version/date at top of file with each change
- Keep accurate reflection of current project state

---

## Questions or Issues?

For questions about this repository or suggested improvements to this guide:
- Create an issue in the repository
- Tag relevant maintainers
- Provide specific examples or use cases

---

**Note for AI Assistants**: This document is your primary reference for understanding and working with this codebase. Always read this file first when starting a new session. Keep it updated as you learn more about the project's conventions and structure.
