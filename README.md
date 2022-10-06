# snap-performance

This repo compares performance of plain JS and WASM inside a snap to a native execution in the browser.

## Problem description

See `rust-perf/README.md` for more details.

## Usage

```bash
yarn install
./bench.sh
```

For more info see original `README.md` in `README.old.md`.
Go to: localhos:8008

# Result

Machine: Mac Air 2021 M1

Browser: Google chrome 105 (arm64)

1. Bench: sha3 (computation)

| Wasm | JS  | snap | browser | iterations | mediana [ms] | std dev |
| ---- | --- | ---- | ------- | ---------- | ------------ | ------- |
| X    |     | X    |         | 1000000    | 4976         | 2       |
|      | X   | X    |         | 1000000    | 24804        | 67      |
| X    |     |      | X       | 1000000    | 5264         | 14      |
|      | X   |      | X       | 1000000    | 2460         | 8       |

| Wasm | snap | browser |
| ---- | ---- | ------- |
| -    | 4976 | 5264    |

| JS  | snap  | browser |
| --- | ----- | ------- |
| -   | 24804 | 2460    |


2. Bench: memeory allocation (wasm only)

