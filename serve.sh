#!/bin/sh
# ────────────────────────────────────────────────
# SCBypass Startup Script (v6.9.4)
# Starts Tor (optional) and the Node.js application
# ────────────────────────────────────────────────

set -e

echo "========================================"
echo "Starting SCBypass (v6.9.4)..."
echo "TikTok: https://www.tiktok.com/@holy.nik.offz"
echo "Discord: https://discord.gg/TnPCzYWZAP"
echo "========================================"

# ────────────────────────────────────────────────
# Optional: Start Tor if ENABLE_TOR is set to true
# ────────────────────────────────────────────────

if [ "${ENABLE_TOR:-false}" = "true" ]; then
    echo "Starting Tor in background..."
    tor --RunAsDaemon 1 > /dev/null 2>&1 || {
        echo "Warning: Tor failed to start – continuing without it"
    }
    sleep 6
    echo "Tor started (or attempted)."
else
    echo "Tor disabled (ENABLE_TOR is not 'true')."
fi

# ────────────────────────────────────────────────
# Start the Node.js application
# ────────────────────────────────────────────────

echo "Launching Node application..."

if command -v pm2 >/dev/null 2>&1; then
    echo "Using pm2-runtime (recommended for production)"
    exec pm2-runtime start ecosystem.config.js
else
    echo "pm2 not found – starting node directly"
    exec node src/server.mjs
fi
