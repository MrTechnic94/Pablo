'use strict';

let db = null;

if (global.isDev) {
    const Redis = require('ioredis');

    db = new Redis({
        host: String(process.env.DB_HOST),
        port: Number(process.env.DB_PORT),
        password: String(process.env.DB_PASSWORD),
        connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT)
    });
}

module.exports = db;