"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
const tracer_1 = __importDefault(require("tracer"));
const defaultLogFormat = '{{timestamp}} <{{title}}> ({{file}}:{{line}}) {{message}}';
exports.log = tracer_1.default.colorConsole({
    dateformat: 'HH:MM:ss.L',
    format: [
        defaultLogFormat,
        {
            // error: `${defaultLogFormat}\n{{stack}}`,
            fatal: `${defaultLogFormat}\n{{stack}}`,
        },
    ],
    level: process.env.LOG_LEVEL || 'all',
});
//# sourceMappingURL=logger.js.map