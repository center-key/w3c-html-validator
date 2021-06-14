# W3C HTML Validator
<img src=https://centerkey.com/graphics/center-key-logo.svg align=right width=200 alt=logo>

_A package for testing HTML files or URLs against the W3C validator_

[![License:MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/center-key/w3c-html-validator/blob/master/LICENSE.txt)
[![npm](https://img.shields.io/npm/v/w3c-html-validator.svg)](https://www.npmjs.com/package/w3c-html-validator)
[![Vulnerabilities](https://snyk.io/test/github/center-key/w3c-html-validator/badge.svg)](https://snyk.io/test/github/center-key/w3c-html-validator)
[![Build](https://github.com/center-key/w3c-html-validator/workflows/build/badge.svg)](https://github.com/center-key/w3c-html-validator/actions?query=workflow%3Abuild)

## 1) Setup

### Install
Install package for node:
```shell
$ npm install --save-dev w3c-html-validator
```

### Import
Import into your application:
```javascript
import { w3cHtmlValidator } from 'w3c-html-validator';
```

## 2) Usage
Call the `validate()` function:
```javascript
const options = { filename: 'docs/index.html' };
w3cHtmlValidator.validate(options).then(console.log);
```
To see some example validation results, run the command:
```shell
$ node examples.js
```

## 3) Options
| Name (key) | Type       | Default                          | Description                  |
| :--------- | :--------- | :------------------------------- | :--------------------------- |
| `html`     | **string** | `null`                           | HTML string to validate.     |
| `filename` | **string** | `null`                           | HTML file to validate.       |
| `website`  | **string** | `null`                           | URL of website to validate.  |
| `checkUrl` | **string** | `'https://validator.w3.org/nu/'` | W3C validation API endpoint. |
| `output`   | **string** | `'json'`                         | Get results as an array (`'json'`) or as a web page (`'html'`). |

## 4) TypeScript Declarations
The **TypeScript Declaration File** file is [w3c-html-validator.d.ts](dist/w3c-html-validator.d.ts)
in the **dist** folder.

The output of the `w3cHtmlValidator.validate(options: ValidatorOptions)` function is a **promise**
for `ValidatorResults` object:
```typescript
type ValidatorResults = {
   validates: boolean,
   mode:      'html' | 'filename' | 'website';
   html:      string | null,
   filename:  string | null,
   website:   string | null,
   output:    'json' | 'html',
   status:    number,
   messages:  ValidatorResultsMessage[] | null,  //for 'json' output
   display:   string | null,                     //for 'html' output
   };
```

## 5) Mocha Example
```javascript
import assert from 'assert';
import { w3cHtmlValidator } from 'w3c-html-validator';

describe('Home page', () => {
   it('validates', (done) => {
      const handleResults = (results) => {
         assert(results.validates, 'Home page validates');
         done();
         };
      w3cHtmlValidator.validate({ filename: 'docs/index.js' }).then(handleResults);
      });
   });
```

## 6) Gulp Task
This library is available as a Gulp plugin:
https://github.com/center-key/gulp-w3c-html-validator
