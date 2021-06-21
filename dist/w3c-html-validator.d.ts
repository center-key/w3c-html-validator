//! W3C HTML Validator v0.7.1 ~ github.com/center-key/w3c-html-validator ~ MIT License

export declare type ValidatorOptions = {
    html?: string;
    filename?: string;
    website?: string;
    checkUrl?: string;
    output?: ValidatorResults['output'];
};
export declare type ValidatorResultsMessage = {
    type: 'info' | 'error';
    subType?: 'warning';
    message: string;
    extract: string;
    lastLine: number;
    firstColumn: number;
    lastColumn: number;
    hiliteStart: number;
    hiliteLength: number;
};
export declare type ValidatorResults = {
    validates: boolean;
    mode: 'html' | 'filename' | 'website';
    title: string;
    html: string | null;
    filename: string | null;
    website: string | null;
    output: 'json' | 'html';
    status: number;
    messages: ValidatorResultsMessage[] | null;
    display: string | null;
};
export declare type ReporterOptions = {
    maxMessageLen?: number;
};
declare const w3cHtmlValidator: {
    version: string;
    validate(options: ValidatorOptions): Promise<ValidatorResults>;
    reporter(results: ValidatorResults, options?: ReporterOptions | undefined): ValidatorResults;
};
export { w3cHtmlValidator };
