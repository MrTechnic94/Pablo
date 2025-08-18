'use strict';

const { verses, Bible } = require('../config/default.json');
const { request } = require('undici');
const logger = require('./logger');

async function fetchVerse(verseID) {
    try {
        const { body, statusCode } = await request(
            `https://api.scripture.api.bible/v1/bibles/${Bible.id}/search?query=${encodeURIComponent(verseID)}`,
            { headers: { 'api-key': process.env.BIBLE_API_KEY } }
        );

        if (statusCode !== 200) {
            logger.error(`[VerseApi] API request error code '${statusCode}'.`);
            return null;
        }

        const { data } = await body.json();

        if (!data.passages || !data.passages.length) {
            logger.error(`[VerseApi] No passages found for verseID '${verseID}'.`);
            return null;
        }

        const passage = data.passages[0];

        return {
            reference: passage.reference,
            content: passage.content
                .replace(/<span[^>]*class="v"[^>]*>(\d+)<\/span>/g, '$1 ')
                .replace(/<[^>]+>/g, '')
                .replace(/\s+/g, ' ')
                .trim()
        };
    } catch (err) {
        logger.error(`[VerseApi] Error fetching verse '${verseID}':\n${err}`);
        return null;
    }
}

async function verseOfTheDay() {
    const verseIndex = new Date().getDate() % verses.length;
    return fetchVerse(verses[verseIndex]);
}

async function randomVerse() {
    const randomIndex = Math.floor(Math.random() * verses.length);
    return fetchVerse(verses[randomIndex]);
}

module.exports = { verseOfTheDay, randomVerse };