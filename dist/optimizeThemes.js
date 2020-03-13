"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const createMinifier_1 = require("./createMinifier");
const magentoFS_1 = require("./magentoFS");
const requireConfig_1 = require("./requireConfig");
const traceAMDDependencies_1 = require("./traceAMDDependencies");
const computeDepsForBundle_1 = require("./computeDepsForBundle");
const createBundleFromDeps_1 = require("./createBundleFromDeps");
const fsPromises_1 = require("./fsPromises");
const flatten_1 = require("./flatten");
const cliTask_1 = require("./cliTask");
const BalerError_1 = require("./BalerError");
const BALER_META_DIR = 'balerbundles';
/**
 * @summary Optimize all eligible themes in a Magento 2 store
 */
async function optimizeThemes(magentoRoot, store, themesToOptimize) {
    // Spins up a worker pool, so we only want to do it once, not per-theme
    const minifier = createMinifier_1.createMinifier();
    const pendingThemeResults = themesToOptimize.map(async (themeID) => {
        const theme = getThemeByID(themeID, store.components.themes);
        throwOnDisallowedTheme(theme);
        try {
            const result = await optimizeTheme(magentoRoot, store, theme, minifier);
            return { themeID, success: true, result };
        }
        catch (error) {
            return { themeID, success: false, error };
        }
    });
    const themeResults = await Promise.all(pendingThemeResults);
    minifier.destroy();
    return themeResults;
}
exports.optimizeThemes = optimizeThemes;
/**
 * @summary Optimize a single theme in a Magento 2 store
 */
