'use strict';

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const { others } = require('../../config/default.json');

const activeBattles = new Map();

module.exports = {
    category: '`💎` 4Fun',
    data: new SlashCommandBuilder()
        .setName('solo')
        .setDescription('Stocz walkę 1v1 z innym użytkownikiem.')
        .setContexts(InteractionContextType.Guild)
        .addUserOption(option => option
            .setName('przeciwnik')
            .setDescription('Wybierz użytkownika do walki.')
            .setRequired(true)
        ),
    async execute(interaction, logger) {
        const { guildId } = interaction;
        const { utils } = interaction.client;

        const currentGuildBattles = activeBattles.get(guildId) || 0;

        if (currentGuildBattles >= others.maxBattlesPerGuild) {
            return await utils.interface.sendError(interaction, 'TOO_MANY_FIGHTS', others.maxBattlesPerGuild);
        }

        const player1 = interaction.user;
        const player2 = interaction.options.getUser('przeciwnik');

        if (player1.id === player2.id) {
            return await utils.interface.sendError(interaction, 'CANT_FIGHT_YOURSELF');
        }

        activeBattles.set(guildId, currentGuildBattles + 1);

        try {
            const players = [
                { user: player1, hp: 100 },
                { user: player2, hp: 100 }
            ];

            const battleLog = [];

            const countdownEmbed = utils.interface.createEmbed({
                title: '`💢` SOLÓWA ! `💢`',
                description: '*Walka zacznie się za 3...*'
            });

            await interaction.reply({ embeds: [countdownEmbed] });
            const message = await interaction.fetchReply();

            await new Promise(resolve => setTimeout(resolve, 1000));

            for (let i = 2; i > 0; i--) {
                countdownEmbed.setDescription(`*Walka zacznie się za ${i}...*`);
                await message.edit({ embeds: [countdownEmbed] }).catch(() => null);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            let round = 0;
            let actionText = '';
            let damage = 0;

            while (players[0].hp > 0 && players[1].hp > 0) {
                const attacker = players[round % 2];
                const defender = players[(round + 1) % 2];

                const rand = Math.random();
                const isMiss = rand < 0.10;
                const isCrit = !isMiss && rand > 0.85;

                if (isMiss) {
                    actionText = `\`💨\` **${defender.user.username}** zrobił unik!`;
                } else {
                    damage = (Math.random() * 16 + 10) >>> 0;
                    if (isCrit) {
                        damage = (damage * 1.8) >>> 0;
                        actionText = `\`💥\` **KRYTYK!** **${attacker.user.username}** uderzył za **${damage}** HP!`;
                    } else {
                        actionText = `\`⚔️\` **${attacker.user.username}** zadaje **${damage}** obrażeń.`;
                    }
                    defender.hp = defender.hp - damage;

                    if (defender.hp < 0) defender.hp = 0;
                }

                battleLog.push(actionText);

                if (battleLog.length > 5) battleLog.shift();

                const battleEmbed = utils.interface.createEmbed({
                    title: '`💢` TRWA WALKA ! `💢`',
                    description: battleLog.join('\n'),
                    fields: [
                        { name: `\`🩸\` ${players[0].user.username}`, value: `${players[0].hp} / 100 HP`, inline: true },
                        { name: `\`🩸\` ${players[1].user.username}`, value: `${players[1].hp} / 100 HP`, inline: true }
                    ]
                });

                await message.edit({ embeds: [battleEmbed] }).catch(() => null);

                if (defender.hp <= 0) break;

                round++;
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            const winner = players.find(p => p.hp > 0);

            const finalEmbed = utils.interface.createEmbed({
                title: '`🥊` PODSUMOWANIE ! `🥊`',
                description: `\`👑\` **Zwycięzca:** <@${winner.user.id}>\n\n${battleLog.join('\n')}`,
                fields: [
                    { name: `${players[0].hp <= 0 ? '`💀`' : '`🩸`'} ${players[0].user.username}`, value: `${players[0].hp} / 100 HP`, inline: true },
                    { name: `${players[1].hp <= 0 ? '`💀`' : '`🩸`'} ${players[1].user.username}`, value: `${players[1].hp} / 100 HP`, inline: true }
                ]
            });

            await message.edit({ embeds: [finalEmbed] }).catch(() => null);
        } catch (err) {
            logger.error(`[Slash ▸ Solo] An error occurred for '${interaction.guild.id}':\n${err}`);
            await utils.interface.sendError(interaction, 'FIGHT_ERROR');
        } finally {
            const current = activeBattles.get(guildId) || 1;
            if (current <= 1) {
                activeBattles.delete(guildId);
            } else {
                activeBattles.set(guildId, current - 1);
            }
        }
    },
};