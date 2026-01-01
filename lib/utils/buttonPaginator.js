'use strict';

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const reply = require('../utils/responder');


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
            return await reply.error(i, 'MENU_ERROR');
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

module.exports = { sendPaginatedEmbed };