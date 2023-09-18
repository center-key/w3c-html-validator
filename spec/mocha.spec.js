// W3C HTML Validator
// Mocha Specification Suite

// Imports
import { assertDeepStrictEqual } from 'assert-deep-strict-equal';
import { cliArgvUtil } from 'cli-argv-util';
import assert from 'assert';
import fs from 'fs';

// Setup
import { w3cHtmlValidator } from '../dist/w3c-html-validator.js';
const pkg =         JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const validHtml =   fs.readFileSync('spec/html/valid.html',   'utf-8').replace(/\r/g, '');
const invalidHtml = fs.readFileSync('spec/html/invalid.html', 'utf-8').replace(/\r/g, '');

////////////////////////////////////////////////////////////////////////////////
describe('The "dist" folder', () => {

   it('contains the correct files', () => {
      const actual = fs.readdirSync('dist').sort();
      const expected = [
         'w3c-html-validator.d.ts',
         'w3c-html-validator.js',
         ];
      assertDeepStrictEqual(actual, expected);
      });

   });

////////////////////////////////////////////////////////////////////////////////
describe('Library version number', () => {

   it('follows semantic version formatting', () => {
      const data = w3cHtmlValidator.version;
      const semVerPattern = /\d+[.]\d+[.]\d+/;
      const actual =   { version: data, valid: semVerPattern.test(data) };
      const expected = { version: data, valid: true };
      assertDeepStrictEqual(actual, expected);
      });

   });

////////////////////////////////////////////////////////////////////////////////
describe('Library module', () => {

   it('is an object', () => {
      const actual =   { constructor: w3cHtmlValidator.constructor.name };
      const expected = { constructor: 'Object' };
      assertDeepStrictEqual(actual, expected);
      });

   it('has functions named validate(), summary(), and reporter()', () => {
      const module = w3cHtmlValidator;
      const actual = Object.keys(module).sort().map(key => [key, typeof module[key]]);
      const expected = [
         ['reporter', 'function'],
         ['summary', 'function'],
         ['validate', 'function'],
         ['version',  'string'],
         ];
      assertDeepStrictEqual(actual, expected);
      });

   });

////////////////////////////////////////////////////////////////////////////////
describe('Pretty-Print JSON website', () => {

   it('validates', (done) => {
      const handleData = (data) => {
         const actual = data;
         const expected = {
            validates: true,
            mode:      'website',
            title:     'https://pretty-print-json.js.org/',
            html:      null,
            filename:  null,
            website:   'https://pretty-print-json.js.org/',
            output:    'json',
            status:    200,
            messages:  [],
            display:   null,
            };
         assertDeepStrictEqual(actual, expected, done);
         };
      w3cHtmlValidator.validate({ website: 'https://pretty-print-json.js.org/' }).then(handleData);
      });

   });

////////////////////////////////////////////////////////////////////////////////
describe('Valid HTML string', () => {

   it('passes validator with JSON output', (done) => {
      const handleData = (data) => {
         const actual = data;
         const expected = {
            validates: true,
            mode:      'html',
            title:     'HTML String (characters: 153)',
            html:      validHtml,
            filename:  null,
            website:   null,
            output:    'json',
            status:    200,
            messages:  [],
            display:   null,
            };
         assertDeepStrictEqual(actual, expected, done);
         };
      w3cHtmlValidator.validate({ html: validHtml, output: 'json' }).then(handleData);
      });

   it('passes validator with HTML output', (done) => {
      const handleData = (data) => {
         const actual = data;
         delete actual.display;
         const expected = {
            validates: true,
            mode:      'html',
            title:     'HTML String (characters: 153)',
            html:      validHtml,
            filename:  null,
            website:   null,
            output:    'html',
            status:    200,
            messages:  null,
            };
         assertDeepStrictEqual(actual, expected, done);
         };
      w3cHtmlValidator.validate({ html: validHtml, output: 'html' }).then(handleData);
      });

   });

////////////////////////////////////////////////////////////////////////////////
describe('Invalid HTML string', () => {

   it('fails validator with JSON output', (done) => {
      const message = {
         heading: 'Section lacks heading. Consider using “h2”-“h6” elements to add identifying headings to all sections, or else use a “div” element instead for any cases where no heading is needed.',
         child:   'Element “blockquote” not allowed as child of element “span” in this context. (Suppressing further errors from this subtree.)',
         };
      const handleData = (data) => {
         const actual = data;
         const expected = {
            validates: false,
            mode:      'html',
            title:     'HTML String (characters: 275)',
            html:      invalidHtml,
            filename:  null,
            website:   null,
            output:    'json',
            status:    200,
            messages:  [
               {
                  type:         'info',
                  subType:      'warning',
                  message:      message.heading,
                  extract:      'e</h1>\n   <section>\n     ',
                  lastLine:     9,
                  firstColumn:  4,
                  lastColumn:   12,
                  hiliteStart:  10,
                  hiliteLength: 9,
                  },
               {
                  type:         'error',
                  message:      message.child,
                  extract:      '\n   <span><blockquote>Inside',
                  lastLine:     12,
                  firstColumn:  10,
                  lastColumn:   21,
                  hiliteStart:  10,
                  hiliteLength: 12,
                  },
               ],
            display:   null,
            };
         assertDeepStrictEqual(actual, expected, done);
         };
      w3cHtmlValidator.validate({ html: invalidHtml, output: 'json' }).then(handleData);
      });

   it('fails validator with HTML output', (done) => {
      const handleData = (data) => {
         const actual = data;
         delete actual.display;
         const expected = {
            validates: false,
            mode:      'html',
            title:     'HTML String (characters: 275)',
            html:      invalidHtml,
            filename:  null,
            website:   null,
            output:    'html',
            status:    200,
            messages:  null,
            };
         assertDeepStrictEqual(actual, expected, done);
         };
      w3cHtmlValidator.validate({ html: invalidHtml, output: 'html' }).then(handleData);
      });

   });

