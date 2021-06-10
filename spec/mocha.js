// W3C HTML Validator
// Mocha Specification Cases

// Imports
import assert from 'assert';

// Setup
import { htmlValidator } from '../build/w3c-html-validator.js';

////////////////////////////////////////////////////////////////////////////////////////////////////
describe('The library', () => {

   it('has a validate() function and a setW3cCheckUrl() function', () => {
      const actual = {
         validate:       typeof htmlValidator.validate,
         setW3cCheckUrl: typeof htmlValidator.setW3cCheckUrl,
         };
      const expected = {
         validate:       'function',
         setW3cCheckUrl: 'function',
         };
      assert.deepStrictEqual(actual, expected);
      });

   });
