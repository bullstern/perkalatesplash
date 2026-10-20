# Public brands page

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
