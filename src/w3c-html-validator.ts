// W3C HTML Validator ~ MIT License
//
// Usage in package.json:
//    "scripts": {
//       "validate": "html-validator docs flyer.html",
//       "all":      "html-validator"
//    },
//
// Usage from command line:
//    $ npm install --save-dev w3c-html-validator
//    $ npx html-validator dist  #validate all html files in the dist folder
//    $ npx html-validator docs flyer.html
//
// Contributors to this project:
//    $ cd w3c-html-validator
//    $ npm install
//    $ npm test
//    $ node bin/cli.js spec --continue

// Imports
import { cliArgvUtil } from 'cli-argv-util';
import { globSync } from 'glob';
import chalk, { ChalkInstance } from 'chalk';
import fs      from 'fs';
import log     from 'fancy-log';
import request from 'superagent';
import slash   from 'slash';

// Type Declarations
export type ValidatorSettings = {
   html:           string | null,              //example: '<!doctype html><html><head><title>Home</title></html>''
   filename:       string | null,              //example: 'docs/index.html'
   website:        string | null,              //example: 'https://pretty-print-json.js.org/'
   checkUrl:       string | null,              //default: 'https://validator.w3.org/nu/'
   ignoreLevel:    'info' | 'warning' | null,  //skip unwanted validation messages ('warning' also skips 'info')
   ignoreMessages: ValidatorIgnorePattern[],   //patterns to skip unwanted validation messages
   defaultRules:   boolean,                    //apply additional built-in opinionated ignore list
   output:         'json' | 'html' | null,     //configure results as an array or as a web page
   dryRun:         boolean,                    //bypass validation (for usage while building your CI)
   };
export type ValidatorIgnorePattern = string | RegExp;  //pattern to skip unwanted validation messages
export type ValidatorResultsMessage = {
   // type                  subType
   // --------------------  --------------------------------------------------
   // 'info'                'warning' | undefined (informative)
   // 'error'               'fatal' | undefined (spec violation)
   // 'non-document-error'  'io' | 'schema' | 'internal' | undefined (external)
   // 'network-error'        undefined (network request failure)
   type:         'info' | 'error' | 'non-document-error' | 'network-error',
   subType?:     'warning' | 'fatal' | 'io' | 'schema' | 'internal',
   message:      string,  //example: 'Section lacks heading.'
   extract?:     string,  //example: '<section>Hi</section>'
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
   dryRun:    boolean,
   };
export type ReporterSettings = {
   continueOnFail: boolean,        //report messages but do not throw an error if validation failed
   maxMessageLen:  number | null,  //trim validation messages to not exceed a maximum length
   quiet:          boolean,        //suppress messages for successful validations
   title:          string | null,  //override display title (useful for naming HTML string inputs)
   };

