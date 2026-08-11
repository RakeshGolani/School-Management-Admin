# AGENTS.md — School-Management-Admin Rules

## Architectural Guidelines
- Role: SaaS Super Admin Dashboard for Managing Schools, Subscriptions, System Settings, & Billing Invoices.
- Framework: Next.js App Router (React).
- UI Components: Use `@/components/ui/` design system components for consistent tabular & modal management.
- Backend API Integration: Server actions in `src/actions/` communicating with SaaS Backend services.
- UI Pointer Rule: All clickable elements (`button`, `a`, `select`, `[role="button"]`, checkboxes, radios) MUST display `cursor: pointer` on hover.
- Tooltip Rule: All key action buttons, table row actions (`View`, `Edit`, `Delete`), and status toggle controls MUST be wrapped with the `@/components/ui/Tooltip` component for clear user guidance.
- Environment URL Rule: Never hardcode `http://localhost:...` endpoints directly in fetch/axios requests or image source strings. Always use dynamic environment variables (`process.env.NEXT_PUBLIC_BASE_URL` / `process.env.NEXT_PUBLIC_API_URL`) with fallback defaults.

## Token Efficiency Rules
1. Inspect files with `view_file` targeting line ranges to conserve context tokens.
2. Edit target code using `replace_file_content` without rewriting entire components.
3. Search for symbols with `grep_search` before modifying code.
