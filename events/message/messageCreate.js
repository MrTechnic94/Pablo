'use strict';

const { defaultPermissions } = require('../../config/default.json');
const { Events } = require('discord.js');

const allowedExtensions = /\.(jpg|jpeg|png|gif|webp|mp4|webm|mov)$/i;
const urlRegex = /https?:\/\/(?:www\.)?[\w.-]{1,256}\.[a-zA-Z]{1,6}\b[\w\-@:%_+.~#?&//=]*/;

module.exports = {
    name: Events.MessageCreate,
    async execute(logger, message) {
        const { utils } = message.client;

        const requiredChannel = await utils.db.hGet(`guild:${message.guild.id}`, 'memesChannelId');

        if (!requiredChannel || message.channel.id !== requiredChannel || message.author.bot) return;

        const botPermissions = message.channel.permissionsFor(message.guild.members.me);

        if (!botPermissions.has(defaultPermissions)) {
            const missing = botPermissions.missing(defaultPermissions);
            return logger.error(`[MessageCreate] Missing permissions '${missing.join(', ')}' for '${message.guild.id}'.`);
        }

        // Auto reakcje dla kanalu
        if (!message.attachments.size && !allowedExtensions.test(message.content) && !urlRegex.test(message.content)) {
            const warningMessage = await utils.reply.error(message, 'ONLY_MEMES_ALLOWED');
            return setTimeout(() => {
                warningMessage.delete().catch(() => null);
                message.delete().catch(() => null);
            }, 5000);
        } else {
            try {
                await Promise.all([
                    message.react('👍'),
                    message.react('👎')
                ]);
            } catch (err) {
                logger.error(`[MessageCreate] Failed to add reaction in '${message.guild.id}':\n${err}`);
            }
        }
    },
};