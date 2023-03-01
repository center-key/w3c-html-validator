# W3C HTML Validator
<img src=https://centerkey.com/graphics/center-key-logo.svg align=right width=200 alt=logo>

_Check the markup validity of HTML files using the W3C validator_

[![License:MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/center-key/w3c-html-validator/blob/main/LICENSE.txt)
[![npm](https://img.shields.io/npm/v/w3c-html-validator.svg)](https://www.npmjs.com/package/w3c-html-validator)
[![Vulnerabilities](https://snyk.io/test/github/center-key/w3c-html-validator/badge.svg)](https://snyk.io/test/github/center-key/w3c-html-validator)
[![Build](https://github.com/center-key/w3c-html-validator/workflows/build/badge.svg)](https://github.com/center-key/w3c-html-validator/actions/workflows/run-spec-on-push.yaml)

**w3c-html-validator** takes HTML files and returns detailed validation results.&nbsp;
The reporter produces formatted output indended for use in build scripts and test suites.

<img src=https://raw.githubusercontent.com/center-key/w3c-html-validator/main/examples.png
width=800 alt=screenshot>

## A) Setup
Install package for node:
```shell
$ npm install --save-dev w3c-html-validator
```

## B) Usage
### 1. npm scripts
Run `html-validator` from the `"scripts"` section of your **package.json** file.

The parameters are files to be validated.

Example **package.json** scripts:
```json
   "scripts": {
      "validate":   "html-validator docs/*.html flyer.html",
      "one-folder": "html-validator docs",
      "all":        "html-validator --quiet"
   },
```

Passing no parameters defaults to validating all HTML files in the project (skipping the
**node_modules** folder).

### 2. Global
You can install **w3c-html-validator** globally and then run it anywhere directly from the terminal.

Example terminal commands:
```shell
$ npm install --global w3c-html-validator
$ html-validator docs/*.html flyer.html
```

### 3. CLI flags
Command-line flags:
| Flag         | Description                                                     | Value      |
| ------------ | --------------------------------------------------------------- | ---------- |
| `--continue` | Report messages but do not throw an error if validation failed. | N/A        |
| `--delay`    | Debounce pause in milliseconds between each file validation.    | **number** |
| `--exclude`  | Comma separated list of strings to match in paths to skip.      | **string** |
| `--ignore`   | Skip messages containing a string or matching a RegEx.          | **string** |
| `--note`     | Place to add a comment only for humans.                         | **string** |
| `--quiet`    | Suppress messages for successful validations.                   | N/A        |
| `--trim`     | Truncate validation messages to not exceed a maximum length.    | **number** |

### 4. Example CLI usage
Examples:
   - `html-validator`<br>
   Validate all HTML files in the project.

   - `html-validator --exclude=build,tmp`<br>
   Slip all files which have "build" or "tmp" anywhere in their pathname or filename.

   - `html-validator docs/*.html '--ignore=Trailing slash on void elements'`<br>
   Allow the ugly slashes of self-closing tags despite XHTML being a hideous scourge on the web.

   - `html-validator docs/*.html '--ignore=/^Duplicate ID/'`<br>
   Use a RegEx (regular expression) to skip all validation messages that start with "Duplicate ID".

   - `html-validator --quiet`<br>
   Suppress "pass" status messages.

   - `html-validator docs --delay=200`<br>
   Validate all HTML files in the "docs" folder at a rate of 1 file per 200 ms (default is 500 ms).

   - `html-validator docs --trim=30 --continue`<br>
   Truncate validation messages to 30 characters and do not abort CI if validation fails.

## D) Application Code and Testing Frameworks
In addition to the CLI interface, the **w3c-html-validator** package can also be imported and called directly in ESM and TypeScript projects.

### 1. Import
Example call to the `validate()` function:
```typescript
import { w3cHtmlValidator } from 'w3c-html-validator';

const options = { filename: 'docs/index.html' };
w3cHtmlValidator.validate(options).then(console.log);
```
To display formatted output, replace `console.log` with `w3cHtmlValidator.reporter`:
```typescript
w3cHtmlValidator.validate(options).then(w3cHtmlValidator.reporter);
```

To see some example validation results, run the commands:
```shell
$ cd w3c-html-validator
$ node examples.js
```

### 2. Options
#### w3cHtmlValidator.validate(options)
| Name (key)       | Type                    | Default                          | Description                                                          |
| :--------------- | :---------------------- | :------------------------------- | :------------------------------------------------------------------- |
| `checkUrl`       | **string**              | `'https://validator.w3.org/nu/'` | W3C validation API endpoint.                                         |
| `filename`       | **string**              | `null`                           | HTML file to validate.                                               |
| `html`           | **string**              | `null`                           | HTML string to validate.                                             |
| `ignoreLevel`    | `'info'` or `'warning'` | `null`                           | Skip unwanted messages.*                                             |
| `ignoreMessages` | **string** or **regex** | `null`                           | Skip messages containing a string or matching a regular expression.* |
| `output`         | `'json'` or `'html'`    | `'json'`                         | Get results as an array or as a web page.                            |
| `website`        | **string**              | `null`                           | URL of website to validate.                                          |

*The `ignoreMessages` and `ignoreLevel` options only work for `'json'` output.&nbsp;
Option value `'warning'` also skips `'info'`.

#### w3cHtmlValidator.reporter(options)
| Name (key)       | Type        | Default | Description                                                     |
| :--------------- | :---------- | :------ | :-------------------------------------------------------------- |
| `continueOnFail` | **boolean** | `false` | Report messages but do not throw an error if validation failed. |
| `maxMessageLen`  | **number**  | `null`  | Trim validation messages to not exceed a maximum length.        |
| `quiet`          | **boolean** | `false` | Suppress status messages for successful validations.            |
| `title`          | **string**  | `null`  | Override display title (useful for naming HTML string inputs).  |

### 3. TypeScript declarations
See the TypeScript declarations at the top of the
[w3c-html-validator.ts](w3c-html-validator.ts) file.

The output of the `w3cHtmlValidator.validate(options: ValidatorOptions)` function is a **promise**
for a `ValidatorResults` object:
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

### 4. Mocha example
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

<br>

---
**CLI Build Tools**
   - 🎋 [add-dist-header](https://github.com/center-key/add-dist-header):&nbsp; _Prepend a one-line banner comment (with license notice) to distribution files_
   - 📄 [copy-file-util](https://github.com/center-key/copy-file-util):&nbsp; _Copy or rename a file with optional package version number_
   - 📂 [copy-folder-util](https://github.com/center-key/copy-folder-util):&nbsp; _Recursively copy files from one folder to another folder_
   - 🔍 [replacer-util](https://github.com/center-key/replacer-util):&nbsp; _Find and replace strings or template outputs in text files_
   - 🔢 [rev-web-assets](https://github.com/center-key/rev-web-assets):&nbsp; _Revision web asset filenames with cache busting content hash fingerprints_
   - 🚆 [run-scripts-util](https://github.com/center-key/run-scripts-util):&nbsp; _Organize npm scripts into named groups of easy to manage commands_
   - 🚦 [w3c-html-validator](https://github.com/center-key/w3c-html-validator):&nbsp; _Check the markup validity of HTML files using the W3C validator_

Feel free to submit questions at:<br>
[github.com/center-key/w3c-html-validator/issues](https://github.com/center-key/w3c-html-validator/issues)

[MIT License](LICENSE.txt)
