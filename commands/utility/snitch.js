'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed } = require('../../lib/utils/createEmbed');
const { channels } = require('../../config/default.json');
const reply = require('../../lib/utils/responder');

module.exports = {
    category: '`ℹ️` Przydatne',
    data: new SlashCommandBuilder()
        .setName('snitch')
        .setDescription('Zgłoś przewinienie użytkownika.')
        .addUserOption(option =>
            option.setName('użytkownik')
                .setDescription('Użytkownik którego chcesz zgłosić.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('powód')
                .setDescription('Powód zgłoszenia.')
                .setRequired(true)
                .setMinLength(5)
                .setMaxLength(450))
        .addAttachmentOption(option =>
            option.setName('obraz')
                .setDescription('Zdjęcie albo zrzut ekranu przewinienia.')
                .setRequired(false))
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const target = interaction.options.getUser('użytkownik');
        const reason = interaction.options.getString('powód');
        const evidence = interaction.options.getAttachment('obraz');
        const reporter = interaction.user;
        const logChannel = interaction.guild.channels.cache.get(channels.snitch);

        if (!logChannel?.isTextBased()) {
            return await reply.error(interaction, 'SNITCH_CHANNEL_NOT_FOUND');
        }

        if (!target) {
            return await reply.error(interaction, 'USER_NOT_FOUND');
        }

        if (target.bot) {
            return await reply.error(interaction, 'REPORT_BOT_ERROR');
        }

        if (target.id === reporter.id) {
            return await reply.error(interaction, 'CANT_REPORT_SELF');
        }

        const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (targetMember.permissions.has(PermissionFlagsBits.Administrator)) {
            return await reply.error(interaction, 'USER_NOT_PUNISHABLE');
        }

        const adminFields = [
            { name: '`👤` Zgłoszony', value: `**•** ${target}\n└ \`🔑\` ${target.id}`, inline: true },
            { name: '`🕵️` Zgłaszający', value: `**•** ${reporter}\n└ \`🔑\` ${reporter.id}`, inline: true },
            { name: '`📍` Miejsce', value: `**•** ${interaction.channel}`, inline: false },
            { name: '`💬` Powód', value: `\`\`\`${reason}\`\`\``, inline: false }
        ];

        const adminEmbed = createEmbed({
            title: 'Nowe zgłoszenie',
            fields: adminFields
        });

        if (evidence) {
            adminEmbed.setImage(evidence.url);
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`snitch_ban_${target.id}`)
                    .setLabel('Zbanuj')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId(`snitch_dismiss_${reporter.id}`)
                    .setLabel('Odrzuć')
                    .setStyle(ButtonStyle.Primary)
            );

        await logChannel.send({ embeds: [adminEmbed], components: [row] });

        await reply.success(interaction, 'SNITCH_SENT');
    },
};