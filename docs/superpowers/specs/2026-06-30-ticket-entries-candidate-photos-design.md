# Ticket Entries and Candidate Photos Design

## Goal

Keep the admin dashboard usable when ticket pickups become numerous, and make candidate imagery controlled per placement:

- ticket entries should not become one endless page;
- `Meet the Candidates` cards use one fixed admin-selected portrait;
- candidate modal/profile can show additional gallery photos;
- `Top 7` can use only photos intentionally tagged for that section;
- Rank 1 may become a carousel only when that candidate has more than one `Top 7 Showcase` photo.

## Admin Ticket Entries

Replace the long `Ticket Entries` stack with a compact management area:

- Search field for candidate name, serial number, or note.
- Status filter: `All`, `Draft`, `Published`.
- Date filter using pickup date.
- Page size limit, initially 10 entries per page.
- Each row keeps the same actions: `Publish`, `Unpublish`, `Edit`, `Delete`.
- Rows stay ordered newest first.

The existing draft/publish behavior remains unchanged. Only published entries count in public standings.

## Candidate Photos

Candidate photos will be stored per candidate as structured photo records. Each photo can have one or more placement flags:

- `main_portrait`: the fixed photo used on the `Meet the Candidates` card.
- `profile_gallery`: extra photos shown only after clicking a candidate card.
- `top7_showcase`: photos allowed in the `Top 7` section.

Rules:

- Each candidate can have only one `main_portrait` at a time.
- A candidate can have many `profile_gallery` photos.
- A candidate can have many `top7_showcase` photos.
- The same uploaded image may be tagged for multiple placements if the admin wants.

## Public Candidate UI

`Meet the Candidates` card:

- Shows only the fixed `main_portrait`.
- If no `main_portrait` exists, fallback to the existing candidate `photo_url`.
- If neither exists, show the current “Photo soon” placeholder.

Candidate click/modal:

- Shows the candidate info and quote as now.
- Shows the `main_portrait` first.
- Includes `profile_gallery` photos when available.
- Does not show `top7_showcase` photos unless those photos are also tagged as `profile_gallery`.

## Public Top 7 UI

Rank 1:

- Uses the full-width/featured card treatment.
- Shows a large image area inside the card.
- If the Rank 1 candidate has multiple `top7_showcase` photos, show them as an automatic carousel.
- If exactly one `top7_showcase` photo exists, show it as a fixed image.
- If none exist, fallback to `main_portrait`, then candidate `photo_url`, then initials.

Ranks 2-7:

- Keep compact ranking cards, but use the best available photo for each candidate.
- Priority: first `top7_showcase`, then `main_portrait`, then candidate `photo_url`, then initials.

Ranks 8-24:

- Stay as small compact rows/chips to avoid visual clutter.

## Database Shape

Add a `candidate_photos` table:

- `id`
- `candidate_id`
- `image_url`
- `caption`
- `is_main_portrait`
- `show_in_profile`
- `show_in_top7`
- `sort_order`
- `created_at`

Public reads are allowed. Admin-only writes are enforced with the existing `is_admin()` policy style.

The existing `candidates.photo_url` remains as a fallback so current data does not break.

## Admin Candidate UI

Inside each candidate edit modal:

- Keep the current `Portrait Photo` as the simple fallback/main legacy field for now.
- Add a `Candidate Photo Library` section.
- Admin can upload a photo and set tags:
  - Main Portrait
  - Profile Gallery
  - Top 7 Showcase
- Admin can edit caption/sort order.
- Admin can delete a photo.

If a photo is marked `Main Portrait`, the app unsets `Main Portrait` from the candidate’s other photos.

## Verification

- Ticket entries list remains usable after many rows by search/filter/pagination.
- Draft entries still do not affect public standings.
- Published entries still affect Top 7.
- `Meet the Candidates` cards use only fixed main portrait/fallback.
- Candidate modal shows profile gallery only.
- Rank 1 carousel appears only when more than one `Top 7 Showcase` photo exists.
- Build succeeds.
