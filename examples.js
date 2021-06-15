// W3C HTML Validator ~ MIT License
// Examples
//
// Command to run:
//    $ node examples.js

import { w3cHtmlValidator } from './dist/w3c-html-validator.js';

w3cHtmlValidator.validate({ website: 'https://pretty-print-json.js.org/' })
   .then(w3cHtmlValidator.reporter);

w3cHtmlValidator.validate({ filename: 'spec/html/valid.html' })
   .then(w3cHtmlValidator.reporter);

w3cHtmlValidator.validate({ filename: 'spec/html/invalid.html' })
   .then(results => {
      w3cHtmlValidator.reporter(results);
      setTimeout(() => console.log('\nValidatorResults:', results), 1000);
      });
