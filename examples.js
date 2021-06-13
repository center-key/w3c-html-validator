// W3C HTML Validator ~ MIT License
// Examples
//
// Command to run:
//    $ node examples.js

import { w3cHtmlValidator } from './dist/w3c-html-validator.js';

w3cHtmlValidator.validate({ website: 'https://pretty-print-json.js.org/' }).then(console.log);
w3cHtmlValidator.validate({ filename: 'spec/html/valid.html' }).then(console.log);
w3cHtmlValidator.validate({ filename: 'spec/html/invalid.html' }).then(console.log);
