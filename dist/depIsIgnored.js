"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const requireBuiltIns_1 = require("./requireBuiltIns");
const excludedFiles_1 = require("./excludedFiles");
/**
 * @summary Will return true or false whether the dependency is
 *          ignored in REQUIRE_BUILT_INS or EXCLUDED_FILES.
 */
function depIsIgnored(dep) {
    return requireBuiltIns_1.REQUIRE_BUILT_INS.includes(dep) || excludedFiles_1.EXCLUDED_FILES.includes(dep);
}
exports.depIsIgnored = depIsIgnored;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwSXNJZ25vcmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2RlcElzSWdub3JlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOztBQUVILHVEQUFzRDtBQUN0RCxtREFBaUQ7QUFFakQ7OztHQUdHO0FBQ0gsU0FBZ0IsWUFBWSxDQUFDLEdBQVc7SUFDcEMsT0FBTyxtQ0FBaUIsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksOEJBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDM0UsQ0FBQztBQUZELG9DQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgwqkgTWFnZW50bywgSW5jLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogU2VlIENPUFlJTkcudHh0IGZvciBsaWNlbnNlIGRldGFpbHMuXG4gKi9cblxuaW1wb3J0IHsgUkVRVUlSRV9CVUlMVF9JTlMgfSBmcm9tICcuL3JlcXVpcmVCdWlsdElucyc7XG5pbXBvcnQgeyBFWENMVURFRF9GSUxFUyB9IGZyb20gJy4vZXhjbHVkZWRGaWxlcyc7XG5cbi8qKlxuICogQHN1bW1hcnkgV2lsbCByZXR1cm4gdHJ1ZSBvciBmYWxzZSB3aGV0aGVyIHRoZSBkZXBlbmRlbmN5IGlzXG4gKiAgICAgICAgICBpZ25vcmVkIGluIFJFUVVJUkVfQlVJTFRfSU5TIG9yIEVYQ0xVREVEX0ZJTEVTLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVwSXNJZ25vcmVkKGRlcDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIFJFUVVJUkVfQlVJTFRfSU5TLmluY2x1ZGVzKGRlcCkgfHwgRVhDTFVERURfRklMRVMuaW5jbHVkZXMoZGVwKTtcbn1cbiJdfQ==