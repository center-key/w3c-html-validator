//! W3C HTML Validator v0.6.0 ~ github.com/center-key/w3c-html-validator ~ MIT License

export declare type ValidatorOptions = {
    html?: string;
    filename?: string;
    website?: string;
    checkUrl?: string;
    output?: ValidatorResults['output'];
};
export declare type ValidatorResultsMessage = {
    type: 'info' | 'error';
    lastLine: number;
    lastColumn: number;
    firstColumn: number;
    subType?: 'warning';
    message: string;
    extract: string;
    hiliteStart: number;
    hiliteLength: number;
};
export declare type ValidatorResults = {
    validates: boolean;
    mode: 'html' | 'filename' | 'website';
    html: string | null;
    filename: string | null;
    website: string | null;
    output: 'json' | 'html';
    status: number;
    messages: ValidatorResultsMessage[] | null;
    display: string | null;
};
declare const w3cHtmlValidator: {
    version: string;
    validate(options: ValidatorOptions): Promise<ValidatorResults>;
};
export { w3cHtmlValidator };
