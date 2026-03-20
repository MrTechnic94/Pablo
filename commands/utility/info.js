'use strict';

const { SlashCommandBuilder, InteractionContextType, ChannelType, PresenceUpdateStatus, PermissionsBitField } = require('discord.js');
const { channels, verification, presence, device } = require('../../locales/pl_PL');

module.exports = {
    category: '`ℹ️` Przydatne',
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Wyświetla szczegółowe informacje o wybranym elemencie.')
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(sub => sub
            .setName('channel')
            .setDescription('Wyświetla informacje o kanale.')
            .addChannelOption(option => option
                .setName('kanał')
                .setDescription('Kanał, o którym chcesz uzyskać informacje.')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('server')
            .setDescription('Wyświetla informacje o serwerze.')
        )
        .addSubcommand(sub => sub
            .setName('role')
            .setDescription('Wyświetla informacje o wybranej roli.')
            .addRoleOption(option => option
                .setName('rola')
                .setDescription('Rola, o której chcesz uzyskać informacje.')
                .setRequired(true)
            )
        )
        .addSubcommand(sub => sub
            .setName('user')
            .setDescription('Wyświetla informacje o użytkowniku.')
            .addUserOption(option => option
                .setName('użytkownik')
                .setDescription('Użytkownik, o którym chcesz zobaczyć informacje.')
                .setRequired(false)
            )
        )
        .addSubcommand(sub => sub
            .setName('emoji')
            .setDescription('Wyświetla informacje o wybranym emoji.')
            .addStringOption(option => option
                .setName('emoji')
                .setDescription('Wklej emoji, o którym chcesz uzyskać informacje.')
                .setRequired(true)
            )
        ),
    async execute(interaction, logger) {
        const { utils } = interaction.client;
        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'channel': {
                    const channel = interaction.options.getChannel('kanał') ?? interaction.channel;

                    const channelType = channels[channel.type] || 'Nieznany.';
                    const createdAt = Math.floor(channel.createdTimestamp / 1000);
                    const nsfw = channel.nsfw ? 'Tak.' : 'Nie.';
                    const parent = channel.parent;

                    let channelFieldName = '`🔎` Kanał';

                    if (channel.type === ChannelType.GuildCategory) {
                        channelFieldName = '`🔎` Kategoria';
                    } else if (channel.isThread()) {
                        channelFieldName = '`🔎` Wątek';
                    }

                    const fields = [
                        { name: channelFieldName, value: `**•** ${channel}`, inline: false },
                        { name: '`🔑` ID', value: `**•** ${channel.id}`, inline: false },
                        { name: '`📦` Rodzaj', value: `**•** ${channelType}`, inline: false },
                        { name: '`🔞` NSFW', value: `**•** ${nsfw}`, inline: false },
                        { name: '`📅` Utworzono', value: `**•** <t:${createdAt}> (<t:${createdAt}:R>)`, inline: false }
                    ];

                    if (!channel.isThread()) {
                        const topic = channel.topic || 'Brak tematu.';

                        fields.splice(3, 0, { name: '`🔢` Pozycja', value: `**•** ${channel.position + 1}`, inline: false });

                        fields.push({ name: '`💬` Temat', value: `**•** ${topic}`, inline: false });
                    }

                    if (parent && channel.type !== ChannelType.GuildCategory) {
                        fields.push({ name: '`📂` Kategoria', value: `**•** ${parent}`, inline: false });
                    }

                    if (channel.isVoiceBased()) {
                        const userLimit = channel.userLimit > 0 ? `${channel.userLimit} użytkowników` : 'Brak.';
                        const bitrate = `${(channel.bitrate / 1000)} kbps`;

                        fields.push({ name: '`🔊` Szczegóły głosowe', value: `**• Limit:** ${userLimit}\n**• Bitrate:** ${bitrate}`, inline: false });
                    }

                    if (channel.isThread()) {
                        const autoArchive = channel.autoArchiveDuration ? utils.formatDuration(channel.autoArchiveDuration * 60000, { fullWords: true }) : 'Nie ustawiono.';

                        const archived = channel.archived ? 'Tak.' : 'Nie.';
                        const locked = channel.locked ? 'Tak.' : 'Nie.';

                        fields.push({ name: '`🧵` Szczegóły wątku', value: `**• Archiwum:** ${archived}\n**• Autoarchiwizacja:** ${autoArchive}\n**• Zablokowany:** ${locked}`, inline: false });
                    }

                    if (channel.rateLimitPerUser > 0) {
                        const slowmodeValue = utils.formatDuration(channel.rateLimitPerUser * 1000, { fullWords: true });

                        fields.push({ name: '`⏱️` Tryb powolny', value: `**•** ${slowmodeValue}`, inline: false });
                    }

                    const successEmbed = utils.createEmbed({
                        title: 'Podgląd kanału',
                        fields: fields
                    });

                    await interaction.reply({ embeds: [successEmbed] });
                    break;
                }

                case 'server': {
                    // Wlasciciel
                    const owner = await interaction.guild.fetchOwner().catch(() => null);

                    // Kiedy utworzono
                    const createdAt = Math.floor(interaction.guild.createdTimestamp / 1000);

                    // Uzytkownicy
                    const totalMembers = interaction.guild.memberCount;
                    let membersToCount = interaction.guild.members.cache;

                    if (membersToCount.size <= 1) {
                        membersToCount = await interaction.guild.members.fetch().catch(() => null);
                    }

                    const onlineCount = membersToCount.filter(m =>
                        m.presence?.status && m.presence?.status !== PresenceUpdateStatus.Offline
                    ).size;

                    // Emotki
                    const emojiCount = interaction.guild.emojis.cache.size;
                    const stickerCount = interaction.guild.stickers.cache.size;

                    // Kanaly
                    const channelCounts = { text: 0, voice: 0, categories: 0 };

                    for (const c of interaction.channel.guild.channels.cache.values()) {
                        if (c.type === ChannelType.GuildText) channelCounts.text++;
                        else if (c.isVoiceBased()) channelCounts.voice++;
                        else if (c.type === ChannelType.GuildCategory) channelCounts.categories++;
                    }

                    // AFK
                    const afkChannelName = interaction.guild.afkChannel ? `${interaction.guild.afkChannel}` : 'Brak.';
                    const afkTimeout = interaction.guild.afkTimeout ? utils.formatDuration(interaction.guild.afkTimeout * 1000, { fullWords: true }) : 'Brak.';
                    const afkInfo = `**• Kanał:** ${afkChannelName}\n**• Limit czasu:** ${afkTimeout}`;

                    // Nitro boost
                    const boostLevel = interaction.guild.premiumTier;
                    const boostCount = interaction.guild.premiumSubscriptionCount;

                    const successEmbed = utils.createEmbed({
                        title: 'Podgląd serwera',
                        thumbnail: interaction.guild.iconURL(),
                        fields: [
                            { name: '`🔍` Serwer', value: `**•** ${interaction.guild.name}`, inline: false },
                            { name: '`🔑` ID', value: `**•** ${interaction.guild.id}`, inline: false },
                            { name: '`👑` Właściciel', value: `**•** <@${owner.id}>`, inline: false },
                            { name: '`📅` Utworzono', value: `**•** <t:${createdAt}> (<t:${createdAt}:R>)`, inline: false },
                            { name: '`👥` Użytkownicy', value: `**• Łącznie:** ${totalMembers}\n**• Online:** ${onlineCount}`, inline: false },
                            { name: '`🎭` Role', value: `**• Łącznie:** ${interaction.guild.roles.cache.size - 1}`, inline: false },
                            { name: '`#️⃣` Kanały', value: `**• Tekstowe:** ${channelCounts.text}\n**• Głosowe:** ${channelCounts.voice}\n**• Kategorie:** ${channelCounts.categories}`, inline: false },
                            { name: '`💜` Nitro boost', value: `**• Poziom:** ${boostLevel}\n**• Boosty:** ${boostCount || 0}`, inline: false },
                            { name: '`📸` Media', value: `**• Emotki:** ${emojiCount}\n**• Naklejki:** ${stickerCount}`, inline: false },
                            { name: '`🛡️` Poziom weryfikacji', value: `**•** ${verification[interaction.guild.verificationLevel]}`, inline: false },
                            { name: '`🌙` AFK', value: afkInfo, inline: false }
                        ]
                    });

                    await interaction.reply({ embeds: [successEmbed] });
                    break;
                }

                case 'role': {
                    const role = interaction.options.getRole('rola');

                    // Podstawowe informacje
                    const memberCount = role.members.size;
                    const createdAt = Math.floor(role.createdTimestamp / 1000);
                    const hoist = role.hoist ? 'Tak.' : 'Nie.';
                    const mentionable = role.mentionable ? 'Tak.' : 'Nie.';

                    // Integracja
                    let integratedStatus = 'Nie.';
                    if (role.managed) {
                        integratedStatus = role.tags?.botId ? `Tak (Bot: <@${role.tags.botId}>)` : 'Tak (Boost serwera)';
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

                    const successEmbed = utils.createEmbed({
                        title: 'Podgląd roli',
                        fields: [
                            { name: '`🔍` Rola', value: `**•** <@${role.id}>`, inline: false },
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
                    break;
                }

                case 'user': {
                    const targetMember = interaction.options.getMember('użytkownik') ?? interaction.member;

                    if (interaction.options.getUser('użytkownik') && !targetMember) {
                        return await utils.reply.error(interaction, 'USER_NOT_FOUND');
                    }

                    const roles = targetMember.roles.cache
                        .filter(role => role.id !== interaction.guild.id)
                        .map(role => role.toString())
                        .join(', ') || 'Brak.';

                    // Sprawdza czy bot
                    const isBot = targetMember.user.bot ? 'Tak.' : 'Nie.';

                    // Kiedy utworzono konto i kiedy dolaczyl na serwer
                    const createdAt = Math.floor(targetMember.user.createdTimestamp / 1000);
                    const joinedAt = Math.floor(targetMember.joinedTimestamp / 1000);

                    // Urzadzenie
                    const clientStatus = targetMember.presence?.clientStatus;

                    const deviceNames = clientStatus ? Object.keys(clientStatus).map(key => device[key]?.name) : [];

                    const deviceString = deviceNames.join(', ') || 'Użytkownik jest offline.';

                    const deviceEmoji = Object.keys(clientStatus || {}).map(key => device[key]?.emoji).join(' ') || '❓';

                    // Status
                    const rawStatus = targetMember.presence?.status || 'Niedostępny.';
                    const userStatus = presence[rawStatus]?.name || 'Niedostępny.';
                    const statusEmoji = presence[rawStatus]?.emoji || '🎱';

                    // Notatka i ostrzezenia
                    const warnCount = await utils.db.lLen(`warns:${interaction.guild.id}:${targetMember.id}`) || 0;
                    const userNote = await utils.db.hGet(`notes:${interaction.guild.id}`, targetMember.id);

                    const fields = [
                        { name: '`👤` Użytkownik', value: `**•** <@${targetMember.id}>`, inline: false },
                        { name: '`🔑` ID', value: `**•** ${targetMember.user.id}`, inline: false },
                        { name: '`✏️` Pseudonim', value: `**•** ${targetMember.nickname || 'Nie ustawiono.'}`, inline: false },
                        { name: `\`${deviceEmoji}\` Urządzenie`, value: `**•** ${deviceString}`, inline: false },
                        { name: `\`${statusEmoji}\` Status`, value: `**•** ${userStatus}`, inline: false },
                        { name: '`🚪` Dołączył na serwer', value: `**•** <t:${joinedAt}> (<t:${joinedAt}:R>)`, inline: false },
                        { name: '`📆` Stworzył konto', value: `**•** <t:${createdAt}> (<t:${createdAt}:R>)`, inline: false },
                        { name: '`⚠️` Ostrzeżenia', value: `**•** ${warnCount}`, inline: true },
                        { name: '`🤖` Bot', value: `**•** ${isBot}`, inline: false }
                    ];

                    if (userNote) {
                        fields.push({ name: '`📝` Notatka moderatora', value: `**•** Wpisz </notes view:1482729096554221618>, aby zobaczyć notatkę.`, inline: false });
                    }

                    fields.push({ name: `\`🎭\` Role (${targetMember.roles.cache.size - 1})`, value: roles, inline: false });

                    const successEmbed = utils.createEmbed({
                        title: 'Podgląd użytkownika',
                        thumbnail: targetMember.user.displayAvatarURL(),
                        fields: fields
                    });

                    await interaction.reply({ embeds: [successEmbed] });
                    break;
                }

                case 'emoji': {
                    const rawEmoji = interaction.options.getString('emoji');
                    const emojiId = utils.parseEmojiId(rawEmoji);

                    if (!emojiId) return await utils.reply.error(interaction, 'INVALID_EMOJI');

                    const emoji = interaction.guild.emojis.cache.get(emojiId);
                    if (!emoji) return await utils.reply.error(interaction, 'EMOJI_NOT_FOUND');

                    const createdAt = Math.floor(emoji.createdTimestamp / 1000);
                    const author = await emoji.fetchAuthor().catch(() => 'Brak uprawnień.');
                    const emojiURL = emoji.imageURL({ animated: emoji.animated });

                    const fields = [
                        { name: '`🔎` Nazwa', value: `**•** ${emoji.name}`, inline: false },
                        { name: '`🔑` ID', value: `**•** ${emoji.id}`, inline: false },
                        { name: '`✨` Animowana', value: `**•** ${emoji.animated ? 'Tak' : 'Nie'}`, inline: false },
                        { name: '`📅` Utworzono', value: `**•** <t:${createdAt}> (<t:${createdAt}:R>)`, inline: false },
                        { name: '`👤` Dodane przez', value: `**•** ${author}`, inline: false },
                        { name: '`🔗` Link', value: `**•** [KLIKNIJ🡭](${emojiURL})`, inline: false }
                    ];

                    if (emoji.managed) {
                        fields.push({ name: '`📦` Integracja', value: '**•** Tak (Zewnętrzna usługa)', inline: false });
                    }

                    const successEmbed = utils.createEmbed({
                        title: 'Podgląd emoji',
                        fields: fields,
                        thumbnail: emojiURL
                    });

                    await interaction.reply({ embeds: [successEmbed] });
                    break;
                }

                default:
                    await utils.reply.error(interaction, 'PARAMETER_NOT_FOUND');
            }
        } catch (err) {
            logger.error(`[Slash ▸ Info] An error occurred in subcommand '${subcommand}' for '${interaction.guild.id}':\n${err}`);
            await utils.reply.error(interaction, 'INFO_ERROR');
        }
    },
};