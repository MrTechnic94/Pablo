'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionsBitField } = require('discord.js');
const { createEmbed } = require('../../lib/utils/createEmbed');

module.exports = {
    category: '`ℹ️` Przydatne',
    data: new SlashCommandBuilder()
        .setName('roleinfo')
        .setDescription('Wyświetla informacje o wybranej roli.')
        .addRoleOption(option =>
            option.setName('rola')
                .setDescription('Rola, o którym chcesz uzyskać informacje.')
                .setRequired(true)
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const role = interaction.options.getRole('rola');

        // Podstawowe informacje
        const memberCount = role.members.size;
        const createdAt = Math.floor(role.createdTimestamp / 1000);
        const hoist = role.hoist ? 'Tak' : 'Nie';
        const mentionable = role.mentionable ? 'Tak' : 'Nie';

        // Integracja
        let integratedStatus = 'Nie';
        if (role.managed) {
            integratedStatus = role.tags?.botId ? `Tak (Bot: <@${role.tags.botId}>)` : 'Tak (Boost Serwera)';
        }

        // Uprawnienia
        const displayPermissions = [];

        const allPermissions = Object.keys(PermissionsBitField.Flags);

        for (const key of allPermissions) {
            if (role.permissions.has(key)) {
                displayPermissions.push(key);
            }
        }

        const adminPermission = role.permissions.has(PermissionsBitField.Flags.Administrator);

        let permissionString;

        if (adminPermission) {
            permissionString = '```👑 ADMINISTRATOR```';
        } else if (displayPermissions.length > 0) {
            permissionString = `\`\`\`\n• ${displayPermissions.join('\n• ')}\n\`\`\``;
        } else {
            permissionString = '**•** Domyślne uprawnienia.';
        }

        // BitField
        const perms = role.permissions.bitfield;

        const successEmbed = createEmbed({
            title: 'Podgląd roli',
            fields: [
                { name: '`🔍` Rola', value: `**•** ${role}`, inline: false },
                { name: '`🔑` ID', value: `**•** ${role.id}`, inline: false },
                { name: '`🔢` Posiadających rolę', value: `**•** ${memberCount}`, inline: false },
                { name: '`🎨` Kolor (HEX)', value: `**•** ${role.hexColor}`, inline: false },
                { name: '`📅` Utworzono', value: `**•** <t:${createdAt}> (<t:${createdAt}:R>)`, inline: false },
                { name: '`✨` Wyświetlana oddzielnie?', value: `**•** ${hoist}`, inline: false },
                { name: '`🗣️` Można wzmiankować?', value: `**•** ${mentionable}`, inline: false },
                { name: '`🔗` Zintegrowana?', value: `**•** ${integratedStatus}`, inline: false },
                { name: '`🛡️` Uprawnienia', value: permissionString, inline: false },
                { name: '`🔢` BitField uprawnień', value: `**•** ${perms}`, inline: false }
            ]
        });

        await interaction.reply({ embeds: [successEmbed] });
    },
};