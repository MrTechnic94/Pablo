'use strict';

const { embeds } = require('../config/default.json');
const { EmbedBuilder } = require('discord.js');

const defaultEmbed = new EmbedBuilder()
    .setColor(embeds.defaultColor);

function createEmbed({ title, url, author = {}, description, thumbnail, fields = {}, image, timestamp, footer = {}, color }) {
    const builtEmbed = EmbedBuilder.from(defaultEmbed);
    if (title) builtEmbed.setTitle(title);
    if (url) builtEmbed.setURL(url);
    if (author?.name) builtEmbed.setAuthor(author);
    if (description) builtEmbed.setDescription(description);
    if (thumbnail) builtEmbed.setThumbnail(thumbnail);
    if (fields.length || fields.name) builtEmbed.setFields(fields);
    if (image) builtEmbed.setImage(image);
    if (timestamp) builtEmbed.setTimestamp(timestamp);
    if (footer?.text) builtEmbed.setFooter(footer);
    if (color) builtEmbed.setColor(color);

    return builtEmbed;
}

module.exports = { createEmbed };