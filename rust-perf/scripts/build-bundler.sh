#!/bin/sh

rm -rf bundler/pkg* && \
wasm-pack build --release --out-dir pkg-bundler && \
wasm-pack build --debug --out-dir pkg-bundler-debug
