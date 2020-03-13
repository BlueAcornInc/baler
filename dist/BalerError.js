"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const trace_1 = require("./trace");
/**
 * @summary A branded error type used for known
 *          categories of errors. We don't
 *          want to log an ugly stack trace on
 *          the CLI for errors we have a clear
 *          message (and known root cause) for.
 *
 */
class BalerError extends Error {
    constructor(message) {
        super(message);
        Error.captureStackTrace(this, BalerError);
        trace_1.trace(`Baler error created. Message: ${message}`);
    }
    get isBalerError() {
        return true;
    }
}
exports.BalerError = BalerError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFsZXJFcnJvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9CYWxlckVycm9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7O0FBRUgsbUNBQWdDO0FBRWhDOzs7Ozs7O0dBT0c7QUFDSCxNQUFhLFVBQVcsU0FBUSxLQUFLO0lBQ2pDLFlBQVksT0FBZTtRQUN2QixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDZixLQUFLLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzFDLGFBQUssQ0FBQyxpQ0FBaUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQsSUFBSSxZQUFZO1FBQ1osT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKO0FBVkQsZ0NBVUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCDCqSBNYWdlbnRvLCBJbmMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBTZWUgQ09QWUlORy50eHQgZm9yIGxpY2Vuc2UgZGV0YWlscy5cbiAqL1xuXG5pbXBvcnQgeyB0cmFjZSB9IGZyb20gJy4vdHJhY2UnO1xuXG4vKipcbiAqIEBzdW1tYXJ5IEEgYnJhbmRlZCBlcnJvciB0eXBlIHVzZWQgZm9yIGtub3duXG4gKiAgICAgICAgICBjYXRlZ29yaWVzIG9mIGVycm9ycy4gV2UgZG9uJ3RcbiAqICAgICAgICAgIHdhbnQgdG8gbG9nIGFuIHVnbHkgc3RhY2sgdHJhY2Ugb25cbiAqICAgICAgICAgIHRoZSBDTEkgZm9yIGVycm9ycyB3ZSBoYXZlIGEgY2xlYXJcbiAqICAgICAgICAgIG1lc3NhZ2UgKGFuZCBrbm93biByb290IGNhdXNlKSBmb3IuXG4gKlxuICovXG5leHBvcnQgY2xhc3MgQmFsZXJFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIobWVzc2FnZSk7XG4gICAgICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIEJhbGVyRXJyb3IpO1xuICAgICAgICB0cmFjZShgQmFsZXIgZXJyb3IgY3JlYXRlZC4gTWVzc2FnZTogJHttZXNzYWdlfWApO1xuICAgIH1cblxuICAgIGdldCBpc0JhbGVyRXJyb3IoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cbiJdfQ==