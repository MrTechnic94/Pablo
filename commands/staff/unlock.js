'use strict';

const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
    category: '`📛` Administracja',
    botPermissions: [PermissionFlagsBits.ManageChannels],
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Oblokowuje zablokowany kanał.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        const everyoneRole = interaction.guild.roles.everyone;
        const channel = interaction.channel.isTextBased() ? interaction.channel : await interaction.channel.fetch();
        const overwrite = channel.permissionOverwrites.cache.get(everyoneRole.id);

        if (!overwrite?.deny.has(PermissionFlagsBits.SendMessages)) {
            return await utils.reply.error(interaction, 'CHANNEL_ALREADY_UNLOCKED');
        }

        try {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                [PermissionFlagsBits.SendMessages]: null,
                [PermissionFlagsBits.AddReactions]: null,
                [PermissionFlagsBits.CreatePublicThreads]: null,
                [PermissionFlagsBits.CreatePrivateThreads]: null,
                [PermissionFlagsBits.SendMessagesInThreads]: null,
                [PermissionFlagsBits.UseApplicationCommands]: null,
                [PermissionFlagsBits.UseEmbeddedActivities]: null,
                [PermissionFlagsBits.UseExternalApps]: null
            });

            const unixTimestamp = Math.floor(Date.now() / 1000);

            const successEmbed = utils.createEmbed({
                title: 'Kanał odblokowany',
                description: `\`📛\` **Moderator:** <@${interaction.user.id}>\n\`🕓\` **Czas:** <t:${unixTimestamp}:R>`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Unlock] An error occurred for '${interaction.guild.id}':\n${err}`);
            await utils.reply.error(interaction, 'UNLOCK_CHANNEL_ERROR');
        }
    },
};