"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const requireConfig_1 = require("./requireConfig");
const transformAMD_1 = require("./transformAMD");
const fsPromises_1 = require("./fsPromises");
const magic_string_1 = __importStar(require("magic-string"));
const createRequireResolver_1 = require("./createRequireResolver");
/**
 * @summary Create a bundle file (compatible with the RequireJS runtime)
 *          from a collection of module IDs
 */
async function createBundleFromDeps(bundleName, deps, baseDir, requireConfig, themeID) {
    const resolver = createRequireResolver_1.createRequireResolver(requireConfig);
    const transformedModules = await Promise.all(deps.map(d => getFinalModuleSource(d, baseDir, resolver, requireConfig)));
    // @ts-ignore
    const { bundle, depsWithInvalidShims } = createBundle(transformedModules.filter(mod => !mod.isInvalid));
    if (depsWithInvalidShims) {
        // TODO: surface in CLI at end of run
    }
    const bundleFilename = `${path_1.parse(bundleName).name}.js`;
    const sourcemap = bundle.generateMap({
        source: bundleFilename,
        includeContent: true,
        hires: true,
    });
    return {
        bundleFilename,
        bundle: bundle.toString(),
        map: sourcemap.toString(),
    };
}
exports.createBundleFromDeps = createBundleFromDeps;
// DO NOT BUNDLE THESE
const blacklistedDeps = [
    'prototype'
];
async function getFinalModuleSource(dep, baseDir, resolver, requireConfig) {
    const resolvedDep = resolver(dep);
    const path = path_1.join(baseDir, resolvedDep.modulePath);
    let source;
    try {
        if (blacklistedDeps.includes(dep)) {
            console.log(`Ignoring ${dep}`);
            throw new Error('No.');
        }
        source = await fsPromises_1.readFile(path, 'utf8');
    }
    catch (err) {
        return { dep, file: '', isInvalid: true };
    }
    const isText = resolvedDep.pluginID === 'text';
    const shims = requireConfig_1.getShimsForModule(dep, requireConfig);
    const hasDefine = transformAMD_1.isAMDWithDefine(source);
    const isNamed = transformAMD_1.isNamedAMD(source);
    const hasInvalidShim = hasDefine && !!shims;
    if (isText) {
        return { dep, file: transformAMD_1.wrapTextModule(dep, source), hasInvalidShim };
    }
    if (isNamed) {
        return { dep, file: new magic_string_1.default(source), hasInvalidShim };
    }
    if (!hasDefine) {
        if (shims) {
            return {
                dep,
                file: transformAMD_1.wrapShimmedModule(dep, source, shims),
                hasInvalidShim,
            };
        }
        if (!shims) {
            return {
                dep,
                file: transformAMD_1.wrapNonShimmedModule(dep, source),
                hasInvalidShim,
            };
        }
    }
    return { dep, file: transformAMD_1.renameModule(dep, source), hasInvalidShim };
}
function createBundle(modules) {
    const bundle = new magic_string_1.Bundle();
    const depsWithInvalidShims = [];
    bundle.prepend(`/* Generated by @magento/baler - ${new Date().toISOString()} */\n\n`);
    for (const { dep, file, hasInvalidShim } of modules) {
        bundle.addSource({
            filename: `../${dep}.js`,
            content: file,
        });
        if (hasInvalidShim)
            depsWithInvalidShims.push(dep);
    }
    return { bundle, depsWithInvalidShims };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlQnVuZGxlRnJvbURlcHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY3JlYXRlQnVuZGxlRnJvbURlcHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7Ozs7O0FBRUgsK0JBQTRDO0FBQzVDLG1EQUFvRDtBQUNwRCxpREFPd0I7QUFDeEIsNkNBQXdDO0FBRXhDLDZEQUFtRDtBQUNuRCxtRUFBZ0U7QUFFaEU7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLG9CQUFvQixDQUN0QyxVQUFrQixFQUNsQixJQUFjLEVBQ2QsT0FBZSxFQUNmLGFBQW1DLEVBQ25DLE9BQWU7SUFFZixNQUFNLFFBQVEsR0FBRyw2Q0FBcUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN0RCxNQUFNLGtCQUFrQixHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FDeEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUNULG9CQUFvQixDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUM1RCxDQUNKLENBQUM7SUFDRixhQUFhO0lBQ2IsTUFBTSxFQUFFLE1BQU0sRUFBRSxvQkFBb0IsRUFBRSxHQUFHLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQ3hHLElBQUksb0JBQW9CLEVBQUU7UUFDdEIscUNBQXFDO0tBQ3hDO0lBRUQsTUFBTSxjQUFjLEdBQUcsR0FBRyxZQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUM7SUFDdEQsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUNqQyxNQUFNLEVBQUUsY0FBYztRQUN0QixjQUFjLEVBQUUsSUFBSTtRQUNwQixLQUFLLEVBQUUsSUFBSTtLQUNkLENBQUMsQ0FBQztJQUVILE9BQU87UUFD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YixRQUFRLEVBQUUsTUFBTSxHQUFHLEtBQUs7WUFDeEIsT0FBTyxFQUFFLElBQUk7U0FDaEIsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxjQUFjO1lBQUUsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3REO0lBRUQsT0FBTyxFQUFFLE1BQU0sRUFBRSxvQkFBb0IsRUFBRSxDQUFDO0FBQzVDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCDCqSBNYWdlbnRvLCBJbmMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBTZWUgQ09QWUlORy50eHQgZm9yIGxpY2Vuc2UgZGV0YWlscy5cbiAqL1xuXG5pbXBvcnQgeyBleHRuYW1lLCBwYXJzZSwgam9pbiB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZ2V0U2hpbXNGb3JNb2R1bGUgfSBmcm9tICcuL3JlcXVpcmVDb25maWcnO1xuaW1wb3J0IHtcbiAgICB3cmFwVGV4dE1vZHVsZSxcbiAgICBpc05hbWVkQU1ELFxuICAgIGlzQU1EV2l0aERlZmluZSxcbiAgICB3cmFwU2hpbW1lZE1vZHVsZSxcbiAgICB3cmFwTm9uU2hpbW1lZE1vZHVsZSxcbiAgICByZW5hbWVNb2R1bGUsXG59IGZyb20gJy4vdHJhbnNmb3JtQU1EJztcbmltcG9ydCB7IHJlYWRGaWxlIH0gZnJvbSAnLi9mc1Byb21pc2VzJztcbmltcG9ydCB7IE1hZ2VudG9SZXF1aXJlQ29uZmlnIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgTWFnaWNTdHJpbmcsIHsgQnVuZGxlIH0gZnJvbSAnbWFnaWMtc3RyaW5nJztcbmltcG9ydCB7IGNyZWF0ZVJlcXVpcmVSZXNvbHZlciB9IGZyb20gJy4vY3JlYXRlUmVxdWlyZVJlc29sdmVyJztcblxuLyoqXG4gKiBAc3VtbWFyeSBDcmVhdGUgYSBidW5kbGUgZmlsZSAoY29tcGF0aWJsZSB3aXRoIHRoZSBSZXF1aXJlSlMgcnVudGltZSlcbiAqICAgICAgICAgIGZyb20gYSBjb2xsZWN0aW9uIG9mIG1vZHVsZSBJRHNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUJ1bmRsZUZyb21EZXBzKFxuICAgIGJ1bmRsZU5hbWU6IHN0cmluZyxcbiAgICBkZXBzOiBzdHJpbmdbXSxcbiAgICBiYXNlRGlyOiBzdHJpbmcsXG4gICAgcmVxdWlyZUNvbmZpZzogTWFnZW50b1JlcXVpcmVDb25maWcsXG4gICAgdGhlbWVJRDogc3RyaW5nLFxuKSB7XG4gICAgY29uc3QgcmVzb2x2ZXIgPSBjcmVhdGVSZXF1aXJlUmVzb2x2ZXIocmVxdWlyZUNvbmZpZyk7XG4gICAgY29uc3QgdHJhbnNmb3JtZWRNb2R1bGVzID0gYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICAgIGRlcHMubWFwKGQgPT5cbiAgICAgICAgICAgIGdldEZpbmFsTW9kdWxlU291cmNlKGQsIGJhc2VEaXIsIHJlc29sdmVyLCByZXF1aXJlQ29uZmlnKSxcbiAgICAgICAgKSxcbiAgICApO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBjb25zdCB7IGJ1bmRsZSwgZGVwc1dpdGhJbnZhbGlkU2hpbXMgfSA9IGNyZWF0ZUJ1bmRsZSh0cmFuc2Zvcm1lZE1vZHVsZXMuZmlsdGVyKG1vZCA9PiAhbW9kLmlzSW52YWxpZCkpO1xuICAgIGlmIChkZXBzV2l0aEludmFsaWRTaGltcykge1xuICAgICAgICAvLyBUT0RPOiBzdXJmYWNlIGluIENMSSBhdCBlbmQgb2YgcnVuXG4gICAgfVxuXG4gICAgY29uc3QgYnVuZGxlRmlsZW5hbWUgPSBgJHtwYXJzZShidW5kbGVOYW1lKS5uYW1lfS5qc2A7XG4gICAgY29uc3Qgc291cmNlbWFwID0gYnVuZGxlLmdlbmVyYXRlTWFwKHtcbiAgICAgICAgc291cmNlOiBidW5kbGVGaWxlbmFtZSxcbiAgICAgICAgaW5jbHVkZUNvbnRlbnQ6IHRydWUsXG4gICAgICAgIGhpcmVzOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgYnVuZGxlRmlsZW5hbWUsXG4gICAgICAgIGJ1bmRsZTogYnVuZGxlLnRvU3RyaW5nKCksXG4gICAgICAgIG1hcDogc291cmNlbWFwLnRvU3RyaW5nKCksXG4gICAgfTtcbn1cblxuLy8gRE8gTk9UIEJVTkRMRSBUSEVTRVxuY29uc3QgYmxhY2tsaXN0ZWREZXBzID0gW1xuICAgICdwcm90b3R5cGUnXG5dO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRGaW5hbE1vZHVsZVNvdXJjZShcbiAgICBkZXA6IHN0cmluZyxcbiAgICBiYXNlRGlyOiBzdHJpbmcsXG4gICAgcmVzb2x2ZXI6IFJldHVyblR5cGU8dHlwZW9mIGNyZWF0ZVJlcXVpcmVSZXNvbHZlcj4sXG4gICAgcmVxdWlyZUNvbmZpZzogTWFnZW50b1JlcXVpcmVDb25maWcsXG4pIHtcbiAgICBjb25zdCByZXNvbHZlZERlcCA9IHJlc29sdmVyKGRlcCk7XG4gICAgY29uc3QgcGF0aCA9IGpvaW4oYmFzZURpciwgcmVzb2x2ZWREZXAubW9kdWxlUGF0aCk7XG4gICAgbGV0IHNvdXJjZTtcbiAgICB0cnkge1xuICAgICAgICBpZiAoYmxhY2tsaXN0ZWREZXBzLmluY2x1ZGVzKGRlcCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBJZ25vcmluZyAke2RlcH1gKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm8uJyk7XG4gICAgICAgIH1cbiAgICAgICAgc291cmNlID0gYXdhaXQgcmVhZEZpbGUocGF0aCwgJ3V0ZjgnKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIHsgZGVwLCBmaWxlOiAnJywgaXNJbnZhbGlkOiB0cnVlIH07XG4gICAgfVxuICAgIGNvbnN0IGlzVGV4dCA9IHJlc29sdmVkRGVwLnBsdWdpbklEID09PSAndGV4dCc7XG4gICAgY29uc3Qgc2hpbXMgPSBnZXRTaGltc0Zvck1vZHVsZShkZXAsIHJlcXVpcmVDb25maWcpO1xuICAgIGNvbnN0IGhhc0RlZmluZSA9IGlzQU1EV2l0aERlZmluZShzb3VyY2UpO1xuICAgIGNvbnN0IGlzTmFtZWQgPSBpc05hbWVkQU1EKHNvdXJjZSk7XG4gICAgY29uc3QgaGFzSW52YWxpZFNoaW0gPSBoYXNEZWZpbmUgJiYgISFzaGltcztcblxuICAgIGlmIChpc1RleHQpIHtcbiAgICAgICAgcmV0dXJuIHsgZGVwLCBmaWxlOiB3cmFwVGV4dE1vZHVsZShkZXAsIHNvdXJjZSksIGhhc0ludmFsaWRTaGltIH07XG4gICAgfVxuXG4gICAgaWYgKGlzTmFtZWQpIHtcbiAgICAgICAgcmV0dXJuIHsgZGVwLCBmaWxlOiBuZXcgTWFnaWNTdHJpbmcoc291cmNlKSwgaGFzSW52YWxpZFNoaW0gfTtcbiAgICB9XG5cbiAgICBpZiAoIWhhc0RlZmluZSkge1xuICAgICAgICBpZiAoc2hpbXMpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGVwLFxuICAgICAgICAgICAgICAgIGZpbGU6IHdyYXBTaGltbWVkTW9kdWxlKGRlcCwgc291cmNlLCBzaGltcyksXG4gICAgICAgICAgICAgICAgaGFzSW52YWxpZFNoaW0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzaGltcykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkZXAsXG4gICAgICAgICAgICAgICAgZmlsZTogd3JhcE5vblNoaW1tZWRNb2R1bGUoZGVwLCBzb3VyY2UpLFxuICAgICAgICAgICAgICAgIGhhc0ludmFsaWRTaGltLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7IGRlcCwgZmlsZTogcmVuYW1lTW9kdWxlKGRlcCwgc291cmNlKSwgaGFzSW52YWxpZFNoaW0gfTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQnVuZGxlKFxuICAgIG1vZHVsZXM6IHsgZGVwOiBzdHJpbmc7IGZpbGU6IE1hZ2ljU3RyaW5nOyBoYXNJbnZhbGlkU2hpbTogYm9vbGVhbiB9W10sXG4pIHtcbiAgICBjb25zdCBidW5kbGUgPSBuZXcgQnVuZGxlKCk7XG4gICAgY29uc3QgZGVwc1dpdGhJbnZhbGlkU2hpbXM6IHN0cmluZ1tdID0gW107XG5cbiAgICBidW5kbGUucHJlcGVuZChcbiAgICAgICAgYC8qIEdlbmVyYXRlZCBieSBAbWFnZW50by9iYWxlciAtICR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfSAqL1xcblxcbmAsXG4gICAgKTtcblxuICAgIGZvciAoY29uc3QgeyBkZXAsIGZpbGUsIGhhc0ludmFsaWRTaGltIH0gb2YgbW9kdWxlcykge1xuICAgICAgICBidW5kbGUuYWRkU291cmNlKHtcbiAgICAgICAgICAgIGZpbGVuYW1lOiBgLi4vJHtkZXB9LmpzYCxcbiAgICAgICAgICAgIGNvbnRlbnQ6IGZpbGUsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoaGFzSW52YWxpZFNoaW0pIGRlcHNXaXRoSW52YWxpZFNoaW1zLnB1c2goZGVwKTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBidW5kbGUsIGRlcHNXaXRoSW52YWxpZFNoaW1zIH07XG59XG4iXX0=