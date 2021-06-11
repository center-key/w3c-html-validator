// W3C HTML Validator ~ MIT License

import { readFileSync } from 'fs';
import * as request from 'superagent';
import withProxy from 'superagent-proxy';
withProxy(request);

export type ValidatorOptions = {
   file?:     string,
   input?:    string,
   checkUrl?: string,
   output?:   'json' | 'html',
   proxy?:    string,
   callback?: (response: unknown, info?: unknown) => void,
   };

const w3cHtmlValidator = {

   version: '[VERSION]',

   validate(options: ValidatorOptions): void {
      const defaults = {
         checkUrl: 'https://validator.w3.org/nu/',
         output:   'json',
         proxy:    null,
         callback: (response: unknown) => console.log(response),
         };
      const settings = { ...defaults, ...options };
      if (!settings.input && !settings.file)
         throw Error('No "input" or "file" specified.');
      const getRequest = (isLocal: boolean): request.SuperAgentRequest => {
         const req = isLocal ? request.default.post(settings.checkUrl) :
            request.default.get(settings.checkUrl);
         if (settings.proxy)
            req.proxy(settings.proxy);
         req.set('User-Agent',   'w3c-html-validator');
         req.set('Content-Type', 'text/html; encoding=utf-8');
         return req;
         };
      const remoteMode =  settings.file && /^http[s]?:/.test(settings.file);
      const type =        settings.input ? 'string' : remoteMode ? 'remote' : 'local';
      const context =     settings.input || settings.file;
      const req = getRequest(type !== 'remote');
      req.query({ out: settings.output });
      if (type === 'remote')
         req.query({ doc: settings.file });
      else
         req.send(type === 'local' ? readFileSync(String(settings.file), 'utf8') : settings.input + '');
      const handleResponse = (error: unknown, res: request.Response) => {
         const getBody = () => {
            res.body.context = context;
            return res.body;
            };
         const getContext = () => settings.output === 'json' ? getBody() : res.text;
         return error ? settings.callback(error) : settings.callback(null, getContext());
         };
      req.end(handleResponse);
      },

   };

export { w3cHtmlValidator };
