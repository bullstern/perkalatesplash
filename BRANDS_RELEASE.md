# Public brands page

This copies the reviewed public page and its assets from Perkalate production
source `a9209d8998f52d92393d9e07611a20ded58a9903` without changing their bytes.
`brands-source-manifest.json` records the SHA256 of each of the 11 files.

The existing domain-owning Vercel project is
`tombullstern-1971s-projects/v0-perkalate-landing-page-8a`, connected to
`bullstern/perkalatesplash`. Its production deployment was independently read
on October 12, 2026 as source `a8077d39d68f022f3678c38db68f1b41c09bd924`.

Only `/brands` and `/brands/` switch to the copied static page. Its four dashboard
images and six PDFs bypass the homepage fallback. Existing consumer routes and
`/api/v1/*` -> `https://dev.perkalate.com/api/v1/*` remain in place.

The page sends leads directly to HubSpot portal `247667002` (region `na2`),
brands form `3b46342c-bda0-4017-982a-16db64d732bc`, and also to the existing
admin access-request queue. Consumer form `f166a53d-7e49-4209-961a-74af4f7d38fe`
is a separate, later workstream. This page does not require consumer switch #803.

Validation: `python3 -m unittest discover -s tests -v` checks route preservation,
all asset types and paths, the correct form and the reviewed source hashes.
These checks do not prove Vercel runtime routing or HubSpot delivery.

Release gates remain open until Merges integrates this exact reviewed change,
the existing Vercel project deploys the containing commit, and public runtime
checks pass. Do not push main or change DNS, credentials, notification recipients,
HubSpot settings or the consumer waitlist as part of this update.

After release, verify `/brands` and `/brands/`, all four dashboard steps, all six
PDF assets and mobile layout. Submit one clearly labeled representative brand
signup through the public page. Verify the matching brands-form submission,
admin-queue record and intended single-notification delivery. A thank-you screen
alone is insufficient: the page can succeed through its admin queue even if
the separate HubSpot request fails. The brands notification recipient is not
yet independently confirmed. Retain the prior Vercel deployment for rollback.
