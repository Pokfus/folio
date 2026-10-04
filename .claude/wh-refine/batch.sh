#!/bin/bash
# batch.sh <first> <last> (numbers) — urlcheck, apply, audit, checks, citations
# [REFINE_PREFIX=rm-] WH_S=<scratch> .claude/wh-refine/batch.sh 1 10   (prefix and audit: cfg.js)
P="${REFINE_PREFIX:-wh-}"; P="${P%-}-"; A="${REFINE_AUDIT:-${P}audit.js}"
export WH_S="${WH_S:-${TMPDIR:-/tmp}/${P%-}}"; S="$WH_S"
cd "$(git rev-parse --show-toplevel)"
ids=""; for n in $(seq $1 $2); do ids="$ids $P$(printf %03d $n)"; done
node .claude/wh-refine/urlcheck.js $ids 2>&1 | tail -4
node .claude/wh-refine/apply.js $ids 2>&1 | grep -v 'text:\|image:'
node .claude/$A --range=$P$(printf %03d $1):$P$(printf %03d $2)
node .claude/check-questions.js 2>&1 | tail -3
for id in $ids; do node .claude/check-cards.js --prefix=$id 2>&1 | tail -1; done | sort | uniq -c
for id in $ids; do echo -n "$id "; NODE_USE_ENV_PROXY=1 timeout 100 node .claude/check-citations.js --card=$id 2>&1 | grep mismatched; done
echo BATCH-DONE
