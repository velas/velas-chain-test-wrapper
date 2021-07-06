import tracer from 'tracer';
export declare type LogLevel = 'error' | 'fatal' | 'warn' | 'info' | 'trace' | 'debug' | 'all';
export declare const log: tracer.Tracer.Logger;
