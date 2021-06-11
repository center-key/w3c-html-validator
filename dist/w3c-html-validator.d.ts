//! W3C HTML Validator v0.5.0 ~ github.com/center-key/w3c-html-validator ~ MIT License

export declare type ValidatorOptions = {
    output?: string;
    doctype?: string;
    charset?: string;
    proxy?: string;
    callback?: (response: unknown, info?: unknown) => void;
    file: string;
    input: string;
};
declare const w3cHtmlValidator: {
    version: string;
    w3cCheckUrl: string;
    setW3cCheckUrl(newW3cCheckUrl: string): void;
    validate(options: ValidatorOptions): void;
};
export { w3cHtmlValidator };
