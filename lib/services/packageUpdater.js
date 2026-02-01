'use strict';

const { dependencies, optionalDependencies, devDependencies } = require('../../package.json');
const { spawn } = require('node:child_process');

function packageUpdater(logger) {
    return new Promise((resolve) => {
        logger.info('[Client] Checking for package updates...');

        const outdated = spawn('pnpm', ['outdated', '--json'], { cwd: process.cwd() });

        let output = '';

        outdated.stdout.once('data', (data) => {
            output += data.toString();
        });

        outdated.stderr.once('data', () => {
            // wylaczenie przechwytywania bledow z polecenia pnpm outdated
        });

        outdated.once('close', () => {
            let outdatedPackages = {};

            try {
                outdatedPackages = JSON.parse(output || '{}');
            } catch (parseErr) {
                logger.error(`[Client] Error parsing 'pnpm outdated' output:\n${parseErr.message}`);
                return resolve();
            }

            if (!outdatedPackages || !Object.keys(outdatedPackages).length) {
                logger.info('[Client] All packages are up to date.');
                return resolve();
            }

            logger.info('[Client] New versions of packages available, updating...');

            const update = spawn('pnpm', ['update', '--latest'], { cwd: process.cwd(), stdio: 'inherit' });

            update.once('close', (code) => {
                if (code === 0) {
                    logger.info('[Client] The packages have been updated.');

                    const hasLintPackage = (dependencies?.['@biomejs/biome'] || (optionalDependencies?.['@biomejs/biome'] || (devDependencies?.['@biomejs/biome'])));

                    if (hasLintPackage) {
                        const lintUpdate = spawn('pnpm', ['lint:update'], { cwd: process.cwd(), stdio: 'inherit' });

                        lintUpdate.once('close', (lintCode) => {
                            if (lintCode === 0) {
                                logger.info('[Client] Lint update completed successfully.');
                            } else {
                                logger.error(`[Client] Lint update exited with code ${lintCode}`);
                            }

                            logger.info('[Client] Restarting the client...');
                            process.exit(0);
                        });

                        lintUpdate.once('error', (err) => {
                            logger.error(`[Client] Error during lint update:\n${err.message}`);
                            logger.error(`[Client] Perform updates manually by calling 'pnpm lint:update'`);
                        });
                    }

                } else {
                    logger.error(`[Client] Package update exited with code ${code}`);
                    resolve();
                }
            });

            update.once('error', (err) => {
                logger.error(`[Client] Error during package update:\n${err.message}`);
                resolve();
            });
        });

        outdated.once('error', (err) => {
            logger.error(`[Client] Error checking outdated packages:\n${err.message}`);
            resolve();
        });
    });
}

module.exports = packageUpdater;