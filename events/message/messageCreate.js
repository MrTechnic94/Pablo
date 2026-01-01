'use strict';

const reply = require('../../lib/utils/responder');
const { channels } = require('../../config/default.json');
const { Events } = require('discord.js');

const allowedExtensions = /\.(jpg|jpeg|png|gif|webp|mp4|webm|mov)$/i;
const urlRegex = /https?:\/\/(?:www\.)?[\w.-]{1,256}\.[a-zA-Z]{1,6}\b[\w\-@:%_+.~#?&//=]*/;

module.exports = {
    name: Events.MessageCreate,
    async execute(logger, message) {
        if (message.author.bot || message.channel.id !== channels.memy) return;

        // Auto reakcje dla kanalu
        if (!message.attachments.size && !allowedExtensions.test(message.content) && !urlRegex.test(message.content)) {
            const warningMessage = await reply.error(message, 'ONLY_MEMES_ALLOWED');
            setTimeout(() => {
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
                logger.error(`[MessageCreate] Failed to add reaction:\n${err}`);
            }
        }
    },
};