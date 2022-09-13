# snap-performance

This repo compares performance of plain JS and WASM inside a snap to a native execution in the browser.

## Problem description

See `rust-perf/README.md` for more details.

## Usage

```bash
yarn install
./bench.sh
```

For more info, see original `README.md` in `README.old.md`.
Go to: localhos:8008

# Result
Machine: Mac Air 2021 M1

Browser: Google chrome 105 (arm64)

Bench: sha3

| Wasm | JS | snap | browser | iterations | mediana [ms] | std dev |
|------|----|------|---------|------------|--------------|---------|
| X    |    | X    |         | 1000000    | 4976         | 2       |
|      | X  | X    |         | 1000000    | 24804        | 67      |
| X    |    |      | X       | 1000000    | 5264         | 14      |
|      | X  |      | X       | 1000000    | 2460         | 8       |

All runs:
```
Snap wasm 
5 times run sha3_256 1000 iterations => mediana 5 [ms] std dev 0.39999999999999997 
,5 times run sha3_256 10000 iterations => mediana 50 [ms] std dev 0.7999999999999999 
,5 times run sha3_256 100000 iterations => mediana 498 [ms] std dev 0.4 
,5 times run sha3_256 1000000 iterations => mediana 4976 [ms] std dev 1.7204650534085253 

Snap js 
5 times run sha3_256 1000 iterations => mediana 25 [ms] std dev 5.455272678794342 
,5 times run sha3_256 10000 iterations => mediana 254 [ms] std dev 1.1661903789690602 
,5 times run sha3_256 100000 iterations => mediana 2496 [ms] std dev 26.522443326360413 
,5 times run sha3_256 1000000 iterations => mediana 24804 [ms] std dev 67.58875646141155 

Browser Wasm 
 5 times run sha3_256 1000 iterations => mediana 11 [ms] std dev 2.481934729198171
,5 times run sha3_256 10000 iterations => mediana 53 [ms] std dev 2.8
,5 times run sha3_256 100000 iterations => mediana 530 [ms] std dev 1.4966629547095767
,5 times run sha3_256 1000000 iterations => mediana 5264 [ms] std dev 13.965672200076874

Browser JS 
 5 times run sha3_256 1000 iterations => mediana 3 [ms] std dev 3.720215047547655
,5 times run sha3_256 10000 iterations => mediana 25 [ms] std dev 0.4898979485566356
,5 times run sha3_256 100000 iterations => mediana 252 [ms] std dev 1.0954451150103321
,5 times run sha3_256 1000000 iterations => mediana 2460 [ms] std dev 8.182909018191513
```

