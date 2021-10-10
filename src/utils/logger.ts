const pino = require('pino');

function createLogger(debug = false) {
    return pino({
        level: debug ? 'debug' : 'info',
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: true,
                ignore: 'pid,hostname',
            },
        },
    })
}

export { createLogger };