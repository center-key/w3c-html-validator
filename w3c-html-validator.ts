// W3C HTML Validator ~ MIT License

import { readFileSync } from 'fs';
import chalk from 'chalk';
import log from 'fancy-log';
import request from 'superagent';

export type ValidatorOptions = {
   html?:           string,  //example: '<!doctype html><html><head><title>Home</title></html>''
   filename?:       string,  //example: 'docs/index.html'
   website?:        string   //example: 'https://pretty-print-json.js.org/'
   checkUrl?:       string,
   ignoreLevel?:    'info' | 'warning',  //skip unwanted messages ('warning' also skips 'info')
   ignoreMessages?: string | RegExp,  //matcher to skip unwanted messages
   output?:         ValidatorResultsOutput,
   };
export type ValidatorResultsMessage = {
   // type                  subType
   // --------------------  --------------------------------------------------
   // 'info'                'warning' | undefined (informative)
   // 'error'               'fatal' | undefined (spec violation)
   // 'non-document-error'  'io' | 'schema' | 'internal' | undefined (external)
   type:         'info' | 'error' | 'non-document-error',
   subType?:     'warning' | 'fatal' | 'io' | 'schema' | 'internal',
   message:      string,
   extract:      string,
   lastLine:     number,
   firstColumn:  number,
   lastColumn:   number,
   hiliteStart:  number,
   hiliteLength: number,
   };
export type ValidatorResultsMessageType = ValidatorResultsMessage['type'];
export type ValidatorResultsMessageSubType = ValidatorResultsMessage['subType'];
export type ValidatorResults = {
   validates: boolean,
   mode:      'html' | 'filename' | 'website',
   title:     string,
   html:      string | null,
   filename:  string | null,
   website:   string | null,
   output:    'json' | 'html',
   status:    number,
   messages:  ValidatorResultsMessage[] | null,
   display:   string | null,
   };
export type ValidatorResultsOutput = ValidatorResults['output'];
export type ReporterOptions = {
   maxMessageLen?: number | null,  //trim validation messages to not exceed a maximum length
   title?:         string | null,  //override display title (useful for naming HTML string inputs)
   };

const w3cHtmlValidator = {

   version: '[VERSION]',

   validate(options: ValidatorOptions): Promise<ValidatorResults> {
      const defaults = {
         checkUrl:       'https://validator.w3.org/nu/',
         ignoreLevel:    null,
         ignoreMessages: null,
         output:         'json',
         };
      const settings = { ...defaults, ...options };
      if (!settings.html && !settings.filename && !settings.website)
         throw Error('Must specify the "html", "filename", or "website" option.');
      if (![null, 'info', 'warning'].includes(settings.ignoreLevel))
         throw Error('[w3c-html-validator] Invalid ignoreLevel option: ' + settings.ignoreLevel);
      if (settings.output !== 'json' && settings.output !== 'html')
         throw Error('Option "output" must be "json" or "html".');
      const mode = settings.html ? 'html' : settings.filename ? 'filename' : 'website';
      const readFile = () => settings.filename ? readFileSync(settings.filename, 'utf8') : null;
      const inputHtml = settings.html || readFile();
      const makePostRequest = () => request.post(settings.checkUrl)
         .set('Content-Type', 'text/html; encoding=utf-8')
         .send(<string>inputHtml);
      const makeGetRequest = () => request.get(settings.checkUrl)
         .query({ doc: settings.website });
      const w3cRequest = inputHtml ? makePostRequest() : makeGetRequest();
      w3cRequest.set('User-Agent', 'W3C HTML Validator ~ github.com/center-key/w3c-html-validator');
      w3cRequest.query({ out: settings.output });
      const json = settings.output === 'json';
      const success = '<p class="success">';
      const titleLookup = {
         html:     'HTML String (characters: ' + inputHtml?.length + ')',
         filename: settings.filename,
         website:  settings.website,
         };
      const filterMessages = (response: request.Response): request.Response => {
         const aboveInfo = (subType: ValidatorResultsMessageSubType): boolean =>
            settings.ignoreLevel === 'info' && !!subType;
         const aboveIgnoreLevel = (message: ValidatorResultsMessage): boolean =>
            !settings.ignoreLevel || message.type !== 'info' || aboveInfo(message.subType);
         const skipSubstr = (title: string) =>
            typeof settings.ignoreMessages === 'string' && title.includes(settings.ignoreMessages);
         const skipRegEx = (title: string) =>
            settings.ignoreMessages?.constructor.name === 'RegExp' &&
            (<RegExp>settings.ignoreMessages).test(title);
         const isImportant = (message: ValidatorResultsMessage): boolean =>
            aboveIgnoreLevel(message) && !skipSubstr(message.message) && !skipRegEx(message.message);
         if (json)
            response.body.messages = response.body.messages?.filter(isImportant) ?? [];
         return response;
         };
      const toValidatorResults = (response: request.Response): ValidatorResults => ({
         validates: json ? !response.body.messages.length : response.text.includes(success),
         mode:      mode,
         title:     <string>titleLookup[mode],
         html:      inputHtml,
         filename:  settings.filename || null,
         website:   settings.website || null,
         output:    <ValidatorResultsOutput>settings.output,
         status:    response.statusCode,
         messages:  json ? response.body.messages : null,
         display:   json ? null : response.text,
         });
      return w3cRequest.then(filterMessages).then(toValidatorResults);
      },

   reporter(results: ValidatorResults, options?: ReporterOptions): ValidatorResults {
      const defaults = {
         maxMessageLen: null,
         title:         null,
         };
      const settings = { ...defaults, ...options };
      if (typeof results?.validates !== 'boolean')
         throw Error('[w3c-html-validator] Invalid results for reporter(): ' + String(results));
      const messages = results.messages ?? [];
      const title =  settings.title ?? results.title;
      const fail =   'fail (messages: ' + messages!.length  + ')';
      const status = results.validates ? chalk.green('pass') : chalk.red.bold(fail);
      log(chalk.blue.bold(title), chalk.gray('validation:'), status);
      const typeColorMap = {
         error:   chalk.red.bold,
         warning: chalk.yellow.bold,
         info:    chalk.white.bold,
         };
      const logMessage = (message: ValidatorResultsMessage) => {
         const type =      message.subType || message.type;
         const typeColor = typeColorMap[type] || chalk.redBright.bold;
         const location =  `line ${message.lastLine}, column ${message.firstColumn}:`;
         const lineText =  message.extract?.replace(/\n/g, '\\n');
         const maxLen =    settings.maxMessageLen ?? undefined;
         log(typeColor('HTML ' + type + ':'), message.message.substring(0, maxLen));
         if (message.lastLine)
            log(chalk.gray(location), chalk.cyan(lineText));
         };
      messages.forEach(logMessage);
      return results;
      },

   };

export { w3cHtmlValidator };
