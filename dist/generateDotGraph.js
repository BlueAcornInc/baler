"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
Object.defineProperty(exports, "__esModule", { value: true });
function generateDotGraph(graph) {
    const strBuilder = ['digraph {'];
    for (const [id, deps] of Object.entries(graph)) {
        strBuilder.push(...deps.map(d => `  "${id}" -> "${d}"`));
    }
    strBuilder.push('}');
    return strBuilder.join('\n');
}
exports.generateDotGraph = generateDotGraph;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVEb3RHcmFwaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9nZW5lcmF0ZURvdEdyYXBoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7O0FBSUgsU0FBZ0IsZ0JBQWdCLENBQUMsS0FBZTtJQUM1QyxNQUFNLFVBQVUsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2pDLEtBQUssTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQzVDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQzVEO0lBQ0QsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNyQixPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakMsQ0FBQztBQVBELDRDQU9DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgwqkgTWFnZW50bywgSW5jLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogU2VlIENPUFlJTkcudHh0IGZvciBsaWNlbnNlIGRldGFpbHMuXG4gKi9cblxuaW1wb3J0IHsgQU1ER3JhcGggfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlRG90R3JhcGgoZ3JhcGg6IEFNREdyYXBoKSB7XG4gICAgY29uc3Qgc3RyQnVpbGRlciA9IFsnZGlncmFwaCB7J107XG4gICAgZm9yIChjb25zdCBbaWQsIGRlcHNdIG9mIE9iamVjdC5lbnRyaWVzKGdyYXBoKSkge1xuICAgICAgICBzdHJCdWlsZGVyLnB1c2goLi4uZGVwcy5tYXAoZCA9PiBgICBcIiR7aWR9XCIgLT4gXCIke2R9XCJgKSk7XG4gICAgfVxuICAgIHN0ckJ1aWxkZXIucHVzaCgnfScpO1xuICAgIHJldHVybiBzdHJCdWlsZGVyLmpvaW4oJ1xcbicpO1xufVxuIl19