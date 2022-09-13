import { run_sha3_256 } from "rust-perf";
import { sha3_256 } from "js-sha3";

const wasm_snap = document.getElementById('wasm-snap');
const wasm_browser = document.getElementById('wasm-browser');
const snap_btn = document.getElementById('btn-wasm-snap');
const browser_brn = document.getElementById('btn-wasm-browser');
browser_brn.addEventListener('click', onBrowserBtn);
snap_btn.addEventListener('click', onSnapButton);

const SNAP_ID = 'local:http://localhost:6969'
const TEST_DATA = [
  [5, 1000],
  [5, 10000],
  [5, 100000],
  [5, 1000000],
];

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

  return `${n} times run sha3_256 ${m} iterations => mediana ${median(perf)} [ms] std dev ${std_dev(perf)}<br>`;
}

function std_dev(arr) {
  let mean = arr.reduce((acc, curr) => {
    return acc + curr
  }, 0) / arr.length;


  arr = arr.map((el) => {
    return (el - mean) ** 2
  })

  let total = arr.reduce((acc, curr) => acc + curr, 0);

  return Math.sqrt(total / arr.length);
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

  return `${n} times run sha3_256 ${m} iterations => mediana ${median(perf)} [ms] std dev ${std_dev(perf)}<br>`;
}

function onBrowserBtn() {
  wasm_browser.innerHTML = `Browser Wasm \n ${TEST_DATA.map(([n, m]) => bench_sha3(n, m))}
  Browser JS \n ${TEST_DATA.map(([n, m]) => bench_sha3js(n, m))}`;
}


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

async function onSnapButton() {
  await connect();
  const result_wasm = await requestSnap('bench', [TEST_DATA]);
  const result_js = await requestSnap('bench-js', [TEST_DATA]);
  wasm_snap.innerHTML = `Snap wasm \n${result_wasm}\n Snap js \n${result_js}`;
}