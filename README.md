# Soundboard
> More like knäckebröd, har jag rätt?

## Features
 - Every wav/mp3/ogg file you add to `samples/` will be glorified instantaneously
 - Responsive search
 - Direct, obfuscated, linking to soundbytes
 - Hold shift to play soundbytes simultaneously
 - Hold control to play soundbytes on a loop
 - Maximum overkill

Samples not included!

## How to _deal with it?_
 1. Add some sound samples to `samples/`.
 2. Build the project by executing `build.sh` or `build.bat` depending on platform.
 3. __Optional:__ Start a development server by executing `server.sh` or `server.bat`.

> Building the soundboard requires having [Node.js](https://nodejs.org/), [PHP](https://secure.php.net/) and [Composer](https://getcomposer.org/) installed on your system.

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

Design by [Mesoptier](https://github.com/mesoptier)!
