"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const trace_1 = require("./trace");
const fast_glob_1 = __importDefault(require("fast-glob"));
const path_1 = require("path");
const fsPromises_1 = require("./fsPromises");
/**
 * @summary Invokes the PHP binary and extracts info about modules
 *          and themes from a store
 */
async function getModulesAndThemesFromMagento(magentoRoot) {
    trace_1.trace('requesting module/theme payload from magento');
    const dirs = [];
    dirs.push(path_1.join(process.cwd(), 'app', '**/registration.php'));
    dirs.push(path_1.join(process.cwd(), 'vendor', '**/registration.php'));
    const registrationFiles = await fast_glob_1.default(dirs);
    const componentPaths = {
        themes: {},
        modules: {}
    };
    // read each registration file and register module/theme path
    const pendingParse = registrationFiles.map(async (filePath) => {
        const registrationFile = await fsPromises_1.readFile(filePath, 'utf8');
        const dirParts = filePath.split('/');
        dirParts.pop();
        const dir = dirParts.join('/');
        const matches = registrationFile.replace(/\s+/g, '').match(/::register\((.*?)\);/);
        if (matches && matches.length) {
            const [type, name, location] = matches[1].split(',');
            const formattedType = type.split('::')[1];
            const formattedName = name.replace(/[\'\"]/g, '');
            const formattedLocation = location.replace('__DIR__', dir).replace(/[\.\'\"]/g, '');
            const blacklist = ['_files', 'tests'];
            // stop here if this is a test file
            for (const blacklisted of blacklist) {
                if (formattedLocation.indexOf(blacklisted) > -1) {
                    return;
                }
            }
            // Error handle invalid parsing of path and remove, this will cause globbing to fail silently
            try {
                await fsPromises_1.readdir(formattedLocation);
            }
            catch (err) {
                return;
            }
            switch (formattedType) {
                case "MODULE":
                    componentPaths.modules[formattedName] = formattedLocation;
                    break;
                case "THEME":
                    componentPaths.themes[formattedName] = formattedLocation;
                    break;
            }
        }
    });
    await Promise.all(pendingParse);
    return componentPaths;
}
exports.getModulesAndThemesFromMagento = getModulesAndThemesFromMagento;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFnZW50b0ludGVyb3AuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbWFnZW50b0ludGVyb3AudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7QUFHSCxtQ0FBZ0M7QUFDaEMsMERBQTZCO0FBQzdCLCtCQUE0QjtBQUM1Qiw2Q0FBaUQ7QUFFakQ7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLDhCQUE4QixDQUNoRCxXQUFtQjtJQUVuQixhQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQztJQUV0RCxNQUFNLElBQUksR0FBRyxFQUFFLENBQUM7SUFDaEIsSUFBSSxDQUFDLElBQUksQ0FDTCxXQUFJLENBQ0EsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUNiLEtBQUssRUFDTCxxQkFBcUIsQ0FDeEIsQ0FDSixDQUFDO0lBQ0YsSUFBSSxDQUFDLElBQUksQ0FDTCxXQUFJLENBQ0EsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUNiLFFBQVEsRUFDUixxQkFBcUIsQ0FDeEIsQ0FDSixDQUFDO0lBRUYsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLG1CQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFFMUMsTUFBTSxjQUFjLEdBQW1CO1FBQ25DLE1BQU0sRUFBRSxFQUFFO1FBQ1YsT0FBTyxFQUFFLEVBQUU7S0FDZCxDQUFDO0lBRUYsNkRBQTZEO0lBQzdELE1BQU0sWUFBWSxHQUFHLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLEVBQUU7UUFDMUQsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLHFCQUFRLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzFELE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDcEMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2YsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMvQixNQUFNLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQ2xGLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7WUFDM0IsTUFBTSxDQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFFLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN2RCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2xELE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUVwRixNQUFNLFNBQVMsR0FBRyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN0QyxtQ0FBbUM7WUFDbkMsS0FBSyxNQUFNLFdBQVcsSUFBSSxTQUFTLEVBQUU7Z0JBQ2pDLElBQUksaUJBQWlCLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO29CQUM3QyxPQUFPO2lCQUNWO2FBQ0o7WUFFRCw2RkFBNkY7WUFDN0YsSUFBSTtnQkFDQSxNQUFNLG9CQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQzthQUNwQztZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNWLE9BQU87YUFDVjtZQUVELFFBQVEsYUFBYSxFQUFFO2dCQUNuQixLQUFLLFFBQVE7b0JBQ1QsY0FBYyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsR0FBRyxpQkFBaUIsQ0FBQztvQkFDMUQsTUFBTTtnQkFDVixLQUFLLE9BQU87b0JBQ1IsY0FBYyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxpQkFBaUIsQ0FBQztvQkFDekQsTUFBTTthQUNiO1NBQ0o7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUVoQyxPQUFPLGNBQWMsQ0FBQztBQUMxQixDQUFDO0FBdEVELHdFQXNFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IMKpIE1hZ2VudG8sIEluYy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFNlZSBDT1BZSU5HLnR4dCBmb3IgbGljZW5zZSBkZXRhaWxzLlxuICovXG5cbmltcG9ydCB7IENvbXBvbmVudFBhdGhzIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyB0cmFjZSB9IGZyb20gJy4vdHJhY2UnO1xuaW1wb3J0IGdsb2IgZnJvbSAnZmFzdC1nbG9iJztcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IHJlYWRGaWxlLCByZWFkZGlyIH0gZnJvbSAnLi9mc1Byb21pc2VzJztcblxuLyoqXG4gKiBAc3VtbWFyeSBJbnZva2VzIHRoZSBQSFAgYmluYXJ5IGFuZCBleHRyYWN0cyBpbmZvIGFib3V0IG1vZHVsZXNcbiAqICAgICAgICAgIGFuZCB0aGVtZXMgZnJvbSBhIHN0b3JlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRNb2R1bGVzQW5kVGhlbWVzRnJvbU1hZ2VudG8oXG4gICAgbWFnZW50b1Jvb3Q6IHN0cmluZyxcbik6IFByb21pc2U8Q29tcG9uZW50UGF0aHM+IHtcbiAgICB0cmFjZSgncmVxdWVzdGluZyBtb2R1bGUvdGhlbWUgcGF5bG9hZCBmcm9tIG1hZ2VudG8nKTtcblxuICAgIGNvbnN0IGRpcnMgPSBbXTtcbiAgICBkaXJzLnB1c2goXG4gICAgICAgIGpvaW4oXG4gICAgICAgICAgICBwcm9jZXNzLmN3ZCgpLFxuICAgICAgICAgICAgJ2FwcCcsXG4gICAgICAgICAgICAnKiovcmVnaXN0cmF0aW9uLnBocCdcbiAgICAgICAgKVxuICAgICk7XG4gICAgZGlycy5wdXNoKFxuICAgICAgICBqb2luKFxuICAgICAgICAgICAgcHJvY2Vzcy5jd2QoKSxcbiAgICAgICAgICAgICd2ZW5kb3InLFxuICAgICAgICAgICAgJyoqL3JlZ2lzdHJhdGlvbi5waHAnXG4gICAgICAgIClcbiAgICApO1xuXG4gICAgY29uc3QgcmVnaXN0cmF0aW9uRmlsZXMgPSBhd2FpdCBnbG9iKGRpcnMpXG5cbiAgICBjb25zdCBjb21wb25lbnRQYXRoczogQ29tcG9uZW50UGF0aHMgPSB7XG4gICAgICAgIHRoZW1lczoge30sXG4gICAgICAgIG1vZHVsZXM6IHt9XG4gICAgfTtcblxuICAgIC8vIHJlYWQgZWFjaCByZWdpc3RyYXRpb24gZmlsZSBhbmQgcmVnaXN0ZXIgbW9kdWxlL3RoZW1lIHBhdGhcbiAgICBjb25zdCBwZW5kaW5nUGFyc2UgPSByZWdpc3RyYXRpb25GaWxlcy5tYXAoYXN5bmMgKGZpbGVQYXRoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlZ2lzdHJhdGlvbkZpbGUgPSBhd2FpdCByZWFkRmlsZShmaWxlUGF0aCwgJ3V0ZjgnKTtcbiAgICAgICAgY29uc3QgZGlyUGFydHMgPSBmaWxlUGF0aC5zcGxpdCgnLycpXG4gICAgICAgIGRpclBhcnRzLnBvcCgpO1xuICAgICAgICBjb25zdCBkaXIgPSBkaXJQYXJ0cy5qb2luKCcvJyk7XG4gICAgICAgIGNvbnN0IG1hdGNoZXMgPSByZWdpc3RyYXRpb25GaWxlLnJlcGxhY2UoL1xccysvZywnJykubWF0Y2goLzo6cmVnaXN0ZXJcXCgoLio/KVxcKTsvKTtcbiAgICAgICAgaWYgKG1hdGNoZXMgJiYgbWF0Y2hlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnN0IFsgdHlwZSwgbmFtZSwgbG9jYXRpb24gXSA9IG1hdGNoZXNbMV0uc3BsaXQoJywnKTtcbiAgICAgICAgICAgIGNvbnN0IGZvcm1hdHRlZFR5cGUgPSB0eXBlLnNwbGl0KCc6OicpWzFdO1xuICAgICAgICAgICAgY29uc3QgZm9ybWF0dGVkTmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcJ1xcXCJdL2csICcnKTtcbiAgICAgICAgICAgIGNvbnN0IGZvcm1hdHRlZExvY2F0aW9uID0gbG9jYXRpb24ucmVwbGFjZSgnX19ESVJfXycsIGRpcikucmVwbGFjZSgvW1xcLlxcJ1xcXCJdL2csICcnKTtcblxuICAgICAgICAgICAgY29uc3QgYmxhY2tsaXN0ID0gWydfZmlsZXMnLCAndGVzdHMnXTtcbiAgICAgICAgICAgIC8vIHN0b3AgaGVyZSBpZiB0aGlzIGlzIGEgdGVzdCBmaWxlXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGJsYWNrbGlzdGVkIG9mIGJsYWNrbGlzdCkge1xuICAgICAgICAgICAgICAgIGlmIChmb3JtYXR0ZWRMb2NhdGlvbi5pbmRleE9mKGJsYWNrbGlzdGVkKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEVycm9yIGhhbmRsZSBpbnZhbGlkIHBhcnNpbmcgb2YgcGF0aCBhbmQgcmVtb3ZlLCB0aGlzIHdpbGwgY2F1c2UgZ2xvYmJpbmcgdG8gZmFpbCBzaWxlbnRseVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCByZWFkZGlyKGZvcm1hdHRlZExvY2F0aW9uKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoIChmb3JtYXR0ZWRUeXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk1PRFVMRVwiOlxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRQYXRocy5tb2R1bGVzW2Zvcm1hdHRlZE5hbWVdID0gZm9ybWF0dGVkTG9jYXRpb247XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJUSEVNRVwiOlxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRQYXRocy50aGVtZXNbZm9ybWF0dGVkTmFtZV0gPSBmb3JtYXR0ZWRMb2NhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGF3YWl0IFByb21pc2UuYWxsKHBlbmRpbmdQYXJzZSk7XG5cbiAgICByZXR1cm4gY29tcG9uZW50UGF0aHM7XG59XG4iXX0=