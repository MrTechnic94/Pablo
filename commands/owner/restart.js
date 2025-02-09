'use strict';

const logger = require('../../plugins/logger');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('Restart bota.'),
    async execute(interaction) {
        // Sprawdza czy uzytkownik ktory wykonal komende, jest wlascicielem bota
        if (interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await interaction.reply({ content: '❌ Nie masz permisji.', flags: MessageFlags.Ephemeral });
        }

        try {
            await interaction.reply({ content: 'Bot restartuje się...', flags: MessageFlags.Ephemeral });

            process.exit(0);
        } catch (err) {
            logger.error(`[Cmd - restart] ${err}`);
            return await interaction.reply({ content: '❌ Wystąpił błąd podczas restartowania bota.', flags: MessageFlags.Ephemeral });
        }
    },
};