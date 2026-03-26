'use strict';

const { SlashCommandBuilder, InteractionContextType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    category: '`ℹ️` Przydatne',
    data: new SlashCommandBuilder()
        .setName('snitch')
        .setDescription('Zgłoś przewinienie użytkownika.')
        .setContexts(InteractionContextType.Guild)
        .addUserOption(option => option
            .setName('użytkownik')
            .setDescription('Użytkownik którego chcesz zgłosić.')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('powód')
            .setDescription('Powód zgłoszenia.')
            .setRequired(true)
            .setMinLength(5)
            .setMaxLength(450)
        )
        .addAttachmentOption(option => option
            .setName('obraz')
            .setDescription('Zdjęcie albo zrzut ekranu przewinienia.')
            .setRequired(false)
        ),
    async execute(interaction) {
        const { utils } = interaction.client;

        const target = interaction.options.getUser('użytkownik');
        const reason = interaction.options.getString('powód');
        const evidence = interaction.options.getAttachment('obraz');
        const reporter = interaction.user;
        const requiredChannel = await utils.db.hGet(`guilds:${interaction.guild.id}:settings`, 'snitchChannelId');
        const logChannel = interaction.guild.channels.cache.get(requiredChannel);

        if (!logChannel) {
            return await utils.interface.sendError(interaction, 'RECORD_NOT_FOUND');
        }

        if (!target) {
            return await utils.interface.sendError(interaction, 'USER_NOT_FOUND');
        }

        if (target.id === reporter.id) {
            return await utils.interface.sendError(interaction, 'CANT_REPORT_SELF');
        }

        const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (!targetMember.bannable && !targetMember.kickable && !targetMember.moderatable || target.bot) {
            return await utils.interface.sendError(interaction, 'USER_NOT_PUNISHABLE');
        }

        const adminFields = [
            { name: '`👤` Zgłoszony', value: `**•** ${target}\n└ \`🔑\` ${target.id}`, inline: true },
            { name: '`🕵️` Zgłaszający', value: `**•** ${reporter}\n└ \`🔑\` ${reporter.id}`, inline: true },
            { name: '`📍` Miejsce', value: `**•** ${interaction.channel}`, inline: false },
            { name: '`💬` Powód', value: `\`\`\`${reason}\`\`\``, inline: false }
        ];

        const adminEmbed = utils.interface.createEmbed({
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
                    .setCustomId(`snitch_timeout_${target.id}`)
                    .setLabel('Wycisz')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId(`snitch_dismiss_${reporter.id}`)
                    .setLabel('Odrzuć')
                    .setStyle(ButtonStyle.Primary)
            );

        await logChannel.send({ embeds: [adminEmbed], components: [row] });

        await utils.interface.sendSuccess(interaction, 'SNITCH_SENT');
    },
};