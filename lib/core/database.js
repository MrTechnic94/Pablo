'use strict';

const { createClient } = require('@redis/client');
const { isDev } = require('../utils/developer');

const db = createClient({
    socket: {
        host: isDev() ? String(process.env.DEV_DB_HOST) : String(process.env.DB_HOST),
        port: isDev() ? Number(process.env.DEV_DB_PORT) : Number(process.env.DB_PORT),
        connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT)
    },
    password: isDev() ? String(process.env.DEV_DB_PASSWORD) : String(process.env.DB_PASSWORD)
});

module.exports = db;