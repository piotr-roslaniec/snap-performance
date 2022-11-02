#!/bin/sh

rm -rf web/pkg* && \
wasm-pack build --release --target web --out-dir pkg-web && \
wasm-pack build --debug --target web --out-dir pkg-web-debug
