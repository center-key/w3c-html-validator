// W3C HTML Validator ~ MIT License
// Examples
//
// Command to run:
//    $ node examples.js

import { w3cHtmlValidator } from './dist/w3c-html-validator.js';

// Formatted output
w3cHtmlValidator.validate({ website: 'https://pretty-print-json.js.org/' }).then(w3cHtmlValidator.reporter);
w3cHtmlValidator.validate({ filename: 'spec/html/valid.html' }).then(w3cHtmlValidator.reporter);
w3cHtmlValidator.validate({ filename: 'spec/html/invalid.html' }).then(w3cHtmlValidator.reporter);

// JSON output
const sleep = (data) => new Promise(resolve => setTimeout(() => resolve(data), 1000));
const log = (results) => console.log('\nValidatorResults:', results);
w3cHtmlValidator.validate({ filename: 'spec/html/invalid.html' }).then(sleep).then(log);
