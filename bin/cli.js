#!/usr/bin/env node
////////////////////////
// w3c-html-validator //
// MIT License        //
////////////////////////

// Usage in package.json:
//    "scripts": {
//       "validate": "html-validator docs flyer.html",
//       "all":      "html-validator"
//    },
//
// Usage from command line:
//    $ npm install --save-dev w3c-html-validator
//    $ npx html-validator dist  #validate all html files in the dist folder
//    $ npx html-validator docs flyer.html
//
// Contributors to this project:
//    $ cd w3c-html-validator
//    $ node bin/cli.js spec --continue

// Imports
import { cliArgvUtil } from 'cli-argv-util';
import { globSync } from 'glob';
import { w3cHtmlValidator } from '../dist/w3c-html-validator.js';
import fs from 'fs';

// Parameters and flags
const validFlags = ['continue', 'delay', 'exclude', 'ignore', 'note', 'quiet', 'trim'];
const cli =        cliArgvUtil.parse(validFlags);
const files =      cli.params;
const ignore =     cli.flagMap.ignore ?? null;
const delay =      Number(cli.flagMap.delay) || 500;  //default half second debounce pause
const trim =       Number(cli.flagMap.trim) || null;

// Validator
const keep =         (filename) => !filename.includes('node_modules/');
const readFolder =   (folder) => globSync(folder + '**/*.html', { ignore: '**/node_modules/**/*' });
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
   w3cHtmlValidator.summary(filenames.length);
const reporterOptions = {
   continueOnFail: cli.flagOn.continue,
   quiet:          cli.flagOn.quiet,
   maxMessageLen:  trim,
   };
const isRegex =      /^\/.*\/$/;  //starts and ends with a slash indicating it's a regex
const skip =         isRegex.test(ignore) ? new RegExp(ignore.slice(1, -1)) : ignore;
const handleReport = (report) => w3cHtmlValidator.reporter(report, reporterOptions);
const options =      (filename) => ({ filename: filename, ignoreMessages: skip });
const getReport =    (filename) => w3cHtmlValidator.validate(options(filename)).then(handleReport);
filenames.forEach((filename, i) => globalThis.setTimeout(() => getReport(filename), i * delay));
