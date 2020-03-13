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
const jsParser_1 = require("./jsParser");
const esquery = __importStar(require("esquery"));
/**
 * @summary Statically analyze a JavaScript file for all
 *          declared dependencies. Supports:
 *          - AMD `define` calls with deps array
 *          - AMD `require` calls with deps array
 * @param fromPHP If true, will use a loose parser that can better
 *                handle PHP interpolations in the code
 */
function parseJavaScriptDeps(input, fromPHP) {
    const ast = jsParser_1.parse(input, { loose: !!fromPHP });
    const defineData = getAMDDefineDeps(ast);
    const asyncRequireData = getAMDAsyncRequireDeps(ast);
    const syncRequireData = getAMDSyncRequireDeps(ast);
    const deps = Array.from(new Set([
        ...defineData.deps,
        ...asyncRequireData.deps,
        ...syncRequireData.deps,
    ]));
    const incompleteAnalysis = defineData.incompleteAnalysis ||
        asyncRequireData.incompleteAnalysis ||
        syncRequireData.incompleteAnalysis;
    return {
        deps,
        incompleteAnalysis,
    };
}
exports.parseJavaScriptDeps = parseJavaScriptDeps;
/**
 * @summary Statically analyze dependencies for AMD `define` calls.
 *          Supports both named and anonymous modules
 */
function getAMDDefineDeps(ast) {
    const selector = 'CallExpression[callee.name=define]';
    const defineCalls = esquery.query(ast, selector);
    let incompleteAnalysis = false;
    const deps = [];
    for (const call of defineCalls) {
        const [firstArg, secondArg] = call.arguments;
        // Anonymous AMD module with dependencies
        if (firstArg && firstArg.type === 'ArrayExpression') {
            const results = extractDepsFromArrayExpression(firstArg);
            deps.push(...results.deps);
            if (results.incompleteAnalysis)
                incompleteAnalysis = true;
        }
        // Named AMD module with dependencies
        if (secondArg && secondArg.type === 'ArrayExpression') {
            const results = extractDepsFromArrayExpression(secondArg);
            deps.push(...results.deps);
            if (results.incompleteAnalysis)
                incompleteAnalysis = true;
        }
    }
    return { deps, incompleteAnalysis };
}
/**
 * @summary Statically analyze dependencies for AMD `require` calls.
 *          Supports the following forms:
 *          - require(['dep'], function(dep) {})
 *          - require(['dep']);
 */
function getAMDAsyncRequireDeps(ast) {
    const selector = 'CallExpression[callee.name=require][arguments.0.type=ArrayExpression]';
    const requireCalls = esquery.query(ast, selector);
    let incompleteAnalysis = false;
    const deps = [];
    for (const call of requireCalls) {
        const firstArg = call.arguments[0];
        const results = extractDepsFromArrayExpression(firstArg);
        deps.push(...results.deps);
        if (results.incompleteAnalysis)
            incompleteAnalysis = true;
    }
    return { deps, incompleteAnalysis };
}
function getAMDSyncRequireDeps(ast) {
    const selector = 'CallExpression[callee.name=define] CallExpression[callee.name=require][arguments.0.type=Literal]';
    const syncRequireCalls = esquery.query(ast, selector);
    let incompleteAnalysis = false;
    const deps = [];
    for (const call of syncRequireCalls) {
        const firstArg = call.arguments[0];
        if (typeof firstArg.value === 'string') {
            deps.push(firstArg.value);
        }
        else {
            incompleteAnalysis = true;
        }
    }
    return { deps, incompleteAnalysis };
}
/**
 * @summary Statically analzye dependencies in an array literal.
 *          Marks as "incompleteAnalysis" for any dep that is not a string literal
 */
