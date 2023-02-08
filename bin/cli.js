#!/usr/bin/env node
////////////////////////
// w3c-html-validator //
// MIT License        //
////////////////////////

// Usage in package.json:
//    "scripts": {
//       "validate": "html-validator docs/*.html flyer.html",
//       "all":      "html-validator"
//    },
//
// Usage from command line:
//    $ npm install --global w3c-html-validator
//    $ html-validator docs/*.html flyer.html
//    $ html-validator  #validate all html files in the project
//
// Contributors to this project:
//    $ cd w3c-html-validator
//    $ node bin/cli.js spec/**/*.html --continue

// Imports
import { cliArgvUtil } from 'cli-argv-util';
import { w3cHtmlValidator } from '../dist/w3c-html-validator.js';
import chalk from 'chalk';
import fs    from 'fs';
import glob  from 'glob';
import log   from 'fancy-log';

// Parameters and flags
const validFlags = ['continue', 'delay', 'exclude', 'note', 'quiet', 'trim'];
const cli =        cliArgvUtil.parse(validFlags);
const files =      cli.params;
const delay =      parseInt(cli.flagMap.delay) || 500;  //default half second debounce pause
const trim =       parseInt(cli.flagMap.trim) || null;

// Validator
const keep =         (filename) => !filename.includes('node_modules/');
const readFolder =   (folder) => glob.sync(folder + '**/*.html', { ignore: '**/node_modules/**/*' });
const expandFolder = (file) => fs.lstatSync(file).isDirectory() ? readFolder(file + '/') : file;
const getFilenames = () => [...new Set(files.map(expandFolder).flat().filter(keep))].sort();
const list =         files.length ? getFilenames() : readFolder('');
const excludes =     cli.flagMap.exclude?.split(',') ?? [];
const filenames =    list.filter(name => !excludes.find(exclude => name.includes(exclude)));
const error =
   cli.invalidFlag ?          cli.invalidFlagMsg :
   !filenames.length ?        'No files to validate.' :
   cli.flagOn.trim && !trim ? 'Value of "trim" must be a positive whole number.' :
   null;
if (error)
   throw Error('[w3c-html-validator] ' + error);
if (filenames.length > 1 && !cli.flagOn.quiet)
   log(chalk.gray('w3c-html-validator'), chalk.magenta('files: ' + filenames.length));
const reporterOptions = {
   continueOnFail: cli.flagOn.continue,
   quiet:          cli.flagOn.quiet,
   maxMessageLen:  trim,
   };
const handleReport = (report) => w3cHtmlValidator.reporter(report, reporterOptions);
const getReport =    (file) => w3cHtmlValidator.validate({ filename: file }).then(handleReport);
filenames.forEach((file, i) => globalThis.setTimeout(() => getReport(file), i * delay));
