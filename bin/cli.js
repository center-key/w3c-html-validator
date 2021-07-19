#!/usr/bin/env node
// w3c-html-validator ~~ MIT License
//
// Usage in package.json:
//    "scripts": {
//       "validate": "w3c-html-validator docs/*.html flyer.html",
//       "all":      "w3c-html-validator"
//    },
//
// Usage from command line:
//    $ npx w3c-html-validator docs/*.html flyer.html
//    $ npx w3c-html-validator  #validate all html files in project
//
// Contributors to this project:
//    $ cd w3c-html-validator
//    $ node bin/cli.js spec/**/*.html

// Imports
import chalk from 'chalk';
import glob from 'glob';
import log from 'fancy-log';
import { w3cHtmlValidator } from '../dist/w3c-html-validator.js';

// Parameters
const args =  process.argv.slice(2);
const flags = args.filter(arg => /^-/.test(arg));
const files = args.filter(arg => !/^-/.test(arg));

// Validator
log('w3c-html-validator');
log(chalk.gray('files:'), chalk.cyan(files.length));
if (flags.length)
   log(chalk.red('Flags not supported:'), flags.join(' '));
const keep =         (filename) => !filename.includes('node_modules/');
const allHtmlFiles = () => glob.sync('**/*.html', { ignore: '**/node_modules/**/*' });
const filenames =    files.length ? [...new Set(files.filter(keep))].sort() : allHtmlFiles();
filenames.forEach(file =>
   w3cHtmlValidator.validate({ filename: file }).then(w3cHtmlValidator.reporter));
