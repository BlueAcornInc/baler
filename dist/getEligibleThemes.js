"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @summary Get a list of themeIDs for every theme
 *          that is eligible for optimization. Requirements
 *          are:
 *          1. Must be a "frontend" theme
 *          2. Must not be "Magento/blank"
 *          3. Must be deployed (in pub/static)
 */
function getEligibleThemes(store) {
    const { components, deployedThemes } = store;
    return Object.values(components.themes)
        .filter(t => t.area === 'frontend' && t.themeID !== 'Magento/blank')
        .filter(t => deployedThemes.includes(t.themeID))
        .map(t => t.themeID);
}
exports.getEligibleThemes = getEligibleThemes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0RWxpZ2libGVUaGVtZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZ2V0RWxpZ2libGVUaGVtZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7QUFJSDs7Ozs7OztHQU9HO0FBQ0gsU0FBZ0IsaUJBQWlCLENBQUMsS0FBZ0I7SUFDOUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsR0FBRyxLQUFLLENBQUM7SUFFN0MsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7U0FDbEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxVQUFVLElBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxlQUFlLENBQUM7U0FDbkUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDL0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzdCLENBQUM7QUFQRCw4Q0FPQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IMKpIE1hZ2VudG8sIEluYy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFNlZSBDT1BZSU5HLnR4dCBmb3IgbGljZW5zZSBkZXRhaWxzLlxuICovXG5cbmltcG9ydCB7IFN0b3JlRGF0YSB9IGZyb20gJy4vdHlwZXMnO1xuXG4vKipcbiAqIEBzdW1tYXJ5IEdldCBhIGxpc3Qgb2YgdGhlbWVJRHMgZm9yIGV2ZXJ5IHRoZW1lXG4gKiAgICAgICAgICB0aGF0IGlzIGVsaWdpYmxlIGZvciBvcHRpbWl6YXRpb24uIFJlcXVpcmVtZW50c1xuICogICAgICAgICAgYXJlOlxuICogICAgICAgICAgMS4gTXVzdCBiZSBhIFwiZnJvbnRlbmRcIiB0aGVtZVxuICogICAgICAgICAgMi4gTXVzdCBub3QgYmUgXCJNYWdlbnRvL2JsYW5rXCJcbiAqICAgICAgICAgIDMuIE11c3QgYmUgZGVwbG95ZWQgKGluIHB1Yi9zdGF0aWMpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbGlnaWJsZVRoZW1lcyhzdG9yZTogU3RvcmVEYXRhKSB7XG4gICAgY29uc3QgeyBjb21wb25lbnRzLCBkZXBsb3llZFRoZW1lcyB9ID0gc3RvcmU7XG5cbiAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyhjb21wb25lbnRzLnRoZW1lcylcbiAgICAgICAgLmZpbHRlcih0ID0+IHQuYXJlYSA9PT0gJ2Zyb250ZW5kJyAmJiB0LnRoZW1lSUQgIT09ICdNYWdlbnRvL2JsYW5rJylcbiAgICAgICAgLmZpbHRlcih0ID0+IGRlcGxveWVkVGhlbWVzLmluY2x1ZGVzKHQudGhlbWVJRCkpXG4gICAgICAgIC5tYXAodCA9PiB0LnRoZW1lSUQpO1xufVxuIl19