async function optimizeTheme(magentoRoot, store, theme, minifier) {
    const coreBundleResults = await createCoreBundle(magentoRoot, theme, minifier);
    return coreBundleResults;
}
async function getLayoutBasedDeps(magentoRoot, theme) {
    const enabledModules = await magentoFS_1.getEnabledModules(magentoRoot);
    const { modules, themes } = await magentoFS_1.getComponents(magentoRoot);
    const themeFallback = [];
    let processing = true;
    let currentFallback = theme;
    // Create theme fallback
    while (processing) {
        themeFallback.push(currentFallback);
        if (currentFallback.parentID) {
            currentFallback = themes[currentFallback.parentID];
        }
        else {
            processing = false;
        }
    }
    console.log(themeFallback);
    console.log(enabledModules);
    console.log(modules);
    // Get all layout files
    const layoutFiles = await magentoFS_1.getLayoutFilesEligibleForUseWithTheme(themeFallback, enabledModules, modules);
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
        }
        else {
            layoutHandle = layoutHandle.replace('.xml', '');
        }
        if (!layoutToTemplatesMap.has(layoutHandle)) {
            layoutToTemplatesMap.set(layoutHandle, new Set());
        }
        if (!layoutToDepsMap.has(layoutHandle)) {
            layoutToDepsMap.set(layoutHandle, new Set());
        }
        const templatesSet = layoutToTemplatesMap.get(layoutHandle);
        const templates = await magentoFS_1.getPHTMLFilesFromLayoutHandle(layoutFile, themeFallback, modules);
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
            const depsForTemplate = await magentoFS_1.getDepsFromPHTMLPath(template);
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
async function createCoreBundle(magentoRoot, theme, minifier) {
    const deployedLocales = await magentoFS_1.getLocalesForDeployedTheme(magentoRoot, theme);
    const [firstLocale] = deployedLocales;
    const firstLocaleRoot = path_1.join(magentoRoot, magentoFS_1.getStaticDirForTheme(theme), firstLocale);
    const { requireConfig, rawRequireConfig } = await requireConfig_1.getRequireConfigFromDir(firstLocaleRoot);
    let entryPoints = getEntryPointsFromConfig(requireConfig, theme.themeID);
    const layoutDeps = await getLayoutBasedDeps(magentoRoot, theme);
    // Combine default.xml deps with core bundle
    const defaultDeps = layoutDeps.get('default');
    if (defaultDeps) {
        entryPoints = entryPoints.concat(Array.from(defaultDeps));
        layoutDeps.delete('default');
    }
    const { graph, resolvedEntryIDs } = await traceAMDDependencies_1.traceAMDDependencies(entryPoints, requireConfig, firstLocaleRoot);
    const coreBundleDeps = computeDepsForBundle_1.computeDepsForBundle(graph, resolvedEntryIDs);
    const endBundleTask = cliTask_1.cliTask(`Create core bundle file`, theme.themeID);
    const { bundle, bundleFilename, map } = await createBundleFromDeps_1.createBundleFromDeps('core-bundle', coreBundleDeps, firstLocaleRoot, requireConfig, theme.themeID);
    endBundleTask(`Created core bundle file`);
    // Create bundles for all other layout xml handles
    const otherBundles = new Map();
    const otherBundlesOutput = [];
    for (const [layoutHandle, entryPoints] of layoutDeps) {
        const { graph, resolvedEntryIDs } = await traceAMDDependencies_1.traceAMDDependencies(Array.from(entryPoints), requireConfig, firstLocaleRoot);
        const layoutBundleDeps = computeDepsForBundle_1.computeDepsForBundle(graph, resolvedEntryIDs).filter(dep => !coreBundleDeps.includes(dep));
        // Only create bundles for handles that have dependencies
        if (layoutBundleDeps.length > 0) {
            const endLayoutBundleTask = cliTask_1.cliTask(`Creating bundle for: ${layoutHandle}`, theme.themeID);
            otherBundles.set(layoutHandle, layoutBundleDeps);
            const { bundle, bundleFilename, map } = await createBundleFromDeps_1.createBundleFromDeps(`core-${layoutHandle}`, layoutBundleDeps, firstLocaleRoot, requireConfig, theme.themeID);
            otherBundlesOutput.push([bundle, bundleFilename, map]);
            endLayoutBundleTask(`Creating bundle for: ${layoutHandle}`);
        }
    }
    const newRequireConfig = requireConfig_1.generateBundleRequireConfig(rawRequireConfig, 'core-bundle', coreBundleDeps, otherBundles);
    const endMinifyTask = cliTask_1.cliTask(`Minify core bundle and RequireJS config`, theme.themeID);
    const [minifiedCoreBundle, minifiedRequireConfig, ...otherMinifiedBundles] = await Promise.all([
        minifier.minifyFromString(bundle, bundleFilename, map),
        minifier.minifyFromString(newRequireConfig, 'requirejs-bundle-config.js'),
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
            pathFromLocaleRoot: path_1.join(BALER_META_DIR, bundleFilename),
            source: minifiedCoreBundle.code,
        },
        {
            pathFromLocaleRoot: path_1.join(BALER_META_DIR, `${bundleFilename}.map`),
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
            pathFromLocaleRoot: path_1.join(BALER_META_DIR, otherBundleFileName),
            // @ts-ignore
            source: minifiedBundle.code
        });
        files.push({
            pathFromLocaleRoot: path_1.join(BALER_META_DIR, `${otherBundleFileName}.map`),
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
async function writeFilesToAllLocales(magentoRoot, theme, files, locales) {
    const staticDir = magentoFS_1.getStaticDirForTheme(theme);
    const pendingWrites = flatten_1.flatten(files.map(file => {
        return locales.map(async (locale) => {
            const path = path_1.join(magentoRoot, staticDir, locale, file.pathFromLocaleRoot);
            await writeFileWithMkDir(path, file.source);
        });
    }));
    await Promise.all(pendingWrites);
}
async function writeFileWithMkDir(path, source) {
    const dir = path_1.dirname(path);
    await fsPromises_1.mkdir(dir, { recursive: true });
    await fsPromises_1.writeFile(path, source);
}
function getThemeByID(themeID, themes) {
    const theme = themes[themeID];
    if (!theme) {
        throw new BalerError_1.BalerError(`Attempted to optimize "${themeID}", but it was ` +
            'not found in the store.');
    }
    return theme;
}
function throwOnDisallowedTheme(theme) {
    if (theme.area !== 'frontend') {
        throw new BalerError_1.BalerError(`Cannot optimize theme "${theme.themeID}" ` +
            'because only "frontend" themes are supported by baler');
    }
    if (theme.themeID === 'Magento/blank') {
        // Only reason we're doing this check is because it's likely
        // a mistake 99.9% of the time if you try to bundle blank
        throw new BalerError_1.BalerError(`Optimization of "Magento/blank" is not supported`);
    }
}
function getEntryPointsFromConfig(requireConfig, themeID) {
    const entries = requireConfig.deps;
    if (Array.isArray(entries) && entries.length) {
        return entries;
    }
    throw new BalerError_1.BalerError(`Could not find any entry points ("deps") config in ` +
        `"requirejs-config.js" for theme "${themeID}"`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3B0aW1pemVUaGVtZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvb3B0aW1pemVUaGVtZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7QUFHSCwrQkFBcUM7QUFDckMscURBQTREO0FBQzVELDJDQVNxQjtBQUNyQixtREFHeUI7QUFDekIsaUVBQThEO0FBQzlELGlFQUE4RDtBQUM5RCxpRUFBOEQ7QUFDOUQsNkNBQWdEO0FBQ2hELHVDQUFvQztBQUNwQyx1Q0FBb0M7QUFDcEMsNkNBQTBDO0FBRTFDLE1BQU0sY0FBYyxHQUFHLGNBQWMsQ0FBQztBQUV0Qzs7R0FFRztBQUNJLEtBQUssVUFBVSxjQUFjLENBQ2hDLFdBQW1CLEVBQ25CLEtBQWdCLEVBQ2hCLGdCQUEwQjtJQUUxQix1RUFBdUU7SUFDdkUsTUFBTSxRQUFRLEdBQUcsK0JBQWMsRUFBRSxDQUFDO0lBRWxDLE1BQU0sbUJBQW1CLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBQyxPQUFPLEVBQUMsRUFBRTtRQUM3RCxNQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0Qsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFOUIsSUFBSTtZQUNBLE1BQU0sTUFBTSxHQUFHLE1BQU0sYUFBYSxDQUM5QixXQUFXLEVBQ1gsS0FBSyxFQUNMLEtBQUssRUFDTCxRQUFRLENBQ1gsQ0FBQztZQUNGLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQztTQUM3QztRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDO1NBQzdDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLFlBQVksR0FBRyxNQUFNLE9BQU8sQ0FB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QUFNLElBQUksdUJBQVUsQ0FDaEIsa0RBQWtELENBQ3JELENBQUM7S0FDTDtBQUNMLENBQUM7QUFFRCxTQUFTLHdCQUF3QixDQUM3QixhQUFtQyxFQUNuQyxPQUFlO0lBRWYsTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQztJQUNuQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtRQUMxQyxPQUFPLE9BQU8sQ0FBQztLQUNsQjtJQUVELE1BQU0sSUFBSSx1QkFBVSxDQUNoQixxREFBcUQ7UUFDakQsb0NBQW9DLE9BQU8sR0FBRyxDQUNyRCxDQUFDO0FBQ04sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IMKpIE1hZ2VudG8sIEluYy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFNlZSBDT1BZSU5HLnR4dCBmb3IgbGljZW5zZSBkZXRhaWxzLlxuICovXG5cbmltcG9ydCB7IFN0b3JlRGF0YSwgVGhlbWUsIE1hZ2VudG9SZXF1aXJlQ29uZmlnIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBqb2luLCBkaXJuYW1lIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBjcmVhdGVNaW5pZmllciwgTWluaWZpZXIgfSBmcm9tICcuL2NyZWF0ZU1pbmlmaWVyJztcbmltcG9ydCB7XG4gICAgZ2V0TG9jYWxlc0ZvckRlcGxveWVkVGhlbWUsXG4gICAgZ2V0U3RhdGljRGlyRm9yVGhlbWUsXG4gICAgZ2V0UEhUTUxGaWxlc0VsaWdpYmxlRm9yVXNlV2l0aFRoZW1lLFxuICAgIGdldExheW91dEZpbGVzRWxpZ2libGVGb3JVc2VXaXRoVGhlbWUsXG4gICAgZ2V0RW5hYmxlZE1vZHVsZXMsXG4gICAgZ2V0Q29tcG9uZW50cyxcbiAgICBnZXRQSFRNTEZpbGVzRnJvbUxheW91dEhhbmRsZSxcbiAgICBnZXREZXBzRnJvbVBIVE1MUGF0aFxufSBmcm9tICcuL21hZ2VudG9GUyc7XG5pbXBvcnQge1xuICAgIGdldFJlcXVpcmVDb25maWdGcm9tRGlyLFxuICAgIGdlbmVyYXRlQnVuZGxlUmVxdWlyZUNvbmZpZyxcbn0gZnJvbSAnLi9yZXF1aXJlQ29uZmlnJztcbmltcG9ydCB7IHRyYWNlQU1ERGVwZW5kZW5jaWVzIH0gZnJvbSAnLi90cmFjZUFNRERlcGVuZGVuY2llcyc7XG5pbXBvcnQgeyBjb21wdXRlRGVwc0ZvckJ1bmRsZSB9IGZyb20gJy4vY29tcHV0ZURlcHNGb3JCdW5kbGUnO1xuaW1wb3J0IHsgY3JlYXRlQnVuZGxlRnJvbURlcHMgfSBmcm9tICcuL2NyZWF0ZUJ1bmRsZUZyb21EZXBzJztcbmltcG9ydCB7IHdyaXRlRmlsZSwgbWtkaXIgfSBmcm9tICcuL2ZzUHJvbWlzZXMnO1xuaW1wb3J0IHsgZmxhdHRlbiB9IGZyb20gJy4vZmxhdHRlbic7XG5pbXBvcnQgeyBjbGlUYXNrIH0gZnJvbSAnLi9jbGlUYXNrJztcbmltcG9ydCB7IEJhbGVyRXJyb3IgfSBmcm9tICcuL0JhbGVyRXJyb3InO1xuXG5jb25zdCBCQUxFUl9NRVRBX0RJUiA9ICdiYWxlcmJ1bmRsZXMnO1xuXG4vKipcbiAqIEBzdW1tYXJ5IE9wdGltaXplIGFsbCBlbGlnaWJsZSB0aGVtZXMgaW4gYSBNYWdlbnRvIDIgc3RvcmVcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9wdGltaXplVGhlbWVzKFxuICAgIG1hZ2VudG9Sb290OiBzdHJpbmcsXG4gICAgc3RvcmU6IFN0b3JlRGF0YSxcbiAgICB0aGVtZXNUb09wdGltaXplOiBzdHJpbmdbXSxcbikge1xuICAgIC8vIFNwaW5zIHVwIGEgd29ya2VyIHBvb2wsIHNvIHdlIG9ubHkgd2FudCB0byBkbyBpdCBvbmNlLCBub3QgcGVyLXRoZW1lXG4gICAgY29uc3QgbWluaWZpZXIgPSBjcmVhdGVNaW5pZmllcigpO1xuXG4gICAgY29uc3QgcGVuZGluZ1RoZW1lUmVzdWx0cyA9IHRoZW1lc1RvT3B0aW1pemUubWFwKGFzeW5jIHRoZW1lSUQgPT4ge1xuICAgICAgICBjb25zdCB0aGVtZSA9IGdldFRoZW1lQnlJRCh0aGVtZUlELCBzdG9yZS5jb21wb25lbnRzLnRoZW1lcyk7XG4gICAgICAgIHRocm93T25EaXNhbGxvd2VkVGhlbWUodGhlbWUpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBvcHRpbWl6ZVRoZW1lKFxuICAgICAgICAgICAgICAgIG1hZ2VudG9Sb290LFxuICAgICAgICAgICAgICAgIHN0b3JlLFxuICAgICAgICAgICAgICAgIHRoZW1lLFxuICAgICAgICAgICAgICAgIG1pbmlmaWVyLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiB7IHRoZW1lSUQsIHN1Y2Nlc3M6IHRydWUsIHJlc3VsdCB9O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIHsgdGhlbWVJRCwgc3VjY2VzczogZmFsc2UsIGVycm9yIH07XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IHRoZW1lUmVzdWx0cyA9IGF3YWl0IFByb21pc2UuYWxsKHBlbmRpbmdUaGVtZVJlc3VsdHMpO1xuICAgIG1pbmlmaWVyLmRlc3Ryb3koKTtcblxuICAgIHJldHVybiB0aGVtZVJlc3VsdHM7XG59XG5cbi8qKlxuICogQHN1bW1hcnkgT3B0aW1pemUgYSBzaW5nbGUgdGhlbWUgaW4gYSBNYWdlbnRvIDIgc3RvcmVcbiAqL1xuYXN5bmMgZnVuY3Rpb24gb3B0aW1pemVUaGVtZShcbiAgICBtYWdlbnRvUm9vdDogc3RyaW5nLFxuICAgIHN0b3JlOiBTdG9yZURhdGEsXG4gICAgdGhlbWU6IFRoZW1lLFxuICAgIG1pbmlmaWVyOiBNaW5pZmllcixcbikge1xuICAgIGNvbnN0IGNvcmVCdW5kbGVSZXN1bHRzID0gYXdhaXQgY3JlYXRlQ29yZUJ1bmRsZShcbiAgICAgICAgbWFnZW50b1Jvb3QsXG4gICAgICAgIHRoZW1lLFxuICAgICAgICBtaW5pZmllcixcbiAgICApO1xuXG4gICAgcmV0dXJuIGNvcmVCdW5kbGVSZXN1bHRzO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRMYXlvdXRCYXNlZERlcHMoXG4gICAgbWFnZW50b1Jvb3Q6IHN0cmluZyxcbiAgICB0aGVtZTogVGhlbWVcbik6IFByb21pc2U8TWFwPHN0cmluZywgU2V0PHN0cmluZz4+PiB7XG4gICAgY29uc3QgZW5hYmxlZE1vZHVsZXMgPSBhd2FpdCBnZXRFbmFibGVkTW9kdWxlcyhtYWdlbnRvUm9vdCk7XG4gICAgY29uc3QgeyBtb2R1bGVzLCB0aGVtZXMgfSA9IGF3YWl0IGdldENvbXBvbmVudHMobWFnZW50b1Jvb3QpO1xuICAgIGNvbnN0IHRoZW1lRmFsbGJhY2sgPSBbXTtcbiAgICBsZXQgcHJvY2Vzc2luZyA9IHRydWU7XG4gICAgbGV0IGN1cnJlbnRGYWxsYmFjayA9IHRoZW1lO1xuXG4gICAgLy8gQ3JlYXRlIHRoZW1lIGZhbGxiYWNrXG4gICAgd2hpbGUgKHByb2Nlc3NpbmcpIHtcbiAgICAgICAgdGhlbWVGYWxsYmFjay5wdXNoKGN1cnJlbnRGYWxsYmFjayk7XG4gICAgICAgIGlmIChjdXJyZW50RmFsbGJhY2sucGFyZW50SUQpIHtcbiAgICAgICAgICAgIGN1cnJlbnRGYWxsYmFjayA9IHRoZW1lc1tjdXJyZW50RmFsbGJhY2sucGFyZW50SURdXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyh0aGVtZUZhbGxiYWNrKTtcbiAgICBjb25zb2xlLmxvZyhlbmFibGVkTW9kdWxlcyk7XG4gICAgY29uc29sZS5sb2cobW9kdWxlcyk7XG5cbiAgICAvLyBHZXQgYWxsIGxheW91dCBmaWxlc1xuICAgIGNvbnN0IGxheW91dEZpbGVzID0gYXdhaXQgZ2V0TGF5b3V0RmlsZXNFbGlnaWJsZUZvclVzZVdpdGhUaGVtZShcbiAgICAgICAgdGhlbWVGYWxsYmFjayxcbiAgICAgICAgZW5hYmxlZE1vZHVsZXMsXG4gICAgICAgIG1vZHVsZXNcbiAgICApO1xuXG4gICAgLy8gTG9nZ2luZyB0byBmaWd1cmUgb3V0IGlmIGEgZ2xvYiBpcyBmYWlsaW5nIG9uIGNsb3VkXG4gICAgY29uc29sZS5sb2cobGF5b3V0RmlsZXMpO1xuXG4gICAgLy8gQ3JlYXRlIGEgbWFwIG9mIGxheW91dCBmaWxlID0+IHRlbXBsYXRlRmlsZXNbXVxuICAgIGNvbnN0IGxheW91dFRvVGVtcGxhdGVzTWFwID0gbmV3IE1hcCgpO1xuICAgIC8vIENyZWF0ZSBhIG1hcCBvZiBsYXlvdXQgZmlsZSA9PiBqc1tdXG4gICAgY29uc3QgbGF5b3V0VG9EZXBzTWFwID0gbmV3IE1hcCgpO1xuXG4gICAgZm9yIChjb25zdCBsYXlvdXRGaWxlIG9mIGxheW91dEZpbGVzKSB7XG4gICAgICAgIGxldCBsYXlvdXRIYW5kbGUgPSBsYXlvdXRGaWxlLnNwbGl0KCcvJykucG9wKCk7XG4gICAgICAgIGlmICghbGF5b3V0SGFuZGxlKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxheW91dEhhbmRsZSA9IGxheW91dEhhbmRsZS5yZXBsYWNlKCcueG1sJywgJycpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghbGF5b3V0VG9UZW1wbGF0ZXNNYXAuaGFzKGxheW91dEhhbmRsZSkpIHtcbiAgICAgICAgICAgIGxheW91dFRvVGVtcGxhdGVzTWFwLnNldChsYXlvdXRIYW5kbGUsIG5ldyBTZXQoKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFsYXlvdXRUb0RlcHNNYXAuaGFzKGxheW91dEhhbmRsZSkpIHtcbiAgICAgICAgICAgIGxheW91dFRvRGVwc01hcC5zZXQobGF5b3V0SGFuZGxlLCBuZXcgU2V0KCkpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlc1NldCA9IGxheW91dFRvVGVtcGxhdGVzTWFwLmdldChsYXlvdXRIYW5kbGUpO1xuICAgICAgICBjb25zdCB0ZW1wbGF0ZXMgPSBhd2FpdCBnZXRQSFRNTEZpbGVzRnJvbUxheW91dEhhbmRsZShsYXlvdXRGaWxlLCB0aGVtZUZhbGxiYWNrLCBtb2R1bGVzKTtcbiAgICAgICAgZm9yIChjb25zdCB0ZW1wbGF0ZSBvZiB0ZW1wbGF0ZXMpIHtcbiAgICAgICAgICAgIHRlbXBsYXRlc1NldC5hZGQodGVtcGxhdGUpO1xuICAgICAgICB9XG4gICAgICAgIGxheW91dFRvVGVtcGxhdGVzTWFwLnNldChsYXlvdXRIYW5kbGUsIHRlbXBsYXRlc1NldCk7XG4gICAgfVxuXG5cbiAgICAvLyBJdGVyYXRlIG92ZXIgZWFjaCBsYXlvdXQgaGFuZGxlXG4gICAgZm9yIChjb25zdCBbaGFuZGxlLCB0ZW1wbGF0ZXNTZXRdIG9mIGxheW91dFRvVGVtcGxhdGVzTWFwKSB7XG4gICAgICAgIC8vIEl0ZXJhdGUgb3ZlciBlYWNoIHRlbXBsYXRlRmlsZVxuICAgICAgICBmb3IgKGNvbnN0IHRlbXBsYXRlIG9mIEFycmF5LmZyb20odGVtcGxhdGVzU2V0KSkge1xuICAgICAgICAgICAgY29uc3QgZGVwc0ZvckxheW91dEhhbmRsZSA9IGxheW91dFRvRGVwc01hcC5nZXQoaGFuZGxlKTtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGNvbnN0IGRlcHNGb3JUZW1wbGF0ZSA9IGF3YWl0IGdldERlcHNGcm9tUEhUTUxQYXRoKHRlbXBsYXRlKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZGVwIG9mIGRlcHNGb3JUZW1wbGF0ZSkge1xuICAgICAgICAgICAgICAgIGRlcHNGb3JMYXlvdXRIYW5kbGUuYWRkKGRlcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsYXlvdXRUb0RlcHNNYXAuc2V0KGhhbmRsZSwgZGVwc0ZvckxheW91dEhhbmRsZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbGF5b3V0VG9EZXBzTWFwO1xuICAgIC8vIHJlYWQgdGhlIHBodG1sIGZpbGUsXG4gICAgLy8gZ2F0aGVyIHRoZSBkZXBlbmRlbmNpZXNcbiAgICAvLyBjcmVhdGUgdGhlIGJ1bmRsZVxufVxuXG4vKipcbiAqIEBzdW1tYXJ5IENyZWF0ZXMgYW5kIHdyaXRlcyB0aGUgY29yZSBidW5kbGUgZmlsZSBmb3IgYSBnaXZlbiB0aGVtZVxuICovXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVDb3JlQnVuZGxlKFxuICAgIG1hZ2VudG9Sb290OiBzdHJpbmcsXG4gICAgdGhlbWU6IFRoZW1lLFxuICAgIG1pbmlmaWVyOiBNaW5pZmllcixcbikge1xuICAgIGNvbnN0IGRlcGxveWVkTG9jYWxlcyA9IGF3YWl0IGdldExvY2FsZXNGb3JEZXBsb3llZFRoZW1lKFxuICAgICAgICBtYWdlbnRvUm9vdCxcbiAgICAgICAgdGhlbWUsXG4gICAgKTtcblxuICAgIGNvbnN0IFtmaXJzdExvY2FsZV0gPSBkZXBsb3llZExvY2FsZXM7XG4gICAgY29uc3QgZmlyc3RMb2NhbGVSb290ID0gam9pbihcbiAgICAgICAgbWFnZW50b1Jvb3QsXG4gICAgICAgIGdldFN0YXRpY0RpckZvclRoZW1lKHRoZW1lKSxcbiAgICAgICAgZmlyc3RMb2NhbGUsXG4gICAgKTtcblxuICAgIGNvbnN0IHsgcmVxdWlyZUNvbmZpZywgcmF3UmVxdWlyZUNvbmZpZyB9ID0gYXdhaXQgZ2V0UmVxdWlyZUNvbmZpZ0Zyb21EaXIoXG4gICAgICAgIGZpcnN0TG9jYWxlUm9vdCxcbiAgICApO1xuICAgIGxldCBlbnRyeVBvaW50cyA9IGdldEVudHJ5UG9pbnRzRnJvbUNvbmZpZyhyZXF1aXJlQ29uZmlnLCB0aGVtZS50aGVtZUlEKTtcbiAgICBjb25zdCBsYXlvdXREZXBzID0gYXdhaXQgZ2V0TGF5b3V0QmFzZWREZXBzKFxuICAgICAgICBtYWdlbnRvUm9vdCxcbiAgICAgICAgdGhlbWVcbiAgICApO1xuICAgIC8vIENvbWJpbmUgZGVmYXVsdC54bWwgZGVwcyB3aXRoIGNvcmUgYnVuZGxlXG4gICAgY29uc3QgZGVmYXVsdERlcHMgPSBsYXlvdXREZXBzLmdldCgnZGVmYXVsdCcpO1xuICAgIGlmIChkZWZhdWx0RGVwcykge1xuICAgICAgICBlbnRyeVBvaW50cyA9IGVudHJ5UG9pbnRzLmNvbmNhdChBcnJheS5mcm9tKGRlZmF1bHREZXBzKSlcbiAgICAgICAgbGF5b3V0RGVwcy5kZWxldGUoJ2RlZmF1bHQnKTtcbiAgICB9XG5cbiAgICBjb25zdCB7IGdyYXBoLCByZXNvbHZlZEVudHJ5SURzIH0gPSBhd2FpdCB0cmFjZUFNRERlcGVuZGVuY2llcyhcbiAgICAgICAgZW50cnlQb2ludHMsXG4gICAgICAgIHJlcXVpcmVDb25maWcsXG4gICAgICAgIGZpcnN0TG9jYWxlUm9vdCxcbiAgICApO1xuICAgIGNvbnN0IGNvcmVCdW5kbGVEZXBzID0gY29tcHV0ZURlcHNGb3JCdW5kbGUoZ3JhcGgsIHJlc29sdmVkRW50cnlJRHMpO1xuXG4gICAgY29uc3QgZW5kQnVuZGxlVGFzayA9IGNsaVRhc2soYENyZWF0ZSBjb3JlIGJ1bmRsZSBmaWxlYCwgdGhlbWUudGhlbWVJRCk7XG4gICAgY29uc3QgeyBidW5kbGUsIGJ1bmRsZUZpbGVuYW1lLCBtYXAgfSA9IGF3YWl0IGNyZWF0ZUJ1bmRsZUZyb21EZXBzKFxuICAgICAgICAnY29yZS1idW5kbGUnLFxuICAgICAgICBjb3JlQnVuZGxlRGVwcyxcbiAgICAgICAgZmlyc3RMb2NhbGVSb290LFxuICAgICAgICByZXF1aXJlQ29uZmlnLFxuICAgICAgICB0aGVtZS50aGVtZUlELFxuICAgICk7XG4gICAgZW5kQnVuZGxlVGFzayhgQ3JlYXRlZCBjb3JlIGJ1bmRsZSBmaWxlYCk7XG5cbiAgICAvLyBDcmVhdGUgYnVuZGxlcyBmb3IgYWxsIG90aGVyIGxheW91dCB4bWwgaGFuZGxlc1xuICAgIGNvbnN0IG90aGVyQnVuZGxlcyA9IG5ldyBNYXAoKTtcbiAgICBjb25zdCBvdGhlckJ1bmRsZXNPdXRwdXQgPSBbXTtcbiAgICBmb3IgKGNvbnN0IFsgbGF5b3V0SGFuZGxlLCBlbnRyeVBvaW50cyBdIG9mIGxheW91dERlcHMpIHtcbiAgICAgICAgY29uc3QgeyBncmFwaCwgcmVzb2x2ZWRFbnRyeUlEcyB9ID0gYXdhaXQgdHJhY2VBTUREZXBlbmRlbmNpZXMoXG4gICAgICAgICAgICBBcnJheS5mcm9tKGVudHJ5UG9pbnRzKSxcbiAgICAgICAgICAgIHJlcXVpcmVDb25maWcsXG4gICAgICAgICAgICBmaXJzdExvY2FsZVJvb3QsXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGxheW91dEJ1bmRsZURlcHMgPSBjb21wdXRlRGVwc0ZvckJ1bmRsZShncmFwaCwgcmVzb2x2ZWRFbnRyeUlEcykuZmlsdGVyKGRlcCA9PiAhY29yZUJ1bmRsZURlcHMuaW5jbHVkZXMoZGVwKSk7XG4gICAgICAgIC8vIE9ubHkgY3JlYXRlIGJ1bmRsZXMgZm9yIGhhbmRsZXMgdGhhdCBoYXZlIGRlcGVuZGVuY2llc1xuICAgICAgICBpZiAobGF5b3V0QnVuZGxlRGVwcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBlbmRMYXlvdXRCdW5kbGVUYXNrID0gY2xpVGFzayhgQ3JlYXRpbmcgYnVuZGxlIGZvcjogJHtsYXlvdXRIYW5kbGV9YCwgdGhlbWUudGhlbWVJRCk7XG4gICAgICAgICAgICBvdGhlckJ1bmRsZXMuc2V0KGxheW91dEhhbmRsZSwgbGF5b3V0QnVuZGxlRGVwcyk7XG4gICAgICAgICAgICBjb25zdCB7IGJ1bmRsZSwgYnVuZGxlRmlsZW5hbWUsIG1hcCB9ID0gYXdhaXQgY3JlYXRlQnVuZGxlRnJvbURlcHMoXG4gICAgICAgICAgICAgICAgYGNvcmUtJHtsYXlvdXRIYW5kbGV9YCxcbiAgICAgICAgICAgICAgICBsYXlvdXRCdW5kbGVEZXBzLFxuICAgICAgICAgICAgICAgIGZpcnN0TG9jYWxlUm9vdCxcbiAgICAgICAgICAgICAgICByZXF1aXJlQ29uZmlnLFxuICAgICAgICAgICAgICAgIHRoZW1lLnRoZW1lSURcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBvdGhlckJ1bmRsZXNPdXRwdXQucHVzaChbYnVuZGxlLCBidW5kbGVGaWxlbmFtZSwgbWFwXSlcbiAgICAgICAgICAgIGVuZExheW91dEJ1bmRsZVRhc2soYENyZWF0aW5nIGJ1bmRsZSBmb3I6ICR7bGF5b3V0SGFuZGxlfWApO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBjb25zdCBuZXdSZXF1aXJlQ29uZmlnID0gZ2VuZXJhdGVCdW5kbGVSZXF1aXJlQ29uZmlnKFxuICAgICAgICByYXdSZXF1aXJlQ29uZmlnLFxuICAgICAgICAnY29yZS1idW5kbGUnLFxuICAgICAgICBjb3JlQnVuZGxlRGVwcyxcbiAgICAgICAgb3RoZXJCdW5kbGVzXG4gICAgKTtcblxuICAgIGNvbnN0IGVuZE1pbmlmeVRhc2sgPSBjbGlUYXNrKFxuICAgICAgICBgTWluaWZ5IGNvcmUgYnVuZGxlIGFuZCBSZXF1aXJlSlMgY29uZmlnYCxcbiAgICAgICAgdGhlbWUudGhlbWVJRCxcbiAgICApO1xuICAgIGNvbnN0IFttaW5pZmllZENvcmVCdW5kbGUsIG1pbmlmaWVkUmVxdWlyZUNvbmZpZywgLi4ub3RoZXJNaW5pZmllZEJ1bmRsZXNdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICBtaW5pZmllci5taW5pZnlGcm9tU3RyaW5nKGJ1bmRsZSwgYnVuZGxlRmlsZW5hbWUsIG1hcCksXG4gICAgICAgIG1pbmlmaWVyLm1pbmlmeUZyb21TdHJpbmcoXG4gICAgICAgICAgICBuZXdSZXF1aXJlQ29uZmlnLFxuICAgICAgICAgICAgJ3JlcXVpcmVqcy1idW5kbGUtY29uZmlnLmpzJyxcbiAgICAgICAgKSxcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAuLi5vdGhlckJ1bmRsZXNPdXRwdXQubWFwKG90aGVyQnVuZGxlT3V0cHV0ID0+IG1pbmlmaWVyLm1pbmlmeUZyb21TdHJpbmcoLi4ub3RoZXJCdW5kbGVPdXRwdXQpKVxuICAgIF0pO1xuICAgIGNvbnN0IGNvcmVCdW5kbGVTaXplcyA9IHtcbiAgICAgICAgYmVmb3JlTWluOiBCdWZmZXIuZnJvbShidW5kbGUpLmJ5dGVMZW5ndGgsXG4gICAgICAgIGFmdGVyTWluOiBCdWZmZXIuZnJvbShtaW5pZmllZENvcmVCdW5kbGUuY29kZSkuYnl0ZUxlbmd0aCxcbiAgICB9O1xuICAgIGNvbnN0IHJlcXVpcmVDb25maWdTaXplcyA9IHtcbiAgICAgICAgYmVmb3JlTWluOiBCdWZmZXIuZnJvbShyYXdSZXF1aXJlQ29uZmlnKS5ieXRlTGVuZ3RoLFxuICAgICAgICBhZnRlck1pbjogQnVmZmVyLmZyb20obWluaWZpZWRSZXF1aXJlQ29uZmlnLmNvZGUpLmJ5dGVMZW5ndGgsXG4gICAgfTtcbiAgICBlbmRNaW5pZnlUYXNrKGBNaW5pZmllZCBjb3JlIGJ1bmRsZSBhbmQgUmVxdWlyZUpTYCk7XG5cbiAgICBjb25zdCBmaWxlcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgcGF0aEZyb21Mb2NhbGVSb290OiBqb2luKEJBTEVSX01FVEFfRElSLCBidW5kbGVGaWxlbmFtZSksXG4gICAgICAgICAgICBzb3VyY2U6IG1pbmlmaWVkQ29yZUJ1bmRsZS5jb2RlLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBwYXRoRnJvbUxvY2FsZVJvb3Q6IGpvaW4oQkFMRVJfTUVUQV9ESVIsIGAke2J1bmRsZUZpbGVuYW1lfS5tYXBgKSxcbiAgICAgICAgICAgIHNvdXJjZTogbWluaWZpZWRDb3JlQnVuZGxlLm1hcCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgcGF0aEZyb21Mb2NhbGVSb290OiAncmVxdWlyZWpzLWJ1bmRsZS1jb25maWcuanMnLFxuICAgICAgICAgICAgc291cmNlOiBtaW5pZmllZFJlcXVpcmVDb25maWcuY29kZSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgcGF0aEZyb21Mb2NhbGVSb290OiAncmVxdWlyZWpzLWJ1bmRsZS1jb25maWcuanMubWFwJyxcbiAgICAgICAgICAgIHNvdXJjZTogbWluaWZpZWRSZXF1aXJlQ29uZmlnLm1hcCxcbiAgICAgICAgfSxcbiAgICBdO1xuICAgIGxldCBpZHggPSAwO1xuICAgIGZvciAoY29uc3QgWywgb3RoZXJCdW5kbGVGaWxlTmFtZV0gb2Ygb3RoZXJCdW5kbGVzT3V0cHV0KSB7XG4gICAgICAgIGNvbnN0IG1pbmlmaWVkQnVuZGxlID0gb3RoZXJNaW5pZmllZEJ1bmRsZXNbaWR4XTtcbiAgICAgICAgZmlsZXMucHVzaCh7XG4gICAgICAgICAgICBwYXRoRnJvbUxvY2FsZVJvb3Q6IGpvaW4oQkFMRVJfTUVUQV9ESVIsIG90aGVyQnVuZGxlRmlsZU5hbWUpLFxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgc291cmNlOiBtaW5pZmllZEJ1bmRsZS5jb2RlXG4gICAgICAgIH0pO1xuICAgICAgICBmaWxlcy5wdXNoKHtcbiAgICAgICAgICAgIHBhdGhGcm9tTG9jYWxlUm9vdDogam9pbihCQUxFUl9NRVRBX0RJUiwgYCR7b3RoZXJCdW5kbGVGaWxlTmFtZX0ubWFwYCksXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBzb3VyY2U6IG1pbmlmaWVkQnVuZGxlLm1hcFxuICAgICAgICB9KTtcbiAgICAgICAgaWR4Kys7XG4gICAgfVxuXG4gICAgYXdhaXQgd3JpdGVGaWxlc1RvQWxsTG9jYWxlcyhtYWdlbnRvUm9vdCwgdGhlbWUsIGZpbGVzLCBkZXBsb3llZExvY2FsZXMpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgYmFzZUxvY2FsZTogZmlyc3RMb2NhbGUsXG4gICAgICAgIGVudHJ5UG9pbnRzOiByZXNvbHZlZEVudHJ5SURzLFxuICAgICAgICBncmFwaCxcbiAgICAgICAgY29yZUJ1bmRsZVNpemVzLFxuICAgICAgICByZXF1aXJlQ29uZmlnU2l6ZXMsXG4gICAgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gd3JpdGVGaWxlc1RvQWxsTG9jYWxlcyhcbiAgICBtYWdlbnRvUm9vdDogc3RyaW5nLFxuICAgIHRoZW1lOiBUaGVtZSxcbiAgICBmaWxlczogeyBwYXRoRnJvbUxvY2FsZVJvb3Q6IHN0cmluZzsgc291cmNlOiBzdHJpbmcgfVtdLFxuICAgIGxvY2FsZXM6IHN0cmluZ1tdLFxuKSB7XG4gICAgY29uc3Qgc3RhdGljRGlyID0gZ2V0U3RhdGljRGlyRm9yVGhlbWUodGhlbWUpO1xuXG4gICAgY29uc3QgcGVuZGluZ1dyaXRlcyA9IGZsYXR0ZW4oXG4gICAgICAgIGZpbGVzLm1hcChmaWxlID0+IHtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbGVzLm1hcChhc3luYyBsb2NhbGUgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGggPSBqb2luKFxuICAgICAgICAgICAgICAgICAgICBtYWdlbnRvUm9vdCxcbiAgICAgICAgICAgICAgICAgICAgc3RhdGljRGlyLFxuICAgICAgICAgICAgICAgICAgICBsb2NhbGUsXG4gICAgICAgICAgICAgICAgICAgIGZpbGUucGF0aEZyb21Mb2NhbGVSb290LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYXdhaXQgd3JpdGVGaWxlV2l0aE1rRGlyKHBhdGgsIGZpbGUuc291cmNlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KSxcbiAgICApO1xuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwocGVuZGluZ1dyaXRlcyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHdyaXRlRmlsZVdpdGhNa0RpcihwYXRoOiBzdHJpbmcsIHNvdXJjZTogc3RyaW5nKSB7XG4gICAgY29uc3QgZGlyID0gZGlybmFtZShwYXRoKTtcbiAgICBhd2FpdCBta2RpcihkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgIGF3YWl0IHdyaXRlRmlsZShwYXRoLCBzb3VyY2UpO1xufVxuXG5mdW5jdGlvbiBnZXRUaGVtZUJ5SUQodGhlbWVJRDogc3RyaW5nLCB0aGVtZXM6IFJlY29yZDxzdHJpbmcsIFRoZW1lPikge1xuICAgIGNvbnN0IHRoZW1lID0gdGhlbWVzW3RoZW1lSURdO1xuICAgIGlmICghdGhlbWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEJhbGVyRXJyb3IoXG4gICAgICAgICAgICBgQXR0ZW1wdGVkIHRvIG9wdGltaXplIFwiJHt0aGVtZUlEfVwiLCBidXQgaXQgd2FzIGAgK1xuICAgICAgICAgICAgICAgICdub3QgZm91bmQgaW4gdGhlIHN0b3JlLicsXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoZW1lO1xufVxuXG5mdW5jdGlvbiB0aHJvd09uRGlzYWxsb3dlZFRoZW1lKHRoZW1lOiBUaGVtZSkge1xuICAgIGlmICh0aGVtZS5hcmVhICE9PSAnZnJvbnRlbmQnKSB7XG4gICAgICAgIHRocm93IG5ldyBCYWxlckVycm9yKFxuICAgICAgICAgICAgYENhbm5vdCBvcHRpbWl6ZSB0aGVtZSBcIiR7dGhlbWUudGhlbWVJRH1cIiBgICtcbiAgICAgICAgICAgICAgICAnYmVjYXVzZSBvbmx5IFwiZnJvbnRlbmRcIiB0aGVtZXMgYXJlIHN1cHBvcnRlZCBieSBiYWxlcicsXG4gICAgICAgICk7XG4gICAgfVxuICAgIGlmICh0aGVtZS50aGVtZUlEID09PSAnTWFnZW50by9ibGFuaycpIHtcbiAgICAgICAgLy8gT25seSByZWFzb24gd2UncmUgZG9pbmcgdGhpcyBjaGVjayBpcyBiZWNhdXNlIGl0J3MgbGlrZWx5XG4gICAgICAgIC8vIGEgbWlzdGFrZSA5OS45JSBvZiB0aGUgdGltZSBpZiB5b3UgdHJ5IHRvIGJ1bmRsZSBibGFua1xuICAgICAgICB0aHJvdyBuZXcgQmFsZXJFcnJvcihcbiAgICAgICAgICAgIGBPcHRpbWl6YXRpb24gb2YgXCJNYWdlbnRvL2JsYW5rXCIgaXMgbm90IHN1cHBvcnRlZGAsXG4gICAgICAgICk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZXRFbnRyeVBvaW50c0Zyb21Db25maWcoXG4gICAgcmVxdWlyZUNvbmZpZzogTWFnZW50b1JlcXVpcmVDb25maWcsXG4gICAgdGhlbWVJRDogc3RyaW5nLFxuKSB7XG4gICAgY29uc3QgZW50cmllcyA9IHJlcXVpcmVDb25maWcuZGVwcztcbiAgICBpZiAoQXJyYXkuaXNBcnJheShlbnRyaWVzKSAmJiBlbnRyaWVzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gZW50cmllcztcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgQmFsZXJFcnJvcihcbiAgICAgICAgYENvdWxkIG5vdCBmaW5kIGFueSBlbnRyeSBwb2ludHMgKFwiZGVwc1wiKSBjb25maWcgaW4gYCArXG4gICAgICAgICAgICBgXCJyZXF1aXJlanMtY29uZmlnLmpzXCIgZm9yIHRoZW1lIFwiJHt0aGVtZUlEfVwiYCxcbiAgICApO1xufVxuIl19