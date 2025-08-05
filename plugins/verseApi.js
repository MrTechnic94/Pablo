'use strict';

const { verses, Bible } = require('../config/default.json');
const { request } = require('undici');
const logger = require('./logger');

const ApiKey = process.env.BIBLE_API_KEY;
const verseIndex = new Date().getDate() % verses.length;
const verseID = verses[verseIndex];

async function verseOfTheDay() {
    try {
        const { body, statusCode } = await request(
            `https://api.scripture.api.bible/v1/bibles/${Bible.id}/search?query=${encodeURIComponent(verseID)}`,
            {
                headers: { 'api-key': ApiKey }
            }
        );

        if (statusCode !== 200) {
            return logger.error(`[VerseApi] API request failed:\n${statusCode}`);
        }

        const { data } = await body.json();

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
        logger.error(`[VerseApi] Error fetching verse of the day:\n${err}`);
    }
}

module.exports = verseOfTheDay;