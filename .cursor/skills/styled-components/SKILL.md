---
name: styled-components
description: Apply Refresherspace styled-components conventions — Style Overrides ordering, theme tokens, and transient props. Use when writing or editing React components, pages, or UI primitives in this project.
---

# Styled-components (Refresherspace)

## When to use

Use this skill when adding or changing UI in `src/` that involves styled-components, theme tokens, or layout styling.

## File layout

For pages and feature components:

1. Imports (grouped per project rules)
2. Component implementation (arrow function)
3. Default export (pages)
4. `// Style Overrides` section with `styled.*` definitions **below** the component

Do not put styled definitions above the component in pages/feature files. UI primitives in `src/components/ui/` may keep styled definitions near their exports.

## Theme usage

- Prefer `theme.colors.*`, `theme.spacing.*`, `theme.fontSizes.*`, `theme.radii.*`, `theme.shadows.*`, `theme.breakpoints.*`.
- Avoid hard-coded hex in components unless adding a new token to `src/styles/theme.ts`.
- Transient props for styled-only values: `$variant`, `$size`, `$align`, etc.

## States

- Hover: `filter: brightness(0.92)` or a soft surface change from the theme
- Disabled: `opacity: 0.5` and `cursor: not-allowed`
- Focus: use theme focus shadow; never leave raw browser outlines unstyled without a visible alternative

## Checklist

- [ ] No inline `style` prop
- [ ] Style Overrides below the component (feature/pages)
- [ ] Theme tokens used instead of magic values
- [ ] `$` prefix on transient props
- [ ] Import groups labeled when local imports exist
