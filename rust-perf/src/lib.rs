use ark_bls12_377::Fq;
use ark_bls12_381::G1Affine;
use ark_ec::{msm, AffineCurve, ProjectiveCurve};
use ark_ff::{BigInteger384, Fp384};
use ark_ff::{PrimeField, UniformRand};
use rand::{rngs::StdRng, Rng, SeedableRng};
use std::ops::MulAssign;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn arkworks_mul_assign(iterations: usize, rng_seed: &[u8]) {
    console_error_panic_hook::set_once();

    let rng_seed: [u8; 32] = rng_seed.try_into().unwrap();
    let rng = &mut StdRng::from_seed(rng_seed);

    for _ in 0..iterations {
        let a: BigInteger384 = BigInteger384::from(rng.gen::<u64>());
        let mut a = Fq::from(Fp384::from(a));
        let b: BigInteger384 = BigInteger384::from(rng.gen::<u64>());
        let b = Fq::from(Fp384::from(b));

        a.mul_assign(b);
    }
}

pub fn generate_msm_inputs<A>(
    size: usize,
    rng_seed: &[u8],
) -> (
    Vec<<A::Projective as ProjectiveCurve>::Affine>,
    Vec<<A::ScalarField as PrimeField>::BigInt>,
)
where
    A: AffineCurve,
{
    let rng_seed: [u8; 32] = rng_seed.try_into().unwrap();
    let mut rng = &mut StdRng::from_seed(rng_seed);

    let scalar_vec = (0..size)
        .map(|_| A::ScalarField::rand(&mut rng).into_repr())
        .collect();
    let point_vec = (0..size)
        .map(|_| A::Projective::rand(&mut rng))
        .collect::<Vec<_>>();
    (
        <A::Projective as ProjectiveCurve>::batch_normalization_into_affine(&point_vec),
        scalar_vec,
    )
}

pub fn compute_msm<A>(
    point_vec: &Vec<<A::Projective as ProjectiveCurve>::Affine>,
    scalar_vec: &Vec<<A::ScalarField as PrimeField>::BigInt>,
) -> A::Projective
where
    A: AffineCurve,
{
    msm::VariableBaseMSM::multi_scalar_mul(point_vec.as_slice(), scalar_vec.as_slice())
}

#[wasm_bindgen]
pub fn arkworks_compute_msm(iterations: usize, rng_seed: &[u8]) {
    console_error_panic_hook::set_once();

    for _ in 0..iterations {
        let size = 1 << 14;
        let (point_vec, scalar_vec) = generate_msm_inputs::<G1Affine>(size, rng_seed);
        let _ = compute_msm::<G1Affine>(&point_vec, &scalar_vec);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    wasm_bindgen_test_configure!(run_in_browser);

    #[test]
    #[wasm_bindgen_test]
    fn runs_vec_allocation_once() {
        arkworks_compute_msm(1, &[0; 32]);
    }
}
