#!/usr/bin/env sh

# TODO: Production optional (build.sh production)

composer install --no-dev --optimize-autoloader
npm install --production
npm run build
