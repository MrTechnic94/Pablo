'use strict';

const { PermissionFlagsBits, SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    category: '`📛` Administracja',
    botPermissions: [PermissionFlagsBits.ManageChannels],
    data: new SlashCommandBuilder()
        .setName('nuke')
        .setDescription('Czyści kanał poprzez jego całkowite zresetowanie.')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        if (!interaction.channel?.isTextBased()) {
            return await utils.reply.error(interaction, 'NOT_TEXT_CHANNEL');
        }

        if (!interaction.channel.deletable) {
            return await utils.reply.error(interaction, 'CHANNEL_NOT_DELETABLE');
        }

        try {
            await interaction.deferReply();

            const newChannel = await interaction.channel.clone({
                reason: `Zlecono wykonanie polecenia 'nuke' przez ${interaction.user.tag}.`
            });

            await interaction.channel.delete(`Zniszczenie kanału zostało wykonane przez ${interaction.user.tag}.`);

            const unixTimestamp = Math.floor(Date.now() / 1000);

            const successEmbed = utils.createEmbed({
                title: 'Kanał został zrestartowany',
                description: `\`📛\` **Moderator:** <@${interaction.user.id}>\n\`📅\` **Czas:** <t:${unixTimestamp}:R>`
            });

            await newChannel.send({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Nuke] An error occurred for '${interaction.guild.id}':\n${err}`);
            await utils.reply.error(interaction, 'NUKE_ERROR');
        }
    },
};