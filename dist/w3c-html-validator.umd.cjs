//! w3c-html-validator v0.8.2 ~~ https://github.com/center-key/w3c-html-validator ~~ MIT License

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs", "chalk", "fancy-log", "superagent"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.w3cHtmlValidator = void 0;
    const fs_1 = require("fs");
    const chalk_1 = __importDefault(require("chalk"));
    const fancy_log_1 = __importDefault(require("fancy-log"));
    const superagent_1 = __importDefault(require("superagent"));
    const w3cHtmlValidator = {
        version: '0.8.2',
        validate(options) {
            const defaults = {
                checkUrl: 'https://validator.w3.org/nu/',
                ignoreLevel: null,
                ignoreMessages: null,
                output: 'json',
            };
            const settings = { ...defaults, ...options };
            if (!settings.html && !settings.filename && !settings.website)
                throw Error('[w3c-html-validator] Must specify the "html", "filename", or "website" option.');
            if (![null, 'info', 'warning'].includes(settings.ignoreLevel))
                throw Error('[w3c-html-validator] Invalid ignoreLevel option: ' + settings.ignoreLevel);
            if (settings.output !== 'json' && settings.output !== 'html')
                throw Error('[w3c-html-validator] Option "output" must be "json" or "html".');
            const mode = settings.html ? 'html' : settings.filename ? 'filename' : 'website';
            const readFile = () => settings.filename ? (0, fs_1.readFileSync)(settings.filename, 'utf8') : null;
            const inputHtml = settings.html || readFile();
            const makePostRequest = () => superagent_1.default.post(settings.checkUrl)
                .set('Content-Type', 'text/html; encoding=utf-8')
                .send(inputHtml);
            const makeGetRequest = () => superagent_1.default.get(settings.checkUrl)
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
            const filterMessages = (response) => {
                const aboveInfo = (subType) => settings.ignoreLevel === 'info' && !!subType;
                const aboveIgnoreLevel = (message) => !settings.ignoreLevel || message.type !== 'info' || aboveInfo(message.subType);
                const skipSubstr = (title) => typeof settings.ignoreMessages === 'string' && title.includes(settings.ignoreMessages);
                const skipRegEx = (title) => settings.ignoreMessages?.constructor.name === 'RegExp' &&
                    settings.ignoreMessages.test(title);
                const isImportant = (message) => aboveIgnoreLevel(message) && !skipSubstr(message.message) && !skipRegEx(message.message);
                if (json)
                    response.body.messages = response.body.messages?.filter(isImportant) ?? [];
                return response;
            };
            const toValidatorResults = (response) => ({
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
            });
            return w3cRequest.then(filterMessages).then(toValidatorResults);
        },
        reporter(results, options) {
            const defaults = {
                maxMessageLen: null,
                title: null,
            };
            const settings = { ...defaults, ...options };
            if (typeof results?.validates !== 'boolean')
                throw Error('[w3c-html-validator] Invalid results for reporter(): ' + String(results));
            const messages = results.messages ?? [];
            const title = settings.title ?? results.title;
            const fail = 'fail (messages: ' + messages.length + ')';
            const status = results.validates ? chalk_1.default.green('pass') : chalk_1.default.red.bold(fail);
            (0, fancy_log_1.default)(chalk_1.default.gray('w3c-html-validator'), chalk_1.default.blue.bold(title), status);
            const typeColorMap = {
                error: chalk_1.default.red.bold,
                warning: chalk_1.default.yellow.bold,
                info: chalk_1.default.white.bold,
            };
            const logMessage = (message) => {
                const type = message.subType || message.type;
                const typeColor = typeColorMap[type] || chalk_1.default.redBright.bold;
                const location = `line ${message.lastLine}, column ${message.firstColumn}:`;
                const lineText = message.extract?.replace(/\n/g, '\\n');
                const maxLen = settings.maxMessageLen ?? undefined;
                (0, fancy_log_1.default)(typeColor('HTML ' + type + ':'), message.message.substring(0, maxLen));
                if (message.lastLine)
                    (0, fancy_log_1.default)(chalk_1.default.white(location), chalk_1.default.magenta(lineText));
            };
            messages.forEach(logMessage);
            return results;
        },
    };
    exports.w3cHtmlValidator = w3cHtmlValidator;
});
