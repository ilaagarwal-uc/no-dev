---
inclusion: auto
---

# Wall Decor Visualizer - Project Instructions

## Overview

This steering file contains persistent instructions for the Wall Decor Visualizer project. It applies to all interactions within this project context.

---

## Prompt Logging Instruction

**IMPORTANT: Every time the user writes a prompt in this project, you MUST append it to `.kiro/specs/wall-decor-visualizer/user-prompts.md`**

### How to Log Prompts

1. After the user submits a prompt, add it to the user-prompts.md file
2. Format:
   - Add a new section with the prompt number (increment from previous)
   - Include the exact prompt text as written by the user
   - Add timestamp if relevant
   - Add any context or related requirements
   - Keep the summary section updated

3. Example format:
```markdown
**Prompt [N]:**
> [exact user prompt text]

**Context:** [any relevant context]
**Related to:** [which feature/requirement]
```

### When to Log

- Log every substantive prompt from the user
- Include clarifications and follow-up questions
- Include feature requests and technical decisions
- Include setup and deployment instructions
- Skip acknowledgments like "understood" or "yes"

### File Location

- File: `.kiro/specs/wall-decor-visualizer/user-prompts.md`
- Keep it updated throughout the project lifecycle
- This becomes the source of truth for user requirements

---

## Project Context

**Project Name:** Wall Decor Visualizer

**Current Phase:** Design & Setup

**Key Files:**
- Requirements: `.kiro/specs/wall-decor-visualizer/requirements.md`
- Design: `.kiro/specs/wall-decor-visualizer/design.md`
- Setup: `.kiro/specs/wall-decor-visualizer/setup.md`
- User Prompts: `.kiro/specs/wall-decor-visualizer/user-prompts.md`
- Config: `.kiro/specs/wall-decor-visualizer/.config.kiro`

**Tech Stack:**
- Frontend: React + TypeScript
- Backend: Node.js + Express
- Database: MongoDB
- Storage: GCP Cloud Storage
- LLM: Google Gemini API
- 3D: Blender (headless)

**Demo Hosting:**
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Storage: GCP (free tier)

---

## Important Notes

- This is a requirements-first workflow project
- After demo validation, will migrate to enterprise microservice architecture
- All user prompts are valuable for future reference and traceability
- Keep the user-prompts.md file as the single source of truth for user requirements
