'use strict';

const { SlashCommandBuilder, InteractionContextType, ActivityType, RESTJSONErrorCodes } = require('discord.js');
const { presence } = require('../../locales/pl_PL');

module.exports = {
    index: false,
    ownerOnly: true,
    data: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('Zarządzanie ustawieniami bota.')
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(sub => sub
            .setName('avatar')
            .setDescription('Ustawia nowy avatar bota.')
            .addAttachmentOption(option => option
                .setName('obraz')
                .setDescription('Nowy avatar. Zalecane 1024x1024.')
                .setRequired(true)
            )
        )
        .addSubcommand(sub => sub
            .setName('banner')
            .setDescription('Ustawia nowy baner bota.')
            .addAttachmentOption(option => option
                .setName('obraz')
                .setDescription('Nowy baner. Zalecane 680x240.')
                .setRequired(true)
            )
        )
        .addSubcommand(sub => sub
            .setName('status')
            .setDescription('Ustawia status bota.')
            .addStringOption(option => option
                .setName('nazwa')
                .setDescription('Nowy status bota.')
                .setRequired(true)
            )
            .addStringOption(option => option
                .setName('status')
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
        ),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        const subcommand = interaction.options.getSubcommand();
        const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];

        try {
            switch (subcommand) {
                case 'avatar': {
                    const attachment = interaction.options.getAttachment('obraz');
                    const extension = attachment.url.split('.').pop().toLowerCase().split('?')[0];

                    if (!allowedExtensions.includes(extension)) {
                        return await utils.reply.error(interaction, 'INVALID_EXTENSION');
                    }

                    await interaction.deferReply();

                    const config = utils.getConfig();

                    config.botOptions.changedAvatar = true;

                    utils.syncConfig(config);

                    const oldAvatar = interaction.client.user.displayAvatarURL({ size: 256 });

                    await interaction.client.user.setAvatar(attachment.url);

                    const newAvatar = interaction.client.user.displayAvatarURL({ size: 256 });

                    const successEmbed = utils.createEmbed({
                        title: 'Avatar ustawiony',
                        description: `\`📷\` **Wcześniejszy:** [KLIKNIJ🡭](${oldAvatar})\n\`🌟\` **Nowy:** [KLIKNIJ🡭](${newAvatar})`,
                        image: newAvatar
                    });

                    await interaction.editReply({ embeds: [successEmbed] });
                    break;
                }

                case 'banner': {
                    const attachment = interaction.options.getAttachment('obraz');
                    const extension = attachment.url.split('.').pop().toLowerCase().split('?')[0];

                    if (!allowedExtensions.includes(extension)) {
                        return await utils.reply.error(interaction, 'INVALID_EXTENSION');
                    }

                    await interaction.deferReply();
                    await interaction.client.user.fetch().catch(() => null);

                    const oldBanner = interaction.client.user.bannerURL({ size: 256 });

                    await interaction.client.user.setBanner(attachment.url);

                    const newBanner = interaction.client.user.bannerURL({ size: 256 });

                    const successEmbed = utils.createEmbed({
                        title: 'Baner ustawiony',
                        description: `\`🖼️\` **Wcześniejszy:** [KLIKNIJ🡭](${oldBanner})\n\`🌟\` **Nowy:** [KLIKNIJ🡭](${newBanner})`,
                        image: newBanner
                    });

                    await interaction.editReply({ embeds: [successEmbed] });
                    break;
                }

                case 'status': {
                    const status = interaction.options.getString('nazwa');
                    const botPresence = interaction.options.getString('status');

                    if (interaction.client.user.presence?.activities?.[0]?.name === status && interaction.client.user.presence?.status === botPresence) {
                        return await utils.reply.error(interaction, 'STATUS_ALREADY_SET');
                    }

                    await interaction.client.user.setPresence({
                        status: botPresence,
                        activities: [{
                            name: status,
                            type: ActivityType.Custom
                        }]
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
                    break;
                }

                default:
                    await utils.reply.error(interaction, 'PARAMETER_NOT_FOUND');
            }
        } catch (err) {
            logger.error(`[Slash ▸ Bot] An error occurred in subcommand '${subcommand}' for '${interaction.guild.id}':\n${err}`);

            let errorKey;

            if (err.code === RESTJSONErrorCodes.InvalidFormBodyOrContentType || err.message?.includes('RATE_LIMIT')) {
                errorKey = 'RATE_LIMIT';
            } else {
                errorKey = subcommand === 'avatar' ? 'AVATAR_ERROR' : subcommand === 'banner' ? 'BANNER_ERROR' : 'STATUS_ERROR';
            }

            await utils.reply.error(interaction, errorKey);
        }
    },
};