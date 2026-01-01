'use strict';

const { MessageFlags, BaseInteraction } = require('discord.js');
const { format } = require('node:util');
const msg = require('./../../locales/pl_PL');

const send = async (target, type, key, ...args) => {
    const rawContent = msg[type][key] || key;
    const content = format(rawContent, ...args);

    const isInteraction = target instanceof BaseInteraction;

    if (!isInteraction) {
        return await target.reply({ content: content });
    }

    const payload = {
        content: content,
        flags: [MessageFlags.Ephemeral]
    };

    if (target.replied) {
        return await target.followUp(payload);
    }
    if (target.deferred) {
        return await target.editReply(payload);
    }

    return await target.reply(payload);
};

module.exports = {
    error: (target, key, ...args) => send(target, 'error', key, ...args),
    success: (target, key, ...args) => send(target, 'success', key, ...args),

    getString: (type, key, ...args) => {
        const rawContent = msg[type][key] || key;
        return format(rawContent, ...args);
    }
};