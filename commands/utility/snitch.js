'use strict';

const { SlashCommandBuilder, InteractionContextType, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed } = require('../../lib/utils/createEmbed');

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

        if (!target) {
            return interaction.reply({ content: '`❌` Nie znaleziono użytkownika.', flags: MessageFlags.Ephemeral });
        }

        if (target.bot) {
            return interaction.reply({ content: '`❌` Nie możesz zgłosić bota.', flags: MessageFlags.Ephemeral });
        }

        if (target.id === reporter.id) {
            return interaction.reply({ content: '`❌` Nie możesz zgłosić samego siebie.', flags: MessageFlags.Ephemeral });
        }

        const logChannel = interaction.guild.channels.cache.get(process.env.SNITCH_CHANNEL_ID);

        if (!logChannel || !logChannel.isTextBased()) {
            return interaction.reply({ content: '`❌` System zgłoszeń nie został skonfigurowany.', flags: MessageFlags.Ephemeral });
        }

        const adminFields = [
            { name: '`👤` Zgłoszony', value: `**•** ${target}\n└ \`🔑\` ${target.id}`, inline: true },
            { name: '`🕵️` Zgłaszający', value: `**•** ${reporter}\n└ \`🔑\` ${reporter.id}`, inline: true },
            { name: '`📍` Miejsce', value: `**•** ${interaction.channel}`, inline: false },
            { name: '`💬` Powód', value: `\`\`\`${reason}\`\`\``, inline: false }
        ];

        const adminEmbed = createEmbed({
            title: 'Nowe zgłoszenie!',
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

        await interaction.reply({
            content: '`➕` Twoje zgłoszenie wpłyneło do administracji. Dziękujemy za czujność!',
            flags: MessageFlags.Ephemeral
        });
    },
};