# Pageant Public Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the public page and admin UI for real pageant data, hidden empty public sections, scheduled announcements, candidate cards, ticket tracking, and percentage-only standings.

**Architecture:** Keep the public site query-driven from Supabase, using existing React/TanStack components. Add focused schema fields and RPC updates for candidates, scheduled announcements, and 24-rank public standings. Keep admin-only raw ticket counts in the admin dashboard.

**Tech Stack:** React, TanStack Router/Start, Supabase, Tailwind CSS, Vite.

---

### Task 1: Assets And Public Navigation

**Files:**
- Modify: `src/assets/*`
- Modify: `src/components/site/Navbar.tsx`
- Modify: `src/components/site/Footer.tsx`
- Modify: `src/components/site/Hero.tsx`
- Modify: `src/components/site/Tickets.tsx`

- [ ] Copy the real logo, emblem, and ticket artwork into `src/assets`.
- [ ] Remove the top navbar Admin link.
- [ ] Keep a subtle footer admin link.
- [ ] Update hero and ticket image usage.

### Task 2: Schema And Seed Data

**Files:**
- Add: `supabase/migrations/20260630003000_public_admin_updates.sql`
- Modify: Supabase database via SQL Editor

- [ ] Add candidate fields: `card_order`, `belief`, and maintain `photo_url`.
- [ ] Add announcement fields: `is_hidden`, `show_from`, `show_until`.
- [ ] Ensure `ticket_entries` has `entry_date`, `serial_from`, `serial_to`, and `note`.
- [ ] Add public RPC returning ranks 1-24 with percentages only.
- [ ] Seed 24 candidates in approved order with sample beliefs.
- [ ] Seed ticket image setting.

### Task 3: Public Homepage

**Files:**
- Modify: `src/routes/index.tsx`
- Modify: `src/lib/queries.ts`
- Modify: `src/components/site/Announcements.tsx`
- Modify: `src/components/site/Candidates.tsx`
- Modify: `src/components/site/Leaderboard.tsx`
- Modify: `src/components/site/Navbar.tsx`

- [ ] Move announcements near the top.
- [ ] Hide Gallery and Videos sections from public.
- [ ] Render candidates as majestic cards.
- [ ] Render public standings rank 1-24 with percentage-only styling.

### Task 4: Admin UI

**Files:**
- Modify: `src/routes/_authenticated/admin.tsx`

- [ ] Add candidate order and belief fields to admin candidate editor.
- [ ] Add ticket entry fields for date taken and serial from/to.
- [ ] Add announcement hide and schedule fields.
- [ ] Keep Gallery and Videos admin tabs available.

### Task 5: Verification

**Commands:**
- `npm run build`
- Browser check at local dev URL.

- [ ] Build succeeds.
- [ ] Public page shows real assets, candidates, announcements near top, no public Gallery/Videos.
- [ ] Admin UI exposes requested controls.