function extractDepsFromArrayExpression(node) {
    const deps = [];
    let incompleteAnalysis = false;
    for (const e of node.elements) {
        if (e.type === 'Literal' && typeof e.value === 'string') {
            deps.push(e.value);
        }
        else {
            incompleteAnalysis = true;
        }
    }
    return { deps, incompleteAnalysis };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VKYXZhU2NyaXB0RGVwcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wYXJzZUphdmFTY3JpcHREZXBzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7Ozs7Ozs7OztBQUVILHlDQUFtQztBQU9uQyxpREFBbUM7QUFHbkM7Ozs7Ozs7R0FPRztBQUNILFNBQWdCLG1CQUFtQixDQUMvQixLQUFhLEVBQ2IsT0FBaUI7SUFFakIsTUFBTSxHQUFHLEdBQUcsZ0JBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDL0MsTUFBTSxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDekMsTUFBTSxnQkFBZ0IsR0FBRyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNyRCxNQUFNLGVBQWUsR0FBRyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUVuRCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUNuQixJQUFJLEdBQUcsQ0FBQztRQUNKLEdBQUcsVUFBVSxDQUFDLElBQUk7UUFDbEIsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJO1FBQ3hCLEdBQUcsZUFBZSxDQUFDLElBQUk7S0FDMUIsQ0FBQyxDQUNMLENBQUM7SUFFRixNQUFNLGtCQUFrQixHQUNwQixVQUFVLENBQUMsa0JBQWtCO1FBQzdCLGdCQUFnQixDQUFDLGtCQUFrQjtRQUNuQyxlQUFlLENBQUMsa0JBQWtCLENBQUM7SUFFdkMsT0FBTztRQUNILElBQUk7UUFDSixrQkFBa0I7S0FDckIsQ0FBQztBQUNOLENBQUM7QUExQkQsa0RBMEJDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxnQkFBZ0IsQ0FBQyxHQUFZO0lBQ2xDLE1BQU0sUUFBUSxHQUFHLG9DQUFvQyxDQUFDO0lBQ3RELE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxF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QUssQ0FBQztJQUUvQixLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7UUFDM0IsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLFNBQVMsSUFBSSxPQUFPLENBQUMsQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUFFO1lBQ3JELElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3RCO2FBQU07WUFDSCxrQkFBa0IsR0FBRyxJQUFJLENBQUM7U0FDN0I7S0FDSjtJQUVELE9BQU8sRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQztBQUN4QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgwqkgTWFnZW50bywgSW5jLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogU2VlIENPUFlJTkcudHh0IGZvciBsaWNlbnNlIGRldGFpbHMuXG4gKi9cblxuaW1wb3J0IHsgcGFyc2UgfSBmcm9tICcuL2pzUGFyc2VyJztcbmltcG9ydCB7XG4gICAgUHJvZ3JhbSxcbiAgICBTaW1wbGVDYWxsRXhwcmVzc2lvbixcbiAgICBBcnJheUV4cHJlc3Npb24sXG4gICAgTGl0ZXJhbCxcbn0gZnJvbSAnZXN0cmVlJztcbmltcG9ydCAqIGFzIGVzcXVlcnkgZnJvbSAnZXNxdWVyeSc7XG5pbXBvcnQgeyBQYXJzZXJSZXN1bHQgfSBmcm9tICcuL3R5cGVzJztcblxuLyoqXG4gKiBAc3VtbWFyeSBTdGF0aWNhbGx5IGFuYWx5emUgYSBKYXZhU2NyaXB0IGZpbGUgZm9yIGFsbFxuICogICAgICAgICAgZGVjbGFyZWQgZGVwZW5kZW5jaWVzLiBTdXBwb3J0czpcbiAqICAgICAgICAgIC0gQU1EIGBkZWZpbmVgIGNhbGxzIHdpdGggZGVwcyBhcnJheVxuICogICAgICAgICAgLSBBTUQgYHJlcXVpcmVgIGNhbGxzIHdpdGggZGVwcyBhcnJheVxuICogQHBhcmFtIGZyb21QSFAgSWYgdHJ1ZSwgd2lsbCB1c2UgYSBsb29zZSBwYXJzZXIgdGhhdCBjYW4gYmV0dGVyXG4gKiAgICAgICAgICAgICAgICBoYW5kbGUgUEhQIGludGVycG9sYXRpb25zIGluIHRoZSBjb2RlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUphdmFTY3JpcHREZXBzKFxuICAgIGlucHV0OiBzdHJpbmcsXG4gICAgZnJvbVBIUD86IGJvb2xlYW4sXG4pOiBQYXJzZXJSZXN1bHQge1xuICAgIGNvbnN0IGFzdCA9IHBhcnNlKGlucHV0LCB7IGxvb3NlOiAhIWZyb21QSFAgfSk7XG4gICAgY29uc3QgZGVmaW5lRGF0YSA9IGdldEFNRERlZmluZURlcHMoYXN0KTtcbiAgICBjb25zdCBhc3luY1JlcXVpcmVEYXRhID0gZ2V0QU1EQXN5bmNSZXF1aXJlRGVwcyhhc3QpO1xuICAgIGNvbnN0IHN5bmNSZXF1aXJlRGF0YSA9IGdldEFNRFN5bmNSZXF1aXJlRGVwcyhhc3QpO1xuXG4gICAgY29uc3QgZGVwcyA9IEFycmF5LmZyb20oXG4gICAgICAgIG5ldyBTZXQoW1xuICAgICAgICAgICAgLi4uZGVmaW5lRGF0YS5kZXBzLFxuICAgICAgICAgICAgLi4uYXN5bmNSZXF1aXJlRGF0YS5kZXBzLFxuICAgICAgICAgICAgLi4uc3luY1JlcXVpcmVEYXRhLmRlcHMsXG4gICAgICAgIF0pLFxuICAgICk7XG5cbiAgICBjb25zdCBpbmNvbXBsZXRlQW5hbHlzaXMgPVxuICAgICAgICBkZWZpbmVEYXRhLmluY29tcGxldGVBbmFseXNpcyB8fFxuICAgICAgICBhc3luY1JlcXVpcmVEYXRhLmluY29tcGxldGVBbmFseXNpcyB8fFxuICAgICAgICBzeW5jUmVxdWlyZURhdGEuaW5jb21wbGV0ZUFuYWx5c2lzO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGVwcyxcbiAgICAgICAgaW5jb21wbGV0ZUFuYWx5c2lzLFxuICAgIH07XG59XG5cbi8qKlxuICogQHN1bW1hcnkgU3RhdGljYWxseSBhbmFseXplIGRlcGVuZGVuY2llcyBmb3IgQU1EIGBkZWZpbmVgIGNhbGxzLlxuICogICAgICAgICAgU3VwcG9ydHMgYm90aCBuYW1lZCBhbmQgYW5vbnltb3VzIG1vZHVsZXNcbiAqL1xuZnVuY3Rpb24gZ2V0QU1ERGVmaW5lRGVwcyhhc3Q6IFByb2dyYW0pIHtcbiAgICBjb25zdCBzZWxlY3RvciA9ICdDYWxsRXhwcmVzc2lvbltjYWxsZWUubmFtZT1kZWZpbmVdJztcbiAgICBjb25zdCBkZWZpbmVDYWxscyA9IGVzcXVlcnkucXVlcnkoYXN0LCBzZWxlY3RvcikgYXMgU2ltcGxlQ2FsbEV4cHJlc3Npb25bXTtcbiAgICBsZXQgaW5jb21wbGV0ZUFuYWx5c2lzID0gZmFsc2U7XG4gICAgY29uc3QgZGVwczogc3RyaW5nW10gPSBbXTtcblxuICAgIGZvciAoY29uc3QgY2FsbCBvZiBkZWZpbmVDYWxscykge1xuICAgICAgICBjb25zdCBbZmlyc3RBcmcsIHNlY29uZEFyZ10gPSBjYWxsLmFyZ3VtZW50cztcblxuICAgICAgICAvLyBBbm9ueW1vdXMgQU1EIG1vZHVsZSB3aXRoIGRlcGVuZGVuY2llc1xuICAgICAgICBpZiAoZmlyc3RBcmcgJiYgZmlyc3RBcmcudHlwZSA9PT0gJ0FycmF5RXhwcmVzc2lvbicpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBleHRyYWN0RGVwc0Zyb21BcnJheUV4cHJlc3Npb24oZmlyc3RBcmcpO1xuICAgICAgICAgICAgZGVwcy5wdXNoKC4uLnJlc3VsdHMuZGVwcyk7XG4gICAgICAgICAgICBpZiAocmVzdWx0cy5pbmNvbXBsZXRlQW5hbHlzaXMpIGluY29tcGxldGVBbmFseXNpcyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTmFtZWQgQU1EIG1vZHVsZSB3aXRoIGRlcGVuZGVuY2llc1xuICAgICAgICBpZiAoc2Vjb25kQXJnICYmIHNlY29uZEFyZy50eXBlID09PSAnQXJyYXlFeHByZXNzaW9uJykge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IGV4dHJhY3REZXBzRnJvbUFycmF5RXhwcmVzc2lvbihzZWNvbmRBcmcpO1xuICAgICAgICAgICAgZGVwcy5wdXNoKC4uLnJlc3VsdHMuZGVwcyk7XG4gICAgICAgICAgICBpZiAocmVzdWx0cy5pbmNvbXBsZXRlQW5hbHlzaXMpIGluY29tcGxldGVBbmFseXNpcyA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4geyBkZXBzLCBpbmNvbXBsZXRlQW5hbHlzaXMgfTtcbn1cblxuLyoqXG4gKiBAc3VtbWFyeSBTdGF0aWNhbGx5IGFuYWx5emUgZGVwZW5kZW5jaWVzIGZvciBBTUQgYHJlcXVpcmVgIGNhbGxzLlxuICogICAgICAgICAgU3VwcG9ydHMgdGhlIGZvbGxvd2luZyBmb3JtczpcbiAqICAgICAgICAgIC0gcmVxdWlyZShbJ2RlcCddLCBmdW5jdGlvbihkZXApIHt9KVxuICogICAgICAgICAgLSByZXF1aXJlKFsnZGVwJ10pO1xuICovXG5mdW5jdGlvbiBnZXRBTURBc3luY1JlcXVpcmVEZXBzKGFzdDogUHJvZ3JhbSkge1xuICAgIGNvbnN0IHNlbGVjdG9yID1cbiAgICAgICAgJ0NhbGxFeHByZXNzaW9uW2NhbGxlZS5uYW1lPXJlcXVpcmVdW2FyZ3VtZW50cy4wLnR5cGU9QXJyYXlFeHByZXNzaW9uXSc7XG4gICAgY29uc3QgcmVxdWlyZUNhbGxzID0gZXNxdWVyeS5xdWVyeShhc3QsIHNlbGVjdG9yKSBhcyBTaW1wbGVDYWxsRXhwcmVzc2lvbltdO1xuICAgIGxldCBpbmNvbXBsZXRlQW5hbHlzaXMgPSBmYWxzZTtcbiAgICBjb25zdCBkZXBzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBjYWxsIG9mIHJlcXVpcmVDYWxscykge1xuICAgICAgICBjb25zdCBmaXJzdEFyZyA9IGNhbGwuYXJndW1lbnRzWzBdIGFzIEFycmF5RXhwcmVzc2lvbjtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IGV4dHJhY3REZXBzRnJvbUFycmF5RXhwcmVzc2lvbihmaXJzdEFyZyk7XG4gICAgICAgIGRlcHMucHVzaCguLi5yZXN1bHRzLmRlcHMpO1xuICAgICAgICBpZiAocmVzdWx0cy5pbmNvbXBsZXRlQW5hbHlzaXMpIGluY29tcGxldGVBbmFseXNpcyA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgZGVwcywgaW5jb21wbGV0ZUFuYWx5c2lzIH07XG59XG5cbmZ1bmN0aW9uIGdldEFNRFN5bmNSZXF1aXJlRGVwcyhhc3Q6IFByb2dyYW0pIHtcbiAgICBjb25zdCBzZWxlY3RvciA9XG4gICAgICAgICdDYWxsRXhwcmVzc2lvbltjYWxsZWUubmFtZT1kZWZpbmVdIENhbGxFeHByZXNzaW9uW2NhbGxlZS5uYW1lPXJlcXVpcmVdW2FyZ3VtZW50cy4wLnR5cGU9TGl0ZXJhbF0nO1xuICAgIGNvbnN0IHN5bmNSZXF1aXJlQ2FsbHMgPSBlc3F1ZXJ5LnF1ZXJ5KFxuICAgICAgICBhc3QsXG4gICAgICAgIHNlbGVjdG9yLFxuICAgICkgYXMgU2ltcGxlQ2FsbEV4cHJlc3Npb25bXTtcbiAgICBsZXQgaW5jb21wbGV0ZUFuYWx5c2lzID0gZmFsc2U7XG4gICAgY29uc3QgZGVwczogc3RyaW5nW10gPSBbXTtcblxuICAgIGZvciAoY29uc3QgY2FsbCBvZiBzeW5jUmVxdWlyZUNhbGxzKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0QXJnID0gY2FsbC5hcmd1bWVudHNbMF0gYXMgTGl0ZXJhbDtcbiAgICAgICAgaWYgKHR5cGVvZiBmaXJzdEFyZy52YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGRlcHMucHVzaChmaXJzdEFyZy52YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbmNvbXBsZXRlQW5hbHlzaXMgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgZGVwcywgaW5jb21wbGV0ZUFuYWx5c2lzIH07XG59XG5cbi8qKlxuICogQHN1bW1hcnkgU3RhdGljYWxseSBhbmFsenllIGRlcGVuZGVuY2llcyBpbiBhbiBhcnJheSBsaXRlcmFsLlxuICogICAgICAgICAgTWFya3MgYXMgXCJpbmNvbXBsZXRlQW5hbHlzaXNcIiBmb3IgYW55IGRlcCB0aGF0IGlzIG5vdCBhIHN0cmluZyBsaXRlcmFsXG4gKi9cbmZ1bmN0aW9uIGV4dHJhY3REZXBzRnJvbUFycmF5RXhwcmVzc2lvbihub2RlOiBBcnJheUV4cHJlc3Npb24pIHtcbiAgICBjb25zdCBkZXBzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGxldCBpbmNvbXBsZXRlQW5hbHlzaXMgPSBmYWxzZTtcblxuICAgIGZvciAoY29uc3QgZSBvZiBub2RlLmVsZW1lbnRzKSB7XG4gICAgICAgIGlmIChlLnR5cGUgPT09ICdMaXRlcmFsJyAmJiB0eXBlb2YgZS52YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGRlcHMucHVzaChlLnZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluY29tcGxldGVBbmFseXNpcyA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4geyBkZXBzLCBpbmNvbXBsZXRlQW5hbHlzaXMgfTtcbn1cbiJdfQ==