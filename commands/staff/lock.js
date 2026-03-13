'use strict';

const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
    category: '`📛` Administracja',
    botPermissions: [PermissionFlagsBits.ManageChannels],
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Blokuje kanał dla wszystkich użytkowników.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        const everyoneRole = interaction.guild.roles.everyone;
        const channel = interaction.channel.isTextBased() ? interaction.channel : await interaction.channel.fetch();
        const overwrite = channel.permissionOverwrites.cache.get(everyoneRole.id);

        if (overwrite?.deny.has(PermissionFlagsBits.SendMessages)) {
            return await utils.reply.error(interaction, 'CHANNEL_ALREADY_LOCKED');
        }

        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                [PermissionFlagsBits.SendMessages]: false,
                [PermissionFlagsBits.AddReactions]: false,
                [PermissionFlagsBits.CreatePublicThreads]: false,
                [PermissionFlagsBits.CreatePrivateThreads]: false,
                [PermissionFlagsBits.SendMessagesInThreads]: false,
                [PermissionFlagsBits.UseApplicationCommands]: false,
                [PermissionFlagsBits.UseEmbeddedActivities]: false,
                [PermissionFlagsBits.UseExternalApps]: false
            });

            const unixTimestamp = Math.floor(Date.now() / 1000);

            const successEmbed = utils.createEmbed({
                title: 'Kanał zablokowany',
                description: `\`📛\` **Moderator:** <@${interaction.user.id}>\n\`🕒\` **Czas:** <t:${unixTimestamp}:R>`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Lock] An error occurred for '${interaction.guild.id}':\n${err}`);
            await utils.reply.error(interaction, 'LOCK_CHANNEL_ERROR');
        }
    },
};