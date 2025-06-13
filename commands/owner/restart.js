'use strict';

const { SlashCommandBuilder, InteractionContextType, ActivityType, PresenceUpdateStatus, EmbedBuilder, MessageFlags } = require('discord.js');
const { botOptions, embedOptions } = require('../../config/default');
const { writeFileSync, readFileSync } = require('node:fs');
const { resolve } = require('node:path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('Restart bota lub przywrócenie domyślnego statusu bota.')
        .addStringOption(option =>
            option.setName('rodzaj')
                .setDescription('Rodzaj restartu.')
                .setRequired(true)
                .addChoices(
                    { name: 'Bot', value: 'Bot' },
                    { name: 'Status', value: 'Status' },
                )
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
        // Sprawdza czy uzytkownik ktory wykonal komende, jest wlascicielem bota
        if (interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await interaction.reply({ content: '❌ Nie masz permisji.', flags: MessageFlags.Ephemeral });
        }

        const type = interaction.options.getString('rodzaj');

        switch (type) {
            case 'Bot': {
                try {
                    await interaction.reply({ content: 'Bot restartuje się...', flags: MessageFlags.Ephemeral });

                    process.exit(0);
                } catch (err) {
                    logger.error(`[Cmd - restart] ${err}`);
                    await interaction.reply({ content: '❌ Wystąpił błąd podczas restartowania bota.', flags: MessageFlags.Ephemeral });
                }
                break;
            }
            case 'Status': {
                try {
                    await interaction.client.user.setPresence({
                        status: PresenceUpdateStatus[botOptions.defaultActivityPresence],
                        activities: [{
                            name: botOptions.defaultActivityName,
                            type: ActivityType[botOptions.defaultActivityType],
                        }],
                    });

                    const configPath = resolve(__dirname, '../../config/default.json');
                    const config = JSON.parse(readFileSync(configPath, 'utf8'));
                    config.botOptions.changedActivityName = "";
                    config.botOptions.changedActivityType = "";
                    config.botOptions.changedActivityPresence = "";

                    writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');

                    const embed = new EmbedBuilder()
                        .setTitle('Status zmieniony')
                        .setDescription(`**• Nazwa:** ${botOptions.defaultActivityName}\n**• Typ:** ${botOptions.defaultActivityType}\n**• Status:** ${botOptions.defaultActivityPresence}`)
                        .setColor(embedOptions.defaultColor);

                    await interaction.reply({ embeds: [embed] });
                } catch (err) {
                    logger.error(`[Cmd - setstatus] ${err}`);
                    await interaction.reply({
                        content: '❌ Wystąpił problem podczas zmiany statusu bota.',
                        flags: MessageFlags.Ephemeral
                    });
                }
            }
        }
    },
};