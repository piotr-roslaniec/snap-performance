#!/bin/sh

rm -rf bundler/pkg && \
wasm-pack build --release --out-dir bundler/pkg
