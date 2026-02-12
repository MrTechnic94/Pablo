'use strict';

const { PermissionFlagsBits, SlashCommandBuilder, InteractionContextType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    category: '`ℹ️` Przydatne',
    botPermissions: [PermissionFlagsBits.BanMembers, PermissionFlagsBits.KickMembers],
    data: new SlashCommandBuilder()
        .setName('snitch')
        .setDescription('Zgłoś przewinienie użytkownika.')
        .addUserOption(option =>
            option.setName('użytkownik')
                .setDescription('Użytkownik którego chcesz zgłosić.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('powód')
                .setDescription('Powód zgłoszenia.')
                .setRequired(true)
                .setMinLength(5)
                .setMaxLength(450)
        )
        .addAttachmentOption(option =>
            option.setName('obraz')
                .setDescription('Zdjęcie albo zrzut ekranu przewinienia.')
                .setRequired(false)
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const { utils } = interaction.client;

        const target = interaction.options.getUser('użytkownik');
        const reason = interaction.options.getString('powód');
        const evidence = interaction.options.getAttachment('obraz');
        const reporter = interaction.user;
        const requiredChannel = await utils.db.hGet(`guild:${interaction.guild.id}`, 'snitchChannelId');
        const logChannel = interaction.guild.channels.cache.get(requiredChannel);

        if (!logChannel) {
            return await utils.reply.error(interaction, 'RECORD_NOT_FOUND');
        }

        if (!target) {
            return await utils.reply.error(interaction, 'USER_NOT_FOUND');
        }

        if (target.bot) {
            return await utils.reply.error(interaction, 'REPORT_BOT_ERROR');
        }

        if (target.id === reporter.id) {
            return await utils.reply.error(interaction, 'CANT_REPORT_SELF');
        }

        const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (targetMember.permissions.has(PermissionFlagsBits.Administrator)) {
            return await utils.reply.error(interaction, 'USER_NOT_PUNISHABLE');
        }

        const adminFields = [
            { name: '`👤` Zgłoszony', value: `**•** ${target}\n└ \`🔑\` ${target.id}`, inline: true },
            { name: '`🕵️` Zgłaszający', value: `**•** ${reporter}\n└ \`🔑\` ${reporter.id}`, inline: true },
            { name: '`📍` Miejsce', value: `**•** ${interaction.channel}`, inline: false },
            { name: '`💬` Powód', value: `\`\`\`${reason}\`\`\``, inline: false }
        ];

        const adminEmbed = utils.createEmbed({
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