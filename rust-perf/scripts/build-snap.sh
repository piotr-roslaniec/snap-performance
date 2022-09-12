#!/bin/sh

rm -rf pkg && \
wasm-pack build --release --target web --out-dir web/pkg
