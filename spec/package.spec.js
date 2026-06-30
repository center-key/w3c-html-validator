// W3C HTML Validator
// Package Specification Suite

// Imports
import { assertDeepStrictEqual } from 'assert-deep-strict-equal';
import fs from 'node:fs';

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
      const version =  w3cHtmlValidator.version;
      const semVer =   /\d+[.]\d+[.]\d+/;
      const actual =   { version: version, valid: semVer.test(version) };
      const expected = { version: version, valid: true };
      assertDeepStrictEqual(actual, expected);
      });

   });

////////////////////////////////////////////////////////////////////////////////
describe('Library module', () => {

   it('is exported as an object', () => {
      const actual =   { type: typeof w3cHtmlValidator };
      const expected = { type: 'object' };
      assertDeepStrictEqual(actual, expected);
      });

   it('has the correct properties', () => {
      const module = w3cHtmlValidator;
      const actual = Object.keys(module).sort().map(key => [key, typeof module[key]]);
      const expected = [
         ['assertOk',          'function'],
         ['checkUrl',          'string'],
         ['cli',               'function'],
         ['defaultIgnoreList', 'object'],
         ['reporter',          'function'],
         ['validate',          'function'],
         ['version',           'string'],
         ];
      assertDeepStrictEqual(actual, expected);
      });

   });
