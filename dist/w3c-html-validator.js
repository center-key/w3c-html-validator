//! W3C HTML Validator v0.5.0 ~ github.com/center-key/w3c-html-validator ~ MIT License

import { readFileSync } from 'fs';
import * as request from 'superagent';
import withProxy from 'superagent-proxy';
withProxy(request);
const w3cHtmlValidator = {
    version: '0.5.0',
    w3cCheckUrl: 'https://validator.w3.org/nu/',
    setW3cCheckUrl(newW3cCheckUrl) {
        w3cHtmlValidator.w3cCheckUrl = newW3cCheckUrl;
    },
    validate(options) {
        const defaults = {
            output: 'json',
            doctype: null,
            charset: null,
            proxy: null,
            callback: (response) => console.log(response),
        };
        const settings = { ...defaults, ...options };
        const checkUrl = w3cHtmlValidator.w3cCheckUrl;
        const getRequest = (isLocal) => {
            const req = isLocal ? request.default.post(checkUrl) : request.default.get(checkUrl);
            if (settings.proxy)
                req.proxy(settings.proxy);
            req.set('User-Agent', 'w3c-html-validator');
            req.set('Content-Type', 'text/html; encoding=utf-8');
            return req;
        };
        if (!settings.input && !settings.file)
            throw Error('No "input" or "file" specified.');
        const remoteMode = /^http[s]?:/.test(settings.file);
        const type = settings.input ? 'string' : remoteMode ? 'remote' : 'local';
        const context = settings.input || settings.file;
        const req = getRequest(type !== 'remote');
        if (type === 'remote') {
            req.query({ out: settings.output });
            req.query({ doc: settings.file });
        }
        else {
            req.query({ out: settings.output });
            req.send((type === 'local') ? readFileSync(settings.file, 'utf8') : settings.input + '');
        }
        req.end(function (error, res) {
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
