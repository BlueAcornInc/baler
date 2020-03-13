"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const acorn = __importStar(require("acorn"));
const acornLoose = __importStar(require("acorn-loose"));
const BalerError_1 = require("./BalerError");
/**
 * @summary Parse JavaScript into an ESTree AST. Can optionally
 *          use an error-tolerant loose parser, which is useful
 *          for JS intermingled with PHP
 */
function parse(input, opts) {
    const isLoose = opts && opts.loose;
    const parser = (isLoose ? acornLoose : acorn).parse;
    // Acorn types are poor, but the AST complies with the ESTree spec,
    // so we explicitly type cast to the ESTree root AST type
    return parser(input);
}
exports.parse = parse;
/**
 * @summary Attempt to parse an ObjectExpression from the input.
 *          If parsing fails in "strict" mode (default), will automatically
 *          retry in "loose" mode
 */
function parseObjectExpression(input, loose) {
    const hasOpeningBrace = /^\s*\{/.test(input);
    // {} is a block in statement position, so we need to wrap
    // in () to force an expression, if that hasn't been done
    const inputCleaned = hasOpeningBrace ? `(${input})` : input;
    try {
        const ast = parse(inputCleaned, { loose: !!loose });
        const [firstStmt] = ast.body;
        if (firstStmt.type === 'ExpressionStatement' &&
            firstStmt.expression.type === 'ObjectExpression') {
            return firstStmt.expression;
        }
        else {
            throw new BalerError_1.BalerError('Unable to parse object expression');
        }
    }
    catch (err) {
        if (!loose) {
            return parseObjectExpression(inputCleaned, true);
        }
        throw err;
    }
}
exports.parseObjectExpression = parseObjectExpression;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNQYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvanNQYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7Ozs7O0FBRUgsNkNBQStCO0FBQy9CLHdEQUEwQztBQUUxQyw2Q0FBMEM7QUFFMUM7Ozs7R0FJRztBQUNILFNBQWdCLEtBQUssQ0FBQyxLQUFhLEVBQUUsSUFBeUI7SUFDMUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDbkMsTUFBTSxNQUFNLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ3BELG1FQUFtRTtJQUNuRSx5REFBeUQ7SUFDekQsT0FBUSxNQUFNLENBQUMsS0FBSyxDQUFvQixDQUFDO0FBQzdDLENBQUM7QUFORCxzQkFNQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFnQixxQkFBcUIsQ0FDakMsS0FBYSxFQUNiLEtBQWU7SUFFZixNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzdDLDBEQUEwRDtJQUMxRCx5REFBeUQ7SUFDekQsTUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFFNUQsSUFBSTtRQUNBLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxZQUFZLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDcEQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDN0IsSUFDSSxTQUFTLENBQUMsSUFBSSxLQUFLLHFCQUFxQjtZQUN4QyxTQUFTLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxrQkFBa0IsRUFDbEQ7WUFDRSxPQUFPLFNBQVMsQ0FBQyxVQUE4QixDQUFDO1NBQ25EO2FBQU07WUFDSCxNQUFNLElBQUksdUJBQVUsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1NBQzdEO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDUixPQUFPLHFCQUFxQixDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNwRDtRQUVELE1BQU0sR0FBRyxDQUFDO0tBQ2I7QUFDTCxDQUFDO0FBM0JELHNEQTJCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IMKpIE1hZ2VudG8sIEluYy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFNlZSBDT1BZSU5HLnR4dCBmb3IgbGljZW5zZSBkZXRhaWxzLlxuICovXG5cbmltcG9ydCAqIGFzIGFjb3JuIGZyb20gJ2Fjb3JuJztcbmltcG9ydCAqIGFzIGFjb3JuTG9vc2UgZnJvbSAnYWNvcm4tbG9vc2UnO1xuaW1wb3J0IHsgUHJvZ3JhbSwgT2JqZWN0RXhwcmVzc2lvbiB9IGZyb20gJ2VzdHJlZSc7XG5pbXBvcnQgeyBCYWxlckVycm9yIH0gZnJvbSAnLi9CYWxlckVycm9yJztcblxuLyoqXG4gKiBAc3VtbWFyeSBQYXJzZSBKYXZhU2NyaXB0IGludG8gYW4gRVNUcmVlIEFTVC4gQ2FuIG9wdGlvbmFsbHlcbiAqICAgICAgICAgIHVzZSBhbiBlcnJvci10b2xlcmFudCBsb29zZSBwYXJzZXIsIHdoaWNoIGlzIHVzZWZ1bFxuICogICAgICAgICAgZm9yIEpTIGludGVybWluZ2xlZCB3aXRoIFBIUFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2UoaW5wdXQ6IHN0cmluZywgb3B0cz86IHsgbG9vc2U6IGJvb2xlYW4gfSkge1xuICAgIGNvbnN0IGlzTG9vc2UgPSBvcHRzICYmIG9wdHMubG9vc2U7XG4gICAgY29uc3QgcGFyc2VyID0gKGlzTG9vc2UgPyBhY29ybkxvb3NlIDogYWNvcm4pLnBhcnNlO1xuICAgIC8vIEFjb3JuIHR5cGVzIGFyZSBwb29yLCBidXQgdGhlIEFTVCBjb21wbGllcyB3aXRoIHRoZSBFU1RyZWUgc3BlYyxcbiAgICAvLyBzbyB3ZSBleHBsaWNpdGx5IHR5cGUgY2FzdCB0byB0aGUgRVNUcmVlIHJvb3QgQVNUIHR5cGVcbiAgICByZXR1cm4gKHBhcnNlcihpbnB1dCkgYXMgYW55KSBhcyBQcm9ncmFtO1xufVxuXG4vKipcbiAqIEBzdW1tYXJ5IEF0dGVtcHQgdG8gcGFyc2UgYW4gT2JqZWN0RXhwcmVzc2lvbiBmcm9tIHRoZSBpbnB1dC5cbiAqICAgICAgICAgIElmIHBhcnNpbmcgZmFpbHMgaW4gXCJzdHJpY3RcIiBtb2RlIChkZWZhdWx0KSwgd2lsbCBhdXRvbWF0aWNhbGx5XG4gKiAgICAgICAgICByZXRyeSBpbiBcImxvb3NlXCIgbW9kZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VPYmplY3RFeHByZXNzaW9uKFxuICAgIGlucHV0OiBzdHJpbmcsXG4gICAgbG9vc2U/OiBib29sZWFuLFxuKTogT2JqZWN0RXhwcmVzc2lvbiB7XG4gICAgY29uc3QgaGFzT3BlbmluZ0JyYWNlID0gL15cXHMqXFx7Ly50ZXN0KGlucHV0KTtcbiAgICAvLyB7fSBpcyBhIGJsb2NrIGluIHN0YXRlbWVudCBwb3NpdGlvbiwgc28gd2UgbmVlZCB0byB3cmFwXG4gICAgLy8gaW4gKCkgdG8gZm9yY2UgYW4gZXhwcmVzc2lvbiwgaWYgdGhhdCBoYXNuJ3QgYmVlbiBkb25lXG4gICAgY29uc3QgaW5wdXRDbGVhbmVkID0gaGFzT3BlbmluZ0JyYWNlID8gYCgke2lucHV0fSlgIDogaW5wdXQ7XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBhc3QgPSBwYXJzZShpbnB1dENsZWFuZWQsIHsgbG9vc2U6ICEhbG9vc2UgfSk7XG4gICAgICAgIGNvbnN0IFtmaXJzdFN0bXRdID0gYXN0LmJvZHk7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIGZpcnN0U3RtdC50eXBlID09PSAnRXhwcmVzc2lvblN0YXRlbWVudCcgJiZcbiAgICAgICAgICAgIGZpcnN0U3RtdC5leHByZXNzaW9uLnR5cGUgPT09ICdPYmplY3RFeHByZXNzaW9uJ1xuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiBmaXJzdFN0bXQuZXhwcmVzc2lvbiBhcyBPYmplY3RFeHByZXNzaW9uO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEJhbGVyRXJyb3IoJ1VuYWJsZSB0byBwYXJzZSBvYmplY3QgZXhwcmVzc2lvbicpO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGlmICghbG9vc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZU9iamVjdEV4cHJlc3Npb24oaW5wdXRDbGVhbmVkLCB0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IGVycjtcbiAgICB9XG59XG4iXX0=