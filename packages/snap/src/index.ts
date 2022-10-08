import {
  InitOutput,
  manta_gen_params
} from 'wasm-bundler';
import { initializeWasm } from './wasm';
import { sha3_256 as sha3_js } from "js-sha3";

const TEST_DATA_MANTA = [[1, [1]]];

let wasm: InitOutput;

export function js_sha3(m: number) {
  for (let i = 0; i < m; i++) {
    sha3_js("abc");
  }
}

export function bench(fn, n: number, m: any[]) {
  console.log(fn);
  console.log("Running bench", { fn: fn.name, runs: n, params: m });
  const results = Array.from(
    { length: n },
    (_, _i) => {
      const t0 = new Date().getTime();
      const result = fn(...m);
      const t1 = new Date().getTime();
      console.log(result)
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
  console.log('HELLO FROM SNAP: 1');
  console.log({ request });

  switch (request.method) {
    case 'bench-wasm':
      // PUT HERE FUNCTION TO TEST WASM
      // return request.params[0].map(([n, m]) => bench(u8_arr_copy, n, m))
      return TEST_DATA_MANTA.map(([n, m]) => bench(manta_gen_params, n as number, m as any[]))
    case 'bench-js':
      // PUT HERE FUNCTION TO TEST JS
      return request.params[0].map(([n, m]) => bench(js_sha3, n, m))
    default:
      throw new Error('Method not found.');
  }
};
