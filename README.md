# snap-performance

This repo compares performance of plain JS and WASM inside a snap to a native execution in the browser.

## Problem description

See `rust-perf/README.md` for more details.

## Usage

First, follow instructions in `rust-perf/README.md`.

Then, run:

```bash
yarn build
yarn start
```

For more info, see original `README.md` in `README.old.md`.

# Result
Machine: Mac Air 2021 M1
Browser: Google chrome 105 (arm64)
Bench: sha3

| Wasm | JS | snap | browser | iterations |mediana[ms]                  |   
|------|----|------|---------|------------|-----------------------------|
|  X   |    |      |    X    |  100_000   |   30 and sometimes 500      |
|      |    |      |         |            |                             |
|      |    |      |         |            |                             |