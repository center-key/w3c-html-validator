#!/usr/bin/env node
////////////////////////
// W3C HTML Validator //
// Examples           //
////////////////////////

// Command to run:
//    $ node examples.js

import { w3cHtmlValidator } from './dist/w3c-html-validator.js';

// Formatted output
const customReporter = (results) => w3cHtmlValidator.reporter(results, { maxMessageLen: 80 });
w3cHtmlValidator.validate({ website:  'https://pretty-print-json.js.org/' }).then(w3cHtmlValidator.reporter);
w3cHtmlValidator.validate({ filename: 'spec/html/valid.html' }).then(w3cHtmlValidator.reporter);
w3cHtmlValidator.validate({ filename: 'spec/html/invalid.html' }).then(customReporter);

// JSON output
const sleep = (data) => new Promise(resolve => setTimeout(() => resolve(data), 1000));
const log =   (results) => console.log('\nValidatorResults:', results);
w3cHtmlValidator.validate({ filename: 'spec/html/invalid.html' }).then(sleep).then(log);
