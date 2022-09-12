import {
  InitOutput,
  run_sha3_256,
} from 'wasm-bundler';

import { initializeWasm } from './wasm';

let wasm: InitOutput;

const median = arr => {
  const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

function bench_sha3(n, m) {
  const perf = Array.from(
    { length: n },
    (_, i) => {
      const t0 = 1;
      run_sha3_256(m);
      const t1 = 0;
      return t1 - t0;
    }
  );

  return `${n} times run sha3_256 ${m} iterations => mediana ${median(perf)} <br>`;
}

// wallet.registerRpcMessageHandler
export const onRpcRequest = async ({
  origin,
  request,
}) => {
  if (!wasm) {
    wasm = await initializeWasm();
  }

  console.log({ request });

  switch (request.method) {
    case 'bench':
      const result = request.params[0].map(([n, m]) => bench_sha3(n, m))
      return result;
    default:
      throw new Error('Method not found.');
  }
};
