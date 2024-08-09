#!/bin/sh

set -e

start_dir=`pwd`

# needs to be checked out in the parent directory of the agent
# (https://github.com/newrelic/SSL_CA_cert_bundle only available to NR staff)
ca_store="../SSL_CA_cert_bundle"
bundle_generator="./bin/ca-gen.js"

if [ -d $ca_store ]; then
    cd $ca_store
    git pull --rebase origin master
    cd $start_dir
    node $bundle_generator
fi
