# Pageant Public And Admin Design

## Goal

Make the public site useful for visitors without requiring an account, while giving only the organizer/admin control over candidates, announcements, ticket tracking, media, and settings.

## Public Site

- The public site remains open to everyone.
- The top navbar removes the visible `Admin` link.
- A small, low-key admin link stays in the footer for the organizer.
- The hero, navbar, and ticket sections use the real event artwork supplied by the user.
- Gallery and Teasers/Reels are hidden from the public page for now.
- Announcements move near the top of the page so visitors see updates quickly.
- Meet the Candidates shows all 24 candidates in the approved official order.
- Candidate cards show a majestic framed image area, name, sitio, and kasabihan.
- Candidate photos are optional at first; empty photos show a polished placeholder.
- Top standings show ranks 1 through 24 using percentages only:
  - Rank 1 uses the largest row/card.
  - Rank 2 uses a medium row/card.
  - Ranks 3-7 use compact rows/cards.
  - Ranks 8-24 use extra compact rows/cards.
- Raw ticket counts are never shown publicly.

## Admin Site

- Admin remains protected by Supabase email/password login and the existing admin role check.
- Candidates can be edited by admin: name, division, sitio, order, kasabihan, photo, active/hidden.
- Announcements can be created repeatedly and support pinned, hidden, show-from date, and show-until date.
- Gallery albums/photos and Videos remain manageable in admin even while hidden publicly.
- Ticket entries can be added repeatedly with candidate, quantity, date taken, serial from, serial to, and note.
- Standings are computed from ticket entries.

## Data

- Candidate data is seeded into Supabase in the official order:
  - Mr: Ken Brian P. Edrad, Carlos Jose Z. Labaquis, Kave Izzy D. Oates, Raven Zian T. Leones, Kurt Rafanan, Symon D. Pabularcon, Rieven V. Villa, Chris Daniel L. Dadis, Kian Ezekiel V. Edrad, Tyron P. Veloso, Adrian N. Sta. Ana, Jonas R. Javin.
  - Ms: Kyla Mae Ecal, Janine Crisibelle S. Lopez, Joyce Anne Rose B. Cena, Hannah Grace D. Lesma, Princess Loren L. Ricamata, Cielo Mae S. Caagbay, Mirence Felicity E. Javin, Criza Jen C. Capistrano, Emerald A. Delgado, Reese Denielle Nuqui, Britney Armocilla, Precious Nicole Guevarra.
- Ticket image is the supplied official `Mr_Ms_Teen_Lalo_2026_Regular (4).png`.
- Candidate contacts are not stored or shown in the public site.

## Verification

- Build must pass.
- Local public page must render with the new assets and candidate list.
- Supabase schema must include new fields/RPC behavior needed by the UI.
