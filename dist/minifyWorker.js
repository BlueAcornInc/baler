"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const terser_1 = __importDefault(require("terser"));
// The RequireJS runtime, in some cases
// relies on Function.prototype.toString
// to find calls to `require`. These must
// be preserved
const mangleOptions = {
    reserved: ['require'],
};
/**
 * @summary Minifies JS code, optionally chaining from
 *          a provided source-map
 */
async function minifyFromString(code, filename, map) {
    const opts = {
        sourceMap: {
            filename,
            url: `${filename}.map`,
        },
        mangle: mangleOptions,
    };
    if (map) {
        try {
            const parsedMap = JSON.parse(map);
            // @ts-ignore
            opts.sourceMap.content = parsedMap;
        }
        catch { }
    }
    const result = terser_1.default.minify(code, opts);
    if (result.error)
        throw result.error;
    return { code: result.code, map: result.map };
}
exports.minifyFromString = minifyFromString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaWZ5V29ya2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21pbmlmeVdvcmtlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7OztBQUVILG9EQUFpRTtBQU9qRSx1Q0FBdUM7QUFDdkMsd0NBQXdDO0FBQ3hDLHlDQUF5QztBQUN6QyxlQUFlO0FBQ2YsTUFBTSxhQUFhLEdBQUc7SUFDbEIsUUFBUSxFQUFFLENBQUMsU0FBUyxDQUFDO0NBQ3hCLENBQUM7QUFFRjs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsZ0JBQWdCLENBQ2xDLElBQVksRUFDWixRQUFnQixFQUNoQixHQUFZO0lBRVosTUFBTSxJQUFJLEdBQWtCO1FBQ3hCLFNBQVMsRUFBRTtZQUNQLFFBQVE7WUFDUixHQUFHLEVBQUUsR0FBRyxRQUFRLE1BQU07U0FDekI7UUFDRCxNQUFNLEVBQUUsYUFBYTtLQUN4QixDQUFDO0lBRUYsSUFBSSxHQUFHLEVBQUU7UUFDTCxJQUFJO1lBQ0EsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQWdDLENBQUM7WUFDakUsYUFBYTtZQUNiLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztTQUN0QztRQUFDLE1BQU0sR0FBRTtLQUNiO0lBRUQsTUFBTSxNQUFNLEdBQUcsZ0JBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3pDLElBQUksTUFBTSxDQUFDLEtBQUs7UUFBRSxNQUFNLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFFckMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsSUFBYyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBYSxFQUFFLENBQUM7QUFDdEUsQ0FBQztBQXpCRCw0Q0F5QkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCDCqSBNYWdlbnRvLCBJbmMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBTZWUgQ09QWUlORy50eHQgZm9yIGxpY2Vuc2UgZGV0YWlscy5cbiAqL1xuXG5pbXBvcnQgdGVyc2VyLCB7IE1pbmlmeU9wdGlvbnMsIFNvdXJjZU1hcE9wdGlvbnMgfSBmcm9tICd0ZXJzZXInO1xuXG50eXBlIFN0cmluZ01pbmlmaWNhdGlvblJlc3VsdCA9IHtcbiAgICBjb2RlOiBzdHJpbmc7XG4gICAgbWFwOiBzdHJpbmc7XG59O1xuXG4vLyBUaGUgUmVxdWlyZUpTIHJ1bnRpbWUsIGluIHNvbWUgY2FzZXNcbi8vIHJlbGllcyBvbiBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmdcbi8vIHRvIGZpbmQgY2FsbHMgdG8gYHJlcXVpcmVgLiBUaGVzZSBtdXN0XG4vLyBiZSBwcmVzZXJ2ZWRcbmNvbnN0IG1hbmdsZU9wdGlvbnMgPSB7XG4gICAgcmVzZXJ2ZWQ6IFsncmVxdWlyZSddLFxufTtcblxuLyoqXG4gKiBAc3VtbWFyeSBNaW5pZmllcyBKUyBjb2RlLCBvcHRpb25hbGx5IGNoYWluaW5nIGZyb21cbiAqICAgICAgICAgIGEgcHJvdmlkZWQgc291cmNlLW1hcFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWluaWZ5RnJvbVN0cmluZyhcbiAgICBjb2RlOiBzdHJpbmcsXG4gICAgZmlsZW5hbWU6IHN0cmluZyxcbiAgICBtYXA/OiBzdHJpbmcsXG4pOiBQcm9taXNlPFN0cmluZ01pbmlmaWNhdGlvblJlc3VsdD4ge1xuICAgIGNvbnN0IG9wdHM6IE1pbmlmeU9wdGlvbnMgPSB7XG4gICAgICAgIHNvdXJjZU1hcDoge1xuICAgICAgICAgICAgZmlsZW5hbWUsXG4gICAgICAgICAgICB1cmw6IGAke2ZpbGVuYW1lfS5tYXBgLFxuICAgICAgICB9LFxuICAgICAgICBtYW5nbGU6IG1hbmdsZU9wdGlvbnMsXG4gICAgfTtcblxuICAgIGlmIChtYXApIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZE1hcCA9IEpTT04ucGFyc2UobWFwKSBhcyBTb3VyY2VNYXBPcHRpb25zWydjb250ZW50J107XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBvcHRzLnNvdXJjZU1hcC5jb250ZW50ID0gcGFyc2VkTWFwO1xuICAgICAgICB9IGNhdGNoIHt9XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0ID0gdGVyc2VyLm1pbmlmeShjb2RlLCBvcHRzKTtcbiAgICBpZiAocmVzdWx0LmVycm9yKSB0aHJvdyByZXN1bHQuZXJyb3I7XG5cbiAgICByZXR1cm4geyBjb2RlOiByZXN1bHQuY29kZSBhcyBzdHJpbmcsIG1hcDogcmVzdWx0Lm1hcCBhcyBzdHJpbmcgfTtcbn1cbiJdfQ==