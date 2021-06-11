// W3C HTML Validator
// Mocha Specification Cases

// Imports
import assert from 'assert';

// Setup
import { w3cHtmlValidator } from '../dist/w3c-html-validator.js';

////////////////////////////////////////////////////////////////////////////////////////////////////
describe('Library version number', () => {

   it('follows semantic version formatting', () => {
      const data = w3cHtmlValidator.version;
      const semVerPattern = /\d+[.]\d+[.]\d+/;
      const actual =   { version: data, valid: semVerPattern.test(data) };
      const expected = { version: data, valid: true };
      assert.deepStrictEqual(actual, expected);
      });

   });

////////////////////////////////////////////////////////////////////////////////////////////////////
describe('Library', () => {

   it('has a validate() function', () => {
      const actual =   { validate: typeof w3cHtmlValidator.validate };
      const expected = { validate: 'function' };
      assert.deepStrictEqual(actual, expected);
      });

   });
