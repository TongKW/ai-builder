#!/bin/bash

ROOTDIR=$PWD

# Loop through all directories in $ROOTDIR/lib/lambda
for func in $ROOTDIR/lib/lambda/*; do
  if [ -d "$func" ]; then  # Check if it's a directory
    cd "$func"
    rm -rf node_modules
    npm install
    rm -f src.zip  # Use -f to avoid errors if the file does not exist
    zip -r src.zip node_modules index.mjs
  fi
done

cd $ROOTDIR
cdk deploy