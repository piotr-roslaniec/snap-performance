#!/bin/sh

rm -rf web/pkg && \
wasm-pack build --release --target web --out-dir web/pkg
