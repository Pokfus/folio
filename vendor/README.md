# vendor/ — libraries copied into the site

The one place a third-party library may live. The rule, and why it is this narrow, is the first golden
rule in `CLAUDE.md` and "Vendored libraries" in `docs/reference.md`. In short: a small library under
MIT, BSD, ISC or Apache-2.0, copied in as a plain unminified (or source-mapped) JS file, with its licence
text beside it as `<name>.LICENSE`, lazy-loaded through `DATA_BUNDLES` / `ensureData` unless a reader
needs it at boot, and justified in the PR that adds it. Never a CDN tag, `node_modules`, a `package.json`,
a build step, or a GPL / non-commercial / share-alike licence. The CSP in `_headers` is never relaxed for
a library.

Every file here has a row below. Keep the table current in the same commit that adds, bumps or removes a file.

| file | library | version | upstream | licence | why Folio uses it |
|---|---|---|---|---|---|
