// W3C HTML Validator
// gulp configuration and tasks

// Imports
import gulp from        'gulp';
import header from      'gulp-header';
import mergeStream from 'merge-stream';
import rename from      'gulp-rename';
import replace from     'gulp-replace';
import size from        'gulp-size';
import { readFileSync } from 'fs';

// Setup
const pkg =           JSON.parse(readFileSync('./package.json'));
const home =          pkg.repository.replace('github:', 'github.com/');
const banner =        '//! W3C HTML Validator v' + pkg.version + ' ~ ' + home + ' ~ MIT License\n\n';
const setPkgVersion = () => replace('[VERSION]', pkg.version);

// Tasks
const task = {

   makeDistribution() {
      const buildDts = () =>
         gulp.src('build/w3c-html-validator.d.ts')
            .pipe(header(banner))
            .pipe(size({ showFiles: true }))
            .pipe(gulp.dest('dist'));
      const buildJs = () =>
         gulp.src('build/w3c-html-validator.js')
            .pipe(header(banner))
            .pipe(setPkgVersion())
            .pipe(size({ showFiles: true }))
            .pipe(gulp.dest('dist'));
      const buildUmd = () =>
         gulp.src('build/umd/w3c-html-validator.js')
            .pipe(header(banner))
            .pipe(setPkgVersion())
            .pipe(rename({ extname: '.umd.cjs' }))
            .pipe(size({ showFiles: true }))
            .pipe(gulp.dest('dist'));
      return mergeStream(buildDts(), buildJs(), buildUmd());
      },

   };

// Gulp
gulp.task('make-dist', task.makeDistribution);
