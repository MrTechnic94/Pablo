'use strict';

const { readdirSync } = require('node:fs');
const { join } = require('node:path');

function getFiles(basePath, logger) {
    try {
        const items = readdirSync(basePath, { withFileTypes: true });
        const results = [];
        const itemsLen = items.length;

        for (let i = 0; i < itemsLen; i++) {
            const item = items[i];
            const itemName = item.name;

            if (item.isDirectory()) {
                const subDir = join(basePath, itemName);
                const subItems = readdirSync(subDir, { withFileTypes: true });
                const subLen = subItems.length;

                for (let j = 0; j < subLen; j++) {
                    const subItem = subItems[j];
                    const subName = subItem.name;

                    if (subItem.isFile() && subName.endsWith('.js')) {
                        results.push({
                            fileName: subName,
                            category: itemName,
                            fullPath: join(subDir, subName)
                        });
                    }
                }
            } else if (item.isFile() && itemName.endsWith('.js')) {
                results.push({
                    fileName: itemName,
                    category: null,
                    fullPath: join(basePath, itemName)
                });
            }
        }

        return results;
    } catch (err) {
        logger.error(`[Explorer] Error found:\n${err}`);
        return [];
    }
}

module.exports = { getFiles };