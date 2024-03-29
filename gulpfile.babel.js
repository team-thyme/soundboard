import autoprefixer from 'autoprefixer';
import babelify from 'babelify';
import browserify from 'browserify';
import buffer from 'vinyl-buffer';
import cssnano from 'cssnano';
import del from 'del';
import fs from 'fs-extra';
import gulp from 'gulp';
import gulpif from 'gulp-if';
import gulpLivereload from 'gulp-livereload';
import path from 'path';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import gulpSass from 'gulp-sass';
import sourceStream from 'vinyl-source-stream';
import svgify from 'svg-browserify';
import uglify from 'gulp-uglify';
import watchify from 'watchify';
import { argv } from 'yargs';
import sass from 'sass';
import gulpSourcemaps from 'gulp-sourcemaps';

const publicDir = `${__dirname}/public`;
const distDir = `${__dirname}/dist`;
const buildDir = `${publicDir}/build`;

const {
    livereload = false,
    sourcemaps = false,
} = argv;

const browserifyOptions = {
    entries: ['frontend/src/main.js'],
    debug: sourcemaps,
};

gulp.task('clean:styles', () => del([`${buildDir}/*.{css,css.map}`]));
gulp.task('build:styles', gulp.series('clean:styles', () => {
    return gulp.src('frontend/styles/**/*.scss')
        .pipe(gulpSass(sass)({
            importers: [
                (url) => {
                    let resolvedUrl = url;

                    if (url[0] === '~') {
                        resolvedUrl = path.resolve('node_modules', url.substr(1));
                    }

                    return { file: resolvedUrl };
                }
            ],
        }))
        .pipe(postcss([
            autoprefixer(),
            cssnano(),
        ]))
        .pipe(rename('style.css'))
        .pipe(gulp.dest(buildDir))
        .pipe(gulpif(livereload, gulpLivereload()));
}));
gulp.task('watch:styles', () => {
    if (livereload) {
        gulpLivereload.listen();
    }

    gulp.watch('frontend/styles/**/*.scss', gulp.series('build:styles'));
});

gulp.task('clean:scripts', () => del([
    `${buildDir}/*.{js,js.map}`,
    `${buildDir}/ogv`,
]));

function createBundler(options = {}) {
    return browserify({...browserifyOptions, ...options})
        .transform(babelify)
        .transform(svgify);
}

function bundle(bundler) {
    console.log('[browserify] Bundle start');

    return bundler
        .bundle(() => console.log('[browserify] Bundle completed'))
        .on('error', (err) => {
            console.log('[browserify]', err.toString());
        })
        .pipe(sourceStream('main.js'))
        .pipe(rename('script.js'))
        .pipe(buffer())
        .pipe(gulpif(sourcemaps, gulpSourcemaps.init({ loadMaps: true })))
        .pipe(uglify())
        .pipe(gulpif(sourcemaps, gulpSourcemaps.write('./')))
        .pipe(gulp.dest(buildDir))
        .pipe(gulpif(livereload, gulpLivereload()));
}

const buildScripts = () => {
    // Copy relevant ogv.js workers.
    fs.copy(`${__dirname}/node_modules/ogv/dist`, `${buildDir}/ogv`, {
        overwrite: true,
        filter: (file) => {
            const baseName = path.basename(file);
            return (
                baseName === 'dist' ||
                baseName === 'ogv-worker-audio.js' ||
                baseName.startsWith('ogv-decoder-audio-') ||
                baseName.startsWith('ogv-demuxer-')
            );
        }
    }, (error) => {
        if (error && error.code !== 'EEXIST') {
            throw error;
        }
    });

    // Copy dist files to public once
    fs.copy(distDir, publicDir, { overwrite: false }, (error) => {
        if (error && error.code !== 'EEXIST') {
            throw error;
        }
    });

    // Below code plain just doesn't work while documentation states it should.
    gulp
        .src('dist/config.json')
        .pipe(rename('config.json'))
        .pipe(gulp.dest(publicDir, { overwrite: false }));

    return bundle(createBundler());
};

gulp.task('build:scripts', gulp.series(
    'clean:scripts',
    buildScripts
));

gulp.task('watch:scripts', () => {
    if (livereload) {
        gulpLivereload.listen();
    }

    const bundler = createBundler(watchify.args)
        .plugin(watchify);

    bundler.on('update', () => {
        console.log('[watch:scripts] Scripts changed, starting build');
        bundle(bundler);
    });
    bundle(bundler);
});

gulp.task('clean:iconfont', () => del([`${buildDir}/iconfont/`]));

const buildIconfont = () =>
    gulp.src('frontend/iconfont/**/*.{css,eot,svg,ttf,woff,woff2}')
    .pipe(gulp.dest(`${buildDir}/iconfont`));

gulp.task('build:iconfont', gulp.series(
    'clean:iconfont',
    buildIconfont
));

gulp.task('build', gulp.parallel(
    'build:scripts',
    'build:styles',
    'build:iconfont'
));

gulp.task('watch', gulp.parallel(
    'watch:scripts',
    'watch:styles'
));
