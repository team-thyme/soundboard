# Soundboard
> More like knäckebröd, har jag rätt?

## How to _deal with it?_
 1. Add some sound samples to `public/samples/`.
 2. Run `npm install` to install dependencies _and_ build the assets.
 3. __Optional:__ Run `gulp php-server` to start a PHP server.
 4. __Optional:__ Run `gulp watch` to start watchers that will rebuild assets on change.

### Gulp Tasks
```shell
> gulp build [--no-compress] [--sourcemaps] # Simple calls the other build tasks
> gulp build:scripts # Same options as gulp build
> gulp build:styles # Same options as gulp build
> gulp build:fontello

> gulp watch [--no-compress] [--sourcemaps] [--livereload] # Simply calls the other watch tasks
> gulp watch:scripts # Same options as gulp watch
> gulp watch:styles # Same options as gulp watch

> gulp php-server
```

### LiveReload
To live reload scripts and styles you need to have [one of these extensions](http://livereload.com/extensions/) installed and use the `--livereload` option on the `gulp watch` tasks.

## Features
 - Every wav/mp3/ogg you add to `public/samples/` will be glorified instantaneously
 - Responsive search
 - Direct, obfuscated, linking to soundbytes
 - Random button
 - Hold shift to play soundbytes simultaneously

Samples not included!

Design by [Mesoptier](https://github.com/mesoptier)!
