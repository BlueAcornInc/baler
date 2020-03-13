"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsesc_1 = __importDefault(require("jsesc"));
const magic_string_1 = __importDefault(require("magic-string"));
const BalerError_1 = require("./BalerError");
// Tip: Can verify source-mappings are working correctly
// using http://evanw.github.io/source-map-visualization/
/**
 * @summary Wrap a text module (commonly .html) in an AMD module,
 *          escaping any code that would break out of the string
 *          boundaries
 */
function wrapTextModule(id, source) {
    const [before, after] = `define('${id}', function() {
    return 'SPLIT';
});`.split('SPLIT');
    const escaped = jsesc_1.default(source);
    const str = new magic_string_1.default(source);
    const startPiece = escaped.slice(0, source.length);
    return str
        .overwrite(0, source.length, startPiece)
        .append(escaped.slice(source.length))
        .append(after)
        .prepend(before);
}
exports.wrapTextModule = wrapTextModule;
/**
 * @summary Wrap a non-AMD module in code that will make it (mostly)
 *          AMD-compatible in the bundle.
 *
 *          Non-AMD modules typically expect that they're running in the
 *          top-most lexical scope. We inject a separate `define` to prevent
 *          the runtime RequireJS lib from fetching a module it thinks hasn't
 *          been loaded, but we keep the module code itself in the top-most scope
 */
function wrapNonShimmedModule(id, source) {
    const str = new magic_string_1.default(source);
    return str.prepend(`define('${id}', function() {
    // baler-injected stub for non-AMD module (no shim config was found for this module)
});
// Original code for non-AMD module ${id}\n`);
}
exports.wrapNonShimmedModule = wrapNonShimmedModule;
/**
 * @summary Rewrite a non-AMD module as an AMD module, using the provided
 *          shim config dependencies and exports values
 */
