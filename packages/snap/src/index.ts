import {
  InitOutput,
  run_sha3_256,
  vec_allocation
} from 'wasm-bundler';
import { initializeWasm } from './wasm';
import { sha3_256 as sha3_js } from "js-sha3";

let wasm: InitOutput;

export function js_sha3(m: number) {
  for (let i = 0; i < m; i++) {
    sha3_js("abc");
  }
}

export function bench(fn: (m: number) => void, n: number, m: number) {
  console.log(fn);
  console.log("Running bench", { fn: fn.name, runs: n, iterations: m });
  const results = Array.from(
    { length: n },
    (_, _i) => {
      const t0 = new Date().getTime();
      fn(m);
      const t1 = new Date().getTime();
      return t1 - t0;
    }
  );

  return results;
}


export const onRpcRequest = async ({
  _origin,
  request,
}) => {
  if (!wasm) {
    wasm = await initializeWasm();
  }

  console.log({ request });

  switch (request.method) {
    case 'bench-wasm':
      // PUT HERE FUNCTION TO TEST WASM
      return request.params[0].map(([n, m]) => bench(vec_allocation, n, m))
    case 'bench-js':
      // PUT HERE FUNCTION TO TEST JS
      return request.params[0].map(([n, m]) => bench(js_sha3, n, m))
    default:
      throw new Error('Method not found.');
  }
};
