#!/usr/bin/env bash

case "$1" in
    prod*) BUILD_MODE='production' ;;
    dev*) BUILD_MODE='development' ;;
    watch) ;&
    '') ;&
    serve) BUILD_MODE='serve' ;;
    *) echo "Unknown build mode \"$1\"." && exit 1 ;;
esac

echo "Building soundboard in \"$BUILD_MODE\" mode..."

if [ "$BUILD_MODE" == 'production' ]; then
    composer install --no-dev --optimize-autoloader
    npm install
    npm run build
    exit 0
fi

composer install
npm install

if [ "$BUILD_MODE" == 'development' ]; then
    npm run build
    exit 0
fi

if [ "$BUILD_MODE" == 'serve' ]; then
    php -S 0.0.0.0:32658 public/api/index.php & \
    npm run dev-server & \
    npm run dev-build
    exit 0
fi
