import gulp from 'gulp';
import { argv } from 'yargs';
import { spawn } from 'child_process';
import path from 'path';
import del from 'del';
import sourceStream from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';

import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import gulpif from 'gulp-if';
import { log } from 'gulp-util';
import gulpLivereload from 'gulp-livereload';
import gulpSourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';

import browserify from 'browserify';
import svgify from 'svg-browserify';
import babelify from 'babelify';
import watchify from 'watchify';
import yamlify from 'yamlify';

import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

const buildDir = `${__dirname}/public/build`;

const {
  compress = true,
  livereload = false,
  sourcemaps = false,
} = argv;

const browserifyOptions = {
  entries: ['src/scripts/main.js'],
  debug: sourcemaps,
};

gulp.task('build', ['build:scripts', 'build:styles', 'build:iconfont']);
gulp.task('watch', ['watch:scripts', 'watch:styles']);

gulp.task('clean:styles', () => del([`${buildDir}/*.{css,css.map}`]));

gulp.task('build:styles', ['clean:styles'], () => {
  const sassOptions = {
    importer(url, prev, done) {
      if (url[0] === '~') {
        url = path.resolve('node_modules', url.substr(1));
      }

      return { file: url };
    },
  };

  const processors = [
    autoprefixer({ browsers: ['last 1 version'] }),
  ];

  if (compress) {
    processors.push(cssnano());
  }

  return gulp.src('src/styles/**/*.scss')
    .pipe(gulpif(sourcemaps, gulpSourcemaps.init()))
      .pipe(sass(sassOptions).on('error', sass.logError))
      .pipe(postcss(processors))
      .pipe(rename('style.css'))
    .pipe(gulpif(sourcemaps, gulpSourcemaps.write('./')))
    .pipe(gulp.dest(buildDir))
    .pipe(gulpif(livereload, gulpLivereload()));
});

gulp.task('watch:styles', (callback) => {
  if (livereload) {
    gulpLivereload.listen();
  }

  gulp.watch('src/styles/**/*.scss', ['build:styles']);
});

gulp.task('clean:scripts', () => del([`${buildDir}/*.{js,js.map}`]));

function createBundler(options = {}) {
  return browserify(Object.assign({}, browserifyOptions, options))
    .transform(babelify)
    .transform(svgify)
    .transform(yamlify);
}

function bundle(bundler) {
  log('[browserify] Bundle start');

  return bundler.bundle(() => log('[browserify] Bundle completed'))
    .on('error', (err) => {
      log('[browserify]', err.toString());
    })
    .pipe(sourceStream('main.js'))
    .pipe(rename('script.js'))
    .pipe(buffer())
    .pipe(gulpif(sourcemaps, gulpSourcemaps.init({ loadMaps: true })))
      .pipe(gulpif(compress, uglify()))
    .pipe(gulpif(sourcemaps, gulpSourcemaps.write('./')))
    .pipe(gulp.dest(buildDir))
    .pipe(gulpif(livereload, gulpLivereload()));
}

gulp.task('build:scripts', ['clean:scripts'], () => {
  const bundler = createBundler();

  return bundle(bundler);
});

gulp.task('watch:scripts', (callback) => {
  if (livereload) {
    gulpLivereload.listen();
  }

  const bundler = createBundler(watchify.args)
    .plugin(watchify);

  bundler.on('update', () => {
    log('[watch:scripts] Scripts changed, starting build');
    bundle(bundler);
  });
  bundle(bundler);
});

gulp.task('clean:iconfont', () => del([`${buildDir}/iconfont/`]));

gulp.task('build:iconfont', ['clean:iconfont'], () => {
  return gulp.src('src/iconfont/**/*.{css,eot,svg,ttf,woff,woff2}')
    .pipe(gulp.dest(`${buildDir}/iconfont`));
});
