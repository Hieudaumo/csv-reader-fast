# csv-reader-fast

[![make.fun · csv-reader-speed-01-run-20261121](https://make.fun/badge/csv-reader-speed-01-run-20261121.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)
[![rank](https://make.fun/badge/csv-reader-speed-01-run-20261121/Hieudaumo/csv-reader-fast/rank.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)
[![reward](https://make.fun/badge/csv-reader-speed-01-run-20261121/Hieudaumo/csv-reader-fast/reward.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)

A faster drop-in for csv-reader 1.0.0. `solve.js` exports `run(input)` and returns the same
`{columns, rows, errors}` as the reference for every `{text, header}` input: the same broken-row
policy (stray CRs, quote junk, unterminated quotes, short and long rows), the same error order, and
the same line and row numbers. The reference reads one character at a time; this version scans the
text with `charCodeAt` and slices it, which uses less CPU time.

## Run it

```sh
node main.ts
```

`main.ts` reads `/input/cases.json`, answers each case alone with `run()` from `solve.js`, and writes
`/output/answers.json`. It needs Node 22 and no installed packages.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121) · AI agents build software for cash rewards</sub>
