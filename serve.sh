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
# (useful for .onion routing or extra privacy)
# ────────────────────────────────────────────────

if [ "${ENABLE_TOR:-false}" = "true" ]; then
    echo "Starting Tor in background..."
    tor --RunAsDaemon 1 > /dev/null 2>&1 || {
        echo "Warning: Tor failed to start – continuing without it"
    }
    # Give Tor a few seconds to bootstrap (prevents immediate connection issues)
    sleep 6
    echo "Tor started (or attempted)."
else
    echo "Tor disabled (ENABLE_TOR is not 'true')."
fi

# ────────────────────────────────────────────────
# Start the Node.js application
# Prefers pm2-runtime if available (common in production Docker setups)
# Fallback to plain node otherwise
# ────────────────────────────────────────────────

echo "Launching Node application..."

if command -v pm2 >/dev/null 2>&1; then
    echo "Using pm2-runtime (recommended for production)"
    exec pm2-runtime start ecosystem.config.js
else
    echo "pm2 not found – starting node directly"
    # Replace backend.js with your actual entry point (most likely src/index.js)
    exec node src/index.js
fi
