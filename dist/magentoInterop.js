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
            const splitMatches = matches[1].split(',');
            if (splitMatches.length !== 3) {
                return;
            }
            const [type, name, location] = splitMatches;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFnZW50b0ludGVyb3AuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbWFnZW50b0ludGVyb3AudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7QUFHSCxtQ0FBZ0M7QUFDaEMsMERBQTZCO0FBQzdCLCtCQUE0QjtBQUM1Qiw2Q0FBaUQ7QUFFakQ7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLDhCQUE4QixDQUNoRCxXQUFtQjtJQUVuQixhQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQztJQUV0RCxNQUFNLElBQUksR0FBRyxFQUFFLENBQUM7SUFDaEIsSUFBSSxDQUFDLElBQUksQ0FDTCxXQUFJLENBQ0EsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUNiLEtBQUssRUFDTCxxQkFBcUIsQ0FDeEIsQ0FDSixDQUFDO0lBQ0YsSUFBSSxDQUFDLElBQUksQ0FDTCxXQUFJLENBQ0EsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUNiLFFBQVEsRUFDUixxQkFBcUIsQ0FDeEIsQ0FDSixDQUFDO0lBRUYsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLG1CQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFFMUMsTUFBTSxjQUFjLEdBQW1CO1FBQ25DLE1BQU0sRUFBRSxFQUFFO1FBQ1YsT0FBTyxFQUFFLEVBQUU7S0FDZCxDQUFDO0lBRUYsNkRBQTZEO0lBQzdELE1BQU0sWUFBWSxHQUFHLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLEVBQUU7UUFDMUQsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLHFCQUFRLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzFELE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDcEMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2YsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMvQixNQUFNLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQ2xGLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7WUFDM0IsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMzQyxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUMzQixPQUFPO2FBQ1Y7WUFDRCxNQUFNLENBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUUsR0FBRyxZQUFZLENBQUM7WUFDOUMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNsRCxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFcEYsTUFBTSxTQUFTLEdBQUcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDdEMsbUNBQW1DO1lBQ25DLEtBQUssTUFBTSxXQUFXLElBQUksU0FBUyxFQUFFO2dCQUNqQyxJQUFJLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtvQkFDN0MsT0FBTztpQkFDVjthQUNKO1lBRUQsNkZBQTZGO1lBQzdGLElBQUk7Z0JBQ0EsTUFBTSxvQkFBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7YUFDcEM7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDVixPQUFPO2FBQ1Y7WUFFRCxRQUFRLGFBQWEsRUFBRTtnQkFDbkIsS0FBSyxRQUFRO29CQUNULGNBQWMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsaUJBQWlCLENBQUM7b0JBQzFELE1BQU07Z0JBQ1YsS0FBSyxPQUFPO29CQUNSLGNBQWMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsaUJBQWlCLENBQUM7b0JBQ3pELE1BQU07YUFDYjtTQUNKO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7SUFFaEMsT0FBTyxjQUFjLENBQUM7QUFDMUIsQ0FBQztBQTFFRCx3RUEwRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCDCqSBNYWdlbnRvLCBJbmMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBTZWUgQ09QWUlORy50eHQgZm9yIGxpY2Vuc2UgZGV0YWlscy5cbiAqL1xuXG5pbXBvcnQgeyBDb21wb25lbnRQYXRocyB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHsgdHJhY2UgfSBmcm9tICcuL3RyYWNlJztcbmltcG9ydCBnbG9iIGZyb20gJ2Zhc3QtZ2xvYic7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyByZWFkRmlsZSwgcmVhZGRpciB9IGZyb20gJy4vZnNQcm9taXNlcyc7XG5cbi8qKlxuICogQHN1bW1hcnkgSW52b2tlcyB0aGUgUEhQIGJpbmFyeSBhbmQgZXh0cmFjdHMgaW5mbyBhYm91dCBtb2R1bGVzXG4gKiAgICAgICAgICBhbmQgdGhlbWVzIGZyb20gYSBzdG9yZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0TW9kdWxlc0FuZFRoZW1lc0Zyb21NYWdlbnRvKFxuICAgIG1hZ2VudG9Sb290OiBzdHJpbmcsXG4pOiBQcm9taXNlPENvbXBvbmVudFBhdGhzPiB7XG4gICAgdHJhY2UoJ3JlcXVlc3RpbmcgbW9kdWxlL3RoZW1lIHBheWxvYWQgZnJvbSBtYWdlbnRvJyk7XG5cbiAgICBjb25zdCBkaXJzID0gW107XG4gICAgZGlycy5wdXNoKFxuICAgICAgICBqb2luKFxuICAgICAgICAgICAgcHJvY2Vzcy5jd2QoKSxcbiAgICAgICAgICAgICdhcHAnLFxuICAgICAgICAgICAgJyoqL3JlZ2lzdHJhdGlvbi5waHAnXG4gICAgICAgIClcbiAgICApO1xuICAgIGRpcnMucHVzaChcbiAgICAgICAgam9pbihcbiAgICAgICAgICAgIHByb2Nlc3MuY3dkKCksXG4gICAgICAgICAgICAndmVuZG9yJyxcbiAgICAgICAgICAgICcqKi9yZWdpc3RyYXRpb24ucGhwJ1xuICAgICAgICApXG4gICAgKTtcblxuICAgIGNvbnN0IHJlZ2lzdHJhdGlvbkZpbGVzID0gYXdhaXQgZ2xvYihkaXJzKVxuXG4gICAgY29uc3QgY29tcG9uZW50UGF0aHM6IENvbXBvbmVudFBhdGhzID0ge1xuICAgICAgICB0aGVtZXM6IHt9LFxuICAgICAgICBtb2R1bGVzOiB7fVxuICAgIH07XG5cbiAgICAvLyByZWFkIGVhY2ggcmVnaXN0cmF0aW9uIGZpbGUgYW5kIHJlZ2lzdGVyIG1vZHVsZS90aGVtZSBwYXRoXG4gICAgY29uc3QgcGVuZGluZ1BhcnNlID0gcmVnaXN0cmF0aW9uRmlsZXMubWFwKGFzeW5jIChmaWxlUGF0aCkgPT4ge1xuICAgICAgICBjb25zdCByZWdpc3RyYXRpb25GaWxlID0gYXdhaXQgcmVhZEZpbGUoZmlsZVBhdGgsICd1dGY4Jyk7XG4gICAgICAgIGNvbnN0IGRpclBhcnRzID0gZmlsZVBhdGguc3BsaXQoJy8nKVxuICAgICAgICBkaXJQYXJ0cy5wb3AoKTtcbiAgICAgICAgY29uc3QgZGlyID0gZGlyUGFydHMuam9pbignLycpO1xuICAgICAgICBjb25zdCBtYXRjaGVzID0gcmVnaXN0cmF0aW9uRmlsZS5yZXBsYWNlKC9cXHMrL2csJycpLm1hdGNoKC86OnJlZ2lzdGVyXFwoKC4qPylcXCk7Lyk7XG4gICAgICAgIGlmIChtYXRjaGVzICYmIG1hdGNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBzcGxpdE1hdGNoZXMgPSBtYXRjaGVzWzFdLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICBpZiAoc3BsaXRNYXRjaGVzLmxlbmd0aCAhPT0gMykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IFsgdHlwZSwgbmFtZSwgbG9jYXRpb24gXSA9IHNwbGl0TWF0Y2hlcztcbiAgICAgICAgICAgIGNvbnN0IGZvcm1hdHRlZFR5cGUgPSB0eXBlLnNwbGl0KCc6OicpWzFdO1xuICAgICAgICAgICAgY29uc3QgZm9ybWF0dGVkTmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcJ1xcXCJdL2csICcnKTtcbiAgICAgICAgICAgIGNvbnN0IGZvcm1hdHRlZExvY2F0aW9uID0gbG9jYXRpb24ucmVwbGFjZSgnX19ESVJfXycsIGRpcikucmVwbGFjZSgvW1xcLlxcJ1xcXCJdL2csICcnKTtcblxuICAgICAgICAgICAgY29uc3QgYmxhY2tsaXN0ID0gWydfZmlsZXMnLCAndGVzdHMnXTtcbiAgICAgICAgICAgIC8vIHN0b3AgaGVyZSBpZiB0aGlzIGlzIGEgdGVzdCBmaWxlXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGJsYWNrbGlzdGVkIG9mIGJsYWNrbGlzdCkge1xuICAgICAgICAgICAgICAgIGlmIChmb3JtYXR0ZWRMb2NhdGlvbi5pbmRleE9mKGJsYWNrbGlzdGVkKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEVycm9yIGhhbmRsZSBpbnZhbGlkIHBhcnNpbmcgb2YgcGF0aCBhbmQgcmVtb3ZlLCB0aGlzIHdpbGwgY2F1c2UgZ2xvYmJpbmcgdG8gZmFpbCBzaWxlbnRseVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCByZWFkZGlyKGZvcm1hdHRlZExvY2F0aW9uKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoIChmb3JtYXR0ZWRUeXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcIk1PRFVMRVwiOlxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRQYXRocy5tb2R1bGVzW2Zvcm1hdHRlZE5hbWVdID0gZm9ybWF0dGVkTG9jYXRpb247XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJUSEVNRVwiOlxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRQYXRocy50aGVtZXNbZm9ybWF0dGVkTmFtZV0gPSBmb3JtYXR0ZWRMb2NhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGF3YWl0IFByb21pc2UuYWxsKHBlbmRpbmdQYXJzZSk7XG5cbiAgICByZXR1cm4gY29tcG9uZW50UGF0aHM7XG59XG4iXX0=