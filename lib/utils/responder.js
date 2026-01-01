'use strict';

const { MessageFlags } = require('discord.js');
const msg = require('./../../locales/pl_PL');
const util = require('node:util');

const send = async (interaction, type, key, ...args) => {
    const rawContent = msg[type][key] || key;

    const content = util.format(rawContent, ...args);

    const payload = {
        content: content,
        flags: [MessageFlags.Ephemeral]
    };

    if (interaction.replied) {
        return await interaction.followUp(payload);
    }
    if (interaction.deferred) {
        return await interaction.editReply(payload);
    }

    return await interaction.reply(payload);
};

module.exports = {
    error: (interaction, key, ...args) => send(interaction, 'error', key, ...args),
    success: (interaction, key, ...args) => send(interaction, 'success', key, ...args),

    getString: (type, key, ...args) => {
        const rawContent = msg[type][key] || key;
        return util.format(rawContent, ...args);
    }
};