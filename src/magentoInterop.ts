/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import { ComponentPaths } from './types';
import { trace } from './trace';
import glob from 'fast-glob';
import { join } from 'path';
import { readFile, readdir } from './fsPromises';

/**
 * @summary Invokes the PHP binary and extracts info about modules
 *          and themes from a store
 */
export async function getModulesAndThemesFromMagento(
    magentoRoot: string,
): Promise<ComponentPaths> {
    trace('requesting module/theme payload from magento');

    const dirs = [];
    dirs.push(
        join(
            process.cwd(),
            'app',
            '**/registration.php'
        )
    );
    dirs.push(
        join(
            process.cwd(),
            'vendor',
            '**/registration.php'
        )
    );

    const registrationFiles = await glob(dirs)

    const componentPaths: ComponentPaths = {
        themes: {},
        modules: {}
    };

    // read each registration file and register module/theme path
    const pendingParse = registrationFiles.map(async (filePath) => {
        const registrationFile = await readFile(filePath, 'utf8');
        const dirParts = filePath.split('/')
        dirParts.pop();
        const dir = dirParts.join('/');
        const matches = registrationFile.replace(/\s+/g,'').match(/::register\((.*?)\);/);
        if (matches && matches.length) {
            const [ type, name, location ] = matches[1].split(',');
            const formattedType = type.split('::')[1];
            const formattedName = name.replace(/[\'\"]/g, '');
            const formattedLocation = location.replace('__DIR__', dir).replace(/[\.\'\"]/g, '');

            const blacklist = ['_files', 'tests'];
            // stop here if this is a test file
            for (const blacklisted of blacklist) {
                if (formattedLocation.indexOf(blacklisted) > -1) {
                    return;
                }
            }

            // Error handle invalid parsing of path and remove, this will cause globbing to fail silently
            try {
                await readdir(formattedLocation);
            } catch (err) {
                return;
            }

            switch (formattedType) {
                case "MODULE":
                    componentPaths.modules[formattedName] = formattedLocation;
                    break;
                case "THEME":
                    componentPaths.themes[formattedName] = formattedLocation;
                    break;
            }
        }
    });

    await Promise.all(pendingParse);

    return componentPaths;
}
