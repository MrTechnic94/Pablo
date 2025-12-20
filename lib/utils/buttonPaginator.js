'use strict';

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags } = require('discord.js');

async function sendPaginatedEmbed(interaction, pages, timeout = 60000) {
    if (!pages?.length) return;

    let currentPage = 0;

    const getButtons = (index) => {
        const isStart = index === 0;
        const isEnd = index === pages.length - 1;
        const showQuickNav = pages.length > 2;

        const buttonsConfig = [
            { id: 'first', emoji: '⏪', show: showQuickNav, disabled: isStart },
            { id: 'preview', emoji: '⬅️', show: true, disabled: isStart },
            { id: 'next', emoji: '➡️', show: true, disabled: isEnd },
            { id: 'last', emoji: '⏩', show: showQuickNav, disabled: isEnd }
        ];

        const components = buttonsConfig
            .filter(btn => btn.show)
            .map(btn => new ButtonBuilder()
                .setCustomId(btn.id)
                .setEmoji(btn.emoji)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(btn.disabled)
            );

        return new ActionRowBuilder().addComponents(components);
    };

    // Wyslanie pierwszej strony
    const response = await interaction.reply({
        embeds: [pages[currentPage]],
        components: [getButtons(currentPage)]
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
            return await i.reply({ content: '`❌` To nie jest twoje menu.', flags: MessageFlags.Ephemeral });
        }

        collector.resetTimer();

        if (actionMap[i.customId]) {
            currentPage = actionMap[i.customId]();
        }

        await i.update({
            embeds: [pages[currentPage]],
            components: [getButtons(currentPage)]
        });
    });

    collector.on('end', () => {
        // Usuniecie przycisku po timeout
        interaction.editReply({ components: [] }).catch(() => null);
    });
}

module.exports = { sendPaginatedEmbed };