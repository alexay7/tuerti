require('winston-daily-rotate-file');
var winston = require('winston');

const myFormat = winston.format.printf(({ level, message, timestamp }) => {
    return ` [${level}]:`.bold + ` ${timestamp}`.blue + " << " + ` ${message} `;
});

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.simple(),
        winston.format.printf(({ level, message, timestamp }) => {
            return ` [${level}]:` + ` ${timestamp}` + " || " + `${message}`;
        })
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.align(),
                myFormat
            )
        })
    ],
    colorize: true
});
/*
logger.add(new winston.transports.DailyRotateFile({
    rotate: '24h',
    filename: 'logs/Tienda-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    UTC: true
}));
*/

module.exports = logger;
