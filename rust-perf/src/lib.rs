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
pub fn vec_allocation(iterations: usize) {
    console_error_panic_hook::set_once();
    let mut acc = vec![];

    for i in 0..iterations {
        acc.push(vec![i; 100])
    }
}

#[wasm_bindgen]
pub fn u8_arr_copy(iterations: usize, arr_to_copy: &[u8]) -> js_sys::Uint8Array {
    console_error_panic_hook::set_once();
    let mut acc = vec![];

    for _ in 0..iterations {
        acc.push(arr_to_copy.to_vec()[0])
    }

    unsafe { js_sys::Uint8Array::view(&acc) }
}

#[wasm_bindgen]
pub fn manta_gen_params(iterations: usize) {
    console_error_panic_hook::set_once();

    for _ in 0..iterations {
        manta_pay::parameters::generate().unwrap();
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
        vec_allocation(1);
    }

    #[test]
    #[wasm_bindgen_test]
    fn runs_vec_allocation_100k_times() {
        vec_allocation(100_000);
    }

    #[test]
    #[wasm_bindgen_test]
    fn u8_arr_copy_once() {
        u8_arr_copy(1, &[1, 2, 3, 4, 56, 7, 89]);
    }

    #[test]
    #[wasm_bindgen_test]
    fn u8_arr_copy_100k_times() {
        u8_arr_copy(100_000, &[1, 2, 3, 4, 56, 7, 89]);
    }

    #[test]
    #[wasm_bindgen_test]
    fn manta_gen_params_once() {
        manta_pay::parameters::generate().unwrap();
    }
}
