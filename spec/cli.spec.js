// W3C HTML Validator
// CLI Specification Suite

// Imports
import { assertDeepStrictEqual } from 'assert-deep-strict-equal';
import { cliArgvUtil } from 'cli-argv-util';
import fs from 'fs';

// Setup
const readTextFile = (filename) => fs.readFileSync(filename, 'utf-8').replace(/\r/g, '');
const pkg =          JSON.parse(readTextFile('package.json'));

////////////////////////////////////////////////////////////////////////////////
describe('Executing the CLI', () => {
   const run = (posix) => cliArgvUtil.run(pkg, posix);

   it('to check a valid HTML file correctly outputs a "pass" message', () => {
      const actual =   run('html-validator spec/html/valid.html --note=cli');
      const expected = null;
      assertDeepStrictEqual(actual, expected);
      });

   it('with the default W3C check URL on a valid HTML file outputs a "pass" message', () => {
      const actual =   run('html-validator spec/html/valid.html --check-url=https://validator.w3.org/nu/');
      const expected = null;
      assertDeepStrictEqual(actual, expected);
      });

   it('with a glob selects the correct files to validate', () => {
      const actual =   run('html-validator "spec/**/valid.html" --note=glob');
      const expected = null;
      assertDeepStrictEqual(actual, expected);
      });

   it('skips validation message matching --ignore and --ignore-config regex patterns', () => {
      const actual =   run('html-validator spec/html "--ignore=/^Section lacks heading/" --ignore-config=spec/ignore-config.txt');
      const expected = null;
      assertDeepStrictEqual(actual, expected);
      });

   it('with --ignore=blockquote and --default-rules skips both validation messages for invalid.html', () => {
      const actual =   run('html-validator spec/html/invalid.html --ignore=blockquote --default-rules');
      const expected = null;
      assertDeepStrictEqual(actual, expected);
      });

   });

////////////////////////////////////////////////////////////////////////////////
describe('Executing the CLI on the project home folder [manual check]', () => {
   const run = (posix) => cliArgvUtil.run(pkg, posix);

   it('with "**/*.html" skips the "node_modules" folder', () => {
      const actual =   run('html-validator "**/*.html" --dry-run');
      const expected = null;
      assertDeepStrictEqual(actual, expected);
      });

   it('with "." skips the "node_modules" folder', () => {
      const actual =   run('html-validator . --dry-run');
      const expected = null;
      assertDeepStrictEqual(actual, expected);
      });

   it('without specifying any files skips the "node_modules" folder', () => {
      const actual =   run('html-validator --dry-run');
      const expected = null;
      assertDeepStrictEqual(actual, expected);
      });

   it('with the "--exclude" flag contining "invalid.html" skips that one file', () => {
      const actual =   run('html-validator . --exclude=aaa,invalid.html,bbb --dry-run');
      const expected = null;
      assertDeepStrictEqual(actual, expected);
      });

   });
