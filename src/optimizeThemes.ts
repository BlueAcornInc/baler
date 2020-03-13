/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import { StoreData, Theme, MagentoRequireConfig } from './types';
import { join, dirname } from 'path';
import { createMinifier, Minifier } from './createMinifier';
import {
    getLocalesForDeployedTheme,
    getStaticDirForTheme,
    getPHTMLFilesEligibleForUseWithTheme,
    getLayoutFilesEligibleForUseWithTheme,
    getEnabledModules,
    getComponents,
    getPHTMLFilesFromLayoutHandle,
    getDepsFromPHTMLPath
} from './magentoFS';
import {
    getRequireConfigFromDir,
    generateBundleRequireConfig,
} from './requireConfig';
import { traceAMDDependencies } from './traceAMDDependencies';
import { computeDepsForBundle } from './computeDepsForBundle';
import { createBundleFromDeps } from './createBundleFromDeps';
import { writeFile, mkdir } from './fsPromises';
import { flatten } from './flatten';
import { cliTask } from './cliTask';
import { BalerError } from './BalerError';

const BALER_META_DIR = 'balerbundles';

/**
 * @summary Optimize all eligible themes in a Magento 2 store
 */
export async function optimizeThemes(
    magentoRoot: string,
    store: StoreData,
    themesToOptimize: string[],
) {
    // Spins up a worker pool, so we only want to do it once, not per-theme
    const minifier = createMinifier();

    const pendingThemeResults = themesToOptimize.map(async themeID => {
        const theme = getThemeByID(themeID, store.components.themes);
        throwOnDisallowedTheme(theme);

        try {
            const result = await optimizeTheme(
                magentoRoot,
                store,
                theme,
                minifier,
            );
            return { themeID, success: true, result };
        } catch (error) {
            return { themeID, success: false, error };
        }
    });

    const themeResults = await Promise.all(pendingThemeResults);
    minifier.destroy();

    return themeResults;
}

/**
 * @summary Optimize a single theme in a Magento 2 store
 */
async function optimizeTheme(
    magentoRoot: string,
    store: StoreData,
    theme: Theme,
    minifier: Minifier,
) {
    const coreBundleResults = await createCoreBundle(
        magentoRoot,
        theme,
        minifier,
    );

    return coreBundleResults;
}

async function getLayoutBasedDeps(
    magentoRoot: string,
    theme: Theme
): Promise<Map<string, Set<string>>> {
    const enabledModules = await getEnabledModules(magentoRoot);
    const { modules, themes } = await getComponents(magentoRoot);
    const themeFallback = [];
    let processing = true;
    let currentFallback = theme;

    // Create theme fallback
    while (processing) {
        themeFallback.push(currentFallback);
        if (currentFallback.parentID) {
            currentFallback = themes[currentFallback.parentID]
        } else {
            processing = false;
        }
    }

    console.log(themeFallback);
    console.log(enabledModules);
    console.log(modules);

    // Get all layout files
    const layoutFiles = await getLayoutFilesEligibleForUseWithTheme(
        themeFallback,
        enabledModules,
        modules
    );

    // Logging to figure out if a glob is failing on cloud
    console.log(layoutFiles);

    // Create a map of layout file => templateFiles[]
    const layoutToTemplatesMap = new Map();
    // Create a map of layout file => js[]
    const layoutToDepsMap = new Map();

    for (const layoutFile of layoutFiles) {
        let layoutHandle = layoutFile.split('/').pop();
        if (!layoutHandle) {
            continue;
        } else {
            layoutHandle = layoutHandle.replace('.xml', '');
        }
        if (!layoutToTemplatesMap.has(layoutHandle)) {
            layoutToTemplatesMap.set(layoutHandle, new Set());
        }
        if (!layoutToDepsMap.has(layoutHandle)) {
            layoutToDepsMap.set(layoutHandle, new Set());
        }
        const templatesSet = layoutToTemplatesMap.get(layoutHandle);
        const templates = await getPHTMLFilesFromLayoutHandle(layoutFile, themeFallback, modules);
        for (const template of templates) {
            templatesSet.add(template);
        }
        layoutToTemplatesMap.set(layoutHandle, templatesSet);
    }


    // Iterate over each layout handle
    for (const [handle, templatesSet] of layoutToTemplatesMap) {
        // Iterate over each templateFile
        for (const template of Array.from(templatesSet)) {
            const depsForLayoutHandle = layoutToDepsMap.get(handle);
            // @ts-ignore
            const depsForTemplate = await getDepsFromPHTMLPath(template);
            for (const dep of depsForTemplate) {
                depsForLayoutHandle.add(dep);
            }
            layoutToDepsMap.set(handle, depsForLayoutHandle);
        }
    }

    return layoutToDepsMap;
    // read the phtml file,
    // gather the dependencies
    // create the bundle
}

