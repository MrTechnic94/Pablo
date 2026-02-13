'use strict';

const { readdirSync, existsSync } = require('node:fs');
const { resolve, join } = require('node:path');

function getFiles(basePath) {
    if (!existsSync(basePath)) return [];

    const results = [];
    const items = readdirSync(basePath, { withFileTypes: true });

    for (const item of items) {
        const fullPath = join(basePath, item.name);

        if (item.isDirectory()) {
            const subFiles = readdirSync(fullPath).filter(f => f.endsWith('.js'));
            for (const file of subFiles) {
                results.push({
                    fileName: file,
                    category: item.name,
                    fullPath: resolve(fullPath, file)
                });
            }
        } else if (item.isFile() && item.name.endsWith('.js')) {
            results.push({
                fileName: item.name,
                category: null,
                fullPath: fullPath
            });
        }
    }

    return results;
}

module.exports = { getFiles };