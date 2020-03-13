"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const trace_1 = require("./trace");
/**
 * @summary Separate a RequireJS module ID from associated plugin
 */
function parseModuleID(request) {
    const parts = request.split('!');
    if (parts.length === 1) {
        return { id: parts[0], plugin: '' };
    }
    const [plugin, id, ...others] = parts;
    if (plugin === 'text') {
        if (others.length) {
            trace_1.trace(`Too many values passed to "text" plugin for request "${request}"`);
        }
        return { id, plugin: 'text' };
    }
    if (plugin === 'domReady') {
        if (others.length) {
            trace_1.trace(`Too many values passed to "domReady" plugin for request "${request}"`);
        }
        return { id, plugin: 'domReady' };
    }
    trace_1.trace(`Unrecognized plugin "${plugin}" for request "${request}". This file will be skipped`);
    return { id: '', plugin: '' };
}
exports.parseModuleID = parseModuleID;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VNb2R1bGVJRC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wYXJzZU1vZHVsZUlELnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7O0FBRUgsbUNBQWdDO0FBQ2hDOztHQUVHO0FBQ0gsU0FBZ0IsYUFBYSxDQUFDLE9BQWU7SUFDekMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ3BCLE9BQU8sRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQztLQUN2QztJQUVELE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBRXRDLElBQUksTUFBTSxLQUFLLE1BQU0sRUFBRTtRQUNuQixJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDZixhQUFLLENBQ0Qsd0RBQXdELE9BQU8sR0FBRyxDQUNyRSxDQUFDO1NBQ0w7UUFDRCxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQztLQUNqQztJQUVELElBQUksTUFBTSxLQUFLLFVBQVUsRUFBRTtRQUN2QixJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDZixhQUFLLENBQ0QsNERBQTRELE9BQU8sR0FBRyxDQUN6RSxDQUFDO1NBQ0w7UUFDRCxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsQ0FBQztLQUNyQztJQUVELGFBQUssQ0FDRCx3QkFBd0IsTUFBTSxrQkFBa0IsT0FBTyw4QkFBOEIsQ0FDeEYsQ0FBQztJQUVGLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUNsQyxDQUFDO0FBL0JELHNDQStCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IMKpIE1hZ2VudG8sIEluYy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFNlZSBDT1BZSU5HLnR4dCBmb3IgbGljZW5zZSBkZXRhaWxzLlxuICovXG5cbmltcG9ydCB7IHRyYWNlIH0gZnJvbSAnLi90cmFjZSc7XG4vKipcbiAqIEBzdW1tYXJ5IFNlcGFyYXRlIGEgUmVxdWlyZUpTIG1vZHVsZSBJRCBmcm9tIGFzc29jaWF0ZWQgcGx1Z2luXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU1vZHVsZUlEKHJlcXVlc3Q6IHN0cmluZykge1xuICAgIGNvbnN0IHBhcnRzID0gcmVxdWVzdC5zcGxpdCgnIScpO1xuICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIHsgaWQ6IHBhcnRzWzBdLCBwbHVnaW46ICcnIH07XG4gICAgfVxuXG4gICAgY29uc3QgW3BsdWdpbiwgaWQsIC4uLm90aGVyc10gPSBwYXJ0cztcblxuICAgIGlmIChwbHVnaW4gPT09ICd0ZXh0Jykge1xuICAgICAgICBpZiAob3RoZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgdHJhY2UoXG4gICAgICAgICAgICAgICAgYFRvbyBtYW55IHZhbHVlcyBwYXNzZWQgdG8gXCJ0ZXh0XCIgcGx1Z2luIGZvciByZXF1ZXN0IFwiJHtyZXF1ZXN0fVwiYCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgaWQsIHBsdWdpbjogJ3RleHQnIH07XG4gICAgfVxuXG4gICAgaWYgKHBsdWdpbiA9PT0gJ2RvbVJlYWR5Jykge1xuICAgICAgICBpZiAob3RoZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgdHJhY2UoXG4gICAgICAgICAgICAgICAgYFRvbyBtYW55IHZhbHVlcyBwYXNzZWQgdG8gXCJkb21SZWFkeVwiIHBsdWdpbiBmb3IgcmVxdWVzdCBcIiR7cmVxdWVzdH1cImAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IGlkLCBwbHVnaW46ICdkb21SZWFkeScgfTtcbiAgICB9XG5cbiAgICB0cmFjZShcbiAgICAgICAgYFVucmVjb2duaXplZCBwbHVnaW4gXCIke3BsdWdpbn1cIiBmb3IgcmVxdWVzdCBcIiR7cmVxdWVzdH1cIi4gVGhpcyBmaWxlIHdpbGwgYmUgc2tpcHBlZGAsXG4gICAgKTtcblxuICAgIHJldHVybiB7IGlkOiAnJywgcGx1Z2luOiAnJyB9O1xufVxuIl19