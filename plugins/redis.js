'use strict';

const Redis = require('ioredis');

// Tworzenie klienta Redis
const redis = new Redis({
    host: String(process.env.DB_HOST),
    port: Number(process.env.DB_PORT),
    password: String(process.env.DB_PASSWORD),
    connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT)
});

module.exports = redis;