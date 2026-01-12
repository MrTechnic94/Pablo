'use strict';

const { MessageFlags, BaseInteraction } = require('discord.js');
const { format } = require('node:util');
const msg = require('./../../locales/pl_PL');

const EPHEMERAL_PAYLOAD = { flags: [MessageFlags.Ephemeral] };

const send = async (target, type, key, ...args) => {
    const rawContent = msg[type]?.[key] ?? key;
    const content = args.length > 0 ? format(rawContent, ...args) : rawContent;

    if (!(target instanceof BaseInteraction)) {
        return target.reply({ content });
    }

    const payload = { content, ...EPHEMERAL_PAYLOAD };

    if (!target.replied && !target.deferred) {
        return target.reply(payload);
    }

    if (target.deferred) {
        return target.editReply(payload);
    }

    return target.followUp(payload);
};

module.exports = {
    error: (target, key, ...args) => send(target, 'error', key, ...args),
    success: (target, key, ...args) => send(target, 'success', key, ...args),

    getString: (type, key, ...args) => {
        const raw = msg[type]?.[key] ?? key;
        return args.length > 0 ? format(raw, ...args) : raw;
    }
};