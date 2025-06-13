'use strict';

const { Events, MessageFlags } = require('discord.js');

module.exports = {
    name: Events.Error,
    async execute(err, interaction, logger) {
        logger.error(`[Client] Error occurred:\n${err}`);

        if (interaction && interaction.isCommand()) {
            try {
                await interaction.reply({
                    content: '❌ Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.',
                    flags: MessageFlags.Ephemeral
                });
            } catch (err) {
                logger.error(`[Client] Error replying to interaction:\n${err}`);
            }
        }
    },
};