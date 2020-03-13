"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const BalerError_1 = require("../BalerError");
const collectStoreData_1 = require("../collectStoreData");
const getEligibleThemes_1 = require("../getEligibleThemes");
const optimizeThemes_1 = require("../optimizeThemes");
const trace_1 = require("../trace");
async function build(magentoRoot, themeIDs) {
    trace_1.trace('starting build command from cli');
    const store = await collectStoreData_1.collectStoreData(magentoRoot);
    const eligibleThemes = getEligibleThemes_1.getEligibleThemes(store);
    if (themeIDs && themeIDs.length) {
        const invalid = themeIDs.filter(id => !eligibleThemes.includes(id));
        if (invalid.length) {
            throw new BalerError_1.BalerError(`You specified ${themeIDs.length} theme(s) to optimize, ` +
                `but ${invalid.length} of them is not optimizable ` +
                `(${invalid.join(', ')}).\n\n` +
                `For a theme to be optimizable, it must:\n` +
                `  - Be for the "frontend" area\n` +
                `  - Be deployed already with bin/magento setup:static-content:deploy\n` +
                `  - Not have the ID "Magento/blank"\n`);
        }
    }
    const results = await optimizeThemes_1.optimizeThemes(magentoRoot, store, themeIDs || eligibleThemes);
    console.log('\nOptimization is done, but stats have not been implemented in the CLI yet');
}
exports.build = build;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY2xpL2J1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7O0FBRUgsOENBQTJDO0FBQzNDLDBEQUF1RDtBQUN2RCw0REFBeUQ7QUFDekQsc0RBQW1EO0FBQ25ELG9DQUFpQztBQUUxQixLQUFLLFVBQVUsS0FBSyxDQUFDLFdBQW1CLEVBQUUsUUFBbUI7SUFDaEUsYUFBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7SUFDekMsTUFBTSxLQUFLLEdBQUcsTUFBTSxtQ0FBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNsRCxNQUFNLGNBQWMsR0FBRyxxQ0FBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUVoRCxJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFO1FBQzdCLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNwRSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7WUFDaEIsTUFBTSxJQUFJLHVCQUFVLENBQ2hCLGlCQUFpQixRQUFRLENBQUMsTUFBTSx5QkFBeUI7Z0JBQ3JELE9BQU8sT0FBTyxDQUFDLE1BQU0sOEJBQThCO2dCQUNuRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVE7Z0JBQzlCLDJDQUEyQztnQkFDM0Msa0NBQWtDO2dCQUNsQyx3RUFBd0U7Z0JBQ3hFLHVDQUF1QyxDQUM5QyxDQUFDO1NBQ0w7S0FDSjtJQUVELE1BQU0sT0FBTyxHQUFHLE1BQU0sK0JBQWMsQ0FDaEMsV0FBVyxFQUNYLEtBQUssRUFDTCxRQUFRLElBQUksY0FBYyxDQUM3QixDQUFDO0lBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FDUCw0RUFBNEUsQ0FDL0UsQ0FBQztBQUNOLENBQUM7QUE1QkQsc0JBNEJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgwqkgTWFnZW50bywgSW5jLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogU2VlIENPUFlJTkcudHh0IGZvciBsaWNlbnNlIGRldGFpbHMuXG4gKi9cblxuaW1wb3J0IHsgQmFsZXJFcnJvciB9IGZyb20gJy4uL0JhbGVyRXJyb3InO1xuaW1wb3J0IHsgY29sbGVjdFN0b3JlRGF0YSB9IGZyb20gJy4uL2NvbGxlY3RTdG9yZURhdGEnO1xuaW1wb3J0IHsgZ2V0RWxpZ2libGVUaGVtZXMgfSBmcm9tICcuLi9nZXRFbGlnaWJsZVRoZW1lcyc7XG5pbXBvcnQgeyBvcHRpbWl6ZVRoZW1lcyB9IGZyb20gJy4uL29wdGltaXplVGhlbWVzJztcbmltcG9ydCB7IHRyYWNlIH0gZnJvbSAnLi4vdHJhY2UnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYnVpbGQobWFnZW50b1Jvb3Q6IHN0cmluZywgdGhlbWVJRHM/OiBzdHJpbmdbXSkge1xuICAgIHRyYWNlKCdzdGFydGluZyBidWlsZCBjb21tYW5kIGZyb20gY2xpJyk7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBjb2xsZWN0U3RvcmVEYXRhKG1hZ2VudG9Sb290KTtcbiAgICBjb25zdCBlbGlnaWJsZVRoZW1lcyA9IGdldEVsaWdpYmxlVGhlbWVzKHN0b3JlKTtcblxuICAgIGlmICh0aGVtZUlEcyAmJiB0aGVtZUlEcy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgaW52YWxpZCA9IHRoZW1lSURzLmZpbHRlcihpZCA9PiAhZWxpZ2libGVUaGVtZXMuaW5jbHVkZXMoaWQpKTtcbiAgICAgICAgaWYgKGludmFsaWQubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgQmFsZXJFcnJvcihcbiAgICAgICAgICAgICAgICBgWW91IHNwZWNpZmllZCAke3RoZW1lSURzLmxlbmd0aH0gdGhlbWUocykgdG8gb3B0aW1pemUsIGAgK1xuICAgICAgICAgICAgICAgICAgICBgYnV0ICR7aW52YWxpZC5sZW5ndGh9IG9mIHRoZW0gaXMgbm90IG9wdGltaXphYmxlIGAgK1xuICAgICAgICAgICAgICAgICAgICBgKCR7aW52YWxpZC5qb2luKCcsICcpfSkuXFxuXFxuYCArXG4gICAgICAgICAgICAgICAgICAgIGBGb3IgYSB0aGVtZSB0byBiZSBvcHRpbWl6YWJsZSwgaXQgbXVzdDpcXG5gICtcbiAgICAgICAgICAgICAgICAgICAgYCAgLSBCZSBmb3IgdGhlIFwiZnJvbnRlbmRcIiBhcmVhXFxuYCArXG4gICAgICAgICAgICAgICAgICAgIGAgIC0gQmUgZGVwbG95ZWQgYWxyZWFkeSB3aXRoIGJpbi9tYWdlbnRvIHNldHVwOnN0YXRpYy1jb250ZW50OmRlcGxveVxcbmAgK1xuICAgICAgICAgICAgICAgICAgICBgICAtIE5vdCBoYXZlIHRoZSBJRCBcIk1hZ2VudG8vYmxhbmtcIlxcbmAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IG9wdGltaXplVGhlbWVzKFxuICAgICAgICBtYWdlbnRvUm9vdCxcbiAgICAgICAgc3RvcmUsXG4gICAgICAgIHRoZW1lSURzIHx8IGVsaWdpYmxlVGhlbWVzLFxuICAgICk7XG4gICAgY29uc29sZS5sb2coXG4gICAgICAgICdcXG5PcHRpbWl6YXRpb24gaXMgZG9uZSwgYnV0IHN0YXRzIGhhdmUgbm90IGJlZW4gaW1wbGVtZW50ZWQgaW4gdGhlIENMSSB5ZXQnLFxuICAgICk7XG59XG4iXX0=