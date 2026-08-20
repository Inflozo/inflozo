export interface GhostErrorOptions {
    /** Human-readable summary of what went wrong. */
    message?: string;
    /** HTTP status code associated with the error. */
    statusCode?: number;
    /** Logging severity for the error. */
    level?: string;
    /** Unique error identifier. Defaults to a random UUID. */
    id?: string;
    /** Human-readable context/help text. Do not use this for structured data. */
    context?: string;
    /** Human-readable remediation guidance. */
    help?: string;
    /** Ghost error class/type name, normally provided by concrete error classes. */
    errorType?: string;
    /** Structured metadata for logs, API responses, and Sentry extra data. */
    errorDetails?: any;
    /** Machine-readable UPPER_SNAKE_CASE error code for programmatic handling. */
    code?: string;
    /** Field/property associated with validation errors. */
    property?: string;
    /** Redirect target associated with this error. */
    redirect?: string;
    /** Hide the stack trace when serializing/logging. */
    hideStack?: boolean;
    /** Underlying error to wrap. Non-core properties are copied onto the GhostError. */
    err?: Error | string;
}
export declare class GhostError extends Error {
    statusCode: number;
    errorType: string;
    level: string;
    id: string;
    context?: string;
    help?: string;
    errorDetails: any;
    code: string | null;
    property: string | null;
    redirect: string | null;
    hideStack: boolean;
    constructor(options?: GhostErrorOptions);
}
//# sourceMappingURL=GhostError.d.ts.map