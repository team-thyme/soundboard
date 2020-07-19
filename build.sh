#!/usr/bin/env bash

if [ "$1" == 'production' ]; then
    echo 'Building soundboard in "production" mode...'
    composer install --no-dev --optimize-autoloader
    npm install --production
else
    echo 'Building soundboard in "development" mode...'
    composer install
    npm install
fi

npm run build
