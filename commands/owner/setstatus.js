'use strict';

const { SlashCommandBuilder, InteractionContextType, ActivityType, PresenceUpdateStatus, EmbedBuilder, MessageFlags } = require('discord.js');
const { embedOptions } = require('../../config/default');
const { writeFileSync, readFileSync } = require('node:fs');
const { resolve } = require('node:path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setstatus')
        .setDescription('Ustawia status bota z możliwością wyboru typu i statusu.')
        .addStringOption(option =>
            option.setName('nazwa')
                .setDescription('Nowy status bota.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('typ')
                .setDescription('Typ aktywności bota.')
                .setRequired(true)
                .addChoices(
                    { name: 'Playing', value: 'Playing' },
                    { name: 'Watching', value: 'Watching' },
                    { name: 'Listening', value: 'Listening' },
                    { name: 'Competing', value: 'Competing' },
                    { name: 'Custom', value: 'Custom' }
                )
        )
        .addStringOption(option =>
            option.setName('status')
                .setDescription('Status dostępności bota.')
                .setRequired(true)
                .addChoices(
                    { name: 'Online', value: 'Online' },
                    { name: 'Idle', value: 'Idle' },
                    { name: 'Do Not Disturb', value: 'DoNotDisturb' },
                    { name: 'Invisible', value: 'Invisible' },
                    { name: 'Offline', value: 'Offline' }
                )
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
        // Sprawdza czy uzytkownik ktory wykonal komende, jest wlascicielem bota
        if (interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await interaction.reply({ content: '❌ Nie masz permisji.', flags: MessageFlags.Ephemeral });
        }

        const status = interaction.options.getString('nazwa');
        const type = interaction.options.getString('typ');
        const botPresence = interaction.options.getString('status');

        try {
            await interaction.client.user.setPresence({
                status: PresenceUpdateStatus[botPresence],
                activities: [{
                    name: status,
                    type: ActivityType[type],
                }],
            });

            const configPath = resolve(__dirname, '../../config/default.json');
            const config = JSON.parse(readFileSync(configPath, 'utf8'));
            config.botOptions.changedActivityName = status;
            config.botOptions.changedActivityType = type;
            config.botOptions.changedActivityPresence = botPresence;

            writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');

            const embed = new EmbedBuilder()
                .setTitle('Status zmieniony')
                .setDescription(`**• Nazwa:** ${status}\n**• Typ:** ${type}\n**• Status:** ${botPresence}`)
                .setColor(embedOptions.defaultColor);

            return await interaction.reply({ embeds: [embed] });
        } catch (err) {
            logger.error(`[Cmd - setstatus] ${err}`);
            return await interaction.reply({
                content: '❌ Wystąpił problem podczas zmiany statusu bota.',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};