#!/bin/sh
# Start Tor in the background; note that this may take awhile even after the app starts
tor &

exec node backend.js
