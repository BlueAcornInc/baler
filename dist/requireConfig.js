"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vm_1 = __importDefault(require("vm"));
const path_1 = require("path");
const trace_1 = require("./trace");
const fs_1 = require("fs");
const fsPromises_1 = require("./fsPromises");
const BalerError_1 = require("./BalerError");
const requirejs = fs_1.readFileSync(require.resolve('requirejs/require.js'), 'utf8');
/**
 * @summary Reads and evaluates a Magento RequireJS config, which is
 *          a file containing `n` successive calls to `require.config`,
 *          wrapped in IIFEs. Various tricks are necessary to get all
 *          the pieces of the config that we need.
 *
 *          This uses node's `vm` module, which can be incredibly
 *          expensive. Do _not_ call in a loop. Instead, create
 *          1 resolver and re-use it
 */
async function getRequireConfigFromDir(path) {
    const filepath = path_1.join(path, 'requirejs-config.js');
    const rawRequireConfig = await fsPromises_1.readFile(filepath, 'utf8').catch(() => '');
    if (!rawRequireConfig) {
        throw new BalerError_1.BalerError(`Failed reading RequireJS config at path "${path}"`);
    }
    try {
        const requireConfig = evaluateRawConfig(rawRequireConfig);
        return { rawRequireConfig, requireConfig };
    }
    catch (err) {
        throw new BalerError_1.BalerError(`Failed evaluating RequireJS config at path "${path}".\nError: ${err}`);
    }
}
exports.getRequireConfigFromDir = getRequireConfigFromDir;
function evaluateRawConfig(rawConfig) {
    trace_1.trace('Evaluating raw "requirejs-config.js"');
    const sandbox = Object.create(null);
    // Support property access on window.
    // https://github.com/DrewML/baler/issues/9
    sandbox.window = {};
    vm_1.default.createContext(sandbox);
    // Set up RequireJS in the VM
    vm_1.default.runInContext(requirejs, sandbox);
    // RequireJS immediately fetches values in `deps`, and does not
    // keep them around in the config. Let's monkey-patch the `config`
    // function to capture them
    const entryDeps = [];
    const oldConfigFn = sandbox.require.config;
    sandbox.require.config = (conf) => {
        if (conf.deps)
            entryDeps.push(...conf.deps);
        return oldConfigFn(conf);
    };
    vm_1.default.runInContext(rawConfig, sandbox);
    const config = sandbox.require.s.contexts._.config;
    config.deps = entryDeps;
    trace_1.trace(`Evaluated requirejs-config.js. Results: ${JSON.stringify(config)}`);
    return config;
}
function getMixinsForModule(moduleID, requireConfig) {
    const mixins = requireConfig.config && requireConfig.config.mixins;
    if (!mixins)
        return [];
    const assignedMixins = mixins[moduleID];
    if (!assignedMixins)
        return [];
    const discoveredMixins = [];
    for (const [dep, enabled] of Object.entries(assignedMixins)) {
        if (enabled)
            discoveredMixins.push(dep);
    }
    return discoveredMixins;
}
exports.getMixinsForModule = getMixinsForModule;
/**
 * @summary Normalize the various ways a shim config can be defined
 */
function getShimsForModule(moduleID, requireConfig) {
    const shims = requireConfig.shim && requireConfig.shim[moduleID];
    if (!shims)
        return;
    if (Array.isArray(shims)) {
        return { deps: shims };
    }
    return shims;
}
exports.getShimsForModule = getShimsForModule;
/**
 * @summary Add `bundles` configuration to an existing
 *          `requirejs-config.js`, to prevent Require
 *          from going to the network to load modules
 *          that are in-flight inside of a bundle
 * @todo hardcoded `balerbundles` is also hardcoded in `index.ts`
 */
