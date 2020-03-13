"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ora_1 = __importDefault(require("ora"));
const chalk_1 = __importDefault(require("chalk"));
const pretty_ms_1 = __importDefault(require("pretty-ms"));
const perf_hooks_1 = require("perf_hooks");
const noop = () => { };
/**
 * @summary When running in CLI mode, will
 *          show individual line-items
 *          for tasks and whether they're
 *          completed or in-progress
 */
function cliTask(startMessage, themeID) {
    if (!global.BALER_CLI_MODE) {
        // If someone is using baler programatically,
        // they won't want our CLI noise
        return noop;
    }
    const startTime = perf_hooks_1.performance.now();
    const spinner = ora_1.default(wrapWithTheme(startMessage, themeID)).start();
    return function endCLITask(endMessage) {
        const endTime = perf_hooks_1.performance.now();
        const time = chalk_1.default.grey(pretty_ms_1.default(endTime - startTime));
        const msg = wrapWithTheme(endMessage, themeID);
        spinner.succeed(`${msg} ${time}`);
    };
}
exports.cliTask = cliTask;
const wrapWithTheme = (msg, themeID) => themeID ? `(${themeID}) ${msg}` : msg;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpVGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGlUYXNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7Ozs7O0FBRUgsOENBQXNCO0FBQ3RCLGtEQUEwQjtBQUMxQiwwREFBaUM7QUFDakMsMkNBQXlDO0FBRXpDLE1BQU0sSUFBSSxHQUFHLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQztBQUV0Qjs7Ozs7R0FLRztBQUNILFNBQWdCLE9BQU8sQ0FBQyxZQUFvQixFQUFFLE9BQWdCO0lBQzFELElBQUksQ0FBRSxNQUFjLENBQUMsY0FBYyxFQUFFO1FBQ2pDLDZDQUE2QztRQUM3QyxnQ0FBZ0M7UUFDaEMsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUVELE1BQU0sU0FBUyxHQUFHLHdCQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDcEMsTUFBTSxPQUFPLEdBQUcsYUFBRyxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUVsRSxPQUFPLFNBQVMsVUFBVSxDQUFDLFVBQWtCO1FBQ3pDLE1BQU0sT0FBTyxHQUFHLHdCQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDbEMsTUFBTSxJQUFJLEdBQUcsZUFBSyxDQUFDLElBQUksQ0FBQyxtQkFBUSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sR0FBRyxHQUFHLGFBQWEsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDL0MsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3RDLENBQUMsQ0FBQztBQUNOLENBQUM7QUFoQkQsMEJBZ0JDO0FBRUQsTUFBTSxhQUFhLEdBQUcsQ0FBQyxHQUFXLEVBQUUsT0FBZ0IsRUFBRSxFQUFFLENBQ3BELE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IMKpIE1hZ2VudG8sIEluYy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFNlZSBDT1BZSU5HLnR4dCBmb3IgbGljZW5zZSBkZXRhaWxzLlxuICovXG5cbmltcG9ydCBvcmEgZnJvbSAnb3JhJztcbmltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XG5pbXBvcnQgcHJldHR5TVMgZnJvbSAncHJldHR5LW1zJztcbmltcG9ydCB7IHBlcmZvcm1hbmNlIH0gZnJvbSAncGVyZl9ob29rcyc7XG5cbmNvbnN0IG5vb3AgPSAoKSA9PiB7fTtcblxuLyoqXG4gKiBAc3VtbWFyeSBXaGVuIHJ1bm5pbmcgaW4gQ0xJIG1vZGUsIHdpbGxcbiAqICAgICAgICAgIHNob3cgaW5kaXZpZHVhbCBsaW5lLWl0ZW1zXG4gKiAgICAgICAgICBmb3IgdGFza3MgYW5kIHdoZXRoZXIgdGhleSdyZVxuICogICAgICAgICAgY29tcGxldGVkIG9yIGluLXByb2dyZXNzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGlUYXNrKHN0YXJ0TWVzc2FnZTogc3RyaW5nLCB0aGVtZUlEPzogc3RyaW5nKSB7XG4gICAgaWYgKCEoZ2xvYmFsIGFzIGFueSkuQkFMRVJfQ0xJX01PREUpIHtcbiAgICAgICAgLy8gSWYgc29tZW9uZSBpcyB1c2luZyBiYWxlciBwcm9ncmFtYXRpY2FsbHksXG4gICAgICAgIC8vIHRoZXkgd29uJ3Qgd2FudCBvdXIgQ0xJIG5vaXNlXG4gICAgICAgIHJldHVybiBub29wO1xuICAgIH1cblxuICAgIGNvbnN0IHN0YXJ0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIGNvbnN0IHNwaW5uZXIgPSBvcmEod3JhcFdpdGhUaGVtZShzdGFydE1lc3NhZ2UsIHRoZW1lSUQpKS5zdGFydCgpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGVuZENMSVRhc2soZW5kTWVzc2FnZTogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGVuZFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgY29uc3QgdGltZSA9IGNoYWxrLmdyZXkocHJldHR5TVMoZW5kVGltZSAtIHN0YXJ0VGltZSkpO1xuICAgICAgICBjb25zdCBtc2cgPSB3cmFwV2l0aFRoZW1lKGVuZE1lc3NhZ2UsIHRoZW1lSUQpO1xuICAgICAgICBzcGlubmVyLnN1Y2NlZWQoYCR7bXNnfSAke3RpbWV9YCk7XG4gICAgfTtcbn1cblxuY29uc3Qgd3JhcFdpdGhUaGVtZSA9IChtc2c6IHN0cmluZywgdGhlbWVJRD86IHN0cmluZykgPT5cbiAgICB0aGVtZUlEID8gYCgke3RoZW1lSUR9KSAke21zZ31gIDogbXNnO1xuIl19