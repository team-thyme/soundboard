import gulp from 'gulp';
import { argv } from 'yargs';
import { spawn } from 'child_process';

import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import gulpif from 'gulp-if';
import { log } from 'gulp-util';
import gulpLivereload from 'gulp-livereload';
import gulpSourcemaps from 'gulp-sourcemaps';

import browserify from 'browserify';
import babelify from 'babelify';
import watchify from 'watchify';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import del from 'del';
import sourceStream from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import uglify from 'gulp-uglify';
import yamlify from 'yamlify';

const buildDir = `${__dirname}/public/build`;

const {
  compress = true,
  livereload = false,
  sourcemaps = false,
} = argv;

const browserifyOptions = {
  entries: ['./src/client/scripts/main.js'],
  debug: sourcemaps,
};

gulp.task('php-server', (callback) => {
  const {
    host = '0.0.0.0',
    port = 80,
  } = argv;

  // Start PHP built-in web server
  spawn('php', [
    '-S',
    `${host}:${port}`,
    '-t',
    `${__dirname}/public`,
    `${__dirname}/router.php`,
  ], {
    shell: true,
    stdio: [
      process.stdin,
      process.stdout,
      process.stderr,
    ],
  });
});

gulp.task('build', ['build:scripts', 'build:styles', 'build:iconfont']);
gulp.task('watch', ['watch:scripts', 'watch:styles']);

gulp.task('clean:styles', () => del([`${buildDir}/*.{css,css.map}`]));

gulp.task('build:styles', ['clean:styles'], () => {
  const processors = [
    autoprefixer({ browsers: ['last 1 version'] }),
  ];

  if (compress) {
    processors.push(cssnano());
  }

  return gulp.src('./src/client/styles/**/*.scss')
    .pipe(gulpif(sourcemaps, gulpSourcemaps.init()))
      .pipe(sass().on('error', sass.logError))
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

  gulp.watch('./src/client/styles/**/*.scss', ['build:styles']);
});

gulp.task('clean:scripts', () => del([`${buildDir}/*.{js,js.map}`]));

function createBundler(options = {}) {
  return browserify(Object.assign({}, browserifyOptions, options))
    .transform(yamlify)
    .transform(babelify);
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
  return gulp.src('./src/client/iconfont/**/*.{css,eot,svg,ttf,woff,woff2}')
    .pipe(gulp.dest(`${buildDir}/iconfont`));
});
