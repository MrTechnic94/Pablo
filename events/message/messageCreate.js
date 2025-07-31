'use strict';

const { channels } = require('../../config/default.json');
const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(logger, message) {
        if (message.author.bot) return;

        // Auto reakcje dla kanalu
        if (message.channel.id === channels.memy) {
            const allowedExtensions = /\.(jpg|jpeg|png|gif|tif|webp|mp4|webm|mov)$/i;
            const urlRegex = /https?:\/\/(?:www\.)?[\w.-]{1,256}\.[a-zA-Z]{1,6}\b[\w\-@:%_+.~#?&//=]*/;

            if (!message.attachments.size && !allowedExtensions.test(message.content) && !urlRegex.test(message.content)) {
                await message.delete().catch(() => null);
                const warningMessage = await message.channel.send('❌ Możesz wysyłać tutaj tylko memy.');
                setTimeout(() => {
                    warningMessage.delete().catch(() => null);
                }, 5000);
            } else {
                try {
                    await message.react('👍');
                    await message.react('👎');
                } catch (err) {
                    logger.error(`[MessageCreate] Failed to add reaction:\n${err}`);
                }
            }
        }
    },
};