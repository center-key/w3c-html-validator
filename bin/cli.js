#!/usr/bin/env node

import color from 'ansi-colors';
import log from 'fancy-log';
import { w3cHtmlValidator } from '../dist/w3c-html-validator.js';

const args =  process.argv.slice(2);
const flags = args.filter(arg => /^-/.test(arg));
const files = args.filter(arg => !/^-/.test(arg));

log('w3c-html-validator');
log(color.gray('files:'), color.cyan(files.length));
if (flags.length)
   throw Error('Flags not supported: ' + flags.join(' '));
files.forEach(file =>
   w3cHtmlValidator.validate({ filename: file }).then(w3cHtmlValidator.reporter));
