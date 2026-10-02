#!/bin/bash
# batch.sh <first> <last> (numbers) — urlcheck, apply, audit, checks, citations
export WH_S="${WH_S:-${TMPDIR:-/tmp}/wh}"; S="$WH_S"
cd "$(git rev-parse --show-toplevel)"
ids=""; for n in $(seq $1 $2); do ids="$ids wh-$(printf %03d $n)"; done
node .claude/wh-refine/urlcheck.js $ids 2>&1 | tail -4
node .claude/wh-refine/apply.js $ids 2>&1 | grep -v 'text:\|image:'
node .claude/wh-audit.js --range=wh-$(printf %03d $1):wh-$(printf %03d $2)
node .claude/check-questions.js 2>&1 | tail -3
for id in $ids; do node .claude/check-cards.js --prefix=$id 2>&1 | tail -1; done | sort | uniq -c
for id in $ids; do echo -n "$id "; NODE_USE_ENV_PROXY=1 timeout 100 node .claude/check-citations.js --card=$id 2>&1 | grep mismatched; done
echo BATCH-DONE
