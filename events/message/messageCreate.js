'use strict';

const logger = require('../../plugins/logger');
const { Events } = require('discord.js');
const { channelsConfig } = require('../../config/default');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        // Auto reakcje dla kanalu z memami
        if (message.channel.id === channelsConfig.memy) {
            const allowedExtensions = /\.(jpg|jpeg|png|gif|tif|webp|mp4|webm|mov)$/i;
            const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

            if (!message.attachments.size && !allowedExtensions.test(message.content) && !urlRegex.test(message.content)) {
                await message.delete().catch(() => null);
                const warningMessage = await message.channel.send('Można tutaj wysyłać jedynie memy!');
                setTimeout(() => {
                    warningMessage.delete().catch(() => null);
                }, 5000);
            } else {
                try {
                    await message.react('👍');
                    await message.react('👎');
                } catch (err) {
                    logger.error(`[Client] Failed to add reaction:\n${err}`);
                }
            }
        }
    },
};