# Ticket Entries Candidate Photos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add manageable ticket entry browsing and controlled per-candidate photos for profile cards, profile galleries, and Top 7 showcase imagery.

**Architecture:** Add a `candidate_photos` table for tagged candidate images, update public queries to include those photos, and render images by placement priority. Keep the existing `candidates.photo_url` as fallback. Improve `TicketsAdmin` locally with search/status/date filters and pagination without changing the existing draft/publish database behavior.

**Tech Stack:** TanStack Start, React, React Query, Supabase Postgres/RLS/Storage, Tailwind, Framer Motion.

---

### Task 1: Database Contract

**Files:**
- Create: `supabase/migrations/20260630023000_candidate_photos.sql`

- [x] Create `candidate_photos` with `candidate_id`, `image_url`, `caption`, `is_main_portrait`, `show_in_profile`, `show_in_top7`, `sort_order`, and `created_at`.
- [x] Add public SELECT and admin-only write RLS policies.
- [x] Add an index for fast candidate/photo ordering.
- [x] Add a partial unique index so only one photo per candidate can be marked `is_main_portrait`.
- [x] Apply the migration in Supabase SQL editor.

### Task 2: Query Data Shape

**Files:**
- Modify: `src/lib/queries.ts`
- Modify: `src/components/site/Leaderboard.tsx`
- Modify: `src/components/site/Candidates.tsx`

- [x] Add `candidatePhotosQuery` for all public candidate photos ordered by candidate and sort order.
- [x] Update `Leaderboard` to load candidate photos and resolve image priority:
  - Rank 1: `top7_showcase` photos, then `main_portrait`, then `photo_url`, then initials.
  - Rank 2-7: first `top7_showcase`, then `main_portrait`, then `photo_url`, then initials.
- [x] Add a lightweight Rank 1 carousel that only rotates when more than one `top7_showcase` photo exists.
- [x] Update `Candidates` to load candidate photos and use only `main_portrait` for cards.
- [x] Update candidate modal to show `main_portrait` plus `profile_gallery` photos only.

### Task 3: Admin Candidate Photo Library

**Files:**
- Modify: `src/routes/_authenticated/admin.tsx`

- [x] Add an admin query for `candidate_photos`.
- [x] In the candidate edit modal, add `Candidate Photo Library`.
- [x] Allow upload through the existing `uploadToStorage` helper using folder `candidates/{candidateId}`.
- [x] Add checkboxes/actions for `Main Portrait`, `Profile Gallery`, and `Top 7 Showcase`.
- [x] When setting one photo as `Main Portrait`, unset `is_main_portrait` on the candidate’s other photos.
- [x] Allow caption and sort order edits.
- [x] Allow delete.
- [x] Invalidate public candidate/photo/leaderboard queries after photo changes.

### Task 4: Ticket Entries Management

**Files:**
- Modify: `src/routes/_authenticated/admin.tsx`

- [x] Add local state for search text, status filter, date filter, and page.
- [x] Filter ticket entries by candidate name, serial, note, status, and pickup date.
- [x] Paginate filtered entries at 10 rows per page.
- [x] Replace the long stack with compact rows and pagination controls.
- [x] Preserve existing `Publish`, `Unpublish`, `Edit`, and `Delete` actions.

### Task 5: Verification

**Files:**
- Modify: `docs/superpowers/plans/2026-06-30-ticket-entries-candidate-photos.md`

- [x] Run `npm run build`.
- [x] Verify Supabase has `candidate_photos` table and schema cache is refreshed.
- [x] Verify admin ticket entries can search, filter, paginate, publish/unpublish, edit, and delete.
- [x] Verify Meet the Candidates card uses only Main Portrait/fallback.
- [x] Verify candidate modal has the profile-gallery-only rendering path.
- [x] Verify Top 7 Rank 1 carousel logic appears only when multiple Top 7 Showcase photos exist.