////////////////////////////////////////////////////////////////////////////////
describe('HTML file', () => {

   it('that is valid passes validation', (done) => {
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
            };
         assertDeepStrictEqual(actual, expected, done);
         };
      w3cHtmlValidator.validate({ filename: 'spec/html/valid.html' }).then(handleData);
      });

   it('that is invalid fails validation', (done) => {
      const handleData = (data) => {
         const actual =   { validates: data.validates };
         const expected = { validates: false };
         assertDeepStrictEqual(actual, expected, done);
         };
      w3cHtmlValidator.validate({ filename: 'spec/html/invalid.html' }).then(handleData);
      });

   });

////////////////////////////////////////////////////////////////////////////////
describe('Option ignoreLevel set to "warning"', () => {

   it('skips warning messages', (done) => {
      const handleData = (data) => {
         const actual = {
            validates: data.validates,
            messages:  data.messages.map(message => message.type),
            };
         const expected = {
            validates: false,
            messages: ['error'],
            };
         assertDeepStrictEqual(actual, expected, done);
         };
      const options = { filename: 'spec/html/invalid.html', ignoreLevel: 'warning' };
      w3cHtmlValidator.validate(options).then(handleData);
      });

   });

////////////////////////////////////////////////////////////////////////////////
describe('Option ignoreMessages', () => {
   // Example validation messgaes:
   // warning: 'Section lacks heading. Consider using “h2”-“h6” elements to add identifying headings to all sections.',
   // error:   'Element “blockquote” not allowed as child of element “span” in this context. (Suppressing further errors from this subtree.)',

   it('as a substring can skip "Section lacks heading" messages', (done) => {
      const handleData = (data) => {
         const actual = {
            validates: data.validates,
            messages:  data.messages.map(message => message.type),
            };
         const expected = {
            validates: false,
            messages: ['error'],
            };
         assertDeepStrictEqual(actual, expected, done);
         };
      const options = {
         filename:       'spec/html/invalid.html',
         ignoreMessages: 'Section lacks heading',
         };
      w3cHtmlValidator.validate(options).then(handleData);
      });

   it('can skip messages matching a regular expression', (done) => {
      const handleData = (data) => {
         const actual = {
            validates: data.validates,
            messages:  data.messages.map(message => message.type),
            };
         const expected = {
            validates: false,
            messages: ['info'],
            };
         assertDeepStrictEqual(actual, expected, done);
         };
      const options = {
         filename:      'spec/html/invalid.html',
         ignoreMessages: /^Element .blockquote./,
         };
      w3cHtmlValidator.validate(options).then(handleData);
      });

   });

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
         const networkError = {
            type:    'network-error',
            message: '503 Service Unavailable https://mockbin.org/status/503/Service Unavailable?out=json',
            };
         const expected = {
            validates: false,
            mode:      'html',
            title:     'HTML String (characters: 153)',
            html:      validHtml,
            filename:  null,
            website:   null,
            output:    'json',
            status:    503,
            messages:  [networkError],
            display:   null,
            };
         assertDeepStrictEqual(actual, expected, done);
         };
      const options = {
         html:     validHtml,
         checkUrl: 'https://mockbin.org/status/503/Service Unavailable',
         output:   'json',
         };
      w3cHtmlValidator.validate(options).then(handleData);
      });

   });

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
      const expected = {
         name:    'Error',
         message: '[w3c-html-validator] Failed: spec/html/invalid.html -- warning line 9 column 4, error line 12 column 10',
         };
      return assert.rejects(fail, expected);
      });

   });

////////////////////////////////////////////////////////////////////////////////
describe('Executing the CLI', () => {
   const run = (posix) => cliArgvUtil.run(pkg, posix);

   it('to check a valid HTML file correctly outputs a "pass" message', () => {
      const actual =   run('html-validator spec/html/valid.html --note=cli');
      const expected = null;
      assertDeepStrictEqual(actual, expected);
      });

   it('skips validation message matching --ignore and --ignore-config regex patterns', () => {
      const actual =   run('html-validator spec/html "--ignore=/^Section lacks heading/" --ignore-config=spec/ignore-config.txt');
      const expected = null;
      assertDeepStrictEqual(actual, expected);
      });

   });
