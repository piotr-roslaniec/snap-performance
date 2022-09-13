import {
  InitOutput,
  run_sha3_256,
} from 'wasm-bundler';
import { sha3_256 } from 'js-sha3'
import { initializeWasm } from './wasm';

let wasm: InitOutput;

const median = arr => {
  const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

function run_sha3_256_js(m) {
  for (let i = 0; i < m; i++) {
    sha3_256("abc")
  }
}

function bench_sha3js(n, m) {
  const perf = Array.from(
    { length: n },
    (_, i) => {
      const t0 = new Date().getTime();
      run_sha3_256_js(m);
      const t1 = new Date().getTime();
      return t1 - t0;
    }
  );

  return `${n} times run sha3_256 ${m} iterations => mediana ${median(perf)} [ms] std dev ${std_dev(perf)} <br>`;
}

function bench_sha3(n, m) {
  const perf = Array.from(
    { length: n },
    (_, i) => {
      const t0 = new Date().getTime();
      run_sha3_256(m);
      const t1 = new Date().getTime();
      return t1 - t0;
    }
  );

  return `${n} times run sha3_256 ${m} iterations => mediana ${median(perf)} [ms] std dev ${std_dev(perf)} <br>`;
}

function std_dev(arr) {
  let mean = arr.reduce((acc, curr) => {
    return acc + curr
  }, 0) / arr.length;


  arr = arr.map((el) => {
    return (el - mean) ** 2
  })

  let total = arr.reduce((acc, curr) => acc + curr, 0);

  return Math.sqrt(total / arr.length)
}

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
      return request.params[0].map(([n, m]) => bench_sha3(n, m))
    case 'bench-js':
      return request.params[0].map(([n, m]) => bench_sha3js(n, m))
    default:
      throw new Error('Method not found.');
  }
};
