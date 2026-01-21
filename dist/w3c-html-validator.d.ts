//! w3c-html-validator v2.2.0 ~~ https://github.com/center-key/w3c-html-validator ~~ MIT License

export type ValidatorSettings = {
    html: string | null;
    filename: string | null;
    website: string | null;
    checkUrl: string | null;
    ignoreLevel: 'info' | 'warning' | null;
    ignoreMessages: ValidatorIgnorePattern[];
    defaultRules: boolean;
    output: 'json' | 'html' | null;
    dryRun: boolean;
};
export type ValidatorIgnorePattern = string | RegExp;
export type ValidatorResultsMessage = {
    type: 'info' | 'error' | 'non-document-error' | 'network-error';
    subType?: 'warning' | 'fatal' | 'io' | 'schema' | 'internal';
    message: string;
    extract?: string;
    lastLine: number;
    firstColumn: number;
    lastColumn: number;
    hiliteStart: number;
    hiliteLength: number;
};
export type ValidatorResultsMessageType = ValidatorResultsMessage['type'];
export type ValidatorResultsMessageSubType = ValidatorResultsMessage['subType'];
export type ValidatorResults = {
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
    dryRun: boolean;
};
export type ReporterSettings = {
    continueOnFail: boolean;
    maxMessageLen: number | null;
    quiet: boolean;
    title: string | null;
};
declare const w3cHtmlValidator: {
    version: string;
    checkUrl: string;
    defaultIgnoreList: string[];
    assert(ok: unknown, message: string | null): void;
    cli(): void;
    validate(options: Partial<ValidatorSettings>): Promise<ValidatorResults>;
    dryRunNotice(): void;
    summary(numFiles: number): void;
    reporter(results: ValidatorResults, options?: Partial<ReporterSettings>): ValidatorResults;
};
export { w3cHtmlValidator };
