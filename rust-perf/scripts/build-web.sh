#!/bin/sh

rm -rf pkg && \
wasm-pack build --release --out-dir bundler/pkg
