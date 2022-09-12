import { OnRpcRequestHandler } from '@metamask/snap-types';
import {
  InitOutput,
  run_sha3_256,
} from 'wasm-bundler';

import { initializeWasm } from './wasm';

let wasm: InitOutput;

export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  if (!wasm) {
    wasm = await initializeWasm();
  }

  console.log({ request });

  switch (request.method) {
    // Uncomment in order to reproduce the original error
    // case 'add_random':
    //   return add_random(request.params[0]);
    case 'run_sha3_256':
      const t1 = Date.now();
      run_sha3_256(request.params[0]);
      return Date.now() - t1;
    default:
      throw new Error('Method not found.');
  }
};
