'use strict';

const { colors } = require('../../locales/pl_PL');

const emojiRegex = /<?(?<animated>a)?:?[\w]+:(?<id>\d{17,19})>?/;
const idRegex = /^\d{17,19}$/;
const REGEX = /(\d+)(h|m|s|d|godzin|godziny|minut|minuty|sekund|sekundy|dni|dzień)/gi;
const MS_PER_DAY = 86400000;
const MS_PER_HOUR = 3600000;
const MS_PER_MIN = 60000;
const MS_PER_SEC = 1000;

function emojiId(input) {
    if (typeof input !== 'string') return null;

    const match = input.match(emojiRegex);

    if (match?.groups) return match.groups.id;

    if (idRegex.test(input)) return input;

    return null;
}

function emojiUrl(input) {
    if (typeof input !== 'string') return null;

    if (input.startsWith('http')) return input;

    const match = input.match(emojiRegex);

    if (match?.groups) {
        const { animated, id } = match.groups;
        return `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'webp'}`;
    }

    if (idRegex.test(input)) {
        return `https://cdn.discordapp.com/emojis/${input}.webp`;
    }

    return null;
}

function color(input) {
    if (typeof input !== 'string') return null;

    const str = input.trim();
    const len = str.length;
    if (len === 0) return null;

    const upper = str.toUpperCase();
    if (colors && Object.hasOwn(colors, upper)) return colors[upper];

    const char0 = str[0];
    if (char0 === '#' || (len > 2 && char0 === '0' && (str[1] === 'x' || str[1] === 'X'))) {
        const start = char0 === '#' ? 1 : 2;
        const hex = str.slice(start);
        const hLen = hex.length;

        if (hLen === 6) {
            const val = parseInt(hex, 16);

            return Number.isNaN(val) ? null : val;
        }

        if (hLen === 3) {
            const r = parseInt(hex[0], 16);
            const g = parseInt(hex[1], 16);
            const b = parseInt(hex[2], 16);

            if (Number.isNaN(r | g | b)) return null;

            return ((r * 17) << 16) | ((g * 17) << 8) | (b * 17);
        }
    }

    let commaCount = 0;
    for (let i = 0; i < len; i++) {
        if (str[i] === ',') commaCount++;
    }

    if (commaCount === 2) {
        const parts = str.split(',');
        const r = parseInt(parts[0], 10);
        const g = parseInt(parts[1], 10);
        const b = parseInt(parts[2], 10);

        if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) return (r << 16) | (g << 8) | b;
    }

    if (char0 >= '0' && char0 <= '9') {
        const val = parseInt(str, 10);

        if (!Number.isNaN(val) && val >= 0 && val <= 16777215) return val;
    }

    return null;
}

function getPlural(value, one, few, many) {
    if (value === 1) return one;

    const rem10 = value % 10;
    const rem100 = value % 100;
    if (rem10 >= 2 && rem10 <= 4 && (rem100 < 10 || rem100 >= 20)) return few;

    return many;
}

function timeString(timeString) {
    REGEX.lastIndex = 0;
    let d = 0;
    let h = 0;
    let m = 0;
    let s = 0;
    let found = false;

    let match = REGEX.exec(timeString);

    while (match !== null) {
        found = true;
        const amount = +match[1];
        const unit = match[2][0].toLowerCase();

        switch (unit) {
            case 'h':
            case 'g':
                h += amount
                break;

            case 'm':
                m += amount;
                break;

            case 's':
                s += amount;
                break;

            case 'd':
                d += amount;
        }

        match = REGEX.exec(timeString);
    }

    if (!found) return null;

    const totalSeconds = (d * 86400) + (h * 3600) + (m * 60) + s;

    let formatted = '';
    if (d) formatted += `${d} ${getPlural(d, 'dzień', 'dni', 'dni')} `;
    if (h) formatted += `${h} ${getPlural(h, 'godzina', 'godziny', 'godzin')} `;
    if (m) formatted += `${m} ${getPlural(m, 'minuta', 'minuty', 'minut')} `;
    if (s) formatted += `${s} ${getPlural(s, 'sekunda', 'sekundy', 'sekund')} `;

    return { seconds: totalSeconds, formatted: formatted.trim() };
}

function formatDuration(ms, options = {}) {
    if (ms < 1000) return options.fullWords ? '0 sekund' : '0s';

    let result = '';
    const full = options.fullWords;
    let time = ms;

    const days = (time / MS_PER_DAY) | 0;
    time -= days * MS_PER_DAY;
    const hours = (time / MS_PER_HOUR) | 0;
    time -= hours * MS_PER_HOUR;
    const mins = (time / MS_PER_MIN) | 0;
    time -= mins * MS_PER_MIN;
    const secs = (time / MS_PER_SEC) | 0;

    if (days > 0) {
        result += full ? `${days} ${getPlural(days, 'dzień', 'dni', 'dni')}` : `${days}d`;
    }

    if (hours > 0) {
        if (result) result += ' ';
        result += full ? `${hours} ${getPlural(hours, 'godzina', 'godziny', 'godzin')}` : `${hours}h`;
    }

    if (mins > 0) {
        if (result) result += ' ';
        result += full ? `${mins} ${getPlural(mins, 'minuta', 'minuty', 'minut')}` : `${mins}m`;
    }

    if (secs > 0) {
        if (result) result += ' ';
        result += full ? `${secs} ${getPlural(secs, 'sekunda', 'sekundy', 'sekund')}` : `${secs}s`;
    }

    return result;
}

module.exports = { emojiId, emojiUrl, color, getPlural, timeString, formatDuration };