#!/bin/bash -e

npm install

for dir in projects/*
do
  if [ -f "$dir/package.json" ]; then
    pushd "$dir"
      npm install
    popd
  fi
done

node src/index.js
