"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const path_2 = require("path");
function resolvedModuleIDToPath(request, baseDir) {
    const ext = path_2.extname(request);
    const fullPath = path_1.join(baseDir, request);
    return `${fullPath}${ext === '.html' || ext === '.js' ? '' : '.js'}`;
}
exports.resolvedModuleIDToPath = resolvedModuleIDToPath;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZWRNb2R1bGVJRFRvUGF0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9yZXNvbHZlZE1vZHVsZUlEVG9QYXRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7O0FBRUgsK0JBQTRCO0FBQzVCLCtCQUErQjtBQUUvQixTQUFnQixzQkFBc0IsQ0FBQyxPQUFlLEVBQUUsT0FBZTtJQUNuRSxNQUFNLEdBQUcsR0FBRyxjQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDN0IsTUFBTSxRQUFRLEdBQUcsV0FBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUV4QyxPQUFPLEdBQUcsUUFBUSxHQUFHLEdBQUcsS0FBSyxPQUFPLElBQUksR0FBRyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN6RSxDQUFDO0FBTEQsd0RBS0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCDCqSBNYWdlbnRvLCBJbmMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBTZWUgQ09QWUlORy50eHQgZm9yIGxpY2Vuc2UgZGV0YWlscy5cbiAqL1xuXG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBleHRuYW1lIH0gZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlZE1vZHVsZUlEVG9QYXRoKHJlcXVlc3Q6IHN0cmluZywgYmFzZURpcjogc3RyaW5nKSB7XG4gICAgY29uc3QgZXh0ID0gZXh0bmFtZShyZXF1ZXN0KTtcbiAgICBjb25zdCBmdWxsUGF0aCA9IGpvaW4oYmFzZURpciwgcmVxdWVzdCk7XG5cbiAgICByZXR1cm4gYCR7ZnVsbFBhdGh9JHtleHQgPT09ICcuaHRtbCcgfHwgZXh0ID09PSAnLmpzJyA/ICcnIDogJy5qcyd9YDtcbn1cbiJdfQ==