import { arkworks_mul_assign, arkworks_compute_msm } from "rust-perf";

const RNG_SEED_SIZE = 32;

function getRandomBytes() {
  if (!window.crypto.getRandomValues) {
    throw new Error('window.crypto.getRandomValues not available');
  }
  const randomBytes = new Int32Array(RNG_SEED_SIZE / 4);
  window.crypto.getRandomValues(randomBytes);
  return new Uint8Array(randomBytes.buffer);
};

const SNAP_ID = 'local:http://localhost:6969'
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

// UI

const snap = document.getElementById('wasm-snap');
const browser = document.getElementById('wasm-browser');
const snap_btn = document.getElementById('btn-wasm-snap');
const browser_brn = document.getElementById('btn-wasm-browser');
browser_brn.addEventListener('click', onBrowserBtn);
snap_btn.addEventListener('click', onSnapButton);

async function onSnapButton() {
  await connect();
  const wasm = await requestSnap('bench-wasm', [TEST_DATA]);
  snap.innerHTML = `
    <h3>Snap Wasm</h3>
    ${formatData(TEST_DATA, wasm)}`;
}

function onBrowserBtn() {
  // const wasm = TEST_DATA.map(([n, seed]) => bench(arkworks_mul_assign, n, seed));
  const wasm = TEST_DATA.map(([n, seed]) => bench(arkworks_compute_msm, n, seed));
  console.log(wasm)

  browser.innerHTML = `
    <h3>Browser Wasm</h3>
    ${formatData(TEST_DATA,wasm)}`
}


function formatData(testData, results) {
  let index = 0;
  let formatted = "";
  for (const [n, [iterations, _]] of testData) {
    const result = results[index];
    formatted += `<tr> <td> ${n} </td>  <td> ${iterations} </td> <td> ${median(result)} </td> <td> ${std(result).toFixed(2)} </td> </tr>`
    index++;
  }

  return `<table> <tr> <th>Runs</th> <th>Iterations</th>  <th>Median [ms]</th> <th>Std</th> <tr> ${formatted}  </table>`
}

// MATH

const median = arr => {
  const mid = Math.floor(arr.length / 2);
  const nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

function std(arr) {
  let mean = arr.reduce((acc, curr) => {
    return acc + curr
  }, 0) / arr.length;


  arr = arr.map((el) => {
    return (el - mean) ** 2
  })

  let total = arr.reduce((acc, curr) => acc + curr, 0);

  return Math.sqrt(total / arr.length);
};

export function bench(fn, n, m) {
  console.log("Running bench", { runs: n, params: m });
  const results = Array.from(
    { length: n },
    (_, i) => {
      const t0 = new Date().getTime();
      const result = fn(...m);
      const t1 = new Date().getTime();
      console.log(i, t1 - t0, result)
      return t1 - t0;
    }
  );
  console.log(results);

  return results;
}


// SNAP API

const request = async (method, params) => {
  if (!window.ethereum || !window.ethereum.isMetaMask) {
    throw new Error("MetaMask is not installed");
  }

  const result = await window.ethereum.request({ method, params });
  console.log([method, params, result])
  return result;
}

function requestSnap(
  method,
  params,
) {
  const result = request("wallet_invokeSnap", [SNAP_ID, { method, params }]);
  console.log({ method, params, result });
  return result;
}

const connect = async () => {
  try {
    await request("wallet_enable", [{ wallet_snap: { [SNAP_ID]: {} } }]);
  } catch (error) {
    // The `wallet_enable` call will throw if the requested permissions are rejected.
    if (error.code === 4001) {
      console.error("The user rejected the request.");
      alert("The user rejected the request.");
    } else {
      console.error(error);
      alert("Error: " + error.message || error);
    }
    throw error;
  }
}

