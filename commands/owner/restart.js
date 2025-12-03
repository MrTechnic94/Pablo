'use strict';

const { SlashCommandBuilder, InteractionContextType, PresenceUpdateStatus, MessageFlags } = require('discord.js');
const { getConfig, syncConfig } = require('../../lib/core/configManipulator');
const { createEmbed } = require('../../lib/utils/createEmbed');
const { botOptions } = require('../../config/default.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('Restart bota lub jego funkcji.')
        .addStringOption(option =>
            option.setName('rodzaj')
                .setDescription('Rodzaj restartu.')
                .setRequired(true)
                .addChoices(
                    { name: 'Bot', value: 'Bot' },
                    { name: 'Status', value: 'Status' },
                    { name: 'Avatar', value: 'Avatar' }
                )
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
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
                    logger.error(`[Slash ▸ Restart] ${err}`);
                    await interaction.reply({ content: '❌ Wystąpił problem podczas restartowania bota.', flags: MessageFlags.Ephemeral });
                }
                break;
            }

            case 'Status': {
                if (interaction.client.user.presence?.activities?.[0]?.name === botOptions.defaultActivityName &&
                    interaction.client.user.presence?.status === PresenceUpdateStatus[botOptions.defaultActivityPresence]) {
                    return await interaction.reply({ content: '❌ Status jest już zrestartowany.', flags: MessageFlags.Ephemeral });
                }

                try {
                    await interaction.client.user.setPresence({
                        status: PresenceUpdateStatus[botOptions.defaultActivityPresence],
                        activities: [{
                            name: botOptions.defaultActivityName
                        }],
                    });

                    const config = getConfig();

                    config.botOptions.changedActivityName = "";
                    config.botOptions.changedActivityPresence = "";

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

                    const presenceEmoji = presenceEmojis[config.botOptions.defaultActivityPresence] || '❓';

                    const successEmbed = createEmbed({
                        title: 'Status zmieniony',
                        description: `\`💬\` **Nazwa:** ${botOptions.defaultActivityName}\n\`${presenceEmoji}\` **Status:** ${presenceTypes[botOptions.defaultActivityPresence]}`
                    });

                    await interaction.reply({ embeds: [successEmbed] });
                } catch (err) {
                    logger.error(`[Slash ▸ Restart] ${err}`);
                    await interaction.reply({
                        content: '❌ Wystąpił problem podczas restartu statusu bota.',
                        flags: MessageFlags.Ephemeral
                    });
                }
                break;
            }

            case 'Avatar': {
                const config = getConfig();

                if (!config.botOptions.changedAvatar) {
                    return await interaction.reply({ content: '❌ Avatar nie został zmieniony.', flags: MessageFlags.Ephemeral });
                }

                try {
                    config.botOptions.changedAvatar = false;

                    syncConfig(config);

                    await interaction.client.user.setAvatar(botOptions.currentAvatar === 'default' ? botOptions.avatarDefaultPath : botOptions.avatarChrismasPath);

                    const successEmbed = createEmbed({
                        title: 'Avatar zrestartowany',
                        description: `\`🖼️\`**Obraz:** [KLIKNIJ🡭](${interaction.client.user.displayAvatarURL()})\n\`🔎\` **Rodzaj:** ${botOptions.currentAvatar === 'default' ? 'Domyślny' : 'Świąteczny'}`,
                        image: interaction.client.user.displayAvatarURL()
                    });

                    await interaction.reply({ embeds: [successEmbed] })
                } catch (err) {
                    logger.error(`[Slash ▸ Restart] ${err}`);
                    await interaction.reply({
                        content: '❌ Wystąpił problem podczas restart avataru bota.',
                        flags: MessageFlags.Ephemeral
                    });
                }
            }
        }
    },
};