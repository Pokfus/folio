/* cfg.js — which collection the refinement harness is running on, from the environment.
     REFINE_PREFIX   the card prefix, e.g. rm- (default wh-, the World History run this harness was built for)
     REFINE_AUDIT    the audit script in .claude/ (default <prefix>audit.js: wh-audit.js, rm-audit.js)
     WH_S            the scratch dir outside the repo (default $TMPDIR/<prefix without the dash>)
   Every script in this folder reads it, so one run is `REFINE_PREFIX=rm- WH_S=… <script>`. */
"use strict";
const path = require("path"), os = require("os");
const PREFIX = String(process.env.REFINE_PREFIX || "wh-").replace(/-?$/, "-");
const AUDIT = process.env.REFINE_AUDIT || PREFIX + "audit.js";
const S = process.env.WH_S || path.join(os.tmpdir(), PREFIX.slice(0, -1));
const idOf = (n) => PREFIX + String(n).padStart(3, "0");
module.exports = { PREFIX, AUDIT, S, idOf };
