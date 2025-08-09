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
//    $ npm install
//    $ npm test
//    $ node bin/cli.js spec --continue

// Imports
import { cliArgvUtil } from 'cli-argv-util';
import { globSync } from 'glob';
import { w3cHtmlValidator } from '../dist/w3c-html-validator.js';
import fs from 'fs';
import slash from 'slash';

// Parameters and flags
const validFlags =
   ['continue', 'delay', 'dry-run', 'exclude', 'ignore', 'ignore-config', 'note', 'quiet', 'trim'];
const cli =          cliArgvUtil.parse(validFlags);
const files =        cli.params.length ? cli.params.map(cliArgvUtil.cleanPath) : ['.'];
const excludeList =  cli.flagMap.exclude ? cli.flagMap.exclude.split(',') : [];
const ignore =       cli.flagMap.ignore ?? null;
const ignoreConfig = cli.flagMap.ignoreConfig ?? null;
const delay =        Number(cli.flagMap.delay) || 500;  //default half second debounce pause
const trim =         Number(cli.flagMap.trim) || null;
const dryRunMode =   cli.flagOn.dryRun || process.env.w3cHtmlValidator === 'dry-run';  //bash: export w3cHtmlValidator=dry-run

const getFilenames = () => {
   const readFilenames = (file) => globSync(file, { ignore: '**/node_modules/**/*' }).map(slash);
   const readHtmlFiles = (folder) => readFilenames(folder + '/**/*.html');
   const addHtml =       (file) => fs.lstatSync(file).isDirectory() ? readHtmlFiles(file) : file;
   const keep =          (file) => excludeList.every(exclude => !file.includes(exclude));
   return files.map(readFilenames).flat().map(addHtml).flat().filter(keep).sort();
   };
const filenames = getFilenames();
const error =
   cli.invalidFlag ?          cli.invalidFlagMsg :
   !filenames.length ?        'No files to validate.' :
   cli.flagOn.trim && !trim ? 'Value of "trim" must be a positive whole number.' :
   null;
if (error)
   throw new Error('[w3c-html-validator] ' + error);
if (dryRunMode)
   w3cHtmlValidator.dryRunNotice();
if (filenames.length > 1 && !cli.flagOn.quiet)
   w3cHtmlValidator.summary(filenames.length);
const reporterOptions = {
   continueOnFail: cli.flagOn.continue,
   quiet:          cli.flagOn.quiet,
   maxMessageLen:  trim,
   };
const getIgnoreMessages = () => {
   const toArray =    (text) => text.replace(/\r/g, '').split('\n').map(line => line.trim());
   const notComment = (line) => line.length > 1 && !line.startsWith('#');
   const readLines =  (file) => toArray(fs.readFileSync(file).toString()).filter(notComment);
   const rawLines =   ignoreConfig ? readLines(ignoreConfig) : [];
   if (ignore)
      rawLines.push(ignore);
   const isRegex = /^\/.*\/$/;  //starts and ends with a slash indicating it's a regex
   return rawLines.map(line => isRegex.test(line) ? new RegExp(line.slice(1, -1)) : line);
   };
const baseOptions =   { ignoreMessages: getIgnoreMessages(), dryRun: dryRunMode };
const options =       (filename) => ({ filename: filename, ...baseOptions });
const handleResults = (results) => w3cHtmlValidator.reporter(results, reporterOptions);
const getReport =     (filename) => w3cHtmlValidator.validate(options(filename)).then(handleResults);
const processFile =   (filename, i) => globalThis.setTimeout(() => getReport(filename), i * delay);
filenames.forEach(processFile);
