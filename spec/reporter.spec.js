// W3C HTML Validator
// Reporter Specification Suite

// Imports
import { assertDeepStrictEqual } from 'assert-deep-strict-equal';
import assert from 'assert';
import fs from 'fs';

// Setup
import { w3cHtmlValidator } from '../dist/w3c-html-validator.js';
const readTextFile = (filename) => fs.readFileSync(filename, 'utf-8').replace(/\r/g, '');
const validHtml =    readTextFile('spec/html/valid.html');

////////////////////////////////////////////////////////////////////////////////
describe('The reporter() function', () => {

   it('passes through valid results', (done) => {
      const handleData = (data) => {
         const actual = data;
         const expected = {
            validates: true,
            mode:      'filename',
            title:     'spec/html/valid.html',
            html:      validHtml,
            filename:  'spec/html/valid.html',
            website:   null,
            output:    'json',
            status:    200,
            messages:  [],
            display:   null,
            dryRun:    false,
            };
         assertDeepStrictEqual(actual, expected, done);
         };
      w3cHtmlValidator.validate({ filename: 'spec/html/valid.html' })
         .then(w3cHtmlValidator.reporter)
         .then(handleData);
      });

   it('throws the correct error when validation fails', () => {
      const options = { filename: 'spec/html/invalid.html' };
      const fail = () => w3cHtmlValidator.validate(options).then(w3cHtmlValidator.reporter);
      const lineInfo = 'warning line 9 column 4, error line 13 column 10, error line 12 column 4';
      const expected = {
         name:    'Error',
         message: '[w3c-html-validator] Failed: spec/html/invalid.html -- ' + lineInfo,
         };
      return assert.rejects(fail, expected);
      });

   });
