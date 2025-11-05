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

import { w3cHtmlValidator } from '../dist/w3c-html-validator.js';

w3cHtmlValidator.cli();