/**
 * @summary Creates and writes the core bundle file for a given theme
 */
async function createCoreBundle(
    magentoRoot: string,
    theme: Theme,
    minifier: Minifier,
) {
    const deployedLocales = await getLocalesForDeployedTheme(
        magentoRoot,
        theme,
    );

    const [firstLocale] = deployedLocales;
    const firstLocaleRoot = join(
        magentoRoot,
        getStaticDirForTheme(theme),
        firstLocale,
    );

    const { requireConfig, rawRequireConfig } = await getRequireConfigFromDir(
        firstLocaleRoot,
    );
    let entryPoints = getEntryPointsFromConfig(requireConfig, theme.themeID);
    const layoutDeps = await getLayoutBasedDeps(
        magentoRoot,
        theme
    );
    // Combine default.xml deps with core bundle
    const defaultDeps = layoutDeps.get('default');
    if (defaultDeps) {
        entryPoints = entryPoints.concat(Array.from(defaultDeps))
        layoutDeps.delete('default');
    }

    const { graph, resolvedEntryIDs } = await traceAMDDependencies(
        entryPoints,
        requireConfig,
        firstLocaleRoot,
    );
    const coreBundleDeps = computeDepsForBundle(graph, resolvedEntryIDs);

    const endBundleTask = cliTask(`Create core bundle file`, theme.themeID);
    const { bundle, bundleFilename, map } = await createBundleFromDeps(
        'core-bundle',
        coreBundleDeps,
        firstLocaleRoot,
        requireConfig,
        theme.themeID,
    );
    endBundleTask(`Created core bundle file`);

    // Create bundles for all other layout xml handles
    const otherBundles = new Map();
    const otherBundlesOutput = [];
    for (const [ layoutHandle, entryPoints ] of layoutDeps) {
        const { graph, resolvedEntryIDs } = await traceAMDDependencies(
            Array.from(entryPoints),
            requireConfig,
            firstLocaleRoot,
        );
        const layoutBundleDeps = computeDepsForBundle(graph, resolvedEntryIDs).filter(dep => !coreBundleDeps.includes(dep));
        // Only create bundles for handles that have dependencies
        if (layoutBundleDeps.length > 0) {
            const endLayoutBundleTask = cliTask(`Creating bundle for: ${layoutHandle}`, theme.themeID);
            otherBundles.set(layoutHandle, layoutBundleDeps);
            const { bundle, bundleFilename, map } = await createBundleFromDeps(
                `core-${layoutHandle}`,
                layoutBundleDeps,
                firstLocaleRoot,
                requireConfig,
                theme.themeID
            );
            otherBundlesOutput.push([bundle, bundleFilename, map])
            endLayoutBundleTask(`Creating bundle for: ${layoutHandle}`);
        }

    }

    const newRequireConfig = generateBundleRequireConfig(
        rawRequireConfig,
        'core-bundle',
        coreBundleDeps,
        otherBundles
    );

    const endMinifyTask = cliTask(
        `Minify core bundle and RequireJS config`,
        theme.themeID,
    );
    const [minifiedCoreBundle, minifiedRequireConfig, ...otherMinifiedBundles] = await Promise.all([
        minifier.minifyFromString(bundle, bundleFilename, map),
        minifier.minifyFromString(
            newRequireConfig,
            'requirejs-bundle-config.js',
        ),
        // @ts-ignore
        ...otherBundlesOutput.map(otherBundleOutput => minifier.minifyFromString(...otherBundleOutput))
    ]);
    const coreBundleSizes = {
        beforeMin: Buffer.from(bundle).byteLength,
        afterMin: Buffer.from(minifiedCoreBundle.code).byteLength,
    };
    const requireConfigSizes = {
        beforeMin: Buffer.from(rawRequireConfig).byteLength,
        afterMin: Buffer.from(minifiedRequireConfig.code).byteLength,
    };
    endMinifyTask(`Minified core bundle and RequireJS`);

    const files = [
        {
            pathFromLocaleRoot: join(BALER_META_DIR, bundleFilename),
            source: minifiedCoreBundle.code,
        },
        {
            pathFromLocaleRoot: join(BALER_META_DIR, `${bundleFilename}.map`),
            source: minifiedCoreBundle.map,
        },
        {
            pathFromLocaleRoot: 'requirejs-bundle-config.js',
            source: minifiedRequireConfig.code,
        },
        {
            pathFromLocaleRoot: 'requirejs-bundle-config.js.map',
            source: minifiedRequireConfig.map,
        },
    ];
    let idx = 0;
    for (const [, otherBundleFileName] of otherBundlesOutput) {
        const minifiedBundle = otherMinifiedBundles[idx];
        files.push({
            pathFromLocaleRoot: join(BALER_META_DIR, otherBundleFileName),
            // @ts-ignore
            source: minifiedBundle.code
        });
        files.push({
            pathFromLocaleRoot: join(BALER_META_DIR, `${otherBundleFileName}.map`),
            // @ts-ignore
            source: minifiedBundle.map
        });
        idx++;
    }

    await writeFilesToAllLocales(magentoRoot, theme, files, deployedLocales);

    return {
        baseLocale: firstLocale,
        entryPoints: resolvedEntryIDs,
        graph,
        coreBundleSizes,
        requireConfigSizes,
    };
}

