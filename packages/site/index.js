import { run_sha3_256 as sha3_wasm, vec_allocation, u8_arr_copy, manta_gen_params } from "rust-perf";
import { sha3_256 as sha3_js } from "js-sha3";

const SNAP_ID = 'local:http://localhost:6969'
const TEST_DATA = [
  [5, [1000]],
  [5, [10000]],
  [5, [100000]],
  [5, [1000000]],
];


const TEST_DATA_MANTA = [[1, [1]]];
// UI

const snap = document.getElementById('wasm-snap');
const browser = document.getElementById('wasm-browser');
const snap_btn = document.getElementById('btn-wasm-snap');
const browser_brn = document.getElementById('btn-wasm-browser');
browser_brn.addEventListener('click', onBrowserBtn);
snap_btn.addEventListener('click', onSnapButton);

async function onSnapButton() {
  await connect();
  const wasm = await requestSnap('bench-wasm', [TEST_DATA_MANTA]);
  // const js = await requestSnap('bench-js', [TEST_DATA]);
  snap.innerHTML = `
    <h3>Snap Wasm</h3>
    ${formatData(TEST_DATA_MANTA, wasm)}`;
  // <h3>Snap JS</h3>
  // ${formatData(TEST_DATA, js)}`;
}

function onBrowserBtn() {
  // PUT HERE FUNCTION TO TEST WASM

  const wasm = TEST_DATA_MANTA.map(([n, m]) => bench(manta_gen_params, n, m));
  console.log(wasm)
  // PUT HERE FUNCTION TO TEST JS
  // const js = TEST_DATA.map(([n, m]) => bench(js_sha3, n, m));

  browser.innerHTML = `
    <h3>Browser Wasm</h3>
    ${formatData(TEST_DATA_MANTA,wasm)}`
  // <h3>Browser JS</h3>
  // ${formatData(TEST_DATA, js)}`;
}


function formatData(testData, results) {
  let index = 0;
  let formatted = "";
  for (const [n, m] of testData) {
    const result = results[index];
    formatted += `<tr> <td> ${n} </td>  <td> ${m.join(',').slice(10)}... </td> <td> ${median(result)} </td> <td> ${std(result).toFixed(2)} </td> </tr>`
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

export function js_sha3(m) {
  for (let i = 0; i < m; i++) {
    sha3_js("abc");
  }
}

export function bench(fn, n, m) {
  console.log("Running bench", { fn: fn.name, runs: n, params: m });
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

