# W3C HTML Validator
<img src=https://centerkey.com/graphics/center-key-logo.svg align=right width=200 alt=logo>

_A package for testing HTML files or URLs against the W3C validator_

[![License:MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/center-key/w3c-html-validator/blob/main/LICENSE.txt)
[![npm](https://img.shields.io/npm/v/w3c-html-validator.svg)](https://www.npmjs.com/package/w3c-html-validator)
[![Vulnerabilities](https://snyk.io/test/github/center-key/w3c-html-validator/badge.svg)](https://snyk.io/test/github/center-key/w3c-html-validator)
[![Build](https://github.com/center-key/w3c-html-validator/workflows/build/badge.svg)](https://github.com/center-key/w3c-html-validator/actions/workflows/run-spec-on-push.yaml)

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
or invoke directly [from the command line or from a **package.json** script](#6-command-line).

## 2) Usage
Call the `validate()` function:
```javascript
const options = { filename: 'docs/index.html' };
w3cHtmlValidator.validate(options).then(console.log);
```
To display formatted output, replace `console.log` with `w3cHtmlValidator.reporter`:
```javascript
w3cHtmlValidator.validate(options).then(w3cHtmlValidator.reporter);
```
To see some example validation results, run the commands:
```shell
$ cd w3c-html-validator
$ node examples.js
```
<img src=https://raw.githubusercontent.com/center-key/w3c-html-validator/main/examples.png
width=800 alt=screenshot>

## 3) Options
### validate()
| Name (key)       | Type                    | Default                          | Description                                                          |
| :--------------- | :---------------------- | :------------------------------- | :------------------------------------------------------------------- |
| `html`           | **string**              | `null`                           | HTML string to validate.                                             |
| `filename`       | **string**              | `null`                           | HTML file to validate.                                               |
| `website`        | **string**              | `null`                           | URL of website to validate.                                          |
| `checkUrl`       | **string**              | `'https://validator.w3.org/nu/'` | W3C validation API endpoint.                                         |
| `ignoreLevel`    | `'info'` or `'warning'` | `null`                           | Skip unwanted messages.*                                             |
| `ignoreMessages` | **string** or **regex** | `null`                           | Skip messages containing a string or matching a regular expression.* |
| `output`         | `'json'` or `'html'`    | `'json'`                         | Get results as an array or as a web page.                            |

*The `ignoreMessages` and `ignoreLevel` options only work for `'json'` output.&nbsp;
Option value `'warning'` also skips `'info'`.

### reporter()
| Name (key)      | Type       | Default | Description                                                    |
| :-------------- | :--------- | :------ | :------------------------------------------------------------- |
| `maxMessageLen` | **number** | `null`  | Trim validation messages to not exceed a maximum length.       |
| `title`         | **string** | `null`  | Override display title (useful for naming HTML string inputs). |

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
         assert(results.status === 200, 'Request succeeded');
         assert(results.validates, 'Home page validates');
         done();
         };
      const options = { filename: 'docs/index.html' };
      w3cHtmlValidator.validate(options).then(handleResults);
      });
   });
```

## 6) Command Line
Example CLI usage:
```shell
$ npm install --save-dev w3c-html-validator
$ npx w3c-html-validator docs/*.html flyer.html
$ npx w3c-html-validator docs  #validate html files in a folder
$ npx w3c-html-validator  #validate all html files in project
```
or as an npm script in **package.json**:
```json
   "scripts": {
      "validate": "w3c-html-validator docs/*.html flyer.html",
      "folder":   "w3c-html-validator docs",
      "all":      "w3c-html-validator"
   },
```
Passing no parameters defaults to validating all HTML files in the projects (skipping the
**node_modules** folder).

## 7) Gulp Task
This library is available as a Gulp plugin:<br>
https://github.com/center-key/gulp-w3c-html-validator
