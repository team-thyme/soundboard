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
    test -f .env && source .env
    composer install --no-dev --optimize-autoloader
    yarn install
    BASE_URL=${BASE_URL:=/} yarn run build-production
    exit 0
fi

composer install
yarn install

if [ "$BUILD_MODE" == 'development' ]; then
    yarn run build
    exit 0
fi

if [ "$BUILD_MODE" == 'serve' ]; then
    composer run dev-server & \
    yarn run dev-server
    exit 0
fi
