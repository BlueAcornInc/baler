"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const depIsIgnored_1 = require("./depIsIgnored");
/**
 * @summary Given an ordered list of entry points and a graph,
 *          will return an ordered list of dependencies to bundle,
 *          ordered depth-first to match the runtime execution
 *          order of AMD modules. Excludes any modules that are built-in
 *          to require
 */
function computeDepsForBundle(graph, entryPoints) {
    const depsToBundle = new Set();
    const toVisit = [...entryPoints];
    while (toVisit.length) {
        const dep = toVisit.shift();
        // Break cycle
        if (depsToBundle.has(dep) || depIsIgnored_1.depIsIgnored(dep)) {
            continue;
        }
        depsToBundle.add(dep);
        const directDeps = graph[dep];
        if (directDeps && directDeps.length) {
            toVisit.unshift(...directDeps);
        }
    }
    return Array.from(depsToBundle);
}
exports.computeDepsForBundle = computeDepsForBundle;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcHV0ZURlcHNGb3JCdW5kbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY29tcHV0ZURlcHNGb3JCdW5kbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7QUFHSCxpREFBOEM7QUFFOUM7Ozs7OztHQU1HO0FBQ0gsU0FBZ0Isb0JBQW9CLENBQUMsS0FBZSxFQUFFLFdBQXFCO0lBQ3ZFLE1BQU0sWUFBWSxHQUFnQixJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQzVDLE1BQU0sT0FBTyxHQUFhLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQztJQUUzQyxPQUFPLE9BQU8sQ0FBQyxNQUFNLEVBQUU7UUFDbkIsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEtBQUssRUFBWSxDQUFDO1FBRXRDLGNBQWM7UUFDZCxJQUFJLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksMkJBQVksQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUM1QyxTQUFTO1NBQ1o7UUFFRCxZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXRCLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QixJQUFJLFVBQVUsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFO1lBQ2pDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQztTQUNsQztLQUNKO0lBRUQsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3BDLENBQUM7QUFyQkQsb0RBcUJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgwqkgTWFnZW50bywgSW5jLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogU2VlIENPUFlJTkcudHh0IGZvciBsaWNlbnNlIGRldGFpbHMuXG4gKi9cblxuaW1wb3J0IHsgQU1ER3JhcGggfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IGRlcElzSWdub3JlZCB9IGZyb20gJy4vZGVwSXNJZ25vcmVkJztcblxuLyoqXG4gKiBAc3VtbWFyeSBHaXZlbiBhbiBvcmRlcmVkIGxpc3Qgb2YgZW50cnkgcG9pbnRzIGFuZCBhIGdyYXBoLFxuICogICAgICAgICAgd2lsbCByZXR1cm4gYW4gb3JkZXJlZCBsaXN0IG9mIGRlcGVuZGVuY2llcyB0byBidW5kbGUsXG4gKiAgICAgICAgICBvcmRlcmVkIGRlcHRoLWZpcnN0IHRvIG1hdGNoIHRoZSBydW50aW1lIGV4ZWN1dGlvblxuICogICAgICAgICAgb3JkZXIgb2YgQU1EIG1vZHVsZXMuIEV4Y2x1ZGVzIGFueSBtb2R1bGVzIHRoYXQgYXJlIGJ1aWx0LWluXG4gKiAgICAgICAgICB0byByZXF1aXJlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlRGVwc0ZvckJ1bmRsZShncmFwaDogQU1ER3JhcGgsIGVudHJ5UG9pbnRzOiBzdHJpbmdbXSkge1xuICAgIGNvbnN0IGRlcHNUb0J1bmRsZTogU2V0PHN0cmluZz4gPSBuZXcgU2V0KCk7XG4gICAgY29uc3QgdG9WaXNpdDogc3RyaW5nW10gPSBbLi4uZW50cnlQb2ludHNdO1xuXG4gICAgd2hpbGUgKHRvVmlzaXQubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGRlcCA9IHRvVmlzaXQuc2hpZnQoKSBhcyBzdHJpbmc7XG5cbiAgICAgICAgLy8gQnJlYWsgY3ljbGVcbiAgICAgICAgaWYgKGRlcHNUb0J1bmRsZS5oYXMoZGVwKSB8fCBkZXBJc0lnbm9yZWQoZGVwKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBkZXBzVG9CdW5kbGUuYWRkKGRlcCk7XG5cbiAgICAgICAgY29uc3QgZGlyZWN0RGVwcyA9IGdyYXBoW2RlcF07XG4gICAgICAgIGlmIChkaXJlY3REZXBzICYmIGRpcmVjdERlcHMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0b1Zpc2l0LnVuc2hpZnQoLi4uZGlyZWN0RGVwcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gQXJyYXkuZnJvbShkZXBzVG9CdW5kbGUpO1xufVxuIl19