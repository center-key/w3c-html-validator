// W3C HTML Validator ~ MIT License

import { readFileSync } from 'fs';
import * as request from 'superagent';
import withProxy from 'superagent-proxy';
withProxy(request);

export type ValidatorOptions = {
   output?:   string,
   proxy?:    string,
   callback?: (response: unknown, info?: unknown) => void,
   file:      string,
   input:     string,
   };

const w3cHtmlValidator = {

   version: '[VERSION]',

   w3cCheckUrl: 'https://validator.w3.org/nu/',

   setW3cCheckUrl(newW3cCheckUrl: string): void {
      w3cHtmlValidator.w3cCheckUrl = newW3cCheckUrl;
      },

   validate(options: ValidatorOptions): void {
      const defaults = {
         output:   'json',
         proxy:    null,
         callback: (response: unknown) => console.log(response),
         };
      const settings = { ...defaults, ...options };
      const checkUrl = w3cHtmlValidator.w3cCheckUrl;
      const getRequest = (isLocal: boolean): request.SuperAgentRequest => {
         const req = isLocal ? request.default.post(checkUrl) : request.default.get(checkUrl);
         if (settings.proxy)
            req.proxy(settings.proxy);
         req.set('User-Agent',   'w3c-html-validator');
         req.set('Content-Type', 'text/html; encoding=utf-8');
         return req;
         };
      if (!settings.input && !settings.file)
         throw Error('No "input" or "file" specified.');
      const remoteMode =  /^http[s]?:/.test(settings.file);
      const type =        settings.input ? 'string' : remoteMode ? 'remote' : 'local';
      const context =     settings.input || settings.file;
      const req = getRequest(type !== 'remote');
      if (type === 'remote') {
         req.query({ out: settings.output });
         req.query({ doc: settings.file });
         }
      else {
         req.query({ out: settings.output });
         req.send((type === 'local') ? readFileSync(settings.file, 'utf8') : settings.input + '');
         }
      req.end(function(error, res) {
         if (error) {
            settings.callback(error);
            }
         else if (settings.output === 'json') {
            res.body.context = context;
            settings.callback(null, res.body);
            }
         else {
            settings.callback(null, res.text);
            }
         });
      },

   };

export { w3cHtmlValidator };
