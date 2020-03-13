"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const trace_1 = require("./trace");
const path_1 = require("path");
const fsPromises_1 = require("./fsPromises");
const wrapP_1 = require("./wrapP");
const parseJavaScriptDeps_1 = require("./parseJavaScriptDeps");
const createRequireResolver_1 = require("./createRequireResolver");
const requireConfig_1 = require("./requireConfig");
const requireBuiltIns_1 = require("./requireBuiltIns");
/**
 * @summary Build a dependency graph of AMD modules, starting
 *          from a single entry module
 * @todo Implement shim support
 */
async function traceAMDDependencies(entryModuleIDs, requireConfig, baseDir) {
    const resolver = createRequireResolver_1.createRequireResolver(requireConfig);
    const visitQueue = new Set();
    const moduleCache = new Map();
    const graph = {};
    const warnings = [];
    const queueDependency = (moduleID, modulePath, issuer) => {
        if (graph.hasOwnProperty(moduleID)) {
            // If we've already seen this dependency, skip it
            return;
        }
        // Add empty entry to dependency graph
        graph[moduleID] = [];
        const path = path_1.join(baseDir, modulePath);
        if (path_1.extname(path) !== '.js') {
            // We're only tracing AMD dependencies. Since a non-JS file
            // can't have dependencies, we can skip the read and parse
            return;
        }
        visitQueue.add(moduleID);
        // the while loop used for BFS in this module processes things serially,
        // but we kick off file reads as soon as possible so the file is ready
        // when it's time to process
        const read = quietAsyncRejectionWarning(fsPromises_1.readFile(path, 'utf8'));
        moduleCache.set(moduleID, {
            read,
            path,
            issuer,
        });
    };
    const resolvedEntryIDs = [];
    // Seed the visitors list with entry points to start
    // the graph traversal with
    entryModuleIDs.forEach(entryID => {
        const resolved = resolver(entryID);
        resolvedEntryIDs.push(resolved.moduleID);
        queueDependency(resolved.moduleID, resolved.modulePath, '<entry point>');
        if (resolved.pluginID) {
            queueDependency(resolved.pluginID, resolved.pluginPath, resolved.moduleID);
        }
    });
    // Breadth-first search of the graph
    while (visitQueue.size) {
        const [moduleID] = visitQueue;
        visitQueue.delete(moduleID);
        trace_1.trace(`Preparing to analyze "${moduleID}" for dependencies`);
        const { read, path, issuer } = moduleCache.get(moduleID);
        const [err, source] = await wrapP_1.wrapP(read);
        if (err) {
            // Missing files are treated as warnings, rather than hard errors, because
            // a storefront is still usable (will just fall back to the network and
            // take a perf hit)
            warnings.push(unreadableDependencyWarning(moduleID, path, issuer));
            trace_1.trace(`Warning for missing dependency "${moduleID}", which was required by "${issuer}"`);
            continue;
        }
        const { deps } = parseJavaScriptDeps_1.parseJavaScriptDeps(source);
        if (deps.length) {
            trace_1.trace(`Discovered dependencies for "${moduleID}": ${deps.join(', ')}`);
        }
        // TODO: test coverage for mixins
        const mixins = requireConfig_1.getMixinsForModule(moduleID, requireConfig).map(mixin => resolver(mixin).moduleID);
        mixins.forEach(mixin => {
            const resolvedMixin = resolver(mixin);
            graph[moduleID].push(resolvedMixin.moduleID);
            queueDependency(resolvedMixin.moduleID, resolvedMixin.modulePath, '<mixin>');
        });
        deps.forEach(dep => {
            if (requireBuiltIns_1.REQUIRE_BUILT_INS.includes(dep)) {
                // We want data about built-in dependencies in the graph,
                // but we don't want to try to read them from disk, since
                // they come from the require runtime
                graph[moduleID].push(dep);
                return;
            }
            const result = resolver(dep, moduleID);
            // It's possible for a dependency to be a plugin without an associated
            // resource. Example: "domReady!"
            if (result.moduleID) {
                graph[moduleID].push(result.moduleID);
                queueDependency(result.moduleID, result.modulePath, moduleID);
            }
            if (result.pluginID) {
                graph[moduleID].push(result.pluginID);
                queueDependency(result.pluginID, result.pluginPath, result.moduleID);
            }
        });
    }
    return { graph, warnings, resolvedEntryIDs };
}
exports.traceAMDDependencies = traceAMDDependencies;
/**
 * @summary Unfortunately a decision was made in node.js core
 *          to spit warnings to stdout whenever a rejection
 *          handler has not been added synchronously to a promise,
 *          which is a pain when you're saving promises to be unwrapped.
 *          This opts-in to stopping those warnings on a per-promise basis
 * @see https://github.com/rsp/node-caught
 */
