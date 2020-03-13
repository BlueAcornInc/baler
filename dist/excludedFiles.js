"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const EXCLUDED_FILES = [
    // TODO: translation files are excluded as a work-around
    // for a bug. Implementing the "thorough" solution from
    // the following issue will speed up storefronts
    // https://github.com/magento/baler/issues/47#issuecomment-582580154
    'text!js-translation.json',
];
exports.EXCLUDED_FILES = EXCLUDED_FILES;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjbHVkZWRGaWxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9leGNsdWRlZEZpbGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7O0FBRUgsTUFBTSxjQUFjLEdBQTBCO0lBQzFDLHdEQUF3RDtJQUN4RCx1REFBdUQ7SUFDdkQsZ0RBQWdEO0lBQ2hELG9FQUFvRTtJQUNwRSwwQkFBMEI7Q0FDN0IsQ0FBQztBQUVPLHdDQUFjIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgwqkgTWFnZW50bywgSW5jLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogU2VlIENPUFlJTkcudHh0IGZvciBsaWNlbnNlIGRldGFpbHMuXG4gKi9cblxuY29uc3QgRVhDTFVERURfRklMRVM6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPiA9IFtcbiAgICAvLyBUT0RPOiB0cmFuc2xhdGlvbiBmaWxlcyBhcmUgZXhjbHVkZWQgYXMgYSB3b3JrLWFyb3VuZFxuICAgIC8vIGZvciBhIGJ1Zy4gSW1wbGVtZW50aW5nIHRoZSBcInRob3JvdWdoXCIgc29sdXRpb24gZnJvbVxuICAgIC8vIHRoZSBmb2xsb3dpbmcgaXNzdWUgd2lsbCBzcGVlZCB1cCBzdG9yZWZyb250c1xuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tYWdlbnRvL2JhbGVyL2lzc3Vlcy80NyNpc3N1ZWNvbW1lbnQtNTgyNTgwMTU0XG4gICAgJ3RleHQhanMtdHJhbnNsYXRpb24uanNvbicsXG5dO1xuXG5leHBvcnQgeyBFWENMVURFRF9GSUxFUyB9O1xuIl19