'use strict';

const { SlashCommandBuilder, InteractionContextType, ActivityType, RESTJSONErrorCodes } = require('discord.js');
const { botOptions } = require('../../config/default.json');
const { presence } = require('../../locales/pl_PL');

module.exports = {
    index: false,
    ownerOnly: true,
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('Restart bota lub jego funkcji.')
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option =>
            option.setName('rodzaj')
                .setDescription('Rodzaj restartu.')
                .setRequired(true)
                .addChoices(
                    { name: 'Bot', value: 'Bot' },
                    { name: 'Status', value: 'Status' },
                    { name: 'Avatar', value: 'Avatar' },
                    { name: 'Banner', value: 'Banner' }
                )
        ),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        const type = interaction.options.getString('rodzaj');

        switch (type) {
            case 'Bot': {
                try {
                    await utils.reply.success(interaction, 'RESTART_BOT');

                    process.emit('SIGINT');
                } catch (err) {
                    logger.error(`[Slash ▸ Restart] An error occurred for '${interaction.guild.id}':\n${err}`);
                    await utils.reply.error(interaction, 'RESTART_ERROR');
                }
                break;
            }

            case 'Status': {
                if (interaction.client.user.presence?.activities?.[0]?.name === botOptions.defaultActivityName &&
                    interaction.client.user.presence?.status === botOptions.defaultActivityPresence) {
                    return await utils.reply.error(interaction, 'STATUS_ALREADY_RESTARTED');
                }

                try {
                    await interaction.client.user.setPresence({
                        status: botOptions.defaultActivityPresence,
                        activities: [{
                            name: botOptions.defaultActivityName,
                            type: ActivityType.Custom
                        }]
                    });

                    const config = utils.getConfig();

                    config.botOptions.changedActivityName = "";
                    config.botOptions.changedActivityPresence = "";

                    utils.syncConfig(config);

                    const presenceData = presence[botOptions.defaultActivityPresence];

                    const presenceEmoji = presenceData?.emoji || '❓';
                    const presenceType = presenceData?.name || 'Nieznany';

                    const successEmbed = utils.createEmbed({
                        title: 'Status zmieniony',
                        description: `\`💬\` **Nazwa:** ${botOptions.defaultActivityName}\n\`${presenceEmoji}\` **Status:** ${presenceType}`
                    });

                    await interaction.reply({ embeds: [successEmbed] });
                } catch (err) {
                    logger.error(`[Slash ▸ Restart] An error occurred for '${interaction.guild.id}':\n${err}`);
                    await utils.reply.error(interaction, 'STATUS_ERROR');
                }
                break;
            }

            case 'Avatar': {
                const config = utils.getConfig();

                if (!config.botOptions.changedAvatar) {
                    return await utils.reply.error(interaction, 'AVATAR_NO_CHANGE');
                }

                try {
                    config.botOptions.changedAvatar = false;

                    utils.syncConfig(config);

                    await interaction.client.user.setAvatar(botOptions.currentAvatar === 'default' ? botOptions.avatarDefaultPath : botOptions.avatarChrismasPath);

                    const successEmbed = utils.createEmbed({
                        title: 'Avatar zrestartowany',
                        description: `\`🖼️\`**Obraz:** [KLIKNIJ🡭](${interaction.client.user.displayAvatarURL()})\n\`🔎\` **Rodzaj:** ${botOptions.currentAvatar === 'default' ? 'Domyślny' : 'Świąteczny'}`,
                        image: interaction.client.user.displayAvatarURL()
                    });

                    await interaction.reply({ embeds: [successEmbed] })
                } catch (err) {
                    if (err.code === RESTJSONErrorCodes.InvalidFormBodyOrContentType || err.message.includes('AVATAR_RATE_LIMIT')) {
                        return await utils.reply.error(interaction, 'RATE_LIMIT');
                    }

                    logger.error(`[Slash ▸ Restart] An error occurred for '${interaction.guild.id}':\n${err}`);
                    await utils.reply.error(interaction, 'AVATAR_ERROR');
                }
                break;
            }

            case 'Banner': {
                const botUser = await interaction.client.user.fetch().catch(() => null);

                if (!botUser.bannerURL()) {
                    return await utils.reply.error(interaction, 'NO_BANNER_FOUND');
                }

                try {
                    await interaction.client.user.setBanner(botOptions.bannerDefaultPath);

                    const isAnimated = botUser.bannerURL()?.includes('.gif');

                    const successEmbed = utils.createEmbed({
                        title: 'Banner zrestartowany',
                        description: `\`🖼️\`**Obraz:** [KLIKNIJ🡭](${interaction.client.user.bannerURL({ size: 256 })})\n\`🔥\`**Rodzaj:** ${isAnimated ? 'Animowany.' : 'Statyczny.'}`,
                        image: interaction.client.user.bannerURL({ size: 256 })
                    });

                    await interaction.reply({ embeds: [successEmbed] })
                } catch (err) {
                    if (err.code === RESTJSONErrorCodes.InvalidFormBodyOrContentType || err.message?.includes('BANNER_RATE_LIMIT')) {
                        return await utils.reply.error(interaction, 'RATE_LIMIT');
                    }

                    logger.error(`[Slash ▸ Restart] An error occurred for '${interaction.guild.id}':\n${err}`);
                    await utils.reply.error(interaction, 'BANNER_ERROR');
                }
                break;
            }

            default:
                await utils.reply.error(interaction, 'PARAMETER_NOT_FOUND');
        }
    },
};