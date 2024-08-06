# File created to force npm execution in shell (instead of potentially Windows batch).
# This script can be run manually if esbuild is replaced by the following:
# ./node_modules/.bin/esbuild

# Make the ./views/dist directory in case it doesn't exist, and also make it empty.
dist='./views/dist'; mkdir "$dist"; find "$dist" -mindepth 1 -delete &&
# Curly bracket wildcards are not supported by some clients, so this is quite long.
esbuild --platform=browser --sourcemap --minify --bundle --external:*.png --external:*.jpg --external:*.jpeg --external:*.webp --external:*.svg --outdir="$dist" ./views/uv/*.js ./views/assets/js/*.js ./views/assets/js/*/*.js ./views/assets/css/*.css
