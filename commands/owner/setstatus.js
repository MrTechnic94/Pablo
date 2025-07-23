'use strict';

const { SlashCommandBuilder, InteractionContextType, ActivityType, PresenceUpdateStatus, MessageFlags } = require('discord.js');
const { getConfig, syncConfig } = require('../../plugins/readConfig');
const { createEmbed } = require('../../plugins/createEmbed');

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
            option.setName('rodzaj')
                .setDescription('Rodzaj aktywności bota.')
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
        const type = interaction.options.getString('rodzaj');
        const botPresence = interaction.options.getString('status');

        if (interaction.client.user.presence?.activities?.[0]?.name === status &&
            interaction.client.user.presence?.activities?.[0]?.type === ActivityType[type] &&
            interaction.client.user.presence?.status === PresenceUpdateStatus[botPresence]) {
            return await interaction.reply({ content: '❌ Nie możesz ustawić takiego samego statusu.', flags: MessageFlags.Ephemeral });
        }

        try {
            await interaction.client.user.setPresence({
                status: PresenceUpdateStatus[botPresence],
                activities: [{
                    name: status,
                    type: ActivityType[type],
                }],
            });

            const config = getConfig();

            config.botOptions.changedActivityName = status;
            config.botOptions.changedActivityType = type;
            config.botOptions.changedActivityPresence = botPresence;

            syncConfig(config);

            const presenceEmojis = {
                Online: '🟢',
                Offline: '🎱',
                Idle: '🌙',
                DoNotDisturb: '⛔',
                Invisible: '🎱'
            };

            const presenceEmoji = presenceEmojis[config.botOptions.changedActivityPresence] || '❓';

            const successEmbed = createEmbed({
                title: 'Status zmieniony',
                description: `\`💬\` **Nazwa:** ${status}\n\`🔎\` **Rodzaj:** ${type}\n\`${presenceEmoji}\` **Status:** ${botPresence === 'DoNotDisturb' ? 'Do Not Disturb' : botPresence}`
            });

            return await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Cmd - setstatus] ${err}`);
            return await interaction.reply({
                content: '❌ Wystąpił problem podczas zmiany statusu bota.',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};