function quietAsyncRejectionWarning(promise) {
    promise.catch(() => { });
    return promise;
}
function unreadableDependencyWarning(resolvedID, path, issuer) {
    return {
        type: 'UnreadableDependencyWarning',
        resolvedID,
        path,
        issuer,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhY2VBTUREZXBlbmRlbmNpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdHJhY2VBTUREZXBlbmRlbmNpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7QUFFSCxtQ0FBZ0M7QUFDaEMsK0JBQXFDO0FBQ3JDLDZDQUF3QztBQUN4QyxtQ0FBZ0M7QUFPaEMsK0RBQTREO0FBQzVELG1FQUFnRTtBQUNoRSxtREFBcUQ7QUFDckQsdURBQXNEO0FBUXREOzs7O0dBSUc7QUFDSSxLQUFLLFVBQVUsb0JBQW9CLENBQ3RDLGNBQXdCLEVBQ3hCLGFBQW1DLEVBQ25DLE9BQWU7SUFFZixNQUFNLFFBQVEsR0FBRyw2Q0FBcUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN0RCxNQUFNLFVBQVUsR0FBZ0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUMxQyxNQUFNLFdBQVcsR0FBNEIsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUN2RCxNQUFNLEtBQUssR0FBYSxFQUFFLENBQUM7SUFDM0IsTUFBTSxRQUFRLEdBQTRCLEVBQUUsQ0FBQztJQUU3QyxNQUFNLGVBQWUsR0FBRyxDQUNwQixRQUFnQixFQUNoQixVQUFrQixFQUNsQixNQUFjLEVBQ2hCLEVBQUU7UUFDQSxJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDaEMsaURBQWlEO1lBQ2pELE9BQU87U0FDVjtRQUVELHNDQUFzQztRQUN0QyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRXJCLE1BQU0sSUFBSSxHQUFHLFdBQUksQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDdkMsSUFBSSxjQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxFQUFFO1lBQ3pCLDJEQUEyRDtZQUMzRCwwREFBMEQ7WUFDMUQsT0FBTztTQUNWO1FBRUQsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN6Qix3RUFB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VCxDQUFDO0FBQ04sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IMKpIE1hZ2VudG8sIEluYy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFNlZSBDT1BZSU5HLnR4dCBmb3IgbGljZW5zZSBkZXRhaWxzLlxuICovXG5cbmltcG9ydCB7IHRyYWNlIH0gZnJvbSAnLi90cmFjZSc7XG5pbXBvcnQgeyBleHRuYW1lLCBqb2luIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyByZWFkRmlsZSB9IGZyb20gJy4vZnNQcm9taXNlcyc7XG5pbXBvcnQgeyB3cmFwUCB9IGZyb20gJy4vd3JhcFAnO1xuaW1wb3J0IHtcbiAgICBNYWdlbnRvUmVxdWlyZUNvbmZpZyxcbiAgICBBTURHcmFwaCxcbiAgICBUcmFjZVJlc3VsdCxcbiAgICBVbnJlYWRhYmxlRGVwZW5kZW5jeVdhcm5pbmcsXG59IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHsgcGFyc2VKYXZhU2NyaXB0RGVwcyB9IGZyb20gJy4vcGFyc2VKYXZhU2NyaXB0RGVwcyc7XG5pbXBvcnQgeyBjcmVhdGVSZXF1aXJlUmVzb2x2ZXIgfSBmcm9tICcuL2NyZWF0ZVJlcXVpcmVSZXNvbHZlcic7XG5pbXBvcnQgeyBnZXRNaXhpbnNGb3JNb2R1bGUgfSBmcm9tICcuL3JlcXVpcmVDb25maWcnO1xuaW1wb3J0IHsgUkVRVUlSRV9CVUlMVF9JTlMgfSBmcm9tICcuL3JlcXVpcmVCdWlsdElucyc7XG5cbnR5cGUgQ2FjaGVFbnRyeSA9IHtcbiAgICByZWFkOiBQcm9taXNlPHN0cmluZz47XG4gICAgcGF0aDogc3RyaW5nO1xuICAgIGlzc3Vlcjogc3RyaW5nO1xufTtcblxuLyoqXG4gKiBAc3VtbWFyeSBCdWlsZCBhIGRlcGVuZGVuY3kgZ3JhcGggb2YgQU1EIG1vZHVsZXMsIHN0YXJ0aW5nXG4gKiAgICAgICAgICBmcm9tIGEgc2luZ2xlIGVudHJ5IG1vZHVsZVxuICogQHRvZG8gSW1wbGVtZW50IHNoaW0gc3VwcG9ydFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdHJhY2VBTUREZXBlbmRlbmNpZXMoXG4gICAgZW50cnlNb2R1bGVJRHM6IHN0cmluZ1tdLFxuICAgIHJlcXVpcmVDb25maWc6IE1hZ2VudG9SZXF1aXJlQ29uZmlnLFxuICAgIGJhc2VEaXI6IHN0cmluZyxcbik6IFByb21pc2U8VHJhY2VSZXN1bHQ+IHtcbiAgICBjb25zdCByZXNvbHZlciA9IGNyZWF0ZVJlcXVpcmVSZXNvbHZlcihyZXF1aXJlQ29uZmlnKTtcbiAgICBjb25zdCB2aXNpdFF1ZXVlOiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoKTtcbiAgICBjb25zdCBtb2R1bGVDYWNoZTogTWFwPHN0cmluZywgQ2FjaGVFbnRyeT4gPSBuZXcgTWFwKCk7XG4gICAgY29uc3QgZ3JhcGg6IEFNREdyYXBoID0ge307XG4gICAgY29uc3Qgd2FybmluZ3M6IFRyYWNlUmVzdWx0Wyd3YXJuaW5ncyddID0gW107XG5cbiAgICBjb25zdCBxdWV1ZURlcGVuZGVuY3kgPSAoXG4gICAgICAgIG1vZHVsZUlEOiBzdHJpbmcsXG4gICAgICAgIG1vZHVsZVBhdGg6IHN0cmluZyxcbiAgICAgICAgaXNzdWVyOiBzdHJpbmcsXG4gICAgKSA9PiB7XG4gICAgICAgIGlmIChncmFwaC5oYXNPd25Qcm9wZXJ0eShtb2R1bGVJRCkpIHtcbiAgICAgICAgICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgc2VlbiB0aGlzIGRlcGVuZGVuY3ksIHNraXAgaXRcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBlbXB0eSBlbnRyeSB0byBkZXBlbmRlbmN5IGdyYXBoXG4gICAgICAgIGdyYXBoW21vZHVsZUlEXSA9IFtdO1xuXG4gICAgICAgIGNvbnN0IHBhdGggPSBqb2luKGJhc2VEaXIsIG1vZHVsZVBhdGgpO1xuICAgICAgICBpZiAoZXh0bmFtZShwYXRoKSAhPT0gJy5qcycpIHtcbiAgICAgICAgICAgIC8vIFdlJ3JlIG9ubHkgdHJhY2luZyBBTUQgZGVwZW5kZW5jaWVzLiBTaW5jZSBhIG5vbi1KUyBmaWxlXG4gICAgICAgICAgICAvLyBjYW4ndCBoYXZlIGRlcGVuZGVuY2llcywgd2UgY2FuIHNraXAgdGhlIHJlYWQgYW5kIHBhcnNlXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2aXNpdFF1ZXVlLmFkZChtb2R1bGVJRCk7XG4gICAgICAgIC8vIHRoZSB3aGlsZSBsb29wIHVzZWQgZm9yIEJGUyBpbiB0aGlzIG1vZHVsZSBwcm9jZXNzZXMgdGhpbmdzIHNlcmlhbGx5LFxuICAgICAgICAvLyBidXQgd2Uga2ljayBvZmYgZmlsZSByZWFkcyBhcyBzb29uIGFzIHBvc3NpYmxlIHNvIHRoZSBmaWxlIGlzIHJlYWR5XG4gICAgICAgIC8vIHdoZW4gaXQncyB0aW1lIHRvIHByb2Nlc3NcbiAgICAgICAgY29uc3QgcmVhZCA9IHF1aWV0QXN5bmNSZWplY3Rpb25XYXJuaW5nKHJlYWRGaWxlKHBhdGgsICd1dGY4JykpO1xuICAgICAgICBtb2R1bGVDYWNoZS5zZXQobW9kdWxlSUQsIHtcbiAgICAgICAgICAgIHJlYWQsXG4gICAgICAgICAgICBwYXRoLFxuICAgICAgICAgICAgaXNzdWVyLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgY29uc3QgcmVzb2x2ZWRFbnRyeUlEczogc3RyaW5nW10gPSBbXTtcbiAgICAvLyBTZWVkIHRoZSB2aXNpdG9ycyBsaXN0IHdpdGggZW50cnkgcG9pbnRzIHRvIHN0YXJ0XG4gICAgLy8gdGhlIGdyYXBoIHRyYXZlcnNhbCB3aXRoXG4gICAgZW50cnlNb2R1bGVJRHMuZm9yRWFjaChlbnRyeUlEID0+IHtcbiAgICAgICAgY29uc3QgcmVzb2x2ZWQgPSByZXNvbHZlcihlbnRyeUlEKTtcbiAgICAgICAgcmVzb2x2ZWRFbnRyeUlEcy5wdXNoKHJlc29sdmVkLm1vZHVsZUlEKTtcbiAgICAgICAgcXVldWVEZXBlbmRlbmN5KFxuICAgICAgICAgICAgcmVzb2x2ZWQubW9kdWxlSUQsXG4gICAgICAgICAgICByZXNvbHZlZC5tb2R1bGVQYXRoLFxuICAgICAgICAgICAgJzxlbnRyeSBwb2ludD4nLFxuICAgICAgICApO1xuXG4gICAgICAgIGlmIChyZXNvbHZlZC5wbHVnaW5JRCkge1xuICAgICAgICAgICAgcXVldWVEZXBlbmRlbmN5KFxuICAgICAgICAgICAgICAgIHJlc29sdmVkLnBsdWdpbklELFxuICAgICAgICAgICAgICAgIHJlc29sdmVkLnBsdWdpblBhdGgsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWQubW9kdWxlSUQsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBCcmVhZHRoLWZpcnN0IHNlYXJjaCBvZiB0aGUgZ3JhcGhcbiAgICB3aGlsZSAodmlzaXRRdWV1ZS5zaXplKSB7XG4gICAgICAgIGNvbnN0IFttb2R1bGVJRF0gPSB2aXNpdFF1ZXVlO1xuICAgICAgICB2aXNpdFF1ZXVlLmRlbGV0ZShtb2R1bGVJRCk7XG4gICAgICAgIHRyYWNlKGBQcmVwYXJpbmcgdG8gYW5hbHl6ZSBcIiR7bW9kdWxlSUR9XCIgZm9yIGRlcGVuZGVuY2llc2ApO1xuXG4gICAgICAgIGNvbnN0IHsgcmVhZCwgcGF0aCwgaXNzdWVyIH0gPSBtb2R1bGVDYWNoZS5nZXQobW9kdWxlSUQpIGFzIENhY2hlRW50cnk7XG4gICAgICAgIGNvbnN0IFtlcnIsIHNvdXJjZV0gPSBhd2FpdCB3cmFwUChyZWFkKTtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgLy8gTWlzc2luZyBmaWxlcyBhcmUgdHJlYXRlZCBhcyB3YXJuaW5ncywgcmF0aGVyIHRoYW4gaGFyZCBlcnJvcnMsIGJlY2F1c2VcbiAgICAgICAgICAgIC8vIGEgc3RvcmVmcm9udCBpcyBzdGlsbCB1c2FibGUgKHdpbGwganVzdCBmYWxsIGJhY2sgdG8gdGhlIG5ldHdvcmsgYW5kXG4gICAgICAgICAgICAvLyB0YWtlIGEgcGVyZiBoaXQpXG4gICAgICAgICAgICB3YXJuaW5ncy5wdXNoKHVucmVhZGFibGVEZXBlbmRlbmN5V2FybmluZyhtb2R1bGVJRCwgcGF0aCwgaXNzdWVyKSk7XG4gICAgICAgICAgICB0cmFjZShcbiAgICAgICAgICAgICAgICBgV2FybmluZyBmb3IgbWlzc2luZyBkZXBlbmRlbmN5IFwiJHttb2R1bGVJRH1cIiwgd2hpY2ggd2FzIHJlcXVpcmVkIGJ5IFwiJHtpc3N1ZXJ9XCJgLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgeyBkZXBzIH0gPSBwYXJzZUphdmFTY3JpcHREZXBzKHNvdXJjZSBhcyBzdHJpbmcpO1xuICAgICAgICBpZiAoZGVwcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRyYWNlKFxuICAgICAgICAgICAgICAgIGBEaXNjb3ZlcmVkIGRlcGVuZGVuY2llcyBmb3IgXCIke21vZHVsZUlEfVwiOiAke2RlcHMuam9pbignLCAnKX1gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE86IHRlc3QgY292ZXJhZ2UgZm9yIG1peGluc1xuICAgICAgICBjb25zdCBtaXhpbnMgPSBnZXRNaXhpbnNGb3JNb2R1bGUobW9kdWxlSUQsIHJlcXVpcmVDb25maWcpLm1hcChcbiAgICAgICAgICAgIG1peGluID0+IHJlc29sdmVyKG1peGluKS5tb2R1bGVJRCxcbiAgICAgICAgKTtcblxuICAgICAgICBtaXhpbnMuZm9yRWFjaChtaXhpbiA9PiB7XG4gICAgICAgICAgICBjb25zdCByZXNvbHZlZE1peGluID0gcmVzb2x2ZXIobWl4aW4pO1xuICAgICAgICAgICAgZ3JhcGhbbW9kdWxlSURdLnB1c2gocmVzb2x2ZWRNaXhpbi5tb2R1bGVJRCk7XG4gICAgICAgICAgICBxdWV1ZURlcGVuZGVuY3koXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRNaXhpbi5tb2R1bGVJRCxcbiAgICAgICAgICAgICAgICByZXNvbHZlZE1peGluLm1vZHVsZVBhdGgsXG4gICAgICAgICAgICAgICAgJzxtaXhpbj4nLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGVwcy5mb3JFYWNoKGRlcCA9PiB7XG4gICAgICAgICAgICBpZiAoUkVRVUlSRV9CVUlMVF9JTlMuaW5jbHVkZXMoZGVwKSkge1xuICAgICAgICAgICAgICAgIC8vIFdlIHdhbnQgZGF0YSBhYm91dCBidWlsdC1pbiBkZXBlbmRlbmNpZXMgaW4gdGhlIGdyYXBoLFxuICAgICAgICAgICAgICAgIC8vIGJ1dCB3ZSBkb24ndCB3YW50IHRvIHRyeSB0byByZWFkIHRoZW0gZnJvbSBkaXNrLCBzaW5jZVxuICAgICAgICAgICAgICAgIC8vIHRoZXkgY29tZSBmcm9tIHRoZSByZXF1aXJlIHJ1bnRpbWVcbiAgICAgICAgICAgICAgICBncmFwaFttb2R1bGVJRF0ucHVzaChkZXApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gcmVzb2x2ZXIoZGVwLCBtb2R1bGVJRCk7XG4gICAgICAgICAgICAvLyBJdCdzIHBvc3NpYmxlIGZvciBhIGRlcGVuZGVuY3kgdG8gYmUgYSBwbHVnaW4gd2l0aG91dCBhbiBhc3NvY2lhdGVkXG4gICAgICAgICAgICAvLyByZXNvdXJjZS4gRXhhbXBsZTogXCJkb21SZWFkeSFcIlxuICAgICAgICAgICAgaWYgKHJlc3VsdC5tb2R1bGVJRCkge1xuICAgICAgICAgICAgICAgIGdyYXBoW21vZHVsZUlEXS5wdXNoKHJlc3VsdC5tb2R1bGVJRCk7XG4gICAgICAgICAgICAgICAgcXVldWVEZXBlbmRlbmN5KHJlc3VsdC5tb2R1bGVJRCwgcmVzdWx0Lm1vZHVsZVBhdGgsIG1vZHVsZUlEKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlc3VsdC5wbHVnaW5JRCkge1xuICAgICAgICAgICAgICAgIGdyYXBoW21vZHVsZUlEXS5wdXNoKHJlc3VsdC5wbHVnaW5JRCk7XG4gICAgICAgICAgICAgICAgcXVldWVEZXBlbmRlbmN5KFxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucGx1Z2luSUQsXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wbHVnaW5QYXRoLFxuICAgICAgICAgICAgICAgICAgICByZXN1bHQubW9kdWxlSUQsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgZ3JhcGgsIHdhcm5pbmdzLCByZXNvbHZlZEVudHJ5SURzIH07XG59XG5cbi8qKlxuICogQHN1bW1hcnkgVW5mb3J0dW5hdGVseSBhIGRlY2lzaW9uIHdhcyBtYWRlIGluIG5vZGUuanMgY29yZVxuICogICAgICAgICAgdG8gc3BpdCB3YXJuaW5ncyB0byBzdGRvdXQgd2hlbmV2ZXIgYSByZWplY3Rpb25cbiAqICAgICAgICAgIGhhbmRsZXIgaGFzIG5vdCBiZWVuIGFkZGVkIHN5bmNocm9ub3VzbHkgdG8gYSBwcm9taXNlLFxuICogICAgICAgICAgd2hpY2ggaXMgYSBwYWluIHdoZW4geW91J3JlIHNhdmluZyBwcm9taXNlcyB0byBiZSB1bndyYXBwZWQuXG4gKiAgICAgICAgICBUaGlzIG9wdHMtaW4gdG8gc3RvcHBpbmcgdGhvc2Ugd2FybmluZ3Mgb24gYSBwZXItcHJvbWlzZSBiYXNpc1xuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vcnNwL25vZGUtY2F1Z2h0XG4gKi9cbmZ1bmN0aW9uIHF1aWV0QXN5bmNSZWplY3Rpb25XYXJuaW5nPFQ+KHByb21pc2U6IFByb21pc2U8VD4pIHtcbiAgICBwcm9taXNlLmNhdGNoKCgpID0+IHt9KTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cblxuZnVuY3Rpb24gdW5yZWFkYWJsZURlcGVuZGVuY3lXYXJuaW5nKFxuICAgIHJlc29sdmVkSUQ6IHN0cmluZyxcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgaXNzdWVyOiBzdHJpbmcsXG4pOiBVbnJlYWRhYmxlRGVwZW5kZW5jeVdhcm5pbmcge1xuICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdVbnJlYWRhYmxlRGVwZW5kZW5jeVdhcm5pbmcnLFxuICAgICAgICByZXNvbHZlZElELFxuICAgICAgICBwYXRoLFxuICAgICAgICBpc3N1ZXIsXG4gICAgfTtcbn1cbiJdfQ==