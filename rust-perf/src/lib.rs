use ark_bls12_377::Fq;
use ark_ff::{Fp384, BigInteger384};
use rand::{rngs::StdRng, Rng, SeedableRng};
use sha3::{Digest, Sha3_256};
use std::ops::MulAssign;
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
pub fn arkworks_mul_assign(iterations: usize, rng_seed: &[u8]) {
    console_error_panic_hook::set_once();

    // #[wasm_bindgen]
    // pub fn add_random_with_seed(left: u32, rng_seed: &[u8]) -> u32 {
    //     console_error_panic_hook::set_once();
    //     let rng_seed: [u8; 32] = rng_seed.try_into().unwrap();
    //     let rng = &mut StdRng::from_seed(rng_seed);
    //     let right = rng.gen::<u32>();
    //     left + right
    // }
    
    let rng_seed: [u8; 32] = rng_seed.try_into().unwrap();
    let rng = &mut StdRng::from_seed(rng_seed);

    for i in 0..iterations {
        let a: BigInteger384 = BigInteger384::from(rng.gen::<u64>());
        // let a = i as u64;
        let mut a = Fq::from(Fp384::from(a));
        let b: BigInteger384 = BigInteger384::from(rng.gen::<u64>());
        // let b = (i+1) as u64;
        let b = Fq::from(Fp384::from(b));

        a.mul_assign(b);
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
}
