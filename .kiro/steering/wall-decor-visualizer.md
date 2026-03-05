---
inclusion: auto
description: Global setup rules
---

# Steering - Auto-Loaded Rules

This steering file is automatically loaded for all interactions. It references the comprehensive global rules document and provides quick reminders.

## Reference Document

For complete DDD architecture rules, see: `.kiro/specs/wall-decor-visualizer/DDD_RULES_REFERENCE.md`

For complete testing-stratergy rules, see: `.kiro/specs/wall-decor-visualizer/testing-quality.md`

For complete UI design rules, see: `.kiro/specs/wall-decor-visualizer/ui_design.md`

## Quick Reminders

### Critical Rules to Remember

1. **src/ is SACRED**: Only `data-service/`, `page-service/`, and root files allowed
2. **data-service MUST have schema files**: Every domain needs `{domain}_schema.ts`
3. **page-service NO schema files**: Only `index.ts` and optional `interface.ts`
4. **Components are FLAT**: No nested component folders in page domains
5. **Errors in application layer**: `application/errors.ts` for each service
6. **NO validators folder**: Validation logic goes in domain layer
7. **Type separation**: Domain types ≠ Application types
8. **NO generic files**: NO `helpers.ts`, `utils.ts`, `manager.ts`

### When Creating Files

- **Folders**: Always kebab-case
- **API files**: `{feature}.api.ts`
- **Schema files**: `{domain}_schema.ts` (data-service only)
- **Domain logic**: `index.ts`
- **Styles**: `{component}.module.css`
- **Validation**: In domain `index.ts`, NOT separate validators folder

### Import Rules

✅ **Allowed**:
- Own domain logic
- Own application types
- Feature-specific utilities
- page-service can import from data-service

❌ **Forbidden**:
- Domain types in application layer
- Cross-domain imports in same service
- Generic utility files
- Circular imports

---

## When in Doubt

Always refer to `.kiro/specs/wall-decor-visualizer/DDD_RULES_REFERENCE.md` for complete rules and examples.
