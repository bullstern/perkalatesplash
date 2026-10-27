# Public brands page

## October 27 messaging correction

Tom approved 108 brands and a business model with no platform fee and a share of
reward funding, with the rate still TBD. This patch updates only six copy
passages in `brands.html`: the count, pricing text, platform-fee label and reward
calculator disclosure. `copy_overrides` in the source manifest records the
approved text changes against public main `7232e085`; the original page source
and all asset hashes retain their provenance. The preservation tests invert
only those approved replacements before comparing the original page/form hashes.

The local suite has 19 passing tests, including three regressions that fail on
the previous public copy. No form submission or provider test is needed for
this text-only patch. PR7's blog and PR10's privacy changes retain their owners
and scopes. Review the desktop/mobile preview before the existing public release
approval and merge process; this branch alone does not update production.

This change copies Tom's selected A+ page from Perkalate's reviewed PR845 head
`70b87ae147305572eca31561eadc6e6aa1d1a335`, merged as
`3faec871647ae66916db2f712d52284a98eec788`. The page and media are byte-identical
between those commits. `brands-source-manifest.json` records all 27 file hashes.

The only routing change lets the 16 new `/brands-media/` images reach the static
filesystem. The four dashboard images and six guide PDFs are unchanged. The
signup form and the complete admin-queue/HubSpot submission block match public
main exactly; the form retains `data-hs-do-not-collect="true"`, portal `247667002`,
form `3b46342c-bda0-4017-982a-16db64d732bc` and region `na2`.
The API rewrite still reaches `dev.perkalate.com`.

Before merge, verify the Vercel preview at desktop and phone widths, all image
responses, whole dashboard/Pass screens and hero email prefill/scroll. Do not
submit a signup. The local tests validate routes, file formats, exact source
hashes and preserved submission code; they do not prove provider acceptance.

Merges must review this public PR twice, then Tom must approve this concrete PR.
Merging main deploys production. No production merge is authorized by the source
copy. Existing blog PR7 also edits `brands.html`; reconcile its integration order
before either public merge, preserving its existing owner and pending acceptance.
