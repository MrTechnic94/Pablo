'use strict';

const { SlashCommandBuilder, InteractionContextType, ActivityType } = require('discord.js');
const { presence } = require('../../locales/pl_PL');

module.exports = {
    index: false,
    ownerOnly: true,
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
                    { name: 'Dostępny', value: 'online' },
                    { name: 'Zaraz wracam', value: 'idle' },
                    { name: 'Offline', value: 'offline' },
                    { name: 'Niewidoczny', value: 'invisible' },
                    { name: 'Nie przeszkadzać', value: 'dnd' }
                )
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        const status = interaction.options.getString('nazwa');
        const botPresence = interaction.options.getString('status');

        if (interaction.client.user.presence?.activities?.[0]?.name === status &&
            interaction.client.user.presence?.status === botPresence) {
            return await utils.reply.error(interaction, 'STATUS_ALREADY_SET');
        }

        try {
            await interaction.client.user.setPresence({
                status: botPresence,
                activities: [{
                    name: status,
                    type: ActivityType.Custom
                }],
            });

            const config = utils.getConfig();

            config.botOptions.changedActivityName = status;
            config.botOptions.changedActivityPresence = botPresence;

            utils.syncConfig(config);

            const presenceData = presence[botPresence];

            const presenceEmoji = presenceData?.emoji || '❓';
            const presenceType = presenceData?.name || 'Nieznany';

            const successEmbed = utils.createEmbed({
                title: 'Status zmieniony',
                description: `\`💬\` **Nazwa:** ${status}\n\`${presenceEmoji}\` **Status:** ${presenceType}`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Setstatus] ${err}`);
            await utils.reply.error(interaction, 'STATUS_ERROR');
        }
    },
};