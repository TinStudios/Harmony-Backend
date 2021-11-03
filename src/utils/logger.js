"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = void 0;
var pino = require('pino');
function createLogger(debug) {
    if (debug === void 0) { debug = false; }
    return pino({
        level: debug ? 'debug' : 'info',
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: true,
                ignore: 'pid,hostname',
            },
        },
    });
}
exports.createLogger = createLogger;
