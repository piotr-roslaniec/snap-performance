#!/bin/bash

set -e

rm -rf node_modules/rust-perf

pushd rust-perf
./scripts/build-web.sh
./scripts/build-bundler.sh
popd

yarn install
yarn build
yarn start