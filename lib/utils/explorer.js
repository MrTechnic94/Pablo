'use strict';

const { readdirSync, existsSync } = require('node:fs');
const { resolve } = require('node:path');

function getFiles(basePath) {
    if (!existsSync(basePath)) return [];

    return readdirSync(basePath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .flatMap(dirent => {
            const categoryPath = resolve(basePath, dirent.name);
            return readdirSync(categoryPath)
                .filter(file => file.endsWith('.js'))
                .map(file => ({
                    fileName: file,
                    category: dirent.name,
                    fullPath: resolve(categoryPath, file)
                }));
        });
}

module.exports = { getFiles };