'use strict';

const REGEX = /(\d+)(h|m|s|d|godzin|godziny|minut|minuty|sekund|sekundy|dni|dzień)/gi;
const MS_PER_DAY = 86400000;
const MS_PER_HOUR = 3600000;
const MS_PER_MIN = 60000;
const MS_PER_SEC = 1000;

function getPlural(value, one, few, many) {
    if (value === 1) return one;
    const rem10 = value % 10;
    const rem100 = value % 100;
    if (rem10 >= 2 && rem10 <= 4 && (rem100 < 10 || rem100 >= 20)) return few;
    return many;
}

function parseTimeString(timeString) {
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

        if (unit === 'h' || unit === 'g') h += amount;
        else if (unit === 'm') m += amount;
        else if (unit === 's') s += amount;
        else if (unit === 'd') d += amount;

        match = REGEX.exec(timeString);
    }

    if (!found) return null;

    const totalSeconds = (d * 86400) + (h * 3600) + (m * 60) + s;

    let formatted = "";
    if (d) formatted += `${d} ${getPlural(d, 'dzień', 'dni', 'dni')} `;
    if (h) formatted += `${h} ${getPlural(h, 'godzina', 'godziny', 'godzin')} `;
    if (m) formatted += `${m} ${getPlural(m, 'minuta', 'minuty', 'minut')} `;
    if (s) formatted += `${s} ${getPlural(s, 'sekunda', 'sekundy', 'sekund')} `;

    return { seconds: totalSeconds, formatted: formatted.trim() };
}

function formatDuration(ms, options = {}) {
    if (ms < 1000) return options.fullWords ? '0 sekund' : '0s';

    let result = "";
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
        if (result) result += " ";
        result += full ? `${hours} ${getPlural(hours, 'godzina', 'godziny', 'godzin')}` : `${hours}h`;
    }

    if (mins > 0) {
        if (result) result += " ";
        result += full ? `${mins} ${getPlural(mins, 'minuta', 'minuty', 'minut')}` : `${mins}m`;
    }

    if (secs > 0) {
        if (result) result += " ";
        result += full ? `${secs} ${getPlural(secs, 'sekunda', 'sekundy', 'sekund')}` : `${secs}s`;
    }

    return result;
}

module.exports = { parseTimeString, formatDuration };