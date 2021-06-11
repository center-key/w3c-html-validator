//! W3C HTML Validator v0.5.1 ~ github.com/center-key/w3c-html-validator ~ MIT License

export declare type ValidatorOptions = {
    file?: string;
    input?: string;
    checkUrl?: string;
    output?: 'json' | 'html';
    proxy?: string;
    callback?: (response: unknown, info?: unknown) => void;
};
declare const w3cHtmlValidator: {
    version: string;
    validate(options: ValidatorOptions): void;
};
export { w3cHtmlValidator };
