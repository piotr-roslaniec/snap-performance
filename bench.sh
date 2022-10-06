pushd rust-perf
./scripts/build-snap.sh
./scripts/build-web.sh
popd
yarn install
yarn build

yarn start