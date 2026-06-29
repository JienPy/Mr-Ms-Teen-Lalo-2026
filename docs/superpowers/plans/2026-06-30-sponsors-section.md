# Sponsors Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public sponsors section and an admin Sponsors tab for managing sponsor logos/details.

**Architecture:** Sponsors live in a new Supabase `sponsors` table queried by the public page and managed from the existing admin dashboard. The public section hides itself when no visible sponsors exist.

**Tech Stack:** TanStack Start, React Query, Supabase, Tailwind, Framer Motion.

---

### Task 1: Database And Query

**Files:**
- Create: `supabase/migrations/20260630010000_sponsors.sql`
- Modify: `src/lib/queries.ts`

- [x] Add a `sponsors` table with `name`, `tier`, `logo_url`, `description`, `link_url`, `sort_order`, `is_visible`.
- [x] Add a `sponsorsQuery` that fetches visible sponsors ordered by tier and sort order.
- [x] Apply the SQL in Supabase SQL editor.

### Task 2: Public Sponsors Section

**Files:**
- Create: `src/components/site/Sponsors.tsx`
- Modify: `src/routes/index.tsx`
- Modify: `src/components/site/Navbar.tsx`

- [x] Render sponsors grouped by tier.
- [x] Hide the section when there are no visible sponsors.
- [x] Add `Sponsors` to the public nav and place section after tickets.

### Task 3: Admin Sponsors Tab

**Files:**
- Modify: `src/routes/_authenticated/admin.tsx`

- [x] Add `Sponsors` to admin tabs.
- [x] Create sponsor list, add/edit modal, image upload, tier select, sort order, visible toggle, delete action.
- [x] Invalidate public and admin sponsor queries after mutations.

### Task 4: Verification

- [x] Run `npm run build`.
- [x] Verify the public site still loads.
- [x] Verify the Sponsors tab is present in admin UI code and public section hides when empty.
