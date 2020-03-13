"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const execa_1 = __importDefault(require("execa"));
const BalerError_1 = require("./BalerError");
const trace_1 = require("./trace");
// Note: Loading the very minimal amount of code on the PHP side
// so that we don't hit the performance bottleneck of bootstrapping
// the entire Magento application. Thanks Vinai!
const phpSource = `
    require 'vendor/autoload.php';
    echo json_encode([
        "themes" => (new \\Magento\\Framework\\Component\\ComponentRegistrar)->getPaths('theme'),
        "modules" => (new \\Magento\\Framework\\Component\\ComponentRegistrar)->getPaths('module')
    ]);
`;
const PHP_BIN = process.env.BALER_PHP_PATH || 'php';
/**
 * @summary Invokes the PHP binary and extracts info about modules
 *          and themes from a store
 */
async function getModulesAndThemesFromMagento(magentoRoot) {
    trace_1.trace('requesting module/theme payload from magento');
    try {
        const { stdout } = await execa_1.default(PHP_BIN, [`-r`, phpSource], {
            cwd: magentoRoot,
        });
        trace_1.trace(`received modules/themes payload from magento: ${stdout}`);
        return JSON.parse(stdout);
    }
    catch (err) {
        trace_1.trace(`failed extracting data from magento: ${err.stack}`);
        throw new BalerError_1.BalerError('Unable to extract list of modules/theme from Magento.\n\n' +
            'Common causes:\n' +
            '  - "php" binary not available on $PATH. The path to the PHP binary can ' +
            'be specified using the $BALER_PHP_PATH environment variable\n' +
            '  - Broken Magento installation. You can test that things are working ' +
            'by running "bin/magento module:status"');
    }
}
exports.getModulesAndThemesFromMagento = getModulesAndThemesFromMagento;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFnZW50b0ludGVyb3AuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbWFnZW50b0ludGVyb3AudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7QUFFSCxrREFBMEI7QUFFMUIsNkNBQTBDO0FBQzFDLG1DQUFnQztBQUVoQyxnRUFBZ0U7QUFDaEUsbUVBQW1FO0FBQ25FLGdEQUFnRDtBQUNoRCxNQUFNLFNBQVMsR0FBRzs7Ozs7O0NBTWpCLENBQUM7QUFFRixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxLQUFLLENBQUM7QUFFcEQ7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLDhCQUE4QixDQUNoRCxXQUFtQjtJQUVuQixhQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQztJQUV0RCxJQUFJO1FBQ0EsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sZUFBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsRUFBRTtZQUN2RCxHQUFHLEVBQUUsV0FBVztTQUNuQixDQUFDLENBQUM7UUFDSCxhQUFLLENBQUMsaURBQWlELE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDakUsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBbUIsQ0FBQztLQUMvQztJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsYUFBSyxDQUFDLHdDQUF3QyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUMzRCxNQUFNLElBQUksdUJBQVUsQ0FDaEIsMkRBQTJEO1lBQ3ZELGtCQUFrQjtZQUNsQiwwRUFBMEU7WUFDMUUsK0RBQStEO1lBQy9ELHdFQUF3RTtZQUN4RSx3Q0FBd0MsQ0FDL0MsQ0FBQztLQUNMO0FBQ0wsQ0FBQztBQXRCRCx3RUFzQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCDCqSBNYWdlbnRvLCBJbmMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBTZWUgQ09QWUlORy50eHQgZm9yIGxpY2Vuc2UgZGV0YWlscy5cbiAqL1xuXG5pbXBvcnQgZXhlY2EgZnJvbSAnZXhlY2EnO1xuaW1wb3J0IHsgQ29tcG9uZW50UGF0aHMgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IEJhbGVyRXJyb3IgfSBmcm9tICcuL0JhbGVyRXJyb3InO1xuaW1wb3J0IHsgdHJhY2UgfSBmcm9tICcuL3RyYWNlJztcblxuLy8gTm90ZTogTG9hZGluZyB0aGUgdmVyeSBtaW5pbWFsIGFtb3VudCBvZiBjb2RlIG9uIHRoZSBQSFAgc2lkZVxuLy8gc28gdGhhdCB3ZSBkb24ndCBoaXQgdGhlIHBlcmZvcm1hbmNlIGJvdHRsZW5lY2sgb2YgYm9vdHN0cmFwcGluZ1xuLy8gdGhlIGVudGlyZSBNYWdlbnRvIGFwcGxpY2F0aW9uLiBUaGFua3MgVmluYWkhXG5jb25zdCBwaHBTb3VyY2UgPSBgXG4gICAgcmVxdWlyZSAndmVuZG9yL2F1dG9sb2FkLnBocCc7XG4gICAgZWNobyBqc29uX2VuY29kZShbXG4gICAgICAgIFwidGhlbWVzXCIgPT4gKG5ldyBcXFxcTWFnZW50b1xcXFxGcmFtZXdvcmtcXFxcQ29tcG9uZW50XFxcXENvbXBvbmVudFJlZ2lzdHJhciktPmdldFBhdGhzKCd0aGVtZScpLFxuICAgICAgICBcIm1vZHVsZXNcIiA9PiAobmV3IFxcXFxNYWdlbnRvXFxcXEZyYW1ld29ya1xcXFxDb21wb25lbnRcXFxcQ29tcG9uZW50UmVnaXN0cmFyKS0+Z2V0UGF0aHMoJ21vZHVsZScpXG4gICAgXSk7XG5gO1xuXG5jb25zdCBQSFBfQklOID0gcHJvY2Vzcy5lbnYuQkFMRVJfUEhQX1BBVEggfHwgJ3BocCc7XG5cbi8qKlxuICogQHN1bW1hcnkgSW52b2tlcyB0aGUgUEhQIGJpbmFyeSBhbmQgZXh0cmFjdHMgaW5mbyBhYm91dCBtb2R1bGVzXG4gKiAgICAgICAgICBhbmQgdGhlbWVzIGZyb20gYSBzdG9yZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0TW9kdWxlc0FuZFRoZW1lc0Zyb21NYWdlbnRvKFxuICAgIG1hZ2VudG9Sb290OiBzdHJpbmcsXG4pOiBQcm9taXNlPENvbXBvbmVudFBhdGhzPiB7XG4gICAgdHJhY2UoJ3JlcXVlc3RpbmcgbW9kdWxlL3RoZW1lIHBheWxvYWQgZnJvbSBtYWdlbnRvJyk7XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCB7IHN0ZG91dCB9ID0gYXdhaXQgZXhlY2EoUEhQX0JJTiwgW2AtcmAsIHBocFNvdXJjZV0sIHtcbiAgICAgICAgICAgIGN3ZDogbWFnZW50b1Jvb3QsXG4gICAgICAgIH0pO1xuICAgICAgICB0cmFjZShgcmVjZWl2ZWQgbW9kdWxlcy90aGVtZXMgcGF5bG9hZCBmcm9tIG1hZ2VudG86ICR7c3Rkb3V0fWApO1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShzdGRvdXQpIGFzIENvbXBvbmVudFBhdGhzO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0cmFjZShgZmFpbGVkIGV4dHJhY3RpbmcgZGF0YSBmcm9tIG1hZ2VudG86ICR7ZXJyLnN0YWNrfWApO1xuICAgICAgICB0aHJvdyBuZXcgQmFsZXJFcnJvcihcbiAgICAgICAgICAgICdVbmFibGUgdG8gZXh0cmFjdCBsaXN0IG9mIG1vZHVsZXMvdGhlbWUgZnJvbSBNYWdlbnRvLlxcblxcbicgK1xuICAgICAgICAgICAgICAgICdDb21tb24gY2F1c2VzOlxcbicgK1xuICAgICAgICAgICAgICAgICcgIC0gXCJwaHBcIiBiaW5hcnkgbm90IGF2YWlsYWJsZSBvbiAkUEFUSC4gVGhlIHBhdGggdG8gdGhlIFBIUCBiaW5hcnkgY2FuICcgK1xuICAgICAgICAgICAgICAgICdiZSBzcGVjaWZpZWQgdXNpbmcgdGhlICRCQUxFUl9QSFBfUEFUSCBlbnZpcm9ubWVudCB2YXJpYWJsZVxcbicgK1xuICAgICAgICAgICAgICAgICcgIC0gQnJva2VuIE1hZ2VudG8gaW5zdGFsbGF0aW9uLiBZb3UgY2FuIHRlc3QgdGhhdCB0aGluZ3MgYXJlIHdvcmtpbmcgJyArXG4gICAgICAgICAgICAgICAgJ2J5IHJ1bm5pbmcgXCJiaW4vbWFnZW50byBtb2R1bGU6c3RhdHVzXCInLFxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==