// W3C HTML Validator
const w3cHtmlValidator = {

   version: '{{package.version}}',

   defaultIgnoreList: [
      'with computed level',     //ridiculous that adding an <aside> with an <h2> breaks the outer flow's outline
      'Section lacks heading.',  //sensible for traditional print publishing but absurd for modern UI components
      ],

   assert(ok: unknown, message: string | null) {
      if (!ok)
         throw new Error(`[w3c-html-validator] ${message}`);
      },

   cli() {
      const validFlags = ['continue', 'default-rules', 'delay', 'dry-run', 'exclude',
         'ignore', 'ignore-config', 'note', 'quiet', 'trim'];
      const cli =          cliArgvUtil.parse(validFlags);
      const files =        cli.params.length ? cli.params.map(cliArgvUtil.cleanPath) : ['.'];
      const excludeList =  cli.flagMap.exclude?.split(',') ?? [];
      const ignore =       cli.flagMap.ignore ?? null;
      const ignoreConfig = cli.flagMap.ignoreConfig ?? null;
      const defaultRules = cli.flagOn.defaultRules!;
      const delay =        Number(cli.flagMap.delay) || 500;  //default half second debounce pause
      const trim =         Number(cli.flagMap.trim) || null;
      const dryRun =       cli.flagOn.dryRun || process.env.w3cHtmlValidator === 'dry-run';  //bash: export w3cHtmlValidator=dry-run
      const getFilenames = () => {
         const readFilenames = (file: string) => globSync(file, { ignore: '**/node_modules/**/*' }).map(slash);
         const readHtmlFiles = (folder: string) => readFilenames(folder + '/**/*.html');
         const addHtml =       (file: string) => fs.lstatSync(file).isDirectory() ? readHtmlFiles(file) : file;
         const keep =          (file: string) => excludeList.every(exclude => !file.includes(exclude));
         return files.map(readFilenames).flat().map(addHtml).flat().filter(keep).sort();
         };
      const filenames = getFilenames();
      const error =
         cli.invalidFlag ?          cli.invalidFlagMsg :
         !filenames.length ?        'No files to validate.' :
         cli.flagOn.trim && !trim ? 'Value of "trim" must be a positive whole number.' :
         null;
      w3cHtmlValidator.assert(!error, error);
      if (dryRun)
         w3cHtmlValidator.dryRunNotice();
      if (filenames.length > 1 && !cli.flagOn.quiet)
         w3cHtmlValidator.summary(filenames.length);
      const reporterOptions: ReporterSettings = {
         continueOnFail: cli.flagOn.continue!,
         maxMessageLen:  trim,
         quiet:          cli.flagOn.quiet!,
         title:          null,
         };
      const getIgnoreMessages = () => {
         const toArray =    (text: string) => text.replace(/\r/g, '').split('\n').map(line => line.trim());
         const notComment = (line: string) => line.length > 1 && !line.startsWith('#');
         const readLines =  (file: string) => toArray(fs.readFileSync(file).toString()).filter(notComment);
         const rawLines =   ignoreConfig ? readLines(ignoreConfig) : [];
         if (ignore)
            rawLines.push(ignore);
         const isRegex = /^\/.*\/$/;  //starts and ends with a slash indicating it's a regex
         return rawLines.map(line => isRegex.test(line) ? new RegExp(line.slice(1, -1)) : line);
         };
      const ignoreMessages = getIgnoreMessages();
      const options =       (filename: string): Partial<ValidatorSettings> => ({ filename, ignoreMessages, defaultRules, dryRun });
      const handleResults = (results: ValidatorResults) => w3cHtmlValidator.reporter(results, reporterOptions);
      const getReport =     (filename: string) => w3cHtmlValidator.validate(options(filename)).then(handleResults);
      const processFile =   (filename: string, i: number) => globalThis.setTimeout(() => getReport(filename), i * delay);
      filenames.forEach(processFile);
      },

   validate(options: Partial<ValidatorSettings>): Promise<ValidatorResults> {
      const defaults: ValidatorSettings = {
         checkUrl:       'https://validator.w3.org/nu/',
         defaultRules:   false,
         dryRun:         false,
         filename:       null,
         html:           null,
         ignoreLevel:    null,
         ignoreMessages: [],
         output:         'json',
         website:        null,
         };
      const settings =      { ...defaults, ...options };
      const missingInput =  !settings.html && !settings.filename && !settings.website;
      const badLevel =      ![null, 'info', 'warning'].includes(settings.ignoreLevel);
      const invalidOutput = settings.output !== 'json' && settings.output !== 'html';
      const error =
         missingInput ?  'Must specify the "html", "filename", or "website" option.' :
         badLevel ?      `Invalid ignoreLevel option: ${settings.ignoreLevel}` :
         invalidOutput ? 'Option "output" must be "json" or "html".' :
         null;
      w3cHtmlValidator.assert(!error, error);
      const filename =  settings.filename ? slash(settings.filename) : null;
      const mode =      settings.html ? 'html' : filename ? 'filename' : 'website';
      const unixify =   (text: string) => text.replace(/\r/g, '');
      const readFile =  (filename: string) => unixify(fs.readFileSync(filename, 'utf-8'));
      const inputHtml = settings.html ?? (filename ? readFile(filename) : null);
      const makePostRequest = () => request.post(settings.checkUrl!)
         .set('Content-Type', 'text/html; encoding=utf-8')
         .send(<string>inputHtml);
      const makeGetRequest = () => request.get(settings.checkUrl!)
         .query({ doc: settings.website });
      const w3cRequest = inputHtml ? makePostRequest() : makeGetRequest();
      const userAgent =  'W3C HTML Validator ~ github.com/center-key/w3c-html-validator';
      w3cRequest.set('User-Agent', userAgent);
      w3cRequest.query({ out: settings.output });
      const json =    settings.output === 'json';
      const success = '<p class="success">';
      const titleLookup = {
         html:     `HTML String (characters: ${inputHtml?.length})`,
         filename: filename,
         website:  settings.website,
         };
      const filterMessages = (response: request.Response): request.Response => {
         const aboveInfo = (subType: ValidatorResultsMessageSubType): boolean =>
            settings.ignoreLevel === 'info' && !!subType;
         const aboveIgnoreLevel = (message: ValidatorResultsMessage): boolean =>
            !settings.ignoreLevel || message.type !== 'info' || aboveInfo(message.subType);
         const defaultList = settings.defaultRules ? w3cHtmlValidator.defaultIgnoreList : [];
         const ignoreList =  [...settings.ignoreMessages, ...defaultList];
         const tester = (title: string) => (pattern: ValidatorIgnorePattern) =>
            typeof pattern === 'string' ? title.includes(pattern) : pattern.test(title)
         const skipMatchFound = (title: string): boolean =>
            ignoreList.some(tester(title));
         const isImportant = (message: ValidatorResultsMessage): boolean =>
            aboveIgnoreLevel(message) && !skipMatchFound(message.message);
         if (json)
            response.body.messages = response.body.messages?.filter(isImportant) ?? [];  //eslint-disable-line
         return response;
         };
      const toValidatorResults = (response: request.Response): ValidatorResults => ({
         validates: json ? !response.body.messages.length : !!response.text?.includes(success),  //eslint-disable-line
         mode:      mode,
         title:     <string>titleLookup[mode],
         html:      inputHtml,
         filename:  filename,
         website:   settings.website || null,
         output:    settings.output!,
         status:    response.statusCode || -1,
         messages:  json ? response.body.messages : null,  //eslint-disable-line
         display:   json ? null : response.text,
         dryRun:    settings.dryRun,
         });
      type ReasonResponse = { request: { url: string }, res: { statusMessage: string }};
      type ReasonError =    Error & { errno: number, response: request.Response & ReasonResponse };
      const handleError = (reason: ReasonError): ValidatorResults => {
         const errRes =  reason.response ?? <ReasonError['response']>{};  //eslint-disable-line
         const getMsg =  () => [errRes.status, errRes.res.statusMessage, errRes.request.url];
         const message = reason.response ? getMsg() : [reason.errno, reason.message];  //eslint-disable-line
         errRes.body =   { messages: [{ type: 'network-error', message: message.join(' ') }] };
         return toValidatorResults(errRes);
         };
      const pseudoResponse = <request.Response>{
         statusCode: 200,
         body:       { messages: [] },
         text:       'Validation bypassed.',
         };
      const pseudoRequest = (): Promise<request.Response> =>
         new Promise(resolve => resolve(pseudoResponse));
      const validation = settings.dryRun ? pseudoRequest() : w3cRequest;
      return validation.then(filterMessages).then(toValidatorResults).catch(handleError);
      },

   dryRunNotice() {
      log(chalk.gray('w3c-html-validator'),
         chalk.yellowBright('dry run mode:'), chalk.whiteBright('validation being bypassed'));
      },

   summary(numFiles: number) {
      log(chalk.gray('w3c-html-validator'), chalk.magenta('files: ' + String(numFiles)));
      },

   reporter(results: ValidatorResults, options?: Partial<ReporterSettings>): ValidatorResults {
      const defaults: ReporterSettings = {
         continueOnFail: false,
         maxMessageLen:  null,
         quiet:          false,
         title:          null,
         };
      const settings = { ...defaults, ...options };
      const hasResults = 'validates' in results && typeof results.validates === 'boolean';
      w3cHtmlValidator.assert(hasResults, `Invalid results for reporter(): ${<unknown>results}`);
      const messages = results.messages ?? [];
      const title =    settings.title ?? results.title;
      const status =   results.validates ? chalk.green.bold('✔ pass') : chalk.red.bold('✘ fail');
      const count =    results.validates ? '' : `(messages: ${messages.length})`;
      if (!results.validates || !settings.quiet)
         log(chalk.gray('w3c-html-validator'), status, chalk.blue.bold(title), chalk.white(count));
      const typeColorMap = <{ [messageType: string]: ChalkInstance }>{
         error:   chalk.red.bold,
         warning: chalk.yellow.bold,
         info:    chalk.white.bold,
         };
      const logMessage = (message: ValidatorResultsMessage) => {
         const type =      message.subType ?? message.type;
         const typeColor = typeColorMap[type] ?? chalk.redBright.bold;
         const location =  `line ${message.lastLine}, column ${message.firstColumn}:`;
         const lineText =  message.extract?.replace(/\n/g, '\\n');
         const maxLen =    settings.maxMessageLen ?? undefined;
         log(typeColor('HTML ' + type + ':'), message.message.substring(0, maxLen));
         if (message.lastLine)
            log(chalk.white(location), chalk.magenta(lineText));
         };
      messages.forEach(logMessage);
      const failDetails = () => {
         // Example: 'spec/html/invalid.html -- warning line 9 column 4, error line 12 column 10'
         const toString = (message: ValidatorResultsMessage) =>
            `${message.subType ?? message.type} line ${message.lastLine} column ${message.firstColumn}`;
         const fileDetails = () =>
            `${results.filename} -- ${results.messages!.map(toString).join(', ')}`;
         return !results.filename ? results.messages![0]!.message : fileDetails();
         };
      const failed = !settings.continueOnFail && !results.validates;
      w3cHtmlValidator.assert(!failed, `Failed: ${failDetails()}`);
      return results;
      },

   };

export { w3cHtmlValidator };
