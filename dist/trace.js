"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const perf_hooks_1 = require("perf_hooks");
const fs_1 = require("fs");
const IS_TEST = process.env.NODE_ENV === 'test';
/**
 * @summary Lazily initialize a write stream for a log file
 */
const getTraceFileStream = (() => {
    if (IS_TEST)
        return;
    const traceFile = path_1.join(process.cwd(), `baler-trace-${Date.now()}.txt`);
    let writeStream;
    return () => {
        if (!writeStream) {
            writeStream = fs_1.createWriteStream(traceFile);
        }
        return writeStream;
    };
})();
/**
 * @summary Add a single event to the event trace log
 */
function trace(event) {
    if (!tracingEnabled)
        return;
    const timeFromProcessStart = perf_hooks_1.performance.now();
    if (getTraceFileStream) {
        getTraceFileStream().write(`(${timeFromProcessStart}): ${event}\n`);
    }
}
exports.trace = trace;
let tracingEnabled = false;
/**
 * @summary Enable baler event tracing for all executions
 *          in the current process
 */
function enableTracing() {
    tracingEnabled = true;
}
exports.enableTracing = enableTracing;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdHJhY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7QUFFSCwrQkFBNEI7QUFDNUIsMkNBQXlDO0FBQ3pDLDJCQUFvRDtBQUVwRCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsS0FBSyxNQUFNLENBQUM7QUFFaEQ7O0dBRUc7QUFDSCxNQUFNLGtCQUFrQixHQUFHLENBQUMsR0FBRyxFQUFFO0lBQzdCLElBQUksT0FBTztRQUFFLE9BQU87SUFFcEIsTUFBTSxTQUFTLEdBQUcsV0FBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxlQUFlLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDdkUsSUFBSSxXQUF3QixDQUFDO0lBRTdCLE9BQU8sR0FBRyxFQUFFO1FBQ1IsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNkLFdBQVcsR0FBRyxzQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUM5QztRQUVELE9BQU8sV0FBVyxDQUFDO0lBQ3ZCLENBQUMsQ0FBQztBQUNOLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFFTDs7R0FFRztBQUNILFNBQWdCLEtBQUssQ0FBQyxLQUFhO0lBQy9CLElBQUksQ0FBQyxjQUFjO1FBQUUsT0FBTztJQUU1QixNQUFNLG9CQUFvQixHQUFHLHdCQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDL0MsSUFBSSxrQkFBa0IsRUFBRTtRQUNwQixrQkFBa0IsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLG9CQUFvQixNQUFNLEtBQUssSUFBSSxDQUFDLENBQUM7S0FDdkU7QUFDTCxDQUFDO0FBUEQsc0JBT0M7QUFFRCxJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUM7QUFDM0I7OztHQUdHO0FBQ0gsU0FBZ0IsYUFBYTtJQUN6QixjQUFjLEdBQUcsSUFBSSxDQUFDO0FBQzFCLENBQUM7QUFGRCxzQ0FFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IMKpIE1hZ2VudG8sIEluYy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFNlZSBDT1BZSU5HLnR4dCBmb3IgbGljZW5zZSBkZXRhaWxzLlxuICovXG5cbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IHBlcmZvcm1hbmNlIH0gZnJvbSAncGVyZl9ob29rcyc7XG5pbXBvcnQgeyBjcmVhdGVXcml0ZVN0cmVhbSwgV3JpdGVTdHJlYW0gfSBmcm9tICdmcyc7XG5cbmNvbnN0IElTX1RFU1QgPSBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Rlc3QnO1xuXG4vKipcbiAqIEBzdW1tYXJ5IExhemlseSBpbml0aWFsaXplIGEgd3JpdGUgc3RyZWFtIGZvciBhIGxvZyBmaWxlXG4gKi9cbmNvbnN0IGdldFRyYWNlRmlsZVN0cmVhbSA9ICgoKSA9PiB7XG4gICAgaWYgKElTX1RFU1QpIHJldHVybjtcblxuICAgIGNvbnN0IHRyYWNlRmlsZSA9IGpvaW4ocHJvY2Vzcy5jd2QoKSwgYGJhbGVyLXRyYWNlLSR7RGF0ZS5ub3coKX0udHh0YCk7XG4gICAgbGV0IHdyaXRlU3RyZWFtOiBXcml0ZVN0cmVhbTtcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGlmICghd3JpdGVTdHJlYW0pIHtcbiAgICAgICAgICAgIHdyaXRlU3RyZWFtID0gY3JlYXRlV3JpdGVTdHJlYW0odHJhY2VGaWxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB3cml0ZVN0cmVhbTtcbiAgICB9O1xufSkoKTtcblxuLyoqXG4gKiBAc3VtbWFyeSBBZGQgYSBzaW5nbGUgZXZlbnQgdG8gdGhlIGV2ZW50IHRyYWNlIGxvZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhY2UoZXZlbnQ6IHN0cmluZykge1xuICAgIGlmICghdHJhY2luZ0VuYWJsZWQpIHJldHVybjtcblxuICAgIGNvbnN0IHRpbWVGcm9tUHJvY2Vzc1N0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgaWYgKGdldFRyYWNlRmlsZVN0cmVhbSkge1xuICAgICAgICBnZXRUcmFjZUZpbGVTdHJlYW0oKS53cml0ZShgKCR7dGltZUZyb21Qcm9jZXNzU3RhcnR9KTogJHtldmVudH1cXG5gKTtcbiAgICB9XG59XG5cbmxldCB0cmFjaW5nRW5hYmxlZCA9IGZhbHNlO1xuLyoqXG4gKiBAc3VtbWFyeSBFbmFibGUgYmFsZXIgZXZlbnQgdHJhY2luZyBmb3IgYWxsIGV4ZWN1dGlvbnNcbiAqICAgICAgICAgIGluIHRoZSBjdXJyZW50IHByb2Nlc3NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuYWJsZVRyYWNpbmcoKSB7XG4gICAgdHJhY2luZ0VuYWJsZWQgPSB0cnVlO1xufVxuIl19