import gulp from 'gulp';
import { argv } from 'yargs';
import { spawn } from 'child_process';
import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import del from 'del';

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

gulp.task('clean:styles', () => del([`${buildDir}/**/*.css`]));

gulp.task('build:styles', ['clean:styles'], () => {
  const { compress = false } = argv;

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
    .pipe(gulp.dest(buildDir));
});

gulp.task('watch:styles', () => {
  gulp.watch('./src/client/styles/**/*.scss', ['build:styles']);
});
