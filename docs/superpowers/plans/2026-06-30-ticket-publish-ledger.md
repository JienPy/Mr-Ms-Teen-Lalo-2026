# Ticket Publish Ledger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make ticket pickups editable drafts that only count in public standings after admin publishing.

**Architecture:** Add published status fields to `ticket_entries`, update public standings SQL to count only published pickups, and enhance the existing Tickets admin tab with entry management. Weeks are computed from the pickup date/current local date instead of manually configured in the admin UI.

**Tech Stack:** TanStack Start, React Query, Supabase SQL/RLS, Tailwind.

---

### Task 1: Database Contract

**Files:**
- Create: `supabase/migrations/20260630020000_ticket_publish_workflow.sql`

- [x] Add `is_published` and `published_at` columns to `ticket_entries`.
- [x] Mark existing entries as published so existing visible standings do not disappear.
- [x] Update `get_public_standings()` to compute the current Monday-Sunday week from Asia/Manila date and count only published entries.
- [x] Update `get_admin_standings()` for consistency.

### Task 2: Admin Ticket UI

**Files:**
- Modify: `src/routes/_authenticated/admin.tsx`

- [x] Add week helper functions for local Monday-Sunday ranges.
- [x] Change admin standings to count only published entries.
- [x] Add ticket entry list with status, edit, delete, publish, and unpublish actions.
- [x] Convert Add Entry into draft creation and support editing existing entries.
- [x] Hide manual Weeks panel and show an automatic week indicator.

### Task 3: Verification

- [x] Apply the SQL migration in Supabase SQL editor.
- [x] Run `npm run build`.
- [x] Verify admin can see, edit, publish/unpublish, and delete ticket entries.
- [x] Verify public Top 7 only changes for published entries.
