import { 
  InitOutput, 
  arkworks_mul_assign, 
  arkworks_compute_msm, 
  arkworks_compute_msm_modified 
} from 'wasm-bundler';
import { getRandomBytes } from './random';
import { initializeWasm } from './wasm';

let wasm: InitOutput;

export function bench(fn, n: number, m: any[]) {
  console.log('Running bench', { runs: n, params: m });
  const results = Array.from({ length: n }, (_, i) => {
    const t0 = new Date().getTime();
    const result = fn(...m);
    const t1 = new Date().getTime();
    console.log(i, t1 - t0, result);
    return t1 - t0;
  });

  return results;
}

export const onRpcRequest = async ({ _origin, request }) => {
  const RNG_SEED = getRandomBytes();
  const RUNS = 5;
  // arkworks_mul_assign
  // const TEST_DATA = [
  //   [RUNS, [10000, RNG_SEED]],
  //   [RUNS, [100000, RNG_SEED]],
  //   [RUNS, [1000000, RNG_SEED]],
  // ];
  // arkworks_compute_msm
  const TEST_DATA = [
    [RUNS, [1, RNG_SEED]],
  ];

  if (!wasm) {
    wasm = await initializeWasm();
  }
  console.log({ request });

  switch (request.method) {
    case 'bench-wasm':
      return TEST_DATA.map(([n, seed]) =>
        // bench(arkworks_mul_assign, n as number, seed as any),
        bench(arkworks_compute_msm, n as number, seed as any),
        // bench(arkworks_compute_msm_modified, n as number, seed as any),
      );
    default:
      throw new Error('Method not found.');
  }
};