function generateBundleRequireConfig(rawConfig, bundleID, bundledDeps, additionalBundles) {
    let additional = '';
    for (const [mod, deps] of additionalBundles) {
        additional += `'balerbundles/core-${mod}': ${JSON.stringify(deps, null, 2)},\n`;
    }
    // TODO: Deal with formatting of this JS better. See `requireConfig.unit.js`
    // for an example of how bad the formatting currently looks
    return `(function() {
    // Injected by @magento/baler. This config
    // tells RequireJS which modules are in the
    // bundle, to prevent require from trying to
    // load bundled modules from the network
    require.config({
        bundles: {
            'balerbundles/${bundleID}': ${JSON.stringify(bundledDeps, null, 2)},
            ${additional}
        }
    });
})();
${rawConfig}`;
}
exports.generateBundleRequireConfig = generateBundleRequireConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWlyZUNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9yZXF1aXJlQ29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7Ozs7O0FBRUgsNENBQW9CO0FBQ3BCLCtCQUE0QjtBQUM1QixtQ0FBZ0M7QUFDaEMsMkJBQWtDO0FBQ2xDLDZDQUF3QztBQUV4Qyw2Q0FBMEM7QUFFMUMsTUFBTSxTQUFTLEdBQUcsaUJBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFFaEY7Ozs7Ozs7OztHQVNHO0FBQ0ksS0FBSyxVQUFVLHVCQUF1QixDQUFDLElBQVk7SUFDdEQsTUFBTSxRQUFRLEdBQUcsV0FBSSxDQUFDLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0lBQ25ELE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxxQkFBUSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFO1FBQ25CLE1BQU0sSUFBSSx1QkFBVSxDQUNoQiw0Q0FBNEMsSUFBSSxHQUFHLENBQ3RELENBQUM7S0FDTDtJQUVELElBQUk7UUFDQSxNQUFNLGFBQWEsR0FBRyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzFELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsQ0FBQztLQUM5QztJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsTUFBTSxJQUFJLHVCQUFVLENBQ2hCLCtDQUErQyxJQUFJLGNBQWMsR0FBRyxFQUFFLENBQ3pFLENBQUM7S0FDTDtBQUNMLENBQUM7QUFqQkQsMERBaUJDO0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxTQUFpQjtJQUN4QyxhQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQztJQUU5QyxNQUFNLE9BQU8sR0FBeUMs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Q0FBQztLQUNuRjtJQUVELDRFQUE0RTtJQUM1RSwyREFBMkQ7SUFDM0QsT0FBTzs7Ozs7Ozs0QkFPaUIsUUFBUSxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7Y0FDaEUsVUFBVTs7OztFQUl0QixTQUFTLEVBQUUsQ0FBQztBQUNkLENBQUM7QUEzQkQsa0VBMkJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgwqkgTWFnZW50bywgSW5jLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogU2VlIENPUFlJTkcudHh0IGZvciBsaWNlbnNlIGRldGFpbHMuXG4gKi9cblxuaW1wb3J0IHZtIGZyb20gJ3ZtJztcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IHRyYWNlIH0gZnJvbSAnLi90cmFjZSc7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgeyByZWFkRmlsZSB9IGZyb20gJy4vZnNQcm9taXNlcyc7XG5pbXBvcnQgeyBNYWdlbnRvUmVxdWlyZUNvbmZpZywgU2hpbSB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHsgQmFsZXJFcnJvciB9IGZyb20gJy4vQmFsZXJFcnJvcic7XG5cbmNvbnN0IHJlcXVpcmVqcyA9IHJlYWRGaWxlU3luYyhyZXF1aXJlLnJlc29sdmUoJ3JlcXVpcmVqcy9yZXF1aXJlLmpzJyksICd1dGY4Jyk7XG5cbi8qKlxuICogQHN1bW1hcnkgUmVhZHMgYW5kIGV2YWx1YXRlcyBhIE1hZ2VudG8gUmVxdWlyZUpTIGNvbmZpZywgd2hpY2ggaXNcbiAqICAgICAgICAgIGEgZmlsZSBjb250YWluaW5nIGBuYCBzdWNjZXNzaXZlIGNhbGxzIHRvIGByZXF1aXJlLmNvbmZpZ2AsXG4gKiAgICAgICAgICB3cmFwcGVkIGluIElJRkVzLiBWYXJpb3VzIHRyaWNrcyBhcmUgbmVjZXNzYXJ5IHRvIGdldCBhbGxcbiAqICAgICAgICAgIHRoZSBwaWVjZXMgb2YgdGhlIGNvbmZpZyB0aGF0IHdlIG5lZWQuXG4gKlxuICogICAgICAgICAgVGhpcyB1c2VzIG5vZGUncyBgdm1gIG1vZHVsZSwgd2hpY2ggY2FuIGJlIGluY3JlZGlibHlcbiAqICAgICAgICAgIGV4cGVuc2l2ZS4gRG8gX25vdF8gY2FsbCBpbiBhIGxvb3AuIEluc3RlYWQsIGNyZWF0ZVxuICogICAgICAgICAgMSByZXNvbHZlciBhbmQgcmUtdXNlIGl0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRSZXF1aXJlQ29uZmlnRnJvbURpcihwYXRoOiBzdHJpbmcpIHtcbiAgICBjb25zdCBmaWxlcGF0aCA9IGpvaW4ocGF0aCwgJ3JlcXVpcmVqcy1jb25maWcuanMnKTtcbiAgICBjb25zdCByYXdSZXF1aXJlQ29uZmlnID0gYXdhaXQgcmVhZEZpbGUoZmlsZXBhdGgsICd1dGY4JykuY2F0Y2goKCkgPT4gJycpO1xuICAgIGlmICghcmF3UmVxdWlyZUNvbmZpZykge1xuICAgICAgICB0aHJvdyBuZXcgQmFsZXJFcnJvcihcbiAgICAgICAgICAgIGBGYWlsZWQgcmVhZGluZyBSZXF1aXJlSlMgY29uZmlnIGF0IHBhdGggXCIke3BhdGh9XCJgLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlcXVpcmVDb25maWcgPSBldmFsdWF0ZVJhd0NvbmZpZyhyYXdSZXF1aXJlQ29uZmlnKTtcbiAgICAgICAgcmV0dXJuIHsgcmF3UmVxdWlyZUNvbmZpZywgcmVxdWlyZUNvbmZpZyB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0aHJvdyBuZXcgQmFsZXJFcnJvcihcbiAgICAgICAgICAgIGBGYWlsZWQgZXZhbHVhdGluZyBSZXF1aXJlSlMgY29uZmlnIGF0IHBhdGggXCIke3BhdGh9XCIuXFxuRXJyb3I6ICR7ZXJyfWAsXG4gICAgICAgICk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBldmFsdWF0ZVJhd0NvbmZpZyhyYXdDb25maWc6IHN0cmluZykge1xuICAgIHRyYWNlKCdFdmFsdWF0aW5nIHJhdyBcInJlcXVpcmVqcy1jb25maWcuanNcIicpO1xuXG4gICAgY29uc3Qgc2FuZGJveDogeyByZXF1aXJlOiBSZXF1aXJlOyB3aW5kb3c6IE9iamVjdCB9ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAvLyBTdXBwb3J0IHByb3BlcnR5IGFjY2VzcyBvbiB3aW5kb3cuXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL0RyZXdNTC9iYWxlci9pc3N1ZXMvOVxuICAgIHNhbmRib3gud2luZG93ID0ge307XG4gICAgdm0uY3JlYXRlQ29udGV4dChzYW5kYm94KTtcblxuICAgIC8vIFNldCB1cCBSZXF1aXJlSlMgaW4gdGhlIFZNXG4gICAgdm0ucnVuSW5Db250ZXh0KHJlcXVpcmVqcywgc2FuZGJveCk7XG5cbiAgICAvLyBSZXF1aXJlSlMgaW1tZWRpYXRlbHkgZmV0Y2hlcyB2YWx1ZXMgaW4gYGRlcHNgLCBhbmQgZG9lcyBub3RcbiAgICAvLyBrZWVwIHRoZW0gYXJvdW5kIGluIHRoZSBjb25maWcuIExldCdzIG1vbmtleS1wYXRjaCB0aGUgYGNvbmZpZ2BcbiAgICAvLyBmdW5jdGlvbiB0byBjYXB0dXJlIHRoZW1cbiAgICBjb25zdCBlbnRyeURlcHM6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3Qgb2xkQ29uZmlnRm4gPSBzYW5kYm94LnJlcXVpcmUuY29uZmlnO1xuICAgIHNhbmRib3gucmVxdWlyZS5jb25maWcgPSAoY29uZjogTWFnZW50b1JlcXVpcmVDb25maWcpID0+IHtcbiAgICAgICAgaWYgKGNvbmYuZGVwcykgZW50cnlEZXBzLnB1c2goLi4uY29uZi5kZXBzKTtcbiAgICAgICAgcmV0dXJuIG9sZENvbmZpZ0ZuKGNvbmYpO1xuICAgIH07XG5cbiAgICB2bS5ydW5JbkNvbnRleHQocmF3Q29uZmlnLCBzYW5kYm94KTtcbiAgICBjb25zdCBjb25maWcgPSBzYW5kYm94LnJlcXVpcmUucy5jb250ZXh0cy5fLmNvbmZpZyBhcyBNYWdlbnRvUmVxdWlyZUNvbmZpZztcbiAgICBjb25maWcuZGVwcyA9IGVudHJ5RGVwcztcblxuICAgIHRyYWNlKGBFdmFsdWF0ZWQgcmVxdWlyZWpzLWNvbmZpZy5qcy4gUmVzdWx0czogJHtKU09OLnN0cmluZ2lmeShjb25maWcpfWApO1xuXG4gICAgcmV0dXJuIGNvbmZpZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE1peGluc0Zvck1vZHVsZShcbiAgICBtb2R1bGVJRDogc3RyaW5nLFxuICAgIHJlcXVpcmVDb25maWc6IE1hZ2VudG9SZXF1aXJlQ29uZmlnLFxuKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IG1peGlucyA9IHJlcXVpcmVDb25maWcuY29uZmlnICYmIHJlcXVpcmVDb25maWcuY29uZmlnLm1peGlucztcbiAgICBpZiAoIW1peGlucykgcmV0dXJuIFtdO1xuXG4gICAgY29uc3QgYXNzaWduZWRNaXhpbnMgPSBtaXhpbnNbbW9kdWxlSURdO1xuICAgIGlmICghYXNzaWduZWRNaXhpbnMpIHJldHVybiBbXTtcblxuICAgIGNvbnN0IGRpc2NvdmVyZWRNaXhpbnMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IFtkZXAsIGVuYWJsZWRdIG9mIE9iamVjdC5lbnRyaWVzKGFzc2lnbmVkTWl4aW5zKSkge1xuICAgICAgICBpZiAoZW5hYmxlZCkgZGlzY292ZXJlZE1peGlucy5wdXNoKGRlcCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRpc2NvdmVyZWRNaXhpbnM7XG59XG5cbi8qKlxuICogQHN1bW1hcnkgTm9ybWFsaXplIHRoZSB2YXJpb3VzIHdheXMgYSBzaGltIGNvbmZpZyBjYW4gYmUgZGVmaW5lZFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2hpbXNGb3JNb2R1bGUoXG4gICAgbW9kdWxlSUQ6IHN0cmluZyxcbiAgICByZXF1aXJlQ29uZmlnOiBNYWdlbnRvUmVxdWlyZUNvbmZpZyxcbik6IFNoaW0gfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHNoaW1zID0gcmVxdWlyZUNvbmZpZy5zaGltICYmIHJlcXVpcmVDb25maWcuc2hpbVttb2R1bGVJRF07XG4gICAgaWYgKCFzaGltcykgcmV0dXJuO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc2hpbXMpKSB7XG4gICAgICAgIHJldHVybiB7IGRlcHM6IHNoaW1zIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHNoaW1zO1xufVxuXG4vKipcbiAqIEBzdW1tYXJ5IEFkZCBgYnVuZGxlc2AgY29uZmlndXJhdGlvbiB0byBhbiBleGlzdGluZ1xuICogICAgICAgICAgYHJlcXVpcmVqcy1jb25maWcuanNgLCB0byBwcmV2ZW50IFJlcXVpcmVcbiAqICAgICAgICAgIGZyb20gZ29pbmcgdG8gdGhlIG5ldHdvcmsgdG8gbG9hZCBtb2R1bGVzXG4gKiAgICAgICAgICB0aGF0IGFyZSBpbi1mbGlnaHQgaW5zaWRlIG9mIGEgYnVuZGxlXG4gKiBAdG9kbyBoYXJkY29kZWQgYGJhbGVyYnVuZGxlc2AgaXMgYWxzbyBoYXJkY29kZWQgaW4gYGluZGV4LnRzYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVCdW5kbGVSZXF1aXJlQ29uZmlnKFxuICAgIHJhd0NvbmZpZzogc3RyaW5nLFxuICAgIGJ1bmRsZUlEOiBzdHJpbmcsXG4gICAgYnVuZGxlZERlcHM6IHN0cmluZ1tdLFxuICAgIGFkZGl0aW9uYWxCdW5kbGVzOiBNYXA8c3RyaW5nLCBzdHJpbmdbXT5cbikge1xuICAgIGxldCBhZGRpdGlvbmFsID0gJyc7XG5cbiAgICBmb3IgKGNvbnN0IFttb2QsIGRlcHNdIG9mIGFkZGl0aW9uYWxCdW5kbGVzKSB7XG4gICAgICAgIGFkZGl0aW9uYWwgKz0gYCdiYWxlcmJ1bmRsZXMvY29yZS0ke21vZH0nOiAke0pTT04uc3RyaW5naWZ5KGRlcHMsIG51bGwsIDIpfSxcXG5gO1xuICAgIH1cblxuICAgIC8vIFRPRE86IERlYWwgd2l0aCBmb3JtYXR0aW5nIG9mIHRoaXMgSlMgYmV0dGVyLiBTZWUgYHJlcXVpcmVDb25maWcudW5pdC5qc2BcbiAgICAvLyBmb3IgYW4gZXhhbXBsZSBvZiBob3cgYmFkIHRoZSBmb3JtYXR0aW5nIGN1cnJlbnRseSBsb29rc1xuICAgIHJldHVybiBgKGZ1bmN0aW9uKCkge1xuICAgIC8vIEluamVjdGVkIGJ5IEBtYWdlbnRvL2JhbGVyLiBUaGlzIGNvbmZpZ1xuICAgIC8vIHRlbGxzIFJlcXVpcmVKUyB3aGljaCBtb2R1bGVzIGFyZSBpbiB0aGVcbiAgICAvLyBidW5kbGUsIHRvIHByZXZlbnQgcmVxdWlyZSBmcm9tIHRyeWluZyB0b1xuICAgIC8vIGxvYWQgYnVuZGxlZCBtb2R1bGVzIGZyb20gdGhlIG5ldHdvcmtcbiAgICByZXF1aXJlLmNvbmZpZyh7XG4gICAgICAgIGJ1bmRsZXM6IHtcbiAgICAgICAgICAgICdiYWxlcmJ1bmRsZXMvJHtidW5kbGVJRH0nOiAke0pTT04uc3RyaW5naWZ5KGJ1bmRsZWREZXBzLCBudWxsLCAyKX0sXG4gICAgICAgICAgICAke2FkZGl0aW9uYWx9XG4gICAgICAgIH1cbiAgICB9KTtcbn0pKCk7XG4ke3Jhd0NvbmZpZ31gO1xufVxuIl19