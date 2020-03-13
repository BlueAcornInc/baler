"use strict";
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const htmlparser2_1 = require("htmlparser2");
const parseJavaScriptDeps_1 = require("./parseJavaScriptDeps");
const jsParser_1 = require("./jsParser");
const BalerError_1 = require("./BalerError");
/**
 * @summary Given contents from a .phtml or .html file from Magento,
 *          will return all JavaScript dependencies. Sources include:
 *          - x-magento-init script tags
 *          - data-mage-init attributes
 *          - mageInit knockout directive
 *          - require() calls in script tags
 *          - define() calls in script tags
 * @see https://devdocs.magento.com/guides/v2.3/javascript-dev-guide/javascript/js_init.html
 */
function parseTemplateDeps(input) {
    const collector = new NodeCollector();
    const parser = new htmlparser2_1.Parser(collector, {
        lowerCaseTags: true,
        lowerCaseAttributeNames: true,
    });
    const cleanedInput = replacePHPDelimiters(input);
    parser.write(cleanedInput);
    return {
        // kill duplicates
        deps: Array.from(new Set(collector.deps)),
        incompleteAnalysis: collector.incompleteAnalysis,
    };
}
exports.parseTemplateDeps = parseTemplateDeps;
/**
 * @summary Implements htmlparser2's `Handler` interface
 *          and collects all forms of mage-init directives
 */
class NodeCollector {
    constructor() {
        this.deps = [];
        this.incompleteAnalysis = false;
        this.inXMageInitScript = false;
        this.inScript = false;
        this.buffer = '';
    }
    onopentag(name, attribs) {
        const dataMageInit = attribs['data-mage-init'];
        const dataBind = attribs['data-bind'];
        if (dataMageInit) {
            try {
                this.deps.push(...extractDepsFromDataMageInitAttr(dataMageInit));
            }
            catch {
                this.incompleteAnalysis = true;
            }
        }
        if (dataBind && dataBind.includes('mageInit')) {
            try {
                this.deps.push(...extractMageInitDepsFromDataBind(dataBind));
            }
            catch {
                this.incompleteAnalysis = true;
            }
        }
        if (name === 'script') {
            const { type = 'text/javascript' } = attribs;
            if (type === 'text/javascript') {
                this.inScript = true;
            }
            if (type === 'text/x-magento-init') {
                this.inXMageInitScript = true;
            }
        }
    }
    ontext(value) {
        if (!(this.inXMageInitScript || this.inScript))
            return;
        this.buffer += value;
    }
    onclosetag() {
        if (this.inXMageInitScript) {
            try {
                this.deps.push(...extractDepsFromXMagentoInit(this.buffer));
            }
            catch {
                this.incompleteAnalysis = true;
            }
            this.buffer = '';
            this.inXMageInitScript = false;
        }
        if (this.inScript) {
            try {
                const results = parseJavaScriptDeps_1.parseJavaScriptDeps(this.buffer, true);
                this.deps.push(...results.deps);
                if (results.incompleteAnalysis)
                    this.incompleteAnalysis = true;
            }
            catch {
                this.incompleteAnalysis = true;
            }
            this.buffer = '';
            this.inScript = false;
        }
    }
}
/**
 * @summary Given the value of a Knockout template `data-bind`
 *          attribute, will find the `mageInit` key if present,
 *          and return a list of all dependencies
 * @see https://knockoutjs.com/documentation/binding-syntax.html
 */
function extractMageInitDepsFromDataBind(attrValue) {
    // Knockout bindings form an object literal without the outer wrapping braces
    const objExpression = jsParser_1.parseObjectExpression(`{${attrValue}}`);
    const mageInitProp = objExpression.properties.find(p => p.key.type === 'Identifier' && p.key.name === 'mageInit');
    if (!mageInitProp) {
        throw new BalerError_1.BalerError('Could not locate "mageInit" property');
    }
    const propValue = mageInitProp.value;
    return getPropertyNamesFromObjExpression(propValue);
}
/**
 * @summary Parses dependencies out of a `data-mage-init` attribute
 */
