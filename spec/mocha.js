// W3C HTML Validator
// Mocha Specification Cases

// Imports
import assert from 'assert';

// Setup
import { w3cHtmlValidator } from '../build/w3c-html-validator.js';

////////////////////////////////////////////////////////////////////////////////////////////////////
describe('The library', () => {

   it('has a validate() function', () => {
      const actual =   { validate: typeof w3cHtmlValidator.validate };
      const expected = { validate: 'function' };
      assert.deepStrictEqual(actual, expected);
      });

   });
