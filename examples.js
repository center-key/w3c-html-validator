#!/usr/bin/env node
////////////////////////
// W3C HTML Validator //
// Examples           //
////////////////////////

// Command to run:
//    $ node examples.js

import { w3cHtmlValidator } from './dist/w3c-html-validator.js';

// Formatted output
const options = { continueOnFail: true, maxMessageLen: 80 };
const customReporter = (results) => w3cHtmlValidator.reporter(results, options);
w3cHtmlValidator.validate({ website:  'https://pretty-print-json.js.org/' }).then(w3cHtmlValidator.reporter);
w3cHtmlValidator.validate({ filename: 'spec/html/valid.html' }).then(w3cHtmlValidator.reporter);
w3cHtmlValidator.validate({ filename: 'spec/html/invalid.html' }).then(customReporter);

// JSON output
const sleep = (data) => new Promise(resolve => setTimeout(() => resolve(data), 2000));
const log =   (results) => console.info('\nValidatorResults:', results);
w3cHtmlValidator.validate({ filename: 'spec/html/invalid.html' }).then(sleep).then(log);
