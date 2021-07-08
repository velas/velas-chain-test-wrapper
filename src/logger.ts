import tracer from 'tracer';

const defaultLogFormat = '{{timestamp}} <{{title}}> ({{file}}:{{line}}) {{message}}';

export type LogLevel = 'error' | 'fatal' | 'warn' | 'info' | 'trace' | 'debug' | 'all';

export const log = tracer.colorConsole({
  dateformat: 'HH:MM:ss.L',
  format: [
    defaultLogFormat,
    {
      // error: `${defaultLogFormat}\n{{stack}}`,
      fatal: `${defaultLogFormat}\n{{stack}}`,
    },
  ],
  level: process.env.LOG_LEVEL || 'warn',
});
