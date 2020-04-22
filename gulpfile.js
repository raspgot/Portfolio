const gulp = require('gulp');
const sass = require('gulp-sass');
const purgecss = require('gulp-purgecss')
const rename = require('gulp-rename');
const order = require('gulp-order');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();
const merge = require('merge-stream');
const cleanCSS = require('gulp-clean-css');
const header = require('gulp-header');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');
const validator = require('gulp-html');

// Banner placed in bottom of each dist assets
var banner = ['/**',
    ' * Raspgot',
    ' * @url https://raspgot.fr',
    ' */',
    '', ''
].join('\n');

// Clean dist folder
function remove() {
    return del(['dist']);
}

// HTML
function html() {
    return gulp.src('src/index.html')
        .pipe(validator())
        .pipe(gulp.dest('dist/'));
}

// CSS
function style() {
    var purge = gulp.src('src/scss/main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(purgecss({
            content: ['src/index.html']
        }))
        .pipe(concat('purged.css'));

    var purgeFix = gulp.src('src/scss/purgecss-fix.css')
        .pipe(concat('purged-fix.css'))

    var mergedStream = merge(purge, purgeFix)
        .pipe(concat('raspgot.min.css'))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(cleanCSS())
        .pipe(header(banner))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream());

    return mergedStream;
}

// JS
function script() {
    return gulp.src(['src/js/*.js'])
        .pipe(order([
            "src/js/jquery.js",
            "src/js/bootstrap.bundle.js",
            "src/js/argon.js",
            "src/js/contact.js",
            "src/js/jquery.validate.js"
        ], {
            base: './'
        }))
        .pipe(concat('all.js'))
        .pipe(rename('raspgot.min.js'))
        .pipe(uglify())
        .pipe(header(banner))
        .pipe(gulp.dest('dist'));
}

// Images
function image() {
    return gulp.src('src/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img'))
}

// Move to dist
function move() {
    var filesToMove = [
        'src/mail.php',
        'src/fonts/*',
        'src/CV-2020.pdf',
        'src/errors/*',
        'src/.htaccess',
        'src/sitemap.xml',
        'src/robot.txt'
    ];
    return gulp.src(filesToMove, {
            base: 'src'
        })
        .pipe(gulp.dest('dist'));
}

// BrowserSync
function watch() {
    browserSync.init({
        server: {
            baseDir: 'dist'
        }
    });
    gulp.watch('src/js/*.js', script)
    gulp.watch('src/scss/**/*.scss', style)
    gulp.watch('src/index.html', html)
    gulp.watch('src/index.html').on('change', browserSync.reload)
}

// Gulp tasks
exports.remove = remove;
exports.html = html;
exports.style = style;
exports.script = script;
exports.image = image;
exports.watch = watch;
exports.move = move;
exports.default = gulp.series(remove, html, style, script, image, move, watch);