# Soundboard
> More like knäckebröd, har jag rätt?

## Features
- Responsive search
- Direct linking to soundbytes without giving a clue on what's about to play
- Uses a configurable [back-end](https://github.com/villermen/soundboard-back-end)
- Contains maximum overkill

## Contrails
- <kbd>Enter</kbd> while focused on the search bar to play a random visible sample
- Hold <kbd>Shift</kbd> to play samples simultaneously
- Hold <kbd>Ctrl</kbd> to play samples on a loop
- Press <kbd>Space</kbd> while not focused on the search bar to stop all playing samples
- <kbd>Right-click</kbd> on a sample for all sample-options

## Browser support
The soundboard works only in _true_ browsers.
This means that recent versions of Chrome and Firefox are fully supported.
Other browsers give mixed results, but who uses those anyway?

## How to _deal with it?_
1. Download the latest release, or build the application from source.
2. Alter the client config options in `config.json`, to make it point to your backend.
3. Put the files (or when building, the files in `public/`) in a web-accessible directory.
4. If hosting from a subdirectory, change the href of the `<base>` tag in index.html to point to your subdirectory. This allows the page to load its resources and arguments no matter where it is called from

> Building the front-end requires [Node.js](https://nodejs.org/). [Apache HTTP Server](https://www.apache.org/) is recommended for hosting the front-end, as it will work without having to set up redirecting to index.html manually.

### Development
For development, there are a few npm scripts created to ease development:
```shell
> npm run devserver # Hosts a development server on localhost:80, routing all unresolved requests through `public/index.html`.
> npm run build # Builds the sources without development options
> npm run devbuild # Builds, watches and livereloads the sources indefinitely
```

Internally, the build scripts use Gulp tasks which can also be called separately:
```shell
> gulp build [--no-compress] [--sourcemaps] # Simply calls the other build tasks
> gulp build:scripts # Same options as gulp build
> gulp build:styles # Same options as gulp build
> gulp build:fontello

> gulp watch [--no-compress] [--sourcemaps] [--livereload] # Simply calls the other watch tasks
> gulp watch:scripts # Same options as gulp watch
> gulp watch:styles # Same options as gulp watch
```

### LiveReload
To live reload scripts and styles in your browser you need to have [one of these browser extensions](http://livereload.com/extensions/) installed.
