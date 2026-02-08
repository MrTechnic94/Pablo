'use strict';

const { PermissionFlagsBits, ContextMenuCommandBuilder, ApplicationCommandType, InteractionContextType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    index: false,
    botPermissions: [PermissionFlagsBits.BanMembers, PermissionFlagsBits.KickMembers],
    data: new ContextMenuCommandBuilder()
        .setName('Zgłoś wiadomość')
        .setType(ApplicationCommandType.Message)
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const { utils } = interaction.client;

        const message = interaction.targetMessage;
        const target = message.author;
        const reporter = interaction.user;
        const requiredChannel = await utils.db.hGet(`guild:${interaction.guild.id}`, 'snitchChannelId');
        const logChannel = interaction.guild.channels.cache.get(requiredChannel);

        if (!logChannel) {
            return await utils.reply.error(interaction, 'RECORD_NOT_FOUND');
        }

        const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (!targetMember) {
            return await utils.reply.error(interaction, 'USER_NOT_FOUND');
        }

        if (target.bot) {
            return await utils.reply.error(interaction, 'REPORT_BOT_ERROR');
        }

        if (target.id === reporter.id) {
            return await utils.reply.error(interaction, 'CANT_REPORT_SELF');
        }

        if (targetMember.permissions.has(PermissionFlagsBits.Administrator)) {
            return await utils.reply.error(interaction, 'USER_NOT_PUNISHABLE');
        }

        const reason = message.content || "Wiadomość nie zawiera tekstu.";

        const adminFields = [
            { name: '`👤` Zgłoszony', value: `**•** ${target}\n└ \`🔑\` ${target.id}`, inline: true },
            { name: '`🕵️` Zgłaszający', value: `**•** ${reporter}\n└ \`🔑\` ${reporter.id}`, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: '`📍` Miejsce', value: `**•** ${interaction.channel}`, inline: true },
            { name: '`📎` Link', value: `**•** [KLIKNIJ🡭](${message.url})`, inline: true },
            { name: '`💬` Treść wiadomości', value: `\`\`\`${reason.slice(0, 1000)}\`\`\``, inline: false }
        ];

        const adminEmbed = utils.createEmbed({
            title: 'Nowe zgłoszenie',
            fields: adminFields
        });

        const attachment = message.attachments.first();

        if (attachment) {
            adminEmbed.setImage(attachment.url);
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`snitch_ban_${target.id}`)
                    .setLabel('Zbanuj')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId(`snitch_kick_${target.id}`)
                    .setLabel('Wyrzuć')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId(`snitch_dismiss_${reporter.id}`)
                    .setLabel('Odrzuć')
                    .setStyle(ButtonStyle.Primary)
            );

        await logChannel.send({ embeds: [adminEmbed], components: [row] });

        await utils.reply.success(interaction, 'SNITCH_SENT');
    },
};