'use strict';

function isDev() {
    return process.env.DEV_MODE === 'true';
}

module.exports = { isDev };