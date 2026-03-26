'use strict';

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, BaseInteraction, MessageFlags } = require('discord.js');
const { embeds } = require('../../config/default.json');
const msg = require('../../locales/pl_PL');

const EPHEMERAL_FLAG = MessageFlags.Ephemeral;

function createEmbed({ title, url, author, description, thumbnail, fields, image, timestamp, footer, color }) {
    const builtEmbed = new EmbedBuilder();
    if (title) builtEmbed.setTitle(title);
    if (url) builtEmbed.setURL(url);
    if (author?.name) builtEmbed.setAuthor(author);
    if (description) builtEmbed.setDescription(description);
    if (thumbnail) builtEmbed.setThumbnail(thumbnail);
    if (fields?.length > 0) builtEmbed.setFields(fields);
    if (image) builtEmbed.setImage(image);
    if (timestamp) builtEmbed.setTimestamp(timestamp);
    if (footer?.text) builtEmbed.setFooter(footer);
    builtEmbed.setColor(color ?? embeds.defaultColor);

    return builtEmbed;
}

function getButtons(index, totalPages) {
    const isStart = index === 0;
    const isEnd = index === totalPages - 1;
    const showQuickNav = totalPages > 2;

    const buttonsConfig = [
        { id: 'first', emoji: '⏪', show: showQuickNav, disabled: isStart },
        { id: 'preview', emoji: '⬅️', show: true, disabled: isStart },
        { id: 'next', emoji: '➡️', show: true, disabled: isEnd },
        { id: 'last', emoji: '⏩', show: showQuickNav, disabled: isEnd }
    ];

    return new ActionRowBuilder().addComponents(
        buttonsConfig
            .filter(btn => btn.show)
            .map(btn => new ButtonBuilder()
                .setCustomId(btn.id)
                .setEmoji(btn.emoji)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(btn.disabled)
            )
    );
}

async function sendPaginatedEmbed(interaction, pages, timeout = 60000) {
    const { utils } = interaction.client;

    if (!pages?.length) return;

    let currentPage = 0;

    // Wyslanie pierwszej strony
    const response = await interaction.reply({
        embeds: [pages[currentPage]],
        components: [getButtons(currentPage, pages.length)]
    });

    const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: timeout
    });

    const actionMap = {
        first: () => 0,
        preview: () => Math.max(0, currentPage - 1),
        next: () => Math.min(pages.length - 1, currentPage + 1),
        last: () => pages.length - 1
    };

    collector.on('collect', async (i) => {
        if (i.user.id !== interaction.user.id) {
            return await utils.reply.error(i, 'MENU_ERROR');
        }

        collector.resetTimer();

        if (actionMap[i.customId]) {
            currentPage = actionMap[i.customId]();
        }

        await i.update({
            embeds: [pages[currentPage]],
            components: [getButtons(currentPage, pages.length)]
        });
    });

    collector.on('end', async () => {
        const lastComponents = getButtons(currentPage, pages.length);

        lastComponents.components.forEach(button => {
            button.setDisabled(true);
        });

        await interaction.editReply({ components: [lastComponents] }).catch(() => null);
    });
}

function fastFormat(str, args) {
    if (!args.length) return str;
    let i = 0;
    return str.replace(/%s|%d|%j/g, () => args[i++]);
}

function getFormattedString(type, key, args) {
    const raw = msg[type]?.[key] || key;
    return args.length > 0 ? fastFormat(raw, args) : raw;
}

async function sendInterface(target, type, key, args) {
    const content = getFormattedString(type, key, args);

    if (!(target instanceof BaseInteraction)) {
        return target.reply({ content }).catch(() => null);
    }

    if (!target.replied) {
        if (target.deferred) {
            return target.editReply({ content, flags: EPHEMERAL_FLAG }).catch(() => null);
        }

        return target.reply({ content, flags: EPHEMERAL_FLAG }).catch(() => null);
    }

    return target.followUp({ content, flags: EPHEMERAL_FLAG }).catch(() => null);
}

module.exports = {
    createEmbed, sendPaginatedEmbed,
    sendError: (target, key, ...args) => sendInterface(target, 'error', key, args),
    sendSuccess: (target, key, ...args) => sendInterface(target, 'success', key, args),
    getString: (type, key, ...args) => getFormattedString(type, key, args)
};