#!/bin/sh
set -e

echo "========================================"
echo "Starting SCBypass (v6.9.4)..."
echo "========================================"

if [ "${ENABLE_TOR:-false}" = "true" ]; then
    echo "Starting Tor..."
    tor --RunAsDaemon 1 || echo "Tor failed, continuing..."
    sleep 6
fi

echo "Launching SCBypass..."
exec pnpm run deployment
