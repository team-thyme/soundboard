# Soundboard
> More like knäckebröd, har jag rätt?

## Features
 - Every wav/mp3/ogg file you add to `samples/` will be glorified instantaneously
 - Responsive search
 - Direct, obfuscated, linking to soundbytes
 - Press <kbd>Enter</kbd> in the search bar to play a random sample. (This also works when a (partial) search term is entered.)
 - Hold shift to play soundbytes simultaneously
 - Hold control to play soundbytes on a loop
 - Maximum overkill

Samples not included!

## How to _deal with it?_
 1. Add some sound samples to `samples/`.
 2. Build the project by executing `build.sh` or `build.bat` depending on platform.
 3. __Optional:__ Start a development server by executing `server.sh` or `server.bat`.
 4. __Recommended:__ Add X-Sendfile support (see below).

> Building the soundboard requires having [Node.js](https://nodejs.org/), [PHP](https://secure.php.net/) and [Composer](https://getcomposer.org/) installed on your system.

### X-Sendfile
Samples are served through PHP by default. This is due to them residing outside of the public directory. This disables certain Apache cleverness like buffering, and will cause other weird side-effects. This can be prevented by serving them with X-Sendfile. To set up X-Sendfile for Apache on Linux, you'll have to install the Apache mod using something similar to `sudo apt-get install libapache2-mod-xsendfile`. The soundboard will automatically start using X-Sendfile, but it will deny access to the samples directory (giving a 404). Allow X-Sendfile to serve the files by adding like `XSendFilePath /path/to/soundboard/samples` to your Apache configuration/virtualhost setup.

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

## So you want your own client? _With blackjack and hookers?_
There's [an API documentation](https://github.com/villermen/soundboard/wiki/API-documentation) for that on [the wiki](https://github.com/villermen/soundboard/wiki)!

Design by [Mesoptier](https://github.com/mesoptier)!
