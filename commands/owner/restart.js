'use strict';

const { SlashCommandBuilder, InteractionContextType, ActivityType, PresenceUpdateStatus, EmbedBuilder, MessageFlags } = require('discord.js');
const { botOptions, embedOptions } = require('../../config/default.json');
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
                    { name: 'Avatar', value: 'Avatar' }
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
                if (interaction.client.user.presence?.activities?.[0]?.name === botOptions.defaultActivityName &&
                    interaction.client.user.presence?.activities?.[0]?.type === ActivityType[botOptions.defaultActivityType] &&
                    interaction.client.user.presence?.status === PresenceUpdateStatus[botOptions.defaultActivityPresence]) {
                    return await interaction.reply({ content: '❌ Status jest już zrestartowany.', flags: MessageFlags.Ephemeral });
                }

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

                    const presenceEmojis = {
                        Online: '🟢',
                        Offline: '🎱',
                        Idle: '🌙',
                        DoNotDisturb: '⛔',
                        Invisible: '🎱'
                    };

                    const presenceEmoji = presenceEmojis[config.botOptions.changedActivityPresence] || presenceEmojis[config.botOptions.defaultActivityPresence];

                    const successEmbed = new EmbedBuilder()
                        .setTitle('Status zmieniony')
                        .setDescription(`\`💬\` **Nazwa:** ${botOptions.defaultActivityName}\n\`🔎\` **Rodzaj:** ${botOptions.defaultActivityType}\n\`${presenceEmoji}\` **Status:** ${botOptions.defaultActivityPresence === 'DoNotDisturb' ? 'Do Not Disturb' : botOptions.defaultActivityPresence}`)
                        .setColor(embedOptions.defaultColor);

                    await interaction.reply({ embeds: [successEmbed] });
                } catch (err) {
                    logger.error(`[Cmd - restart] ${err}`);
                    await interaction.reply({
                        content: '❌ Wystąpił problem podczas restartu statusu bota.',
                        flags: MessageFlags.Ephemeral
                    });
                }
                break;
            }

            case 'Avatar': {
                const configPath = resolve(__dirname, '../../config/default.json');
                const config = JSON.parse(readFileSync(configPath, 'utf8'));

                if (!config.botOptions.changedAvatar) {
                    return await interaction.reply({ content: '❌ Avatar nie został zmieniony.', flags: MessageFlags.Ephemeral });
                }

                try {
                    config.botOptions.changedAvatar = false;

                    writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');

                    await interaction.client.user.setAvatar(botOptions.currentAvatar === 'default' ? botOptions.avatarDefaultPath : botOptions.avatarChrismasPath);

                    const successEmbed = new EmbedBuilder()
                        .setTitle('Avatar zrestartowany')
                        .setDescription(`\`🖼️\`**Obraz:** [KLIKNIJ🡭](${interaction.client.user.displayAvatarURL()})\n\`🔎\` **Rodzaj:** ${botOptions.currentAvatar === 'default' ? 'Domyślny' : 'Świąteczny'}`)
                        .setImage(interaction.client.user.displayAvatarURL())
                        .setColor(embedOptions.defaultColor);

                    await interaction.reply({ embeds: [successEmbed] })
                } catch (err) {
                    logger.error(`[Cmd - restart] ${err}`);
                    await interaction.reply({
                        content: '❌ Wystąpił problem podczas restart avataru bota.',
                        flags: MessageFlags.Ephemeral
                    });
                }
            }
        }
    },
};