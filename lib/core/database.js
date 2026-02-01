'use strict';

const { createClient } = require('@redis/client');

const db = createClient({
    socket: {
        host: global.isDev ? String(process.env.DEV_DB_HOST) : String(process.env.DB_HOST),
        port: global.isDev ? Number(process.env.DEV_DB_PORT) : Number(process.env.DB_PORT),
        connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT)
    },
    password: global.isDev ? String(process.env.DEV_DB_PASSWORD) : String(process.env.DB_PASSWORD),
});

module.exports = db;