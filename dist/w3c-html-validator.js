//! W3C HTML Validator v0.7.0 ~ github.com/center-key/w3c-html-validator ~ MIT License

import { readFileSync } from 'fs';
import color from 'ansi-colors';
import log from 'fancy-log';
import request from 'superagent';
const w3cHtmlValidator = {
    version: '0.7.0',
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
        const titleLookup = {
            html: 'HTML characters: ' + inputHtml?.length,
            filename: settings.filename,
            website: settings.website,
        };
        return w3cRequest.then(response => ({
            validates: json ? !response.body.messages.length : response.text.includes(success),
            mode: mode,
            title: titleLookup[mode],
            html: inputHtml,
            filename: settings.filename || null,
            website: settings.website || null,
            output: settings.output,
            status: response.statusCode,
            messages: json ? response.body.messages : null,
            display: json ? null : response.text,
        }));
    },
    reporter(results) {
        if (typeof results?.validates !== 'boolean')
            throw Error('[w3c-html-validator] Invalid parameter for reporter(): ' + String(results));
        const fail = 'fail (' + results.messages.length + ')';
        const status = results.validates ? color.green('pass') : color.red.bold(fail);
        log(color.blue.bold(results.title), color.gray('validation:'), status);
        const typeColorMap = {
            error: color.red.bold,
            warning: color.yellow.bold,
            info: color.blue.bold,
        };
        const logMessage = (message) => {
            const type = message.subType || message.type;
            const typeColor = typeColorMap[type] || color.magenta.bold;
            const lineNum = 'line #' + message.lastLine + ':';
            const lineText = message.extract.replace(/\n/g, '\\n');
            log(typeColor('[' + type.toUpperCase() + ']'), message.message);
            log(color.gray(lineNum), color.cyan(lineText));
        };
        results.messages.forEach(logMessage);
        return results;
    },
};
export { w3cHtmlValidator };
