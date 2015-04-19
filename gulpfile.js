/*global -$ */
'use strict';
// generated on 2015-02-15 using generator-gulp-webapp 0.2.0
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');

gulp.task('views', function () {
  return gulp.src('app/views/**/*.{html,md}')
    .pipe($.frontMatter({property: 'data'}))
    .pipe($.if('*.md', $.markdown({smartypants: true})))
    .pipe($.wrap({src: 'app/layouts/default.html'}))
    .pipe($.rename(function (path) {
      if (path.basename !== 'index') {
        path.dirname += '/' + path.basename;
        path.basename = 'index';
      }
    }))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('scripts', function () {
  return gulp.src('app/scripts/**/*.jsx')
    .pipe($.sourcemaps.init())
    .pipe($.react())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/scripts'));
});

gulp.task('styles', function () {
  return gulp.src('app/styles/main.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      outputStyle: 'nested', // libsass doesn't support expanded yet
      precision: 10,
      includePaths: ['.'],
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe($.postcss([
      require('autoprefixer-core')({browsers: ['last 3 versions']})
    ]))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('html', ['views', 'scripts', 'styles'], function () {
  var assets = $.useref.assets({searchPath: ['.tmp', 'app']});

  return gulp.src('.tmp/*.html')
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('extras', function () {
  return gulp.src('app/*.*', {dot: true})
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['views', 'scripts', 'styles'], function () {
  browserSync({
    notify: false,
    open: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app']
    }
  });

  // watch for changes
  gulp.watch([
    '.tmp/**/*.html',
    'app/scripts/**/*.js',
    '.tmp/scripts/**/*.js',
    'app/images/**/*'
  ]).on('change', browserSync.reload);

  gulp.watch('app/{views,layouts}/**/*.{html,md}', ['views']);
  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch('app/scripts/**/*.jsx', ['scripts']);
});

gulp.task('serve:dist', function () {
  browserSync({
    notify: false,
    open: false,
    port: 9000,
    server: {baseDir: ['dist']},
    ui: false
  });
});

gulp.task('build', ['html', 'images', 'extras'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
