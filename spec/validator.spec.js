// W3C HTML Validator
// Validator Specification Suite

// Imports
import { assertDeepStrictEqual } from 'assert-deep-strict-equal';
import fs from 'fs';

// Setup
import { w3cHtmlValidator } from '../dist/w3c-html-validator.js';
const readTextFile = (filename) => fs.readFileSync(filename, 'utf-8').replace(/\r/g, '');
const validHtml =    readTextFile('spec/html/valid.html');
const invalidHtml =  readTextFile('spec/html/invalid.html');

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
            dryRun:    false,
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
            dryRun:    false,
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
            dryRun:    false,
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
         heading:  'Section lacks heading. Consider using “h2”-“h6” elements to add identifying headings to all sections, or else use a “div” element instead for any cases where no heading is needed.',
         child:    'Element “blockquote” not allowed as child of element “span” in this context. (Suppressing further errors from this subtree.)',
         skipping: 'The heading “h3” (with computed level 3) follows the heading “h1” (with computed level 1), skipping 1 heading level.',
         };
      const handleData = (data) => {
         const actual = data;
         const expected = {
            validates: false,
            mode:      'html',
            title:     'HTML String (characters: 312)',
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
                  lastLine:     13,
                  firstColumn:  10,
                  lastColumn:   21,
                  hiliteStart:  10,
                  hiliteLength: 12,
                  },
               {
                  type:         'error',
                  message:      message.skipping,
                  extract:      'ction>\n   <h3>Skippi',
                  lastLine:     12,
                  firstColumn:  4,
                  lastColumn:   7,
                  hiliteStart:  10,
                  hiliteLength: 4,
                  },
               ],
            display:   null,
            dryRun:    false,
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
            title:     'HTML String (characters: 312)',
            html:      invalidHtml,
            filename:  null,
            website:   null,
            output:    'html',
            status:    200,
            messages:  null,
            dryRun:    false,
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
            dryRun:    false,
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
            messages:  ['error', 'error'],
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
            messages:  ['error', 'error'],
            };
         assertDeepStrictEqual(actual, expected, done);
         };
      const options = {
         filename:       'spec/html/invalid.html',
         ignoreMessages: ['Section lacks heading'],
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
         ignoreMessages: [/^Element .blockquote. not allowed/, /with computed level/],
         };
      w3cHtmlValidator.validate(options).then(handleData);
      });

   });
