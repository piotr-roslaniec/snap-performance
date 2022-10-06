use sha3::{Digest, Sha3_256};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn run_sha3_256(iterations: usize) {
    console_error_panic_hook::set_once();

    for _ in 0..iterations {
        let mut hasher = Sha3_256::new();
        hasher.update(b"abc");
        hasher.finalize();
    }
}

#[wasm_bindgen]
pub fn vec_alocation(iterations: usize) {
    console_error_panic_hook::set_once();
    let mut acc = vec![];

    for i in 0..iterations {
        acc.push(vec![i; 100])
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    wasm_bindgen_test_configure!(run_in_browser);

    #[test]
    #[wasm_bindgen_test]
    fn runs_hashcash_once() {
        run_sha3_256(1);
    }

    #[test]
    #[wasm_bindgen_test]
    fn runs_hashcash_100k_times() {
        run_sha3_256(100_000);
    }

    #[test]
    #[wasm_bindgen_test]
    fn runs_vec_allocation_once() {
        vec_alocation(1);
    }

    #[test]
    #[wasm_bindgen_test]
    fn runs_vec_allocation_100k_times() {
        vec_alocation(100_000);
    }
}
