import { run_sha3_256 } from "rust-perf";

const wasm_snap = document.getElementById('wasm-snap');
const wasm_browser = document.getElementById('wasm-browser');
const snap_btn = document.getElementById('btn-wasm-snap');
const browser_brn = document.getElementById('btn-wasm-browser');
browser_brn.addEventListener('click', onBrowserBtn);
snap_btn.addEventListener('click', onSnapButton);

const SNAP_ID = 'local:http://localhost:6969'
const TEST_DATA = [
  [20, 20],
  [40, 400],
  [50, 10000],
  [10, 1000000], 
];

const median = arr => {
  const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

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

  return `${n} times run sha3_256 ${m} iterations => mediana ${median(perf)} <br>`;
}

function onBrowserBtn() {
  wasm_browser.innerHTML = `Browser Wasm \n ${TEST_DATA.map(([n, m]) => bench_sha3(n, m))}`;
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
  const result = await requestSnap('bench', [TEST_DATA]);
  wasm_snap.innerHTML = `Snap wasm \n${result}`;
}