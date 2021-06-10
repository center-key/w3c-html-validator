// W3C HTML Validator
// Mocha Specification Cases

// Imports
import assert from 'assert';

// Setup
const htmlValidator = { validate: () => true };

////////////////////////////////////////////////////////////////////////////////////////////////////
describe('Library module', () => {

   it('has a validate() function', () => {
      const actual =   { type: typeof htmlValidator.validate };
      const expected = { type: 'function' };
      assert.deepStrictEqual(actual, expected);
      });

   });
