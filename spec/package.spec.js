// W3C HTML Validator
// Package Specification Suite

// Imports
import { assertDeepStrictEqual } from 'assert-deep-strict-equal';
import fs from 'fs';

// Setup
import { w3cHtmlValidator } from '../dist/w3c-html-validator.js';

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

   it('has functions named validate(), dryRunNotice(), summary(), and reporter()', () => {
      const module = w3cHtmlValidator;
      const actual = Object.keys(module).sort().map(key => [key, typeof module[key]]);
      const expected = [
         ['assert',            'function'],
         ['checkUrl',          'string'],
         ['cli',               'function'],
         ['defaultIgnoreList', 'object'],
         ['dryRunNotice',      'function'],
         ['reporter',          'function'],
         ['summary',           'function'],
         ['validate',          'function'],
         ['version',           'string'],
         ];
      assertDeepStrictEqual(actual, expected);
      });

   });
