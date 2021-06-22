//! W3C HTML Validator v0.7.2 ~ github.com/center-key/w3c-html-validator ~ MIT License

import { readFileSync } from 'fs';
import color from 'ansi-colors';
import log from 'fancy-log';
import request from 'superagent';
const w3cHtmlValidator = {
    version: '0.7.2',
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
            html: 'HTML String (characters: ' + inputHtml?.length + ')',
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
    reporter(results, options) {
        const defaults = {
            ignoreLevel: null,
            maxMessageLen: null,
            title: null,
        };
        const settings = { ...defaults, ...options };
        if (typeof results?.validates !== 'boolean')
            throw Error('[w3c-html-validator] Invalid results for reporter(): ' + String(results));
        if (![null, 'info', 'warning'].includes(settings.ignoreLevel))
            throw Error('[w3c-html-validator] Invalid ignoreLevel option: ' + settings.ignoreLevel);
        const aboveIgnoreLevel = (message) => {
            return !settings.ignoreLevel || message.type !== 'info' || (settings.ignoreLevel === 'info' && !!message.subType);
        };
        const messages = results.messages ? results.messages.filter(aboveIgnoreLevel) : [];
        const title = settings.title ?? results.title;
        const fail = 'fail (messages: ' + messages.length + ')';
        const status = results.validates ? color.green('pass') : color.red.bold(fail);
        log(color.blue.bold(title), color.gray('validation:'), status);
        const typeColorMap = {
            error: color.red.bold,
            warning: color.yellow.bold,
            info: color.white.bold,
        };
        const logMessage = (message) => {
            const type = message.subType || message.type;
            const typeColor = typeColorMap[type] || color.redBright.bold;
            const location = `line ${message.lastLine}, column ${message.firstColumn}:`;
            const lineText = message.extract?.replace(/\n/g, '\\n');
            const maxLen = settings.maxMessageLen ?? undefined;
            log(typeColor('HTML ' + type + ':'), message.message.substring(0, maxLen));
            log(color.gray(location), color.cyan(lineText));
        };
        messages.forEach(logMessage);
        return results;
    },
};
export { w3cHtmlValidator };
