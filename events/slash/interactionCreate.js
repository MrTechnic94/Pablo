'use strict';

const { createEmbed } = require('../../lib/utils/createEmbed');
const { Events } = require('discord.js');
const { roles } = require('../../config/default.json');
const reply = require('../../lib/utils/responder');

// Role - Kolory
const roleMap = {
    'colors_black': roles.black,
    'colors_red': roles.red,
    'colors_blue': roles.blue,
    'colors_magenta': roles.magenta,
    'colors_green': roles.green
};

const colorRoleIds = Object.values(roleMap);

module.exports = {
    name: Events.InteractionCreate,
    async execute(logger, interaction) {
        if (interaction.isChatInputCommand() || interaction.isUserContextMenuCommand() || interaction.isMessageContextMenuCommand()) {
            const commandType = interaction.isChatInputCommand() ? 'Slash' : 'Context';

            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                logger.error(`[${commandType}] Command '${interaction.commandName}' not found.`);
                return await reply.error(interaction, 'COMMAND_NOT_FOUND');
            }

            try {
                await command.execute(interaction, logger);
            } catch (err) {
                const commandName = command.__fileName || command.data?.name || interaction.commandName;

                const commandNameBig = commandName.charAt(0).toUpperCase() + commandName.slice(1);

                logger.error(`[${commandType} ▸ ${commandNameBig}] ${err}`);
                if (interaction.replied || interaction.deferred) {
                    await reply.error(interaction, 'COMMAND_ERROR');
                } else {
                    await reply.error(interaction, 'COMMAND_ERROR');
                }
            }
        } else if (interaction.isButton()) {
            try {
                const { customId } = interaction;

                switch (true) {
                    case customId === 'accept_rules': {
                        if (interaction.member.roles.cache.has(roles.user)) {
                            return await reply.error(interaction, 'USER_ALREADY_VERIFIED');
                        }
                        await interaction.member.roles.add(roles.user);
                        await reply.success(interaction, 'VERIFIED');
                        break;
                    }

                    case customId.startsWith('snitch_dismiss_'): {
                        const reporterId = customId.replace('snitch_dismiss_', '');

                        const targetField = interaction.message.embeds[0].fields.find(f => f.name.includes('Zgłoszony'));
                        const targetIdMatch = targetField ? targetField.value.match(/<@!?(\d+)>/) : null;
                        const targetId = targetIdMatch ? targetIdMatch[1] : null;
                        const userDisplay = targetId ? `użytkownika <@${targetId}>` : 'wybranego użytkownika';

                        const description = reply.getString('error', 'SNITCH_REJECTED_DM', userDisplay, interaction.guild.name);

                        const embedDM = createEmbed({
                            title: 'Zgłoszenie odrzucone',
                            description: description
                        });

                        // Wysyla DM do reportera
                        if (reporterId) {
                            await interaction.client.users.send(reporterId, { embeds: [embedDM] })
                                .catch(() => logger.warn(`[Slash] Failed to send DM to reporter: ${reporterId}`));
                        }

                        // Czyszczenie duplikatow
                        let duplicatesDeleted = 0;

                        if (targetId) {
                            const logChannel = interaction.channel;
                            const messages = await logChannel.messages.fetch({ limit: 50 });
                            const duplicates = messages.filter(msg =>
                                msg.embeds.length > 0 &&
                                msg.id !== interaction.message.id &&
                                msg.embeds[0].fields.some(f => f.name.includes('Zgłoszony') && f.value.includes(targetId))
                            );

                            duplicatesDeleted = duplicates.size;

                            if (duplicatesDeleted > 0) {
                                await Promise.all(duplicates.map(msg => msg.delete().catch(() => null)));
                            }
                        }

                        await interaction.message.delete().catch(() => null);

                        let finalContent = reply.getString('success', 'SNITCH_REJECTED');

                        if (duplicatesDeleted > 0) {
                            finalContent += reply.getString('success', 'SNITCH_CLEANED', duplicatesDeleted);
                        }

                        await reply.error(interaction, finalContent);
                        break;
                    }

                    case customId.startsWith('snitch_ban_'): {
                        const targetId = customId.replace('snitch_ban_', '');

                        const reporterField = interaction.message.embeds[0].fields.find(f => f.name.includes('Zgłaszający'));
                        const reporterIdMatch = reporterField ? reporterField.value.match(/<@!?(\d+)>/) : null;
                        const reporterId = reporterIdMatch ? reporterIdMatch[1] : null;

                        const reasonField = interaction.message.embeds[0].fields.find(f => f.name.includes('Powód') || f.name.includes('wiadomości'));

                        let rawReason = reasonField ? reasonField.value : "Naruszenie regulaminu.";
                        rawReason = rawReason.replace(/[`*•]|```/g, '').trim();

                        const fullReason = `ZGŁOSZENIE: Zaakceptowane przez ${interaction.user.tag} | POWÓD: ${rawReason}`;
                        const auditLogReason = fullReason.length > 500 ? `${fullReason.slice(0, 497)}...` : fullReason;

                        // Wysyla DM do reportera
                        if (reporterId) {
                            const description = reply.getString(
                                'success',
                                'SNITCH_ACCEPTED',
                                interaction.guild.name
                            );

                            const firstEmbedDM = createEmbed({
                                title: 'Zgłoszenie zaakceptowane',
                                description: description
                            });

                            await interaction.client.users.send(reporterId, { embeds: [firstEmbedDM] })
                                .catch(() => logger.warn(`[Slash] Failed to send DM to reporter: ${reporterId}`));
                        }

                        // Wysyla DM do zbanowanego
                        const secondEmbedDM = createEmbed({
                            title: 'Zostałeś zbanowany',
                            description: `\`👤\` **Serwer:** ${interaction.guild.name}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`💬\` **Powód:** ${rawReason}`
                        });
                        await interaction.client.users.send(targetId, { embeds: [secondEmbedDM] })
                            .catch(() => logger.warn(`[Slash] Failed to send DM to banned user: ${targetId}`));

                        try {
                            // Banuje uzytkownika
                            await interaction.guild.members.ban(targetId, { reason: auditLogReason });

                            // Czyszczenie duplikatow
                            const logChannel = interaction.channel;
                            const messages = await logChannel.messages.fetch({ limit: 50 });
                            const duplicates = messages.filter(msg =>
                                msg.embeds.length > 0 &&
                                msg.id !== interaction.message.id &&
                                msg.embeds[0].fields.some(f => f.name.includes('Zgłoszony') && f.value.includes(targetId))
                            );

                            if (duplicates.size > 0) {
                                for (const msg of duplicates.values()) {
                                    await msg.delete().catch(() => null);
                                }
                            }

                            const finishedEmbed = interaction.message.embeds[0].toJSON();
                            finishedEmbed.title = 'Zgłoszenie - akcja wykonana';
                            finishedEmbed.color = 0x2b2d31;

                            await interaction.update({
                                content: `\`🔨\` Użytkownik został zbanowany przez ${interaction.user}.`,
                                embeds: [finishedEmbed],
                                components: []
                            });

                        } catch (err) {
                            logger.error(`[Slash] Failed to ban user:\n${err}`);
                            if (!interaction.replied && !interaction.deferred) {
                                await reply.error(interaction, 'BAN_FAILED');
                            }
                        }
                        break;
                    }
                }
            } catch (err) {
                logger.error(`[Slash] Unexpected error:\n${err}`);
                await reply.error(interaction, 'COMMAND_ERROR');
            }
        } else if (interaction.isStringSelectMenu()) {
            try {
                switch (interaction.customId) {
                    // Auto role - kolorow
                    case 'colors_menu': {
                        const roleId = roleMap[interaction.values[0]];

                        if (interaction.member.roles.cache.has(roleId)) {
                            return await reply.error(interaction, 'ROLE_ALREADY_OWNED');
                        }

                        const currentRoles = Array.from(interaction.member.roles.cache.keys());

                        const newRoles = currentRoles
                            .filter(id => !colorRoleIds.includes(id))
                            .concat(roleId);

                        await interaction.member.roles.set(newRoles);
                        await reply.success(interaction, 'NEW_COLOR', roleId);
                        break;
                    }
                }
            } catch (err) {
                logger.error(`[Slash] Error in select menu:\n${err}`);
                await reply.error(interaction, 'COMMAND_ERROR');
            }
        }
    },
};