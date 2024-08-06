# Make the ./views/dist directory in case it doesn't exist, and also make it empty.
mkdir ./views/dist; find ./views/dist -mindepth 1 -delete &&
# Curly bracket wildcards are not supported by some clients, so this is quite long.
esbuild --platform=browser --sourcemap --minify --bundle --external:*.png --external:*.jpg --external:*.jpeg --external:*.webp --external:*.svg --outdir=./views/dist ./views/*/*.js ./views/*/*/*.js ./views/*/*/*/*.js ./views/assets/css/*.css