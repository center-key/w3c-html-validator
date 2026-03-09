// W3C HTML Validator
// Error Handling Specification Suite

// Imports
import { assertDeepStrictEqual } from 'assert-deep-strict-equal';
import assert from 'assert';
import fs from 'fs';

// Setup
import { w3cHtmlValidator } from '../dist/w3c-html-validator.js';
const readTextFile = (filename) => fs.readFileSync(filename, 'utf-8').replace(/\r/g, '');
const validHtml =    readTextFile('spec/html/valid.html');

////////////////////////////////////////////////////////////////////////////////
describe('Correct error is thrown', () => {

   it('when no input is specified', () => {
      const options =         {};
      const makeInvalidCall = () => w3cHtmlValidator.validate(options);
      const exception =       { message: '[w3c-html-validator] Must specify the "html", "filename", or "website" option.' };
      assert.throws(makeInvalidCall, exception);
      });

   it('when "ignoreLevel" option is bogus', () => {
      const options =         { html: validHtml, ignoreLevel: 'bogus' };
      const makeInvalidCall = () => w3cHtmlValidator.validate(options);
      const exception =       { message: '[w3c-html-validator] Invalid ignoreLevel option: bogus' };
      assert.throws(makeInvalidCall, exception);
      });

   it('when "output" option is bogus', () => {
      const options =         { html: validHtml, output: 'bogus' };
      const makeInvalidCall = () => w3cHtmlValidator.validate(options);
      const exception =       { message: '[w3c-html-validator] Option "output" must be "json" or "html".' };
      assert.throws(makeInvalidCall, exception);
      });

   });

////////////////////////////////////////////////////////////////////////////////
describe('Network request failure', () => {

   it('for service unavailable (HTTP status 503) is handled gracefully', (done) => {
      const handleData = (data) => {
         const actual = data;
         const message = '503 Service Unavailable https://centerkey.com/rest/status/503/?out=json';
         const expected = {
            validates: false,
            mode:      'html',
            title:     'HTML String (characters: 153)',
            html:      validHtml,
            filename:  null,
            website:   null,
            output:    'json',
            status:    503,
            messages:  [{ type: 'network-error', message: message }],
            display:   null,
            dryRun:    false,
            };
         assertDeepStrictEqual(actual, expected, done);
         };
      const options = {
         html:     validHtml,
         checkUrl: 'https://centerkey.com/rest/status/503/',
         output:   'json',
         };
      w3cHtmlValidator.validate(options).then(handleData);
      });

   });
