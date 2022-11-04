# snap-performance

This repo compares the performance of plain JS and WASM inside a snap to a native execution in the browser.

## Problem description

See `rust-perf/README.md` for more details.

## Usage

```bash
yarn install
./bench.sh
```

For more info see the original `README.md` in `README.old.md`.
Go to: localhos:8008

# Result

1. Bench: sha3 (computation)

| benchmark                | Chromium [ms] | Snap [ms] | Perf change |
| ------------------------ | ------------- | --------- | ----------- |
| arkworks_multiply_assign | 33478         | 34833     | ~104%       |
| arkworks_compute_msm     | 77125         | 325595    | ~422%       |
