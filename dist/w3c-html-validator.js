//! W3C HTML Validator v0.6.0 ~ github.com/center-key/w3c-html-validator ~ MIT License

import { readFileSync } from 'fs';
import request from 'superagent';
const w3cHtmlValidator = {
    version: '0.6.0',
    validate(options) {
        const defaults = {
            checkUrl: 'https://validator.w3.org/nu/',
            output: 'json',
        };
        const settings = { ...defaults, ...options };
        if (!settings.html && !settings.filename && !settings.website)
            throw Error('Must specify the "html", "filename", or "website" option.');
        if (settings.output !== 'json' && settings.output !== 'html')
            throw Error('Option "output" must be "json" or "html".');
        const mode = settings.html ? 'html' : settings.filename ? 'filename' : 'website';
        const readFile = () => settings.filename ? readFileSync(settings.filename, 'utf8') : null;
        const inputHtml = settings.html || readFile();
        const makePostRequest = () => request.post(settings.checkUrl)
            .set('Content-Type', 'text/html; encoding=utf-8')
            .send(inputHtml);
        const makeGetRequest = () => request.get(settings.checkUrl)
            .query({ doc: settings.website });
        const w3cRequest = inputHtml ? makePostRequest() : makeGetRequest();
        w3cRequest.set('User-Agent', 'W3C HTML Validator ~ github.com/center-key/w3c-html-validator');
        w3cRequest.query({ out: settings.output });
        const json = settings.output === 'json';
        const success = '<p class="success">';
        return w3cRequest.then(response => ({
            validates: json ? !response.body.messages.length : response.text.includes(success),
            mode: mode,
            html: inputHtml,
            filename: settings.filename || null,
            website: settings.website || null,
            output: settings.output,
            status: response.statusCode,
            messages: json ? response.body.messages : null,
            display: json ? null : response.text,
        }));
    },
};
export { w3cHtmlValidator };
