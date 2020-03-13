"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jest_worker_1 = __importDefault(require("jest-worker"));
const trace_1 = require("./trace");
function createMinifier() {
    trace_1.trace('creating minification worker pool');
    const worker = new jest_worker_1.default(require.resolve('./minifyWorker'), {
        forkOptions: {
            // surface console.log and friends in worker
            stdio: 'inherit',
        },
    });
    return {
        minifyFromString: worker.minifyFromString,
        destroy: worker.end.bind(worker),
    };
}
exports.createMinifier = createMinifier;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlTWluaWZpZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY3JlYXRlTWluaWZpZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7QUFFSCw4REFBaUM7QUFFakMsbUNBQWdDO0FBSWhDLFNBQWdCLGNBQWM7SUFDMUIsYUFBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7SUFDM0MsTUFBTSxNQUFNLEdBQUksSUFBSSxxQkFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtRQUMxRCxXQUFXLEVBQUU7WUFDVCw0Q0FBNEM7WUFDNUMsS0FBSyxFQUFFLFNBQVM7U0FDbkI7S0FDSixDQUFrRSxDQUFDO0lBRXBFLE9BQU87UUFDSCxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsZ0JBQWdCO1FBQ3pDLE9BQU8sRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7S0FDbkMsQ0FBQztBQUNOLENBQUM7QUFiRCx3Q0FhQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IMKpIE1hZ2VudG8sIEluYy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFNlZSBDT1BZSU5HLnR4dCBmb3IgbGljZW5zZSBkZXRhaWxzLlxuICovXG5cbmltcG9ydCBXb3JrZXIgZnJvbSAnamVzdC13b3JrZXInO1xuaW1wb3J0ICogYXMgbWluaWZ5V29ya2VyIGZyb20gJy4vbWluaWZ5V29ya2VyJztcbmltcG9ydCB7IHRyYWNlIH0gZnJvbSAnLi90cmFjZSc7XG5cbmV4cG9ydCB0eXBlIE1pbmlmaWVyID0gUmV0dXJuVHlwZTx0eXBlb2YgY3JlYXRlTWluaWZpZXI+O1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTWluaWZpZXIoKSB7XG4gICAgdHJhY2UoJ2NyZWF0aW5nIG1pbmlmaWNhdGlvbiB3b3JrZXIgcG9vbCcpO1xuICAgIGNvbnN0IHdvcmtlciA9IChuZXcgV29ya2VyKHJlcXVpcmUucmVzb2x2ZSgnLi9taW5pZnlXb3JrZXInKSwge1xuICAgICAgICBmb3JrT3B0aW9uczoge1xuICAgICAgICAgICAgLy8gc3VyZmFjZSBjb25zb2xlLmxvZyBhbmQgZnJpZW5kcyBpbiB3b3JrZXJcbiAgICAgICAgICAgIHN0ZGlvOiAnaW5oZXJpdCcsXG4gICAgICAgIH0sXG4gICAgfSkgYXMgdW5rbm93bikgYXMgdHlwZW9mIG1pbmlmeVdvcmtlciAmIEluc3RhbmNlVHlwZTx0eXBlb2YgV29ya2VyPjtcblxuICAgIHJldHVybiB7XG4gICAgICAgIG1pbmlmeUZyb21TdHJpbmc6IHdvcmtlci5taW5pZnlGcm9tU3RyaW5nLFxuICAgICAgICBkZXN0cm95OiB3b3JrZXIuZW5kLmJpbmQod29ya2VyKSxcbiAgICB9O1xufVxuIl19