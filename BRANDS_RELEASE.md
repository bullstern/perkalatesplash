# Public brands page

The original public page and assets were copied byte-for-byte from Perkalate
source `a9209d8998f52d92393d9e07611a20ded58a9903`. The duplicate-conversion
correction copies only `brands.html` from canonical PR804 at exact source
`a710c5f173b4fd4e8cb4ff36a9ae99bb6451dd9c`; its sole page change is the
`data-hs-do-not-collect="true"` form attribute. The manifest records both source
revisions and the SHA256 of all 11 files. Canonical source review/integration
and this public-site publication remain separate gates.

The existing domain-owning Vercel project is
`tombullstern-1971s-projects/v0-perkalate-landing-page-8a`, connected to
`bullstern/perkalatesplash`. Its production deployment was independently read
on October 12, 2026 after PR4 as source
`cd40cad237735c7fc472f0602b62bb6f1d2097f1`, deployment
`ERzNSKUk22wdoE7s2iYKXmgQ8Khw`. Refresh that baseline before any next publish.

Only `/brands` and `/brands/` switch to the copied static page. Its four dashboard
images and six PDFs bypass the homepage fallback. Existing consumer routes and
`/api/v1/*` -> `https://dev.perkalate.com/api/v1/*` remain in place.

The page sends leads directly to HubSpot portal `247667002` (region `na2`),
brands form `3b46342c-bda0-4017-982a-16db64d732bc`, and also to the existing
admin access-request queue. Consumer form `f166a53d-7e49-4209-961a-74af4f7d38fe`
is a separate, later workstream. This page does not require consumer switch #803.

Validation: `python3 -m unittest discover -s tests -v` checks route preservation,
all asset types and paths, the correct form and source hashes. Two additional
regressions require the collector opt-out on the sole signup form and prove
every other page byte, including both direct submission handlers, is unchanged.
These checks do not prove Vercel runtime routing or HubSpot delivery.

Correction release gates remain open until Merges clears the canonical source,
the public update has exact-source review and green checks, the authorized
publisher integrates this exact change,
the existing Vercel project deploys the containing commit, and public runtime
checks pass. Do not push main or change DNS, credentials, notification recipients,
HubSpot settings or the consumer waitlist as part of this update.

PR4's single-signup allowance was used at 3:40 PM PT on October 12. The public
signup reached the intended brands form with company, loyalty answer, source
and conversion URL intact. It created one contact with two conversion events:
the intended form and the auto-collected #wl form. The correction prevents that
extra collection without changing direct submission or HubSpot settings.

The intended notification recipient was independently confirmed as
`tom@perkalate.com`, with Forms and global email preferences already enabled;
matching inbox delivery remains unobserved. A read-only existing log query
shows a time-correlated 201 access-request response at 22:40:00Z, but it does
not name the test email or show the exact admin row. Keep those proof gaps open.

After a separately authorized correction publish, verify the marker on the
live form and the unchanged page, asset and route hashes. Another external
signup requires its own applicable authorization; local tests submit nothing.
Retain the prior Vercel deployment for rollback. PR4's one-time merge exception
is fulfilled and does not authorize another merge or publication.
