# W3C HTML Validator
<img src=https://centerkey.com/graphics/center-key-logo.svg align=right width=200 alt=logo>

_A package for testing HTML files or URLs against the W3C validator_

[![License:MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/center-key/w3c-html-validator/blob/master/LICENSE.txt)
[![npm](https://img.shields.io/npm/v/w3c-html-validator.svg)](https://www.npmjs.com/package/w3c-html-validator)
[![Vulnerabilities](https://snyk.io/test/github/center-key/w3c-html-validator/badge.svg)](https://snyk.io/test/github/center-key/w3c-html-validator)
[![Build](https://github.com/center-key/w3c-html-validator/workflows/build/badge.svg)](https://github.com/center-key/w3c-html-validator/actions?query=workflow%3Abuild)

## Setup

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

### Validate
Call the `validate()` function:
```javascript
const handleValidation = (error, info) => console.log(error || info);
const options = { file: 'https://pretty-print-json.js.org/', callback: handleValidation };
w3cHtmlValidator.validate(options);
```
