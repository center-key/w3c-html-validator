//! W3C HTML Validator v0.5.1 ~ github.com/center-key/w3c-html-validator ~ MIT License

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs", "superagent", "superagent-proxy"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.w3cHtmlValidator = void 0;
    const fs_1 = require("fs");
    const request = __importStar(require("superagent"));
    const superagent_proxy_1 = __importDefault(require("superagent-proxy"));
    superagent_proxy_1.default(request);
    const w3cHtmlValidator = {
        version: '0.5.1',
        validate(options) {
            const defaults = {
                checkUrl: 'https://validator.w3.org/nu/',
                output: 'json',
                proxy: null,
                callback: (response) => console.log(response),
            };
            const settings = { ...defaults, ...options };
            if (!settings.input && !settings.file)
                throw Error('No "input" or "file" specified.');
            const getRequest = (isLocal) => {
                const req = isLocal ? request.default.post(settings.checkUrl) :
                    request.default.get(settings.checkUrl);
                if (settings.proxy)
                    req.proxy(settings.proxy);
                req.set('User-Agent', 'w3c-html-validator');
                req.set('Content-Type', 'text/html; encoding=utf-8');
                return req;
            };
            const remoteMode = settings.file && /^http[s]?:/.test(settings.file);
            const type = settings.input ? 'string' : remoteMode ? 'remote' : 'local';
            const context = settings.input || settings.file;
            const req = getRequest(type !== 'remote');
            req.query({ out: settings.output });
            if (type === 'remote')
                req.query({ doc: settings.file });
            else
                req.send(type === 'local' ? fs_1.readFileSync(String(settings.file), 'utf8') : settings.input + '');
            const handleResponse = (error, res) => {
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
    exports.w3cHtmlValidator = w3cHtmlValidator;
});
