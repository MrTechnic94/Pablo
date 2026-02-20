'use strict';

const { PermissionFlagsBits } = require('discord.js');
const { embeds } = require('../../config/default.json');

module.exports = {
    customId: 'snitch_timeout_',
    isPrefix: true,
    botPermissions: [PermissionFlagsBits.ModerateMembers],
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        try {
            if (!interaction.message.components.length) return;

            const targetId = interaction.customId.replace('snitch_timeout_', '');
            const targetMember = await interaction.guild.members.fetch(targetId).catch(() => null);

            if (!targetMember) {
                return await utils.reply.error(interaction, 'USER_NOT_FOUND');
            }

            if (!targetMember.moderatable) {
                return await utils.reply.error(interaction, 'USER_NOT_PUNISHABLE');
            }

            const reporterField = interaction.message.embeds[0].fields.find(f => f.name.includes('Zgłaszający'));
            const reporterIdMatch = reporterField ? reporterField.value.match(/<@!?(\d+)>/) : null;
            const reporterId = reporterIdMatch ? reporterIdMatch[1] : null;

            const reasonField = interaction.message.embeds[0].fields.find(f => f.name.includes('Powód') || f.name.includes('wiadomości'));

            let rawReason = reasonField ? reasonField.value : "Naruszenie regulaminu.";
            rawReason = rawReason.replace(/[`*•]|```/g, '').trim();

            const fullReason = `ZGŁOSZENIE: Zaakceptowane przez ${interaction.user.tag} | POWÓD: ${rawReason}`;
            const auditLogReason = fullReason.length > 500 ? `${fullReason.slice(0, 497)}...` : fullReason;

            if (reporterId) {
                const description = utils.reply.getString('success', 'SNITCH_ACCEPTED', targetId, 'wyciszony', interaction.guild.name);
                const firstEmbedDM = utils.createEmbed({ title: 'Zgłoszenie zaakceptowane', description });
                await interaction.client.users.send(reporterId, { embeds: [firstEmbedDM] })
                    .catch(() => logger.warn(`[Button ▸ SnitchTimeout] Failed to send DM to '${reporterId}'.`));
            }

            const secondEmbedDM = utils.createEmbed({
                title: 'Zostałeś wyciszony',
                description: `\`🔍\` **Serwer:** ${interaction.guild.name}\n\`🔨\` **Moderator:** <@${interaction.user.id}>\n\`💬\` **Powód:** ${rawReason}`
            });

            await interaction.client.users.send(targetId, { embeds: [secondEmbedDM] })
                .catch(() => logger.warn(`[Button ▸ SnitchTimeout] Failed to send DM to '${targetId}'.`));

            await targetMember.timeout(7200000, auditLogReason);

            let duplicatesProcessed = 0;
            const messages = await interaction.channel.messages.fetch({ limit: 50 }).catch(() => null);

            if (messages) {
                const duplicates = messages.filter(msg =>
                    msg.embeds.length > 0 &&
                    msg.id !== interaction.message.id &&
                    msg.embeds[0].fields.some(f => f.value.includes(targetId)) &&
                    msg.components.length > 0
                );

                duplicatesProcessed = duplicates.size;

                for (const msg of duplicates.values()) {
                    const dupEmbed = msg.embeds[0].toJSON();
                    dupEmbed.title = 'Zgłoszenie - akcja wykonana (duplikat)';
                    dupEmbed.color = embeds.secondaryColor;

                    await msg.edit({
                        content: `\`🔇\` Użytkownik został wyciszony przez <@${interaction.user.id}>.`,
                        embeds: [dupEmbed],
                        components: []
                    }).catch(() => null);
                }
            }

            const finishedEmbed = interaction.message.embeds[0].toJSON();
            finishedEmbed.title = 'Zgłoszenie - akcja wykonana';
            finishedEmbed.color = embeds.secondaryColor;

            let finalContent = `\`🔇\` Użytkownik został wyciszony przez <@${interaction.user.id}>`;

            if (duplicatesProcessed > 0) {
                finalContent += `\n\`🧹\` Zaktualizowano również \`${duplicatesProcessed}\` aktywne zgłoszenia tego użytkownika.`;
            }

            return await interaction.update({
                content: finalContent,
                embeds: [finishedEmbed],
                components: []
            });

        } catch (err) {
            logger.error(`[Button ▸ SnitchTimeout] An error occurred for '${interaction.guild.id}':\n${err}`);

            if (err.code === 10062 || err.code === 50027) return;

            await utils.reply.error(interaction, 'COMMAND_ERROR');
        }
    },
};