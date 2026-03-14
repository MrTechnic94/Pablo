'use strict';

const { PermissionFlagsBits, InteractionContextType, SlashCommandBuilder } = require('discord.js');

module.exports = {
    category: '`📛` Administracja',
    botPermissions: [PermissionFlagsBits.ManageChannels],
    data: new SlashCommandBuilder()
        .setName('channel')
        .setDescription('Zarządzanie blokadami kanału.')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addSubcommand(sub => sub
            .setName('lock')
            .setDescription('Blokuje kanał dla wszystkich użytkowników.')
        )
        .addSubcommand(sub => sub
            .setName('unlock')
            .setDescription('Odblokowuje zablokowany kanał.')
        ),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        const subcommand = interaction.options.getSubcommand();

        if (!interaction.channel.isTextBased()) {
            return await utils.reply.error(interaction, 'NOT_TEXT_CHANNEL');
        }

        try {
            const everyoneRole = interaction.guild.roles.everyone;
            const overwrite = interaction.channel.permissionOverwrites.cache.get(everyoneRole.id);
            const unixTimestamp = Math.floor(Date.now() / 1000);

            const lockPermissions = {
                [PermissionFlagsBits.SendMessages]: subcommand === 'lock' ? false : null,
                [PermissionFlagsBits.AddReactions]: subcommand === 'lock' ? false : null,
                [PermissionFlagsBits.CreatePublicThreads]: subcommand === 'lock' ? false : null,
                [PermissionFlagsBits.CreatePrivateThreads]: subcommand === 'lock' ? false : null,
                [PermissionFlagsBits.SendMessagesInThreads]: subcommand === 'lock' ? false : null,
                [PermissionFlagsBits.UseApplicationCommands]: subcommand === 'lock' ? false : null,
                [PermissionFlagsBits.UseEmbeddedActivities]: subcommand === 'lock' ? false : null,
                [PermissionFlagsBits.UseExternalApps]: subcommand === 'lock' ? false : null
            };

            switch (subcommand) {
                case 'lock': {
                    if (overwrite?.deny.has(PermissionFlagsBits.SendMessages)) {
                        return await utils.reply.error(interaction, 'CHANNEL_ALREADY_LOCKED');
                    }

                    await interaction.channel.permissionOverwrites.edit(everyoneRole, lockPermissions);

                    const successEmbed = utils.createEmbed({
                        title: 'Kanał zablokowany',
                        description: `\`📛\` **Moderator:** <@${interaction.user.id}>\n\`🕒\` **Zablokowano:** <t:${unixTimestamp}:R>`
                    });

                    await interaction.reply({ embeds: [successEmbed] });
                    break;
                }

                case 'unlock': {
                    if (!overwrite?.deny.has(PermissionFlagsBits.SendMessages)) {
                        return await utils.reply.error(interaction, 'CHANNEL_ALREADY_UNLOCKED');
                    }

                    await interaction.channel.permissionOverwrites.edit(everyoneRole, lockPermissions);

                    const successEmbed = utils.createEmbed({
                        title: 'Kanał odblokowany',
                        description: `\`📛\` **Moderator:** <@${interaction.user.id}>\n\`🕓\` **Odblokowano:** <t:${unixTimestamp}:R>`
                    });

                    await interaction.reply({ embeds: [successEmbed] });
                    break;
                }

                default:
                    await utils.reply.error(interaction, 'PARAMETER_NOT_FOUND');
            }
        } catch (err) {
            logger.error(`[Slash ▸ Channel] An error occurred in subcommand '${subcommand}' for '${interaction.guild.id}':\n${err}`);
            const errorKey = subcommand === 'lock' ? 'LOCK_CHANNEL_ERROR' : 'UNLOCK_CHANNEL_ERROR';
            await utils.reply.error(interaction, errorKey);
        }
    },
};