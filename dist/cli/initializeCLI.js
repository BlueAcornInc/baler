"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const magentoFS_1 = require("../magentoFS");
const trace_1 = require("../trace");
const build_1 = require("./build");
const graph_1 = require("./graph");
const chalk_1 = __importDefault(require("chalk"));
const minimist_1 = __importDefault(require("minimist"));
async function initializeCLI(argv, cwd) {
    const args = minimist_1.default(argv.slice(2));
    const [command] = args._;
    if (args.help) {
        return console.log(helpMsg);
    }
    if (args.trace)
        trace_1.enableTracing();
    trace_1.trace('starting CLI');
    const magentoRoot = await magentoFS_1.findMagentoRoot(cwd);
    if (!magentoRoot) {
        errMsgAndExit(`Could not find required data from Magento store at "${cwd}". ` +
            'To bundle your themes, baler needs to run from a directory ' +
            'with access to the following locations:\n' +
            '- app/code\n' +
            '- app/etc/config.php\n' +
            '- pub/static' +
            '- vendor\n');
        return;
    }
    if (command === 'build' || !command) {
        const themeIDs = args.theme &&
            (Array.isArray(args.theme) ? args.theme : [args.theme]);
        return await failOnReject(build_1.build)(magentoRoot, themeIDs);
    }
    if (command === 'graph') {
        const themeID = args.theme;
        if (!themeID) {
            errMsgAndExit('Must supply the ID of a theme with --theme.');
        }
        return await failOnReject(graph_1.graph)(magentoRoot, themeID);
    }
    errMsgAndExit(`Unrecognized baler command: ${command}`);
}
exports.initializeCLI = initializeCLI;
function errMsgAndExit(message) {
    console.error(chalk_1.default.red(message));
    process.exit(1);
}
function failOnReject(fn) {
    return function failOnRejectWrapper(...args) {
        const promise = fn(...args);
        promise.catch((err) => {
            if ('isBalerError' in err) {
                // Don't need the ugly stack trace for the known
                // category of failures
                console.error(`\n\n${chalk_1.default.red(err.message)}`);
            }
            else {
                console.error(`\n\n${err.stack}`);
            }
            process.exit(1);
        });
        return promise;
    };
}
const helpMsg = chalk_1.default `Usage
  {green $ baler <command> [options]}

  {underline Commands}
    build --theme Vendor/name
    graph --theme Vendor/name

  {underline Examples}
    {gray Optimize all eligible themes}
    $ baler build

    {gray Optimize multiple themes}
    $ baler build --theme Magento/foo --theme Magento/bar

    {gray Generate Dependency Graph}
    $ baler graph --theme Magento/luma
`;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdGlhbGl6ZUNMSS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvaW5pdGlhbGl6ZUNMSS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7OztBQUVILDRDQUErQztBQUMvQyxvQ0FBZ0Q7QUFDaEQsbUNBQWdDO0FBQ2hDLG1DQUFnQztBQUVoQyxrREFBMEI7QUFDMUIsd0RBQWdDO0FBRXpCLEtBQUssVUFBVSxhQUFhLENBQUMsSUFBYyxFQUFFLEdBQVc7SUFDM0QsTUFBTSxJQUFJLEdBQUcsa0JBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7SUFFekIsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ1gsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQy9CO0lBRUQsSUFBSSxJQUFJLENBQUMsS0FBSztRQUFFLHFCQUFhLEVBQUUsQ0FBQztJQUNoQyxhQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7SUFFdEIsTUFBTSxXQUFXLEdBQUcsTUFBTSwyQkFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQy9DLElBQUksQ0FBQyxXQUFXLEVBQUU7UUFDZCxhQUFhLENBQ1QsdURBQXVELEdBQUcsS0FBSztZQUMzRCw2REFBNkQ7WUFDN0QsMkNBQTJDO1lBQzNDLGNBQWM7WUFDZCx3QkFBd0I7WUFDeEIsY0FBYztZQUNkLFlBQVksQ0FDbkIsQ0FBQztRQUNGLE9BQU87S0FDVjtJQUVELElBQUksT0FBTyxLQUFLLE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRTtRQUNqQyxNQUFNLFFBQVEsR0FDVixJQUFJLENBQUMsS0FBSztZQUNWLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFFNUQsT0FBTyxNQUFNLFlBQVksQ0FBQyxhQUFLLENBQUMsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDM0Q7SUFFRCxJQUFJLE9BQU8sS0FBSyxPQUFPLEVBQUU7UUFDckIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUMzQixJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1YsYUFBYSxDQUFDLDZDQUE2QyxDQUFDLENBQUM7U0FDaEU7UUFDRCxPQUFPLE1BQU0sWUFBWSxDQUFDLGFBQUssQ0FBQyxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUMxRDtJQUVELGFBQWEsQ0FBQywrQkFBK0IsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUM1RCxDQUFDO0FBMUNELHNDQTBDQztBQUVELFNBQVMsYUFBYSxDQUFDLE9BQWU7SUFDbEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDbEMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQixDQUFDO0FBRUQsU0FBUyxZQUFZLENBQXFCLEVBQUs7SUFDM0MsT0FBTyxTQUFTLG1CQUFtQixDQUFDLEdBQUcsSUFBVztRQUM5QyxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUU1QixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBdUIsRUFBRSxFQUFFO1lBQ3RDLElBQUksY0FBYyxJQUFJLEdBQUcsRUFBRTtnQkFDdkIsZ0RBQWdEO2dCQUNoRCx1QkFBdUI7Z0JBQ3ZCLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxlQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDbEQ7aUJBQU07Z0JBQ0gsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2FBQ3JDO1lBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQVEsQ0FBQztBQUNiLENBQUM7QUFFRCxNQUFNLE9BQU8sR0FBRyxlQUFLLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FnQnBCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCDCqSBNYWdlbnRvLCBJbmMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBTZWUgQ09QWUlORy50eHQgZm9yIGxpY2Vuc2UgZGV0YWlscy5cbiAqL1xuXG5pbXBvcnQgeyBmaW5kTWFnZW50b1Jvb3QgfSBmcm9tICcuLi9tYWdlbnRvRlMnO1xuaW1wb3J0IHsgdHJhY2UsIGVuYWJsZVRyYWNpbmcgfSBmcm9tICcuLi90cmFjZSc7XG5pbXBvcnQgeyBidWlsZCB9IGZyb20gJy4vYnVpbGQnO1xuaW1wb3J0IHsgZ3JhcGggfSBmcm9tICcuL2dyYXBoJztcbmltcG9ydCB7IEJhbGVyRXJyb3IgfSBmcm9tICcuLi9CYWxlckVycm9yJztcbmltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XG5pbXBvcnQgbWluaW1pc3QgZnJvbSAnbWluaW1pc3QnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZUNMSShhcmd2OiBzdHJpbmdbXSwgY3dkOiBzdHJpbmcpIHtcbiAgICBjb25zdCBhcmdzID0gbWluaW1pc3QoYXJndi5zbGljZSgyKSk7XG4gICAgY29uc3QgW2NvbW1hbmRdID0gYXJncy5fO1xuXG4gICAgaWYgKGFyZ3MuaGVscCkge1xuICAgICAgICByZXR1cm4gY29uc29sZS5sb2coaGVscE1zZyk7XG4gICAgfVxuXG4gICAgaWYgKGFyZ3MudHJhY2UpIGVuYWJsZVRyYWNpbmcoKTtcbiAgICB0cmFjZSgnc3RhcnRpbmcgQ0xJJyk7XG5cbiAgICBjb25zdCBtYWdlbnRvUm9vdCA9IGF3YWl0IGZpbmRNYWdlbnRvUm9vdChjd2QpO1xuICAgIGlmICghbWFnZW50b1Jvb3QpIHtcbiAgICAgICAgZXJyTXNnQW5kRXhpdChcbiAgICAgICAgICAgIGBDb3VsZCBub3QgZmluZCByZXF1aXJlZCBkYXRhIGZyb20gTWFnZW50byBzdG9yZSBhdCBcIiR7Y3dkfVwiLiBgICtcbiAgICAgICAgICAgICAgICAnVG8gYnVuZGxlIHlvdXIgdGhlbWVzLCBiYWxlciBuZWVkcyB0byBydW4gZnJvbSBhIGRpcmVjdG9yeSAnICtcbiAgICAgICAgICAgICAgICAnd2l0aCBhY2Nlc3MgdG8gdGhlIGZvbGxvd2luZyBsb2NhdGlvbnM6XFxuJyArXG4gICAgICAgICAgICAgICAgJy0gYXBwL2NvZGVcXG4nICtcbiAgICAgICAgICAgICAgICAnLSBhcHAvZXRjL2NvbmZpZy5waHBcXG4nICtcbiAgICAgICAgICAgICAgICAnLSBwdWIvc3RhdGljJyArXG4gICAgICAgICAgICAgICAgJy0gdmVuZG9yXFxuJyxcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChjb21tYW5kID09PSAnYnVpbGQnIHx8ICFjb21tYW5kKSB7XG4gICAgICAgIGNvbnN0IHRoZW1lSURzID1cbiAgICAgICAgICAgIGFyZ3MudGhlbWUgJiZcbiAgICAgICAgICAgIChBcnJheS5pc0FycmF5KGFyZ3MudGhlbWUpID8gYXJncy50aGVtZSA6IFthcmdzLnRoZW1lXSk7XG5cbiAgICAgICAgcmV0dXJuIGF3YWl0IGZhaWxPblJlamVjdChidWlsZCkobWFnZW50b1Jvb3QsIHRoZW1lSURzKTtcbiAgICB9XG5cbiAgICBpZiAoY29tbWFuZCA9PT0gJ2dyYXBoJykge1xuICAgICAgICBjb25zdCB0aGVtZUlEID0gYXJncy50aGVtZTtcbiAgICAgICAgaWYgKCF0aGVtZUlEKSB7XG4gICAgICAgICAgICBlcnJNc2dBbmRFeGl0KCdNdXN0IHN1cHBseSB0aGUgSUQgb2YgYSB0aGVtZSB3aXRoIC0tdGhlbWUuJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGF3YWl0IGZhaWxPblJlamVjdChncmFwaCkobWFnZW50b1Jvb3QsIHRoZW1lSUQpO1xuICAgIH1cblxuICAgIGVyck1zZ0FuZEV4aXQoYFVucmVjb2duaXplZCBiYWxlciBjb21tYW5kOiAke2NvbW1hbmR9YCk7XG59XG5cbmZ1bmN0aW9uIGVyck1zZ0FuZEV4aXQobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgY29uc29sZS5lcnJvcihjaGFsay5yZWQobWVzc2FnZSkpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbn1cblxuZnVuY3Rpb24gZmFpbE9uUmVqZWN0PFQgZXh0ZW5kcyBGdW5jdGlvbj4oZm46IFQpOiBUIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gZmFpbE9uUmVqZWN0V3JhcHBlciguLi5hcmdzOiBhbnlbXSkge1xuICAgICAgICBjb25zdCBwcm9taXNlID0gZm4oLi4uYXJncyk7XG5cbiAgICAgICAgcHJvbWlzZS5jYXRjaCgoZXJyOiBFcnJvciB8IEJhbGVyRXJyb3IpID0+IHtcbiAgICAgICAgICAgIGlmICgnaXNCYWxlckVycm9yJyBpbiBlcnIpIHtcbiAgICAgICAgICAgICAgICAvLyBEb24ndCBuZWVkIHRoZSB1Z2x5IHN0YWNrIHRyYWNlIGZvciB0aGUga25vd25cbiAgICAgICAgICAgICAgICAvLyBjYXRlZ29yeSBvZiBmYWlsdXJlc1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFxcblxcbiR7Y2hhbGsucmVkKGVyci5tZXNzYWdlKX1gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgXFxuXFxuJHtlcnIuc3RhY2t9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH0gYXMgYW55O1xufVxuXG5jb25zdCBoZWxwTXNnID0gY2hhbGtgVXNhZ2VcbiAge2dyZWVuICQgYmFsZXIgPGNvbW1hbmQ+IFtvcHRpb25zXX1cblxuICB7dW5kZXJsaW5lIENvbW1hbmRzfVxuICAgIGJ1aWxkIC0tdGhlbWUgVmVuZG9yL25hbWVcbiAgICBncmFwaCAtLXRoZW1lIFZlbmRvci9uYW1lXG5cbiAge3VuZGVybGluZSBFeGFtcGxlc31cbiAgICB7Z3JheSBPcHRpbWl6ZSBhbGwgZWxpZ2libGUgdGhlbWVzfVxuICAgICQgYmFsZXIgYnVpbGRcblxuICAgIHtncmF5IE9wdGltaXplIG11bHRpcGxlIHRoZW1lc31cbiAgICAkIGJhbGVyIGJ1aWxkIC0tdGhlbWUgTWFnZW50by9mb28gLS10aGVtZSBNYWdlbnRvL2JhclxuXG4gICAge2dyYXkgR2VuZXJhdGUgRGVwZW5kZW5jeSBHcmFwaH1cbiAgICAkIGJhbGVyIGdyYXBoIC0tdGhlbWUgTWFnZW50by9sdW1hXG5gO1xuIl19