function wrapShimmedModule(id, source, shim) {
    const deps = shim.deps || [];
    const [before, after] = `define('${id}', ${JSON.stringify(deps)}, function() {
        // Shimmed by @magento/baler
        (function() {
            SPLIT;
        })();
        return window['${shim.exports}'];
    });`.split('SPLIT');
    return new magic_string_1.default(source).prepend(before).append(after);
}
exports.wrapShimmedModule = wrapShimmedModule;
const RE_DEFINE = /define\s*\(/;
/**
 * @summary Add the provided id as the first argument to a `define` call
 */
function renameModule(id, source) {
    const str = new magic_string_1.default(source);
    const { 0: match, index } = source.match(RE_DEFINE) || [];
    if (typeof index !== 'number') {
        throw new BalerError_1.BalerError('Failed RE_DEFINE RegExp. Should have used a real parser');
    }
    return str.prependRight(index + match.length, `'${id}', `);
}
exports.renameModule = renameModule;
/**
 * @summary Determine if a module is an AMD module using the
 *          `define` function
 */
function isAMDWithDefine(source) {
    return RE_DEFINE.test(source);
}
exports.isAMDWithDefine = isAMDWithDefine;
const RE_NAMED_AMD = /define\s*\(\s*['"]/;
/**
 * @summary Determine if a module is already a named AMD module.
 *          A named AMD module will have a string literal as the first
 *          argument passed
 */
function isNamedAMD(source) {
    const match = RE_NAMED_AMD.exec(source);
    return !!match;
}
exports.isNamedAMD = isNamedAMD;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtQU1ELmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RyYW5zZm9ybUFNRC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7OztBQUVILGtEQUEwQjtBQUMxQixnRUFBdUM7QUFFdkMsNkNBQTBDO0FBRTFDLHdEQUF3RDtBQUN4RCx5REFBeUQ7QUFFekQ7Ozs7R0FJRztBQUNILFNBQWdCLGNBQWMsQ0FBQyxFQUFVLEVBQUUsTUFBYztJQUNyRCxNQUFNLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxHQUFHLFdBQVcsRUFBRTs7SUFFckMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFaEIsTUFBTSxPQUFPLEdBQUcsZUFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzlCLE1BQU0sR0FBRyxHQUFHLElBQUksc0JBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwQyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFbkQsT0FBTyxHQUFHO1NBQ0wsU0FBUyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQztTQUN2QyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDcEMsTUFBTSxDQUFDLEtBQUssQ0FBQztTQUNiLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN6QixDQUFDO0FBZEQsd0NBY0M7QUFFRDs7Ozs7Ozs7R0FRRztBQUNILFNBQWdCLG9CQUFvQixDQUFDLEVBQVUsRUFBRSxNQUFjO0lBQzNELE1BQU0sR0FBRyxHQUFHLElBQUksc0JBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwQyxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFOzs7c0NBR0UsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM5QyxDQUFDO0FBTkQsb0RBTUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFnQixpQkFBaUIsQ0FBQyxFQUFVLEVBQUUsTUFBYyxFQUFFLElBQVU7SUFDcEUsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7SUFDN0IsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsR0FBRyxXQUFXLEVBQUUsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUNyRCxJQUFJLENBQ1A7Ozs7O3lCQUtvQixJQUFJLENBQUMsT0FBTztRQUM3QixDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUVwQixPQUFPLElBQUksc0JBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2pFLENBQUM7QUFiRCw4Q0FhQztBQUVELE1BQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQztBQUNoQzs7R0FFRztBQUNILFNBQWdCLFlBQVksQ0FBQyxFQUFVLEVBQUUsTUFBYztJQUNuRCxNQUFNLEdBQUcsR0FBRyxJQUFJLHNCQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEMsTUFBTSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDMUQsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7UUFDM0IsTUFBTSxJQUFJLHVCQUFVLENBQ2hCLHlEQUF5RCxDQUM1RCxDQUFDO0tBQ0w7SUFFRCxPQUFPLEdBQUcsQ0FBQyxZQUFZLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQy9ELENBQUM7QUFWRCxvQ0FVQztBQUVEOzs7R0FHRztBQUNILFNBQWdCLGVBQWUsQ0FBQyxNQUFjO0lBQzFDLE9BQU8sU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsQyxDQUFDO0FBRkQsMENBRUM7QUFFRCxNQUFNLFlBQVksR0FBRyxvQkFBb0IsQ0FBQztBQUMxQzs7OztHQUlHO0FBQ0gsU0FBZ0IsVUFBVSxDQUFDLE1BQWM7SUFDckMsTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN4QyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDbkIsQ0FBQztBQUhELGdDQUdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgwqkgTWFnZW50bywgSW5jLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogU2VlIENPUFlJTkcudHh0IGZvciBsaWNlbnNlIGRldGFpbHMuXG4gKi9cblxuaW1wb3J0IGpzZXNjIGZyb20gJ2pzZXNjJztcbmltcG9ydCBNYWdpY1N0cmluZyBmcm9tICdtYWdpYy1zdHJpbmcnO1xuaW1wb3J0IHsgU2hpbSB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHsgQmFsZXJFcnJvciB9IGZyb20gJy4vQmFsZXJFcnJvcic7XG5cbi8vIFRpcDogQ2FuIHZlcmlmeSBzb3VyY2UtbWFwcGluZ3MgYXJlIHdvcmtpbmcgY29ycmVjdGx5XG4vLyB1c2luZyBodHRwOi8vZXZhbncuZ2l0aHViLmlvL3NvdXJjZS1tYXAtdmlzdWFsaXphdGlvbi9cblxuLyoqXG4gKiBAc3VtbWFyeSBXcmFwIGEgdGV4dCBtb2R1bGUgKGNvbW1vbmx5IC5odG1sKSBpbiBhbiBBTUQgbW9kdWxlLFxuICogICAgICAgICAgZXNjYXBpbmcgYW55IGNvZGUgdGhhdCB3b3VsZCBicmVhayBvdXQgb2YgdGhlIHN0cmluZ1xuICogICAgICAgICAgYm91bmRhcmllc1xuICovXG5leHBvcnQgZnVuY3Rpb24gd3JhcFRleHRNb2R1bGUoaWQ6IHN0cmluZywgc291cmNlOiBzdHJpbmcpIHtcbiAgICBjb25zdCBbYmVmb3JlLCBhZnRlcl0gPSBgZGVmaW5lKCcke2lkfScsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAnU1BMSVQnO1xufSk7YC5zcGxpdCgnU1BMSVQnKTtcblxuICAgIGNvbnN0IGVzY2FwZWQgPSBqc2VzYyhzb3VyY2UpO1xuICAgIGNvbnN0IHN0ciA9IG5ldyBNYWdpY1N0cmluZyhzb3VyY2UpO1xuICAgIGNvbnN0IHN0YXJ0UGllY2UgPSBlc2NhcGVkLnNsaWNlKDAsIHNvdXJjZS5sZW5ndGgpO1xuXG4gICAgcmV0dXJuIHN0clxuICAgICAgICAub3ZlcndyaXRlKDAsIHNvdXJjZS5sZW5ndGgsIHN0YXJ0UGllY2UpXG4gICAgICAgIC5hcHBlbmQoZXNjYXBlZC5zbGljZShzb3VyY2UubGVuZ3RoKSlcbiAgICAgICAgLmFwcGVuZChhZnRlcilcbiAgICAgICAgLnByZXBlbmQoYmVmb3JlKTtcbn1cblxuLyoqXG4gKiBAc3VtbWFyeSBXcmFwIGEgbm9uLUFNRCBtb2R1bGUgaW4gY29kZSB0aGF0IHdpbGwgbWFrZSBpdCAobW9zdGx5KVxuICogICAgICAgICAgQU1ELWNvbXBhdGlibGUgaW4gdGhlIGJ1bmRsZS5cbiAqXG4gKiAgICAgICAgICBOb24tQU1EIG1vZHVsZXMgdHlwaWNhbGx5IGV4cGVjdCB0aGF0IHRoZXkncmUgcnVubmluZyBpbiB0aGVcbiAqICAgICAgICAgIHRvcC1tb3N0IGxleGljYWwgc2NvcGUuIFdlIGluamVjdCBhIHNlcGFyYXRlIGBkZWZpbmVgIHRvIHByZXZlbnRcbiAqICAgICAgICAgIHRoZSBydW50aW1lIFJlcXVpcmVKUyBsaWIgZnJvbSBmZXRjaGluZyBhIG1vZHVsZSBpdCB0aGlua3MgaGFzbid0XG4gKiAgICAgICAgICBiZWVuIGxvYWRlZCwgYnV0IHdlIGtlZXAgdGhlIG1vZHVsZSBjb2RlIGl0c2VsZiBpbiB0aGUgdG9wLW1vc3Qgc2NvcGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdyYXBOb25TaGltbWVkTW9kdWxlKGlkOiBzdHJpbmcsIHNvdXJjZTogc3RyaW5nKSB7XG4gICAgY29uc3Qgc3RyID0gbmV3IE1hZ2ljU3RyaW5nKHNvdXJjZSk7XG4gICAgcmV0dXJuIHN0ci5wcmVwZW5kKGBkZWZpbmUoJyR7aWR9JywgZnVuY3Rpb24oKSB7XG4gICAgLy8gYmFsZXItaW5qZWN0ZWQgc3R1YiBmb3Igbm9uLUFNRCBtb2R1bGUgKG5vIHNoaW0gY29uZmlnIHdhcyBmb3VuZCBmb3IgdGhpcyBtb2R1bGUpXG59KTtcbi8vIE9yaWdpbmFsIGNvZGUgZm9yIG5vbi1BTUQgbW9kdWxlICR7aWR9XFxuYCk7XG59XG5cbi8qKlxuICogQHN1bW1hcnkgUmV3cml0ZSBhIG5vbi1BTUQgbW9kdWxlIGFzIGFuIEFNRCBtb2R1bGUsIHVzaW5nIHRoZSBwcm92aWRlZFxuICogICAgICAgICAgc2hpbSBjb25maWcgZGVwZW5kZW5jaWVzIGFuZCBleHBvcnRzIHZhbHVlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gd3JhcFNoaW1tZWRNb2R1bGUoaWQ6IHN0cmluZywgc291cmNlOiBzdHJpbmcsIHNoaW06IFNoaW0pIHtcbiAgICBjb25zdCBkZXBzID0gc2hpbS5kZXBzIHx8IFtdO1xuICAgIGNvbnN0IFtiZWZvcmUsIGFmdGVyXSA9IGBkZWZpbmUoJyR7aWR9JywgJHtKU09OLnN0cmluZ2lmeShcbiAgICAgICAgZGVwcyxcbiAgICApfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIFNoaW1tZWQgYnkgQG1hZ2VudG8vYmFsZXJcbiAgICAgICAgKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgU1BMSVQ7XG4gICAgICAgIH0pKCk7XG4gICAgICAgIHJldHVybiB3aW5kb3dbJyR7c2hpbS5leHBvcnRzfSddO1xuICAgIH0pO2Auc3BsaXQoJ1NQTElUJyk7XG5cbiAgICByZXR1cm4gbmV3IE1hZ2ljU3RyaW5nKHNvdXJjZSkucHJlcGVuZChiZWZvcmUpLmFwcGVuZChhZnRlcik7XG59XG5cbmNvbnN0IFJFX0RFRklORSA9IC9kZWZpbmVcXHMqXFwoLztcbi8qKlxuICogQHN1bW1hcnkgQWRkIHRoZSBwcm92aWRlZCBpZCBhcyB0aGUgZmlyc3QgYXJndW1lbnQgdG8gYSBgZGVmaW5lYCBjYWxsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW5hbWVNb2R1bGUoaWQ6IHN0cmluZywgc291cmNlOiBzdHJpbmcpIHtcbiAgICBjb25zdCBzdHIgPSBuZXcgTWFnaWNTdHJpbmcoc291cmNlKTtcbiAgICBjb25zdCB7IDA6IG1hdGNoLCBpbmRleCB9ID0gc291cmNlLm1hdGNoKFJFX0RFRklORSkgfHwgW107XG4gICAgaWYgKHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEJhbGVyRXJyb3IoXG4gICAgICAgICAgICAnRmFpbGVkIFJFX0RFRklORSBSZWdFeHAuIFNob3VsZCBoYXZlIHVzZWQgYSByZWFsIHBhcnNlcicsXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0ci5wcmVwZW5kUmlnaHQoaW5kZXggKyBtYXRjaC5sZW5ndGgsIGAnJHtpZH0nLCBgKTtcbn1cblxuLyoqXG4gKiBAc3VtbWFyeSBEZXRlcm1pbmUgaWYgYSBtb2R1bGUgaXMgYW4gQU1EIG1vZHVsZSB1c2luZyB0aGVcbiAqICAgICAgICAgIGBkZWZpbmVgIGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0FNRFdpdGhEZWZpbmUoc291cmNlOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gUkVfREVGSU5FLnRlc3Qoc291cmNlKTtcbn1cblxuY29uc3QgUkVfTkFNRURfQU1EID0gL2RlZmluZVxccypcXChcXHMqWydcIl0vO1xuLyoqXG4gKiBAc3VtbWFyeSBEZXRlcm1pbmUgaWYgYSBtb2R1bGUgaXMgYWxyZWFkeSBhIG5hbWVkIEFNRCBtb2R1bGUuXG4gKiAgICAgICAgICBBIG5hbWVkIEFNRCBtb2R1bGUgd2lsbCBoYXZlIGEgc3RyaW5nIGxpdGVyYWwgYXMgdGhlIGZpcnN0XG4gKiAgICAgICAgICBhcmd1bWVudCBwYXNzZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTmFtZWRBTUQoc291cmNlOiBzdHJpbmcpIHtcbiAgICBjb25zdCBtYXRjaCA9IFJFX05BTUVEX0FNRC5leGVjKHNvdXJjZSk7XG4gICAgcmV0dXJuICEhbWF0Y2g7XG59XG4iXX0=