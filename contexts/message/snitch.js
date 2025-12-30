'use strict';

const { ContextMenuCommandBuilder, ApplicationCommandType, InteractionContextType, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed } = require('../../lib/utils/createEmbed');
const { channels } = require('../../config/default.json');

module.exports = {
    index: false,
    data: new ContextMenuCommandBuilder()
        .setName('Zgłoś wiadomość')
        .setType(ApplicationCommandType.Message)
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const message = interaction.targetMessage;
        const target = message.author;
        const reporter = interaction.user;

        const targetMember = interaction.guild.members.cache.get(target.id);

        if (!targetMember) {
            return interaction.reply({ content: '`❌` Nie znaleziono użytkownika.', flags: MessageFlags.Ephemeral });
        }

        if (target.bot) {
            return interaction.reply({ content: '`❌` Nie możesz zgłosić bota.', flags: MessageFlags.Ephemeral });
        }

        if (target.id === reporter.id) {
            return interaction.reply({ content: '`❌` Nie możesz zgłosić samego siebie.', flags: MessageFlags.Ephemeral });
        }

        const logChannel = interaction.guild.channels.cache.get(channels.snitch);

        if (!logChannel || !logChannel.isTextBased()) {
            return interaction.reply({ content: '`❌` System zgłoszeń nie został skonfigurowany.', flags: MessageFlags.Ephemeral });
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

        const adminEmbed = createEmbed({
            title: 'Nowe zgłoszenie!',
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