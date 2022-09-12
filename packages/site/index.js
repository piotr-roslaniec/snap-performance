import { run_sha3_256 } from "rust-perf";

const pre = document.getElementById("rust-perf");

const REPEAT = 5;

const median = arr => {
  const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

function bench_sha3() {
  const perf = Array.from(
    { length: REPEAT },
    (_, i) => {
      const t0 = performance.now();
      run_sha3_256(10_000_000);
      const t1 = performance.now();
      return t1 - t0;
    }
  );
  return `prove mint performance: ${median(perf)} ms \n`;
}

pre.textContent = bench_sha3();
