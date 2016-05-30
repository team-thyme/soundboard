import gulp from 'gulp';
import { argv } from 'yargs';
import { spawn } from 'child_process';

import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import gulpif from 'gulp-if';
import { log, colors } from 'gulp-util';
import gulpLivereload from 'gulp-livereload';

import browserify from 'browserify';
import babelify from 'babelify';
import watchify from 'watchify';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import del from 'del';
import sourceStream from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import uglify from 'gulp-uglify';

const buildDir = `${__dirname}/public/build`;

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

gulp.task('build', ['build:scripts', 'build:styles']);
gulp.task('watch', ['watch:scripts', 'watch:styles']);

gulp.task('clean:styles', () => del([`${buildDir}/**/*.css`]));

gulp.task('build:styles', ['clean:styles'], () => {
  const { compress = true, livereload } = argv;

  const processors = [
    autoprefixer({ browsers: ['last 1 version'] }),
  ];

  if (compress) {
    processors.push(cssnano());
  }

  return gulp.src('./src/client/styles/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(rename('style.css'))
    .pipe(gulp.dest(buildDir))
    .pipe(gulpif(livereload, gulpLivereload()));
});

gulp.task('watch:styles', (callback) => {
  const { livereload = false } = argv;

  if (livereload) {
    gulpLivereload.listen();
  }

  gulp.watch('./src/client/styles/**/*.scss', ['build:styles']);
});

gulp.task('clean:scripts', () => del([`${buildDir}/**/*.js`]));

function bundle(bundler) {
  const { compress = true, livereload = false } = argv;

  log('[browserify] Bundle start');

  return bundler.bundle(() => log('[browserify] Bundle completed'))
    .pipe(sourceStream('main.js'))
    .pipe(buffer())
    .pipe(gulpif(compress, uglify()))
    .pipe(rename('script.js'))
    .pipe(gulp.dest(buildDir))
    .pipe(gulpif(livereload, gulpLivereload()));
}

gulp.task('build:scripts', ['clean:scripts'], () => {
  const options = {
    entries: ['./src/client/scripts/main.js'],
  };

  const bundler = browserify(options)
    .transform(babelify);

  return bundle(bundler);
});

gulp.task('watch:scripts', (callback) => {
  const { livereload = false } = argv;

  if (livereload) {
    gulpLivereload.listen();
  }

  const options = Object.assign({}, watchify.args, {
    entries: ['./src/client/scripts/main.js'],
  });

  const bundler = browserify(options)
    .transform(babelify)
    .plugin(watchify);

  bundler.on('update', () => {
    log('[watch:scripts] Scripts changed, starting build');
    bundle(bundler);
  });
  bundle(bundler);
});
