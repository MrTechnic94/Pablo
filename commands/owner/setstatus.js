'use strict';

const { SlashCommandBuilder, InteractionContextType, MessageFlags, PresenceUpdateStatus } = require('discord.js');
const { getConfig, syncConfig } = require('../../lib/core/configManipulator');
const { createEmbed } = require('../../lib/utils/createEmbed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setstatus')
        .setDescription('Ustawia status bota.')
        .addStringOption(option =>
            option.setName('nazwa')
                .setDescription('Nowy status bota.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('status')
                .setDescription('Status dostępności bota.')
                .setRequired(true)
                .addChoices(
                    { name: 'Dostępny', value: 'Online' },
                    { name: 'Zaraz wracam', value: 'Idle' },
                    { name: 'Nie przeszkadzać', value: 'DoNotDisturb' },
                    { name: 'Niewidoczny', value: 'Invisible' }
                )
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
        if (interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await interaction.reply({ content: '`❌` Nie masz permisji.', flags: MessageFlags.Ephemeral });
        }

        const status = interaction.options.getString('nazwa');
        const botPresence = interaction.options.getString('status');

        if (interaction.client.user.presence?.activities?.[0]?.name === status &&
            interaction.client.user.presence?.status === PresenceUpdateStatus[botPresence]) {
            return await interaction.reply({ content: '`❌` Nie możesz ustawić takiego samego statusu.', flags: MessageFlags.Ephemeral });
        }

        try {
            await interaction.client.user.setPresence({
                status: PresenceUpdateStatus[botPresence],
                activities: [{
                    name: status
                }],
            });

            const config = getConfig();

            config.botOptions.changedActivityName = status;
            config.botOptions.changedActivityPresence = botPresence;

            syncConfig(config);

            const presenceEmojis = {
                Online: '🟢',
                Offline: '🎱',
                Idle: '🌙',
                DoNotDisturb: '⛔',
                Invisible: '🎱'
            };

            const presenceTypes = {
                Online: 'Dostępny',
                Idle: 'Zaraz wracam',
                DoNotDisturb: 'Nie przeszkadzać',
                Invisible: 'Niewidoczny',
                Offline: 'Offline'
            };

            const presenceEmoji = presenceEmojis[config.botOptions.changedActivityPresence] || '❓';

            const successEmbed = createEmbed({
                title: 'Status zmieniony',
                description: `\`💬\` **Nazwa:** ${status}\n\`${presenceEmoji}\` **Status:** ${presenceTypes[botPresence]}`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Setstatus] ${err}`);
            await interaction.reply({
                content: '`❌` Wystąpił problem podczas zmiany statusu bota.',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};