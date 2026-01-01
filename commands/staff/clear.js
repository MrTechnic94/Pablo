'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../lib/utils/createEmbed');
const reply = require('../../lib/utils/responder');

module.exports = {
    category: '`📛` Administracja',
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Usuwa wybraną ilość wiadomości z kanału.')
        .addIntegerOption(option =>
            option.setName('ilość')
                .setDescription('Ilość wiadomości do usunięcia.')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('usuń_przypięte')
                .setDescription('Wybierz, czy chcesz usunąć również przypięte wiadomości.')
                .setRequired(false)
                .addChoices(
                    { name: 'Tak', value: 'true' },
                    { name: 'Nie', value: 'false' }
                )
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages) && interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await reply.error(interaction, 'MANAGE_MESSAGE_PERMISSION_DENY');
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return await reply.error(interaction, 'BOT_MANAGE_MESSAGE_PERMISSION_DENY');
        }

        const amount = interaction.options.getInteger('ilość');
        const removePinnedStr = interaction.options.getString('usuń_przypięte') ?? 'false';
        const removePinned = removePinnedStr === 'true';

        const fetchedMessages = await interaction.channel.messages.fetch({ limit: amount });

        const messagesToDelete = removePinned ? fetchedMessages : fetchedMessages.filter(msg => !msg.pinned);

        if (!messagesToDelete.size) {
            return await reply.error(interaction, 'CLEAR_MESSAGE_NOT_FOUND');
        }

        try {
            await interaction.channel.bulkDelete(messagesToDelete, true);

            const successEmbed = createEmbed({
                title: 'Akcja wykonana',
                description: `\`💬\` **Usunięto: ** ${messagesToDelete.size > 1 ? `${messagesToDelete.size} wiadomości` : `${messagesToDelete.size} wiadomość`}\n\`📌\` **W tym przypięte:** ${removePinned ? 'Tak.' : 'Nie.'}`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (error) {
            logger.error(`[Slash ▸ Clear] ${error}`);
            await reply.error(interaction, 'CLEAR_ERROR');
        }
    },
};