# W3C HTML Validator
<img src=https://centerkey.com/graphics/center-key-logo.svg align=right width=200 alt=logo>

_Check the markup validity of HTML files using the W3C validator_

[![License:MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/center-key/w3c-html-validator/blob/main/LICENSE.txt)
[![npm](https://img.shields.io/npm/v/w3c-html-validator.svg)](https://www.npmjs.com/package/w3c-html-validator)
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

The parameters are folders and files to be validated.

Example **package.json** scripts:
```json
   "scripts": {
      "validate":   "html-validator docs flyer.html",
      "one-folder": "html-validator docs",
      "all":        "html-validator --quiet"
   },
```

Passing no parameters defaults to validating all HTML files in the project (skipping the
**node_modules** folder).

### 2. Command-line npx
Example terminal commands:
```shell
$ npm install --save-dev w3c-html-validator
$ npx html-validator docs
```
The above `npx` line validates all the HTML files in the **docs** folder.

You can also install **w3c-html-validator** globally (`--global`) and then run it anywhere directly from the terminal.

### 3. CLI flags
Command-line flags:
| Flag              | Description                                                         | Value      |
| ----------------- | ------------------------------------------------------------------- | ---------- |
| `--continue`      | Report messages but do not throw an error if validation failed.     | N/A        |
| `--delay`         | Debounce pause in milliseconds between each file validation.        | **number** |
| `--exclude`       | Comma separated list of strings to match in paths to skip.          | **string** |
| `--ignore`        | Skip validation messages containing a string or matching a regex.   | **string** |
| `--ignore-config` | File containing strings and regexes of validation messages to skip. | **string** |
| `--note`          | Place to add a comment only for humans.                             | **string** |
| `--quiet`         | Suppress messages for successful validations.                       | N/A        |
| `--trim`          | Truncate validation messages to not exceed a maximum length.        | **number** |

### 4. Example CLI usage
Examples:
   - `html-validator`<br>
   Validates all HTML files in the project.

   - `html-validator docs --exclude=build,tmp`<br>
   Validates all HTML files in the **docs** folder except files which have "build" or "tmp" anywhere in their pathname or filename.

   - `html-validator docs '--ignore=Trailing slash on void elements'`<br>
   Allows the ugly slashes of self-closing tags despite XHTML being a hideous scourge on the web.

   - `html-validator docs '--ignore=/^Duplicate ID/'`<br>
   Uses a regex (regular expression) to skip all HTML validation messages that start with "Duplicate ID".

   - `html-validator docs '--ignore=/^Duplicate ID|^Section lacks|^Element .blockquote. not allowed/'`<br>
   Uses a regex with "or" operators (`|`) to skip multiple HTML validation messages.

   - `html-validator docs --ignore-config=spec/ignore-config.txt`<br>
   Similar to the pervious command but strings and regexes are stored in a configuration file (see the _Configuration File for Ignore Patterns_ section below).

   - `html-validator --quiet`<br>
   Suppresses all the "pass" status messages.

   - `html-validator docs --delay=200`<br>
   Validates all HTML files in the "docs" folder at a rate of 1 file per 200 ms (default is 500 ms).

   - `html-validator docs --trim=30 --continue`<br>
   Truncates validation messages to 30 characters and does not abort CI if validation fails.

_**Note:** Single quotes in commands are normalized so they work cross-platform and avoid the errors often encountered on Microsoft Windows._

### 5. Configuration File for Ignore Patterns
The optional `--ignore-config=FILENAME` flag specifies a configuration file with one string or regex per line.&nbsp;
HTML validation messages containing any of the strings or matching any of the regexes will be skipped.&nbsp;
Empty lines and lines starting with a hash sign (`#`) are treated as comments and do nothing.

Example configuration file with 3 regexes:
```config
# Ignore Config for w3c-html-validator

/^Duplicate ID/
/^Element .blockquote. not allowed/
/^Element .style. not allowed/
```
The caret (`^`) regex operator says to match from the beginning of the validation message.&nbsp;
The dot (`.`) regex operator says to match any one character, which is a handy way to avoid typing the special curly quote characters in some of the validation messages.

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
| Name (key)       | Type                    | Default                          | Description                                             |
| :--------------- | :---------------------- | :------------------------------- | :------------------------------------------------------ |
| `checkUrl`       | **string**              | `'https://validator.w3.org/nu/'` | W3C validation API endpoint.                            |
| `filename`       | **string**              | `null`                           | HTML file to validate.                                  |
| `html`           | **string**              | `null`                           | HTML string to validate.                                |
| `ignoreLevel`    | `'info'` or `'warning'` | `null`                           | Skip unwanted messages.*                                |
| `ignoreMessages` | **array**               | `[]`                             | Skip messages containing a string or matching a regex.* |
| `output`         | `'json'` or `'html'`    | `'json'`                         | Get results as an array or as a web page.               |
| `website`        | **string**              | `null`                           | URL of website to validate.                             |

*The `ignoreMessages` and `ignoreLevel` options only work for `'json'` output.&nbsp;
Setting `ignoreLevel` to `'warning'` skips both `'warning'` level and `'info'` level validation messages.

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
         assert(results.validates,      'Home page validates');
         done();
         };
      const options = { filename: 'docs/index.html' };
      w3cHtmlValidator.validate(options).then(handleResults);
      });

   });
```

<br>

---
**CLI Build Tools for package.json**
   - 🎋 [add-dist-header](https://github.com/center-key/add-dist-header):&nbsp; _Prepend a one-line banner comment (with license notice) to distribution files_
   - 📄 [copy-file-util](https://github.com/center-key/copy-file-util):&nbsp; _Copy or rename a file with optional package version number_
   - 📂 [copy-folder-util](https://github.com/center-key/copy-folder-util):&nbsp; _Recursively copy files from one folder to another folder_
   - 🪺 [recursive-exec](https://github.com/center-key/recursive-exec):&nbsp; _Run a command on each file in a folder and its subfolders_
   - 🔍 [replacer-util](https://github.com/center-key/replacer-util):&nbsp; _Find and replace strings or template outputs in text files_
   - 🔢 [rev-web-assets](https://github.com/center-key/rev-web-assets):&nbsp; _Revision web asset filenames with cache busting content hash fingerprints_
   - 🚆 [run-scripts-util](https://github.com/center-key/run-scripts-util):&nbsp; _Organize npm scripts into named groups of easy to manage commands_
   - 🚦 [w3c-html-validator](https://github.com/center-key/w3c-html-validator):&nbsp; _Check the markup validity of HTML files using the W3C validator_

Feel free to submit questions at:<br>
[github.com/center-key/w3c-html-validator/issues](https://github.com/center-key/w3c-html-validator/issues)

[MIT License](LICENSE.txt)
