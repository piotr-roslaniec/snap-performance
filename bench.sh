pushd rust-perf
./scripts/build-snap.sh
./scripts/build-web.sh
popd

yarn build

yarn start