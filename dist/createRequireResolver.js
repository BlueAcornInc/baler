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
const trace_1 = require("./trace");
const fs_1 = require("fs");
const parseModuleID_1 = require("./parseModuleID");
// The whole point of this module is to piggy back on
// RequireJS's path resolver so we don't have to reimplement
// it. Unfortunately the lib is not CommonJS or ES module friendly,
// so we have to use some hacks.
const requirejs = fs_1.readFileSync(require.resolve('requirejs/require.js'), 'utf8');
/**
 * @summary Create a file path resolver using the API exposed by RequireJS,
 *          taking into account paths/map/etc config
 */
function createRequireResolver(requireConfig) {
    const sandbox = {};
    // RequireJS is targeted at browsers, so it doesn't
    // have a CommonJS version, and just sets a global.
    // This is a quick hack to get what we need off that global
    vm_1.default.runInNewContext(requirejs, sandbox);
    sandbox.require.config({ ...requireConfig, baseUrl: '' });
    const makeModuleMap = sandbox.require.s.contexts._.makeModuleMap;
    const toUrl = sandbox.require.s.contexts._.require.toUrl;
    const resolver = (requestID, issuingModule = '') => {
        trace_1.trace(`Resolving dependency "${requestID}" from "${issuingModule ||
            'unknown source'}"`);
        const { id, plugin } = parseModuleID_1.parseModuleID(requestID);
        const map = {
            moduleID: '',
            modulePath: '',
            pluginID: '',
            pluginPath: '',
        };
        if (plugin) {
            const { moduleID, modulePath } = resolver(plugin);
            map.pluginID = moduleID;
            map.pluginPath = modulePath;
        }
        if (id) {
            const parentModuleMap = {
                id: issuingModule,
                name: issuingModule,
                originalName: issuingModule,
                unnormalized: false,
                url: toUrl(issuingModule),
            };
            const result = makeModuleMap(id, parentModuleMap, false, true);
            map.moduleID = map.pluginID
                ? `${map.pluginID}!${result.id}`
                : result.id;
            map.modulePath = `${toUrl(result.id)}${map.pluginID === 'text' ? '' : '.js'}`;
        }
        return map;
    };
    return resolver;
}
exports.createRequireResolver = createRequireResolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlUmVxdWlyZVJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NyZWF0ZVJlcXVpcmVSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7OztBQUVILDRDQUFvQjtBQUNwQixtQ0FBZ0M7QUFFaEMsMkJBQWtDO0FBQ2xDLG1EQUFnRDtBQUVoRCxxREFBcUQ7QUFDckQsNERBQTREO0FBQzVELG1FQUFtRTtBQUNuRSxnQ0FBZ0M7QUFFaEMsTUFBTSxTQUFTLEdBQUcsaUJBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFFaEY7OztHQUdHO0FBQ0gsU0FBZ0IscUJBQXFCLENBQUMsYUFBbUM7SUFDckUsTUFBTSxPQUFPLEdBQVEsRUFBRSxDQUFDO0lBQ3hCLG1EQUFtRDtJQUNuRCxtREFBbUQ7SUFDbkQsMkRBQTJEO0lBQzNELFlBQUUsQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3RDLE9BQU8sQ0FBQyxPQUFtQixDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsYUFBYSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRXZFLE1BQU0sYUFBYSxHQUFRLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDO0lBQ3RFLE1BQU0sS0FBSyxHQUFxQixPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFDM0UsTUFBTSxRQUFRLEdBQUcsQ0FBQyxTQUFpQixFQUFFLGdCQUF3QixFQUFFLEVBQUUsRUFBRTtRQUMvRCxhQUFLLENBQ0QseUJBQXlCLFNBQVMsV0FBVyxhQUFhO1lBQ3RELGdCQUFnQixHQUFHLENBQzFCLENBQUM7UUFDRixNQUFNLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxHQUFHLDZCQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDaEQsTUFBTSxHQUFHLEdBQUc7WUFDUixRQUFRLEVBQUUsRUFBRTtZQUNaLFVBQVUsRUFBRSxFQUFFO1lBQ2QsUUFBUSxFQUFFLEVBQUU7WUFDWixVQUFVLEVBQUUsRUFBRTtTQUNqQixDQUFDO1FBRUYsSUFBSSxNQUFNLEVBQUU7WUFDUixNQUFNLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsRCxHQUFHLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztZQUN4QixHQUFHLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztTQUMvQjtRQUVELElBQUksRUFBRSxFQUFFO1lBQ0osTUFBTSxlQUFlLEdBQUc7Z0JBQ3BCLEVBQUUsRUFBRSxhQUFhO2dCQUNqQixJQUFJLEVBQUUsYUFBYTtnQkFDbkIsWUFBWSxFQUFFLGFBQWE7Z0JBQzNCLFlBQVksRUFBRSxLQUFLO2dCQUNuQixHQUFHLEVBQUUsS0FBSyxDQUFDLGFBQWEsQ0FBQzthQUM1QixDQUFDO1lBRUYsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLEVBQUUsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRS9ELEdBQUcsQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDLFFBQVE7Z0JBQ3ZCLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLEVBQUUsRUFBRTtnQkFDaEMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDaEIsR0FBRyxDQUFDLFVBQVUsR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQ2hDLEdBQUcsQ0FBQyxRQUFRLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQ25DLEVBQUUsQ0FBQztTQUNOO1FBRUQsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDLENBQUM7SUFFRixPQUFPLFFBQVEsQ0FBQztBQUNwQixDQUFDO0FBcERELHNEQW9EQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IMKpIE1hZ2VudG8sIEluYy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFNlZSBDT1BZSU5HLnR4dCBmb3IgbGljZW5zZSBkZXRhaWxzLlxuICovXG5cbmltcG9ydCB2bSBmcm9tICd2bSc7XG5pbXBvcnQgeyB0cmFjZSB9IGZyb20gJy4vdHJhY2UnO1xuaW1wb3J0IHsgTWFnZW50b1JlcXVpcmVDb25maWcgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7IHBhcnNlTW9kdWxlSUQgfSBmcm9tICcuL3BhcnNlTW9kdWxlSUQnO1xuXG4vLyBUaGUgd2hvbGUgcG9pbnQgb2YgdGhpcyBtb2R1bGUgaXMgdG8gcGlnZ3kgYmFjayBvblxuLy8gUmVxdWlyZUpTJ3MgcGF0aCByZXNvbHZlciBzbyB3ZSBkb24ndCBoYXZlIHRvIHJlaW1wbGVtZW50XG4vLyBpdC4gVW5mb3J0dW5hdGVseSB0aGUgbGliIGlzIG5vdCBDb21tb25KUyBvciBFUyBtb2R1bGUgZnJpZW5kbHksXG4vLyBzbyB3ZSBoYXZlIHRvIHVzZSBzb21lIGhhY2tzLlxuXG5jb25zdCByZXF1aXJlanMgPSByZWFkRmlsZVN5bmMocmVxdWlyZS5yZXNvbHZlKCdyZXF1aXJlanMvcmVxdWlyZS5qcycpLCAndXRmOCcpO1xuXG4vKipcbiAqIEBzdW1tYXJ5IENyZWF0ZSBhIGZpbGUgcGF0aCByZXNvbHZlciB1c2luZyB0aGUgQVBJIGV4cG9zZWQgYnkgUmVxdWlyZUpTLFxuICogICAgICAgICAgdGFraW5nIGludG8gYWNjb3VudCBwYXRocy9tYXAvZXRjIGNvbmZpZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUmVxdWlyZVJlc29sdmVyKHJlcXVpcmVDb25maWc6IE1hZ2VudG9SZXF1aXJlQ29uZmlnKSB7XG4gICAgY29uc3Qgc2FuZGJveDogYW55ID0ge307XG4gICAgLy8gUmVxdWlyZUpTIGlzIHRhcmdldGVkIGF0IGJyb3dzZXJzLCBzbyBpdCBkb2Vzbid0XG4gICAgLy8gaGF2ZSBhIENvbW1vbkpTIHZlcnNpb24sIGFuZCBqdXN0IHNldHMgYSBnbG9iYWwuXG4gICAgLy8gVGhpcyBpcyBhIHF1aWNrIGhhY2sgdG8gZ2V0IHdoYXQgd2UgbmVlZCBvZmYgdGhhdCBnbG9iYWxcbiAgICB2bS5ydW5Jbk5ld0NvbnRleHQocmVxdWlyZWpzLCBzYW5kYm94KTtcbiAgICAoc2FuZGJveC5yZXF1aXJlIGFzIFJlcXVpcmUpLmNvbmZpZyh7IC4uLnJlcXVpcmVDb25maWcsIGJhc2VVcmw6ICcnIH0pO1xuXG4gICAgY29uc3QgbWFrZU1vZHVsZU1hcDogYW55ID0gc2FuZGJveC5yZXF1aXJlLnMuY29udGV4dHMuXy5tYWtlTW9kdWxlTWFwO1xuICAgIGNvbnN0IHRvVXJsOiBSZXF1aXJlWyd0b1VybCddID0gc2FuZGJveC5yZXF1aXJlLnMuY29udGV4dHMuXy5yZXF1aXJlLnRvVXJsO1xuICAgIGNvbnN0IHJlc29sdmVyID0gKHJlcXVlc3RJRDogc3RyaW5nLCBpc3N1aW5nTW9kdWxlOiBzdHJpbmcgPSAnJykgPT4ge1xuICAgICAgICB0cmFjZShcbiAgICAgICAgICAgIGBSZXNvbHZpbmcgZGVwZW5kZW5jeSBcIiR7cmVxdWVzdElEfVwiIGZyb20gXCIke2lzc3VpbmdNb2R1bGUgfHxcbiAgICAgICAgICAgICAgICAndW5rbm93biBzb3VyY2UnfVwiYCxcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgeyBpZCwgcGx1Z2luIH0gPSBwYXJzZU1vZHVsZUlEKHJlcXVlc3RJRCk7XG4gICAgICAgIGNvbnN0IG1hcCA9IHtcbiAgICAgICAgICAgIG1vZHVsZUlEOiAnJyxcbiAgICAgICAgICAgIG1vZHVsZVBhdGg6ICcnLFxuICAgICAgICAgICAgcGx1Z2luSUQ6ICcnLFxuICAgICAgICAgICAgcGx1Z2luUGF0aDogJycsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHBsdWdpbikge1xuICAgICAgICAgICAgY29uc3QgeyBtb2R1bGVJRCwgbW9kdWxlUGF0aCB9ID0gcmVzb2x2ZXIocGx1Z2luKTtcbiAgICAgICAgICAgIG1hcC5wbHVnaW5JRCA9IG1vZHVsZUlEO1xuICAgICAgICAgICAgbWFwLnBsdWdpblBhdGggPSBtb2R1bGVQYXRoO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlkKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJlbnRNb2R1bGVNYXAgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IGlzc3VpbmdNb2R1bGUsXG4gICAgICAgICAgICAgICAgbmFtZTogaXNzdWluZ01vZHVsZSxcbiAgICAgICAgICAgICAgICBvcmlnaW5hbE5hbWU6IGlzc3VpbmdNb2R1bGUsXG4gICAgICAgICAgICAgICAgdW5ub3JtYWxpemVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB1cmw6IHRvVXJsKGlzc3VpbmdNb2R1bGUpLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbWFrZU1vZHVsZU1hcChpZCwgcGFyZW50TW9kdWxlTWFwLCBmYWxzZSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIG1hcC5tb2R1bGVJRCA9IG1hcC5wbHVnaW5JRFxuICAgICAgICAgICAgICAgID8gYCR7bWFwLnBsdWdpbklEfSEke3Jlc3VsdC5pZH1gXG4gICAgICAgICAgICAgICAgOiByZXN1bHQuaWQ7XG4gICAgICAgICAgICBtYXAubW9kdWxlUGF0aCA9IGAke3RvVXJsKHJlc3VsdC5pZCl9JHtcbiAgICAgICAgICAgICAgICBtYXAucGx1Z2luSUQgPT09ICd0ZXh0JyA/ICcnIDogJy5qcydcbiAgICAgICAgICAgIH1gO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHJlc29sdmVyO1xufVxuIl19