function extractDepsFromDataMageInitAttr(attrValue) {
    const objExpression = jsParser_1.parseObjectExpression(attrValue);
    return getPropertyNamesFromObjExpression(objExpression);
}
/**
 * @summary Replace PHP delimiters (and their contents) with placeholder
 *          values that will not break HTML parsing when the delimiters
 *          are not wrapped as JS string literals
 */
function replacePHPDelimiters(input) {
    return input.replace(/(<\?(?:=|php)[\s\S]+?\?>)/g, 'PHP_DELIM_PLACEHOLDER');
}
/**
 * @summary Extract dependencies from the value of a script tag
 *          that has type="text/x-magento-init". A x-magento-init
 *          is required to be JSON-compliant _after_ render, but
 *          will have PHP interpolations in places when pulled
 *          directly from a .phtml file
 */
function extractDepsFromXMagentoInit(input) {
    const objExpression = jsParser_1.parseObjectExpression(input);
    const deps = [];
    for (const selector of objExpression.properties) {
        const propValue = selector.value;
        deps.push(...getPropertyNamesFromObjExpression(propValue));
    }
    return deps;
}
/**
 * @summary Given an AST for an object literal, return all literal
 *          property names, and report when a key can not be statically
 *          analyzed
 */
function getPropertyNamesFromObjExpression(node) {
    const keys = [];
    for (const { key } of node.properties) {
        if (key.type === 'Literal' && typeof key.value === 'string') {
            keys.push(key.value);
        }
        if (key.type === 'Identifier') {
            keys.push(key.name);
        }
    }
    return keys;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VUZW1wbGF0ZURlcHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcGFyc2VUZW1wbGF0ZURlcHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7QUFFSCw2Q0FBbUQ7QUFFbkQsK0RBQTREO0FBQzVELHlDQUFtRDtBQUVuRCw2Q0FBMEM7QUFFMUM7Ozs7Ozs7OztHQVNHO0FBQ0gsU0FBZ0IsaUJBQWlCLENBQUMsS0FBYTtJQUMzQyxNQUFNLFNBQVMsR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDO0lBQ3RDLE1BQU0sTUFBTSxHQUFHLElBQUksb0JBQVUsQ0FBQyxTQUFTLEVBQUU7UUFDckMsYUFBYSxFQUFFLElBQUk7UUFDbkIsdUJBQXVCLEVBQUUsSUFBSTtLQUNoQyxDQUFDLENBQUM7SUFDSCxNQUFNLFlBQVksR0FBRyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqRCxNQUFNLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBRTNCLE9BQU87UUFDSCxrQkFBa0I7UUFDbEIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pDLGtCQUFrQixFQUFFLFNBQVMsQ0FBQyxrQkFBa0I7S0FDbkQsQ0FBQztBQUNOLENBQUM7QUFkRCw4Q0FjQztBQUVEOzs7R0FHRztBQUNILE1BQU0sYUFBYTtJQUFuQjtRQUNJLFNBQUksR0FBYSxFQUFFLENBQUM7UUFDcEIsdUJBQWtCLEdBQVksS0FBSyxDQUFDO1FBQ3BDLHNCQUFpQixHQUFZLEtBQUssQ0FBQztRQUNuQyxhQUFRLEdBQVksS0FBSyxDQUFDO1FBQzFCLFdBQU0sR0FBVyxFQUFFLENBQUM7SUErRHhCLENBQUM7SUE3REcsU0FBUyxDQUFDLElBQVksRUFBRSxPQUErQjtRQUNuRCxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUMv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LENBQUMsS0FBSyxDQUFDLENBQUM7U0FDeEI7UUFFRCxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssWUFBWSxFQUFFO1lBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZCO0tBQ0o7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgwqkgTWFnZW50bywgSW5jLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogU2VlIENPUFlJTkcudHh0IGZvciBsaWNlbnNlIGRldGFpbHMuXG4gKi9cblxuaW1wb3J0IHsgUGFyc2VyIGFzIEhUTUxQYXJzZXIgfSBmcm9tICdodG1scGFyc2VyMic7XG5pbXBvcnQgeyBPYmplY3RFeHByZXNzaW9uIH0gZnJvbSAnZXN0cmVlJztcbmltcG9ydCB7IHBhcnNlSmF2YVNjcmlwdERlcHMgfSBmcm9tICcuL3BhcnNlSmF2YVNjcmlwdERlcHMnO1xuaW1wb3J0IHsgcGFyc2VPYmplY3RFeHByZXNzaW9uIH0gZnJvbSAnLi9qc1BhcnNlcic7XG5pbXBvcnQgeyBQYXJzZXJSZXN1bHQgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IEJhbGVyRXJyb3IgfSBmcm9tICcuL0JhbGVyRXJyb3InO1xuXG4vKipcbiAqIEBzdW1tYXJ5IEdpdmVuIGNvbnRlbnRzIGZyb20gYSAucGh0bWwgb3IgLmh0bWwgZmlsZSBmcm9tIE1hZ2VudG8sXG4gKiAgICAgICAgICB3aWxsIHJldHVybiBhbGwgSmF2YVNjcmlwdCBkZXBlbmRlbmNpZXMuIFNvdXJjZXMgaW5jbHVkZTpcbiAqICAgICAgICAgIC0geC1tYWdlbnRvLWluaXQgc2NyaXB0IHRhZ3NcbiAqICAgICAgICAgIC0gZGF0YS1tYWdlLWluaXQgYXR0cmlidXRlc1xuICogICAgICAgICAgLSBtYWdlSW5pdCBrbm9ja291dCBkaXJlY3RpdmVcbiAqICAgICAgICAgIC0gcmVxdWlyZSgpIGNhbGxzIGluIHNjcmlwdCB0YWdzXG4gKiAgICAgICAgICAtIGRlZmluZSgpIGNhbGxzIGluIHNjcmlwdCB0YWdzXG4gKiBAc2VlIGh0dHBzOi8vZGV2ZG9jcy5tYWdlbnRvLmNvbS9ndWlkZXMvdjIuMy9qYXZhc2NyaXB0LWRldi1ndWlkZS9qYXZhc2NyaXB0L2pzX2luaXQuaHRtbFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VUZW1wbGF0ZURlcHMoaW5wdXQ6IHN0cmluZyk6IFBhcnNlclJlc3VsdCB7XG4gICAgY29uc3QgY29sbGVjdG9yID0gbmV3IE5vZGVDb2xsZWN0b3IoKTtcbiAgICBjb25zdCBwYXJzZXIgPSBuZXcgSFRNTFBhcnNlcihjb2xsZWN0b3IsIHtcbiAgICAgICAgbG93ZXJDYXNlVGFnczogdHJ1ZSxcbiAgICAgICAgbG93ZXJDYXNlQXR0cmlidXRlTmFtZXM6IHRydWUsXG4gICAgfSk7XG4gICAgY29uc3QgY2xlYW5lZElucHV0ID0gcmVwbGFjZVBIUERlbGltaXRlcnMoaW5wdXQpO1xuICAgIHBhcnNlci53cml0ZShjbGVhbmVkSW5wdXQpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgLy8ga2lsbCBkdXBsaWNhdGVzXG4gICAgICAgIGRlcHM6IEFycmF5LmZyb20obmV3IFNldChjb2xsZWN0b3IuZGVwcykpLFxuICAgICAgICBpbmNvbXBsZXRlQW5hbHlzaXM6IGNvbGxlY3Rvci5pbmNvbXBsZXRlQW5hbHlzaXMsXG4gICAgfTtcbn1cblxuLyoqXG4gKiBAc3VtbWFyeSBJbXBsZW1lbnRzIGh0bWxwYXJzZXIyJ3MgYEhhbmRsZXJgIGludGVyZmFjZVxuICogICAgICAgICAgYW5kIGNvbGxlY3RzIGFsbCBmb3JtcyBvZiBtYWdlLWluaXQgZGlyZWN0aXZlc1xuICovXG5jbGFzcyBOb2RlQ29sbGVjdG9yIHtcbiAgICBkZXBzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGluY29tcGxldGVBbmFseXNpczogYm9vbGVhbiA9IGZhbHNlO1xuICAgIGluWE1hZ2VJbml0U2NyaXB0OiBib29sZWFuID0gZmFsc2U7XG4gICAgaW5TY3JpcHQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBidWZmZXI6IHN0cmluZyA9ICcnO1xuXG4gICAgb25vcGVudGFnKG5hbWU6IHN0cmluZywgYXR0cmliczogUmVjb3JkPHN0cmluZywgc3RyaW5nPikge1xuICAgICAgICBjb25zdCBkYXRhTWFnZUluaXQgPSBhdHRyaWJzWydkYXRhLW1hZ2UtaW5pdCddO1xuICAgICAgICBjb25zdCBkYXRhQmluZCA9IGF0dHJpYnNbJ2RhdGEtYmluZCddO1xuXG4gICAgICAgIGlmIChkYXRhTWFnZUluaXQpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXBzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgIC4uLmV4dHJhY3REZXBzRnJvbURhdGFNYWdlSW5pdEF0dHIoZGF0YU1hZ2VJbml0KSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmNvbXBsZXRlQW5hbHlzaXMgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRhdGFCaW5kICYmIGRhdGFCaW5kLmluY2x1ZGVzKCdtYWdlSW5pdCcpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVwcy5wdXNoKC4uLmV4dHJhY3RNYWdlSW5pdERlcHNGcm9tRGF0YUJpbmQoZGF0YUJpbmQpKTtcbiAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5jb21wbGV0ZUFuYWx5c2lzID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuYW1lID09PSAnc2NyaXB0Jykge1xuICAgICAgICAgICAgY29uc3QgeyB0eXBlID0gJ3RleHQvamF2YXNjcmlwdCcgfSA9IGF0dHJpYnM7XG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ3RleHQvamF2YXNjcmlwdCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluU2NyaXB0ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlID09PSAndGV4dC94LW1hZ2VudG8taW5pdCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluWE1hZ2VJbml0U2NyaXB0ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9udGV4dCh2YWx1ZTogc3RyaW5nKSB7XG4gICAgICAgIGlmICghKHRoaXMuaW5YTWFnZUluaXRTY3JpcHQgfHwgdGhpcy5pblNjcmlwdCkpIHJldHVybjtcbiAgICAgICAgdGhpcy5idWZmZXIgKz0gdmFsdWU7XG4gICAgfVxuXG4gICAgb25jbG9zZXRhZygpIHtcbiAgICAgICAgaWYgKHRoaXMuaW5YTWFnZUluaXRTY3JpcHQpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXBzLnB1c2goLi4uZXh0cmFjdERlcHNGcm9tWE1hZ2VudG9Jbml0KHRoaXMuYnVmZmVyKSk7XG4gICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluY29tcGxldGVBbmFseXNpcyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmJ1ZmZlciA9ICcnO1xuICAgICAgICAgICAgdGhpcy5pblhNYWdlSW5pdFNjcmlwdCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaW5TY3JpcHQpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IHBhcnNlSmF2YVNjcmlwdERlcHModGhpcy5idWZmZXIsIHRydWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVwcy5wdXNoKC4uLnJlc3VsdHMuZGVwcyk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdHMuaW5jb21wbGV0ZUFuYWx5c2lzKSB0aGlzLmluY29tcGxldGVBbmFseXNpcyA9IHRydWU7XG4gICAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluY29tcGxldGVBbmFseXNpcyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmJ1ZmZlciA9ICcnO1xuICAgICAgICAgICAgdGhpcy5pblNjcmlwdCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEBzdW1tYXJ5IEdpdmVuIHRoZSB2YWx1ZSBvZiBhIEtub2Nrb3V0IHRlbXBsYXRlIGBkYXRhLWJpbmRgXG4gKiAgICAgICAgICBhdHRyaWJ1dGUsIHdpbGwgZmluZCB0aGUgYG1hZ2VJbml0YCBrZXkgaWYgcHJlc2VudCxcbiAqICAgICAgICAgIGFuZCByZXR1cm4gYSBsaXN0IG9mIGFsbCBkZXBlbmRlbmNpZXNcbiAqIEBzZWUgaHR0cHM6Ly9rbm9ja291dGpzLmNvbS9kb2N1bWVudGF0aW9uL2JpbmRpbmctc3ludGF4Lmh0bWxcbiAqL1xuZnVuY3Rpb24gZXh0cmFjdE1hZ2VJbml0RGVwc0Zyb21EYXRhQmluZChhdHRyVmFsdWU6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICAvLyBLbm9ja291dCBiaW5kaW5ncyBmb3JtIGFuIG9iamVjdCBsaXRlcmFsIHdpdGhvdXQgdGhlIG91dGVyIHdyYXBwaW5nIGJyYWNlc1xuICAgIGNvbnN0IG9iakV4cHJlc3Npb24gPSBwYXJzZU9iamVjdEV4cHJlc3Npb24oYHske2F0dHJWYWx1ZX19YCk7XG4gICAgY29uc3QgbWFnZUluaXRQcm9wID0gb2JqRXhwcmVzc2lvbi5wcm9wZXJ0aWVzLmZpbmQoXG4gICAgICAgIHAgPT4gcC5rZXkudHlwZSA9PT0gJ0lkZW50aWZpZXInICYmIHAua2V5Lm5hbWUgPT09ICdtYWdlSW5pdCcsXG4gICAgKTtcblxuICAgIGlmICghbWFnZUluaXRQcm9wKSB7XG4gICAgICAgIHRocm93IG5ldyBCYWxlckVycm9yKCdDb3VsZCBub3QgbG9jYXRlIFwibWFnZUluaXRcIiBwcm9wZXJ0eScpO1xuICAgIH1cblxuICAgIGNvbnN0IHByb3BWYWx1ZSA9IG1hZ2VJbml0UHJvcC52YWx1ZSBhcyBPYmplY3RFeHByZXNzaW9uO1xuICAgIHJldHVybiBnZXRQcm9wZXJ0eU5hbWVzRnJvbU9iakV4cHJlc3Npb24ocHJvcFZhbHVlKTtcbn1cblxuLyoqXG4gKiBAc3VtbWFyeSBQYXJzZXMgZGVwZW5kZW5jaWVzIG91dCBvZiBhIGBkYXRhLW1hZ2UtaW5pdGAgYXR0cmlidXRlXG4gKi9cbmZ1bmN0aW9uIGV4dHJhY3REZXBzRnJvbURhdGFNYWdlSW5pdEF0dHIoYXR0clZhbHVlOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgY29uc3Qgb2JqRXhwcmVzc2lvbiA9IHBhcnNlT2JqZWN0RXhwcmVzc2lvbihhdHRyVmFsdWUpO1xuICAgIHJldHVybiBnZXRQcm9wZXJ0eU5hbWVzRnJvbU9iakV4cHJlc3Npb24ob2JqRXhwcmVzc2lvbik7XG59XG5cbi8qKlxuICogQHN1bW1hcnkgUmVwbGFjZSBQSFAgZGVsaW1pdGVycyAoYW5kIHRoZWlyIGNvbnRlbnRzKSB3aXRoIHBsYWNlaG9sZGVyXG4gKiAgICAgICAgICB2YWx1ZXMgdGhhdCB3aWxsIG5vdCBicmVhayBIVE1MIHBhcnNpbmcgd2hlbiB0aGUgZGVsaW1pdGVyc1xuICogICAgICAgICAgYXJlIG5vdCB3cmFwcGVkIGFzIEpTIHN0cmluZyBsaXRlcmFsc1xuICovXG5mdW5jdGlvbiByZXBsYWNlUEhQRGVsaW1pdGVycyhpbnB1dDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGlucHV0LnJlcGxhY2UoLyg8XFw/KD86PXxwaHApW1xcc1xcU10rP1xcPz4pL2csICdQSFBfREVMSU1fUExBQ0VIT0xERVInKTtcbn1cblxuLyoqXG4gKiBAc3VtbWFyeSBFeHRyYWN0IGRlcGVuZGVuY2llcyBmcm9tIHRoZSB2YWx1ZSBvZiBhIHNjcmlwdCB0YWdcbiAqICAgICAgICAgIHRoYXQgaGFzIHR5cGU9XCJ0ZXh0L3gtbWFnZW50by1pbml0XCIuIEEgeC1tYWdlbnRvLWluaXRcbiAqICAgICAgICAgIGlzIHJlcXVpcmVkIHRvIGJlIEpTT04tY29tcGxpYW50IF9hZnRlcl8gcmVuZGVyLCBidXRcbiAqICAgICAgICAgIHdpbGwgaGF2ZSBQSFAgaW50ZXJwb2xhdGlvbnMgaW4gcGxhY2VzIHdoZW4gcHVsbGVkXG4gKiAgICAgICAgICBkaXJlY3RseSBmcm9tIGEgLnBodG1sIGZpbGVcbiAqL1xuZnVuY3Rpb24gZXh0cmFjdERlcHNGcm9tWE1hZ2VudG9Jbml0KGlucHV0OiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgY29uc3Qgb2JqRXhwcmVzc2lvbiA9IHBhcnNlT2JqZWN0RXhwcmVzc2lvbihpbnB1dCk7XG4gICAgY29uc3QgZGVwczogc3RyaW5nW10gPSBbXTtcblxuICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2Ygb2JqRXhwcmVzc2lvbi5wcm9wZXJ0aWVzKSB7XG4gICAgICAgIGNvbnN0IHByb3BWYWx1ZSA9IHNlbGVjdG9yLnZhbHVlIGFzIE9iamVjdEV4cHJlc3Npb247XG4gICAgICAgIGRlcHMucHVzaCguLi5nZXRQcm9wZXJ0eU5hbWVzRnJvbU9iakV4cHJlc3Npb24ocHJvcFZhbHVlKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlcHM7XG59XG5cbi8qKlxuICogQHN1bW1hcnkgR2l2ZW4gYW4gQVNUIGZvciBhbiBvYmplY3QgbGl0ZXJhbCwgcmV0dXJuIGFsbCBsaXRlcmFsXG4gKiAgICAgICAgICBwcm9wZXJ0eSBuYW1lcywgYW5kIHJlcG9ydCB3aGVuIGEga2V5IGNhbiBub3QgYmUgc3RhdGljYWxseVxuICogICAgICAgICAgYW5hbHl6ZWRcbiAqL1xuZnVuY3Rpb24gZ2V0UHJvcGVydHlOYW1lc0Zyb21PYmpFeHByZXNzaW9uKG5vZGU6IE9iamVjdEV4cHJlc3Npb24pIHtcbiAgICBjb25zdCBrZXlzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAoY29uc3QgeyBrZXkgfSBvZiBub2RlLnByb3BlcnRpZXMpIHtcbiAgICAgICAgaWYgKGtleS50eXBlID09PSAnTGl0ZXJhbCcgJiYgdHlwZW9mIGtleS52YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGtleXMucHVzaChrZXkudmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGtleS50eXBlID09PSAnSWRlbnRpZmllcicpIHtcbiAgICAgICAgICAgIGtleXMucHVzaChrZXkubmFtZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGtleXM7XG59XG4iXX0=