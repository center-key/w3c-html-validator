// W3C HTML Validator
// Mocha Specification Cases

// Imports
import assert from 'assert';

// Setup
import { w3cHtmlValidator } from '../build/w3c-html-validator.js';

////////////////////////////////////////////////////////////////////////////////////////////////////
describe('The library', () => {

   it('has a validate() function and a setW3cCheckUrl() function', () => {
      const actual = {
         validate:       typeof w3cHtmlValidator.validate,
         setW3cCheckUrl: typeof w3cHtmlValidator.setW3cCheckUrl,
         };
      const expected = {
         validate:       'function',
         setW3cCheckUrl: 'function',
         };
      assert.deepStrictEqual(actual, expected);
      });

   });
