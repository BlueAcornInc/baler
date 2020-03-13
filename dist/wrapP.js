"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @summary Resolve a promise with an [error, result] tuple
 */
async function wrapP(promise) {
    try {
        const result = await promise;
        return [null, result];
    }
    catch (err) {
        return [err];
    }
}
exports.wrapP = wrapP;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JhcFAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvd3JhcFAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7QUFFSDs7R0FFRztBQUNJLEtBQUssVUFBVSxLQUFLLENBQ3ZCLE9BQW1CO0lBRW5CLElBQUk7UUFDQSxNQUFNLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQztRQUM3QixPQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ3pCO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDaEI7QUFDTCxDQUFDO0FBVEQsc0JBU0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCDCqSBNYWdlbnRvLCBJbmMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBTZWUgQ09QWUlORy50eHQgZm9yIGxpY2Vuc2UgZGV0YWlscy5cbiAqL1xuXG4vKipcbiAqIEBzdW1tYXJ5IFJlc29sdmUgYSBwcm9taXNlIHdpdGggYW4gW2Vycm9yLCByZXN1bHRdIHR1cGxlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB3cmFwUDxUPihcbiAgICBwcm9taXNlOiBQcm9taXNlPFQ+LFxuKTogUHJvbWlzZTxbbnVsbCwgVF0gfCBbRXJyb3JdPiB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcHJvbWlzZTtcbiAgICAgICAgcmV0dXJuIFtudWxsLCByZXN1bHRdO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICByZXR1cm4gW2Vycl07XG4gICAgfVxufVxuIl19