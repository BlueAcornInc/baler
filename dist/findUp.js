"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fsPromises_1 = require("./fsPromises");
/**
 * @summary Walk up a directory tree looking for a matching dir
 */
async function findUp(dir, predicate) {
    try {
        const entries = await fsPromises_1.readdir(dir);
        const isMatch = predicate(dir, entries);
        if (isMatch)
            return dir;
        const oneUp = path_1.join(dir, '..');
        if (oneUp === path_1.parse(oneUp).root)
            return;
        return findUp(oneUp, predicate);
    }
    catch {
        return;
    }
}
exports.findUp = findUp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZFVwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2ZpbmRVcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOztBQUVILCtCQUFtQztBQUNuQyw2Q0FBdUM7QUFHdkM7O0dBRUc7QUFDSSxLQUFLLFVBQVUsTUFBTSxDQUN4QixHQUFXLEVBQ1gsU0FBMEI7SUFFMUIsSUFBSTtRQUNBLE1BQU0sT0FBTyxHQUFHLE1BQU0sb0JBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuQyxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3hDLElBQUksT0FBTztZQUFFLE9BQU8sR0FBRyxDQUFDO1FBRXhCLE1BQU0sS0FBSyxHQUFHLFdBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDOUIsSUFBSSxLQUFLLEtBQUssWUFBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUk7WUFBRSxPQUFPO1FBRXhDLE9BQU8sTUFBTSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztLQUNuQztJQUFDLE1BQU07UUFDSixPQUFPO0tBQ1Y7QUFDTCxDQUFDO0FBaEJELHdCQWdCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IMKpIE1hZ2VudG8sIEluYy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFNlZSBDT1BZSU5HLnR4dCBmb3IgbGljZW5zZSBkZXRhaWxzLlxuICovXG5cbmltcG9ydCB7IGpvaW4sIHBhcnNlIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyByZWFkZGlyIH0gZnJvbSAnLi9mc1Byb21pc2VzJztcblxudHlwZSBGaW5kVXBQcmVkaWNhdGUgPSAoZGlyOiBzdHJpbmcsIGVudHJpZXM6IHN0cmluZ1tdKSA9PiBCb29sZWFuO1xuLyoqXG4gKiBAc3VtbWFyeSBXYWxrIHVwIGEgZGlyZWN0b3J5IHRyZWUgbG9va2luZyBmb3IgYSBtYXRjaGluZyBkaXJcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZpbmRVcChcbiAgICBkaXI6IHN0cmluZyxcbiAgICBwcmVkaWNhdGU6IEZpbmRVcFByZWRpY2F0ZSxcbik6IFByb21pc2U8c3RyaW5nIHwgdW5kZWZpbmVkPiB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZW50cmllcyA9IGF3YWl0IHJlYWRkaXIoZGlyKTtcbiAgICAgICAgY29uc3QgaXNNYXRjaCA9IHByZWRpY2F0ZShkaXIsIGVudHJpZXMpO1xuICAgICAgICBpZiAoaXNNYXRjaCkgcmV0dXJuIGRpcjtcblxuICAgICAgICBjb25zdCBvbmVVcCA9IGpvaW4oZGlyLCAnLi4nKTtcbiAgICAgICAgaWYgKG9uZVVwID09PSBwYXJzZShvbmVVcCkucm9vdCkgcmV0dXJuO1xuXG4gICAgICAgIHJldHVybiBmaW5kVXAob25lVXAsIHByZWRpY2F0ZSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG59XG4iXX0=