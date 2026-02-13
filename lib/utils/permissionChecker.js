'use strict';

const { defaultPermissions } = require('../../config/default.json');
const { permissions } = require('../../locales/pl_PL');

async function checkBotPermissions(interaction, additionalPerms = []) {
    const { utils } = interaction.client;

    const requiredPermissions = [...new Set([...defaultPermissions, ...(additionalPerms || [])])];

    const botPermissions = interaction.channel.permissionsFor(interaction.guild.members.me);

    if (!botPermissions.has(requiredPermissions)) {
        const missing = botPermissions.missing(requiredPermissions).map(p => `\`${permissions[p] || p}\``);

        await utils.reply.error(interaction, missing.length === 1 ? 'BOT_MISSING_PERMISSION' : 'BOT_MISSING_PERMISSIONS', missing.join(' '));
        return false;
    }

    return true;
}

module.exports = checkBotPermissions;