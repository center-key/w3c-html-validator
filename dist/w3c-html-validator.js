//! w3c-html-validator v1.6.4 ~~ https://github.com/center-key/w3c-html-validator ~~ MIT License

import chalk from 'chalk';
import fs from 'fs';
import log from 'fancy-log';
import request from 'superagent';
import slash from 'slash';
const w3cHtmlValidator = {
    version: '1.6.4',
    validate(options) {
        const defaults = {
            checkUrl: 'https://validator.w3.org/nu/',
            ignoreLevel: null,
            ignoreMessages: [],
            output: 'json',
        };
        const settings = { ...defaults, ...options };
        if (!settings.html && !settings.filename && !settings.website)
            throw Error('[w3c-html-validator] Must specify the "html", "filename", or "website" option.');
        if (![null, 'info', 'warning'].includes(settings.ignoreLevel))
            throw Error('[w3c-html-validator] Invalid ignoreLevel option: ' + settings.ignoreLevel);
        if (settings.output !== 'json' && settings.output !== 'html')
            throw Error('[w3c-html-validator] Option "output" must be "json" or "html".');
        const filename = settings.filename ? slash(settings.filename) : null;
        const mode = settings.html ? 'html' : filename ? 'filename' : 'website';
        const readFile = (filename) => fs.readFileSync(filename, 'utf-8').replace(/\r/g, '');
        const inputHtml = settings.html ?? (filename ? readFile(filename) : null);
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
            filename: filename,
            website: settings.website,
        };
        const filterMessages = (response) => {
            const aboveInfo = (subType) => settings.ignoreLevel === 'info' && !!subType;
            const aboveIgnoreLevel = (message) => !settings.ignoreLevel || message.type !== 'info' || aboveInfo(message.subType);
            const matchesSkipPattern = (title) => settings.ignoreMessages.some(pattern => typeof pattern === 'string' ? title.includes(pattern) : pattern.test(title));
            const isImportant = (message) => aboveIgnoreLevel(message) && !matchesSkipPattern(message.message);
            if (json)
                response.body.messages = response.body.messages?.filter(isImportant) ?? [];
            return response;
        };
        const toValidatorResults = (response) => ({
            validates: json ? !response.body.messages.length : !!response.text?.includes(success),
            mode: mode,
            title: titleLookup[mode],
            html: inputHtml,
            filename: filename,
            website: settings.website || null,
            output: settings.output,
            status: response.statusCode || -1,
            messages: json ? response.body.messages : null,
            display: json ? null : response.text,
        });
        const handleError = (reason) => {
            const response = reason.response;
            const getMsg = () => [response.status, response.res.statusMessage, response.request.url];
            const message = response ? getMsg() : [reason.errno, reason.message];
            const errRes = response ?? {};
            errRes.body = { messages: [{ type: 'network-error', message: message.join(' ') }] };
            return toValidatorResults(errRes);
        };
        return w3cRequest.then(filterMessages).then(toValidatorResults).catch(handleError);
    },
    summary(numFiles) {
        log(chalk.gray('w3c-html-validator'), chalk.magenta('files: ' + numFiles));
    },
    reporter(results, options) {
        const defaults = {
            continueOnFail: false,
            maxMessageLen: null,
            quiet: false,
            title: null,
        };
        const settings = { ...defaults, ...options };
        if (typeof results?.validates !== 'boolean')
            throw Error('[w3c-html-validator] Invalid results for reporter(): ' + String(results));
        const messages = results.messages ?? [];
        const title = settings.title ?? results.title;
        const status = results.validates ? chalk.green.bold('✔ pass') : chalk.red.bold('✘ fail');
        const count = results.validates ? '' : '(messages: ' + messages.length + ')';
        if (!results.validates || !settings.quiet)
            log(chalk.gray('w3c-html-validator'), status, chalk.blue.bold(title), chalk.white(count));
        const typeColorMap = {
            error: chalk.red.bold,
            warning: chalk.yellow.bold,
            info: chalk.white.bold,
        };
        const logMessage = (message) => {
            const type = (message.subType ?? message.type);
            const typeColor = typeColorMap[type] ?? chalk.redBright.bold;
            const location = `line ${message.lastLine}, column ${message.firstColumn}:`;
            const lineText = message.extract?.replace(/\n/g, '\\n');
            const maxLen = settings.maxMessageLen ?? undefined;
            log(typeColor('HTML ' + type + ':'), message.message.substring(0, maxLen));
            if (message.lastLine)
                log(chalk.white(location), chalk.magenta(lineText));
        };
        messages.forEach(logMessage);
        const failDetails = () => {
            const toString = (message) => `${message.subType ?? message.type} line ${message.lastLine} column ${message.firstColumn}`;
            const fileDetails = () => results.filename + ' -- ' + results.messages.map(toString).join(', ');
            return !results.filename ? results.messages[0].message : fileDetails();
        };
        if (!settings.continueOnFail && !results.validates)
            throw Error('[w3c-html-validator] Failed: ' + failDetails());
        return results;
    },
};
export { w3cHtmlValidator };
