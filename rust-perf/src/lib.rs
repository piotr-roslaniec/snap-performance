use ark_bls12_377::Fq;
use ark_bls12_381::G1Affine;
use ark_ec::{msm, AffineCurve, ProjectiveCurve};
use ark_ff::{BigInteger384, Fp384};
use ark_ff::{PrimeField, UniformRand};
use rand::{rngs::StdRng, Rng, SeedableRng};
use std::ops::MulAssign;
use wasm_bindgen::prelude::*;
use ark_ff::prelude::*;

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

// Copied from arkworks

fn ln_without_floats(a: usize) -> usize {
    // log2(a) * ln(2)
    (ark_std::log2(a) * 69 / 100) as usize
}


pub fn multi_scalar_mul<G: AffineCurve>(
    bases: &[G],
    scalars: &[<G::ScalarField as PrimeField>::BigInt],
) -> G::Projective {
    let size = ark_std::cmp::min(bases.len(), scalars.len());
    let scalars = &scalars[..size];
    let bases = &bases[..size];
    let scalars_and_bases_iter = scalars.iter().zip(bases).filter(|(s, _)| !s.is_zero());

    let c = if size < 32 {
        3
    } else {
        ln_without_floats(size) + 2
    };

    let num_bits = <G::ScalarField as PrimeField>::Params::MODULUS_BITS as usize;
    let fr_one = G::ScalarField::one().into_repr();

    let zero = G::Projective::zero();
    let window_starts: Vec<_> = (0..num_bits).step_by(c).collect();

    // Each window is of size `c`.
    // We divide up the bits 0..num_bits into windows of size `c`, and
    // in parallel process each such window.
    let window_sums: Vec<_> = ark_std::cfg_into_iter!(window_starts)
        .map(|w_start| {
            let mut res = zero;
            // We don't need the "zero" bucket, so we only have 2^c - 1 buckets.
            let mut buckets = vec![zero; (1 << c) - 1];
            // This clone is cheap, because the iterator contains just a
            // pointer and an index into the original vectors.
            scalars_and_bases_iter.clone().for_each(|(&scalar, base)| {
                if scalar == fr_one {
                    // We only process unit scalars once in the first window.
                    if w_start == 0 {
                        res.add_assign_mixed(base);
                    }
                } else {
                    let mut scalar = scalar;

                    // We right-shift by w_start, thus getting rid of the
                    // lower bits.
                    scalar.divn(w_start as u32);

                    // We mod the remaining bits by 2^{window size}, thus taking `c` bits.
                    let scalar = scalar.as_ref()[0] % (1 << c);

                    // If the scalar is non-zero, we update the corresponding
                    // bucket.
                    // (Recall that `buckets` doesn't have a zero bucket.)
                    if scalar != 0 {
                        buckets[(scalar - 1) as usize].add_assign_mixed(base);
                    }
                }
            });

            // Compute sum_{i in 0..num_buckets} (sum_{j in i..num_buckets} bucket[j])
            // This is computed below for b buckets, using 2b curve additions.
            //
            // We could first normalize `buckets` and then use mixed-addition
            // here, but that's slower for the kinds of groups we care about
            // (Short Weierstrass curves and Twisted Edwards curves).
            // In the case of Short Weierstrass curves,
            // mixed addition saves ~4 field multiplications per addition.
            // However normalization (with the inversion batched) takes ~6
            // field multiplications per element,
            // hence batch normalization is a slowdown.

            // `running_sum` = sum_{j in i..num_buckets} bucket[j],
            // where we iterate backward from i = num_buckets to 0.
            let mut running_sum = G::Projective::zero();
            buckets.into_iter().rev().for_each(|b| {
                running_sum += &b;
                res += &running_sum;
            });
            res
        })
        .collect();

    // We store the sum for the lowest window.
    let lowest = *window_sums.first().unwrap();

    // We're traversing windows from high to low.
    lowest
        // + &window_sums[1..]
        //     .iter()
        //     .rev()
        //     .fold(zero, |mut total, sum_i| {
        //         total += sum_i;
        //         for _ in 0..c {
        //             total.double_in_place();
        //         }
        //         total
        //     })
}

#[wasm_bindgen]
pub fn arkworks_compute_msm_modified(iterations: usize, rng_seed: &[u8]) {
    console_error_panic_hook::set_once();

    for _ in 0..iterations {
        let size = 1 << 14;
        let (point_vec, scalar_vec) = generate_msm_inputs::<G1Affine>(size, rng_seed);
        let _ = multi_scalar_mul::<G1Affine>(&point_vec, &scalar_vec);
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