async function writeFilesToAllLocales(
    magentoRoot: string,
    theme: Theme,
    files: { pathFromLocaleRoot: string; source: string }[],
    locales: string[],
) {
    const staticDir = getStaticDirForTheme(theme);

    const pendingWrites = flatten(
        files.map(file => {
            return locales.map(async locale => {
                const path = join(
                    magentoRoot,
                    staticDir,
                    locale,
                    file.pathFromLocaleRoot,
                );
                await writeFileWithMkDir(path, file.source);
            });
        }),
    );

    await Promise.all(pendingWrites);
}

async function writeFileWithMkDir(path: string, source: string) {
    const dir = dirname(path);
    await mkdir(dir, { recursive: true });
    await writeFile(path, source);
}

function getThemeByID(themeID: string, themes: Record<string, Theme>) {
    const theme = themes[themeID];
    if (!theme) {
        throw new BalerError(
            `Attempted to optimize "${themeID}", but it was ` +
                'not found in the store.',
        );
    }

    return theme;
}

function throwOnDisallowedTheme(theme: Theme) {
    if (theme.area !== 'frontend') {
        throw new BalerError(
            `Cannot optimize theme "${theme.themeID}" ` +
                'because only "frontend" themes are supported by baler',
        );
    }
    if (theme.themeID === 'Magento/blank') {
        // Only reason we're doing this check is because it's likely
        // a mistake 99.9% of the time if you try to bundle blank
        throw new BalerError(
            `Optimization of "Magento/blank" is not supported`,
        );
    }
}

function getEntryPointsFromConfig(
    requireConfig: MagentoRequireConfig,
    themeID: string,
) {
    const entries = requireConfig.deps;
    if (Array.isArray(entries) && entries.length) {
        return entries;
    }

    throw new BalerError(
        `Could not find any entry points ("deps") config in ` +
            `"requirejs-config.js" for theme "${themeID}"`,
    );
}
