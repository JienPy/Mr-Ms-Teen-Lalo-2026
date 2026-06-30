# Ticket Remittance Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add admin-only remittance analytics for ticket pickups so Jien can track issued tickets, expected remittance, money received, balances, and candidate share.

**Architecture:** Extend the existing `ticket_entries` workflow instead of creating a second ticket system. Each pickup remains the source of Top 7 standings, while new remittance fields track how many issued tickets have been paid/remitted. The Tickets admin page computes analytics locally from the same entries and remains hidden from chairman accounts by existing role filtering.

**Tech Stack:** Supabase Postgres migrations, React/TanStack Query admin UI, existing Tailwind utility styling, Vite build verification.

---

### Task 1: Database Fields

**Files:**
- Create: `supabase/migrations/20260630220000_ticket_remittance_tracking.sql`

- [ ] Add `remitted_quantity`, `remittance_date`, and `remittance_note` to `public.ticket_entries`.
- [ ] Add a check constraint so remitted quantity cannot be negative or greater than pickup quantity.

### Task 2: Admin Calculations

**Files:**
- Modify: `src/routes/_authenticated/admin.tsx`

- [ ] Define ticket finance constants: public price ₱50, remittance ₱45, candidate share ₱5.
- [ ] Compute totals from ticket entries: issued tickets, expected remit, remitted money, balance, candidate share.
- [ ] Compute per-candidate rows for analytics.

### Task 3: Admin UI

**Files:**
- Modify: `src/routes/_authenticated/admin.tsx`

- [ ] Add remittance fields to the ticket form.
- [ ] Show automatic expected/remitted/balance values while editing.
- [ ] Add an analytics panel visible only in the existing admin-only Tickets tab.
- [ ] Add money values to each ticket entry row.

### Task 4: Verification

**Files:**
- Read/check: `src/routes/_authenticated/admin.tsx`
- Run: `npm run build`

- [ ] Run a regression check for ticket finance strings and remittance fields.
- [ ] Build the app.
- [ ] Commit and push after local verification passes.
