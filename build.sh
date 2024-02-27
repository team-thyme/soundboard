#!/usr/bin/env bash

test -f .env && source .env
APP_ENV=${APP_ENV:=dev}

if [ "$APP_ENV" == 'dev' ]; then
    if [ "$1" == '--serve' ]; then
        echo "Building soundboard in development mode with dev servers..."
    else
        echo "Building soundboard in development mode..."
    fi

    composer install
    npm install

    if [ "$1" == '--serve' ]; then
        composer run dev-server & \
        npm run dev-server
        exit 0
    fi

    npm run build
    exit 0
fi

echo "Building soundboard in production mode..."
rm -rf .slim-cache
composer install --no-dev --optimize-autoloader
npm install
BASE_URL=${BASE_URL:=/} npm run build-production
exit 0
