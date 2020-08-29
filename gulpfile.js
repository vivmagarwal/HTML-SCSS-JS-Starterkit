const gulp = require('gulp'),
  plumber      = require('gulp-plumber'),   
  watch = require('gulp-watch'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  sassGlob = require('gulp-sass-glob'),
  autoprefixer = require('gulp-autoprefixer'),
  browserSync = require('browser-sync').create(),
  webpack = require('webpack'),
  webpackConfig = require('./webpack.config'),
  svgSprite = require('gulp-svg-sprite');

sass.compiler = require('node-sass');

var srcDir_svg = 'src/svgs/*.svg'; // <-- Set to your SVG base directory
var outDir_svg = 'build/svgs'; // <-- Main output directory

var config = {
  "dest": "/dest",
  "log": "info",
  "shape": {
      "spacing": {
          "padding": 1
      }
  },
  "transform": [],
  "mode": {
      "css": {
          "dest": ".",
          "sprite": "svg-sprite.svg",
          "bust": false,
          "render": {
              "css": {
                  "dest": "./svg-sprite.css"
              }
          },
          "example": true
      }
  }
};

gulp.task('svg', function svg() {
  return gulp.src(srcDir_svg)
  .pipe(plumber())
  .pipe(svgSprite(config)).on('error', function(error){ console.log(error); })
  .pipe(gulp.dest(outDir_svg))
});

gulp.task('html', function html() {
  return gulp.src('src/index.html').pipe(gulp.dest('build'));
});

gulp.task('reload', async function reload() {
  browserSync.init(
    {
      server: {
        baseDir: 'build',
      },
    },
    function() {
      browserSync.reload();
    }
  );
});

gulp.task('scripts', async function scripts() {
  webpack(webpackConfig, function(err, stats) {
    if (err) console.log('Webpack', err.toString());
  });
});

gulp.task('styles', function styles() {
  return gulp
    .src('src/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass.sync({ outputStyle: 'expanded', includePaths: ['node_modules'] }).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer({ cascade: false }))
    .pipe(gulp.dest('build'))
    .pipe(browserSync.stream());
});

gulp.task('default', gulp.series(gulp.parallel('html', 'scripts', 'styles')));

gulp.task('cssInject', function cssInject() {
  return gulp.src('src/**/*.scss').pipe(browserSync.stream());
});

gulp.task('watch', function() {
  browserSync.init({
    notify: false,
    server: {
      baseDir: 'build',
    },
  });

  watch(
    ['src/index.html', 'src/script-es6.js'],
    gulp.series(gulp.parallel('html', 'scripts'), gulp.parallel('reload'))
  );
  watch(['src/style.scss'], gulp.series(gulp.parallel('styles')));
});
