/// <reference path="typings/typings.d.ts" />
var filesize = require('filesize');
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function modulePath(identifier) {
    // the format of module paths is
    //   '(<loader expression>!)?/path/to/module.js'
    var loaderRegex = /.*!/;
    return identifier.replace(loaderRegex, '');
}
/** Walk a dependency size tree produced by dependencySizeTree() and output the
  * size contributed to the bundle by each package's own code plus those
  * of its dependencies.
  */
function printDependencySizeTree(node, depth, outputFn) {
    if (depth === void 0) { depth = 0; }
    if (outputFn === void 0) { outputFn = console.log; }
    var childrenBySize = node.children.sort(function (a, b) {
        return b.size - a.size;
    });
    var totalSize = node.size;
    var remainder = totalSize;
    var includedCount = 0;
    var prefix = '';
    for (var i = 0; i < depth; i++) {
        prefix += '  ';
    }
    for (var _i = 0; _i < childrenBySize.length; _i++) {
        var child = childrenBySize[_i];
        remainder -= child.size;
        if (remainder < 0.01 * totalSize) {
            break;
        }
        ++includedCount;
        var percentage_1 = ((child.size / totalSize) * 100).toPrecision(3);
        outputFn("" + prefix + child.packageName + ": " + filesize(child.size) + " (" + percentage_1 + "%)");
        printDependencySizeTree(child, depth + 1, outputFn);
    }
    var percentage = ((remainder / totalSize) * 100).toPrecision(3);
    outputFn(prefix + "<self>: " + filesize(remainder) + " (" + percentage + "%)");
}
exports.printDependencySizeTree = printDependencySizeTree;
/** Takes the output of 'webpack --json', groups the require()'d modules
  * by their associated NPM package and outputs a tree of package dependencies.
  */
function dependencySizeTree(stats, module_path) {
    var statsTree = {
        packageName: '<root>',
        size: 0,
        children: []
    };
    // extract source path for each module
    var modules = stats.modules.map(function (mod) {
        return {
            path: modulePath(mod.identifier),
            size: mod.size
        };
    });
    modules.sort(function (a, b) {
        if (a === b) {
            return 0;
        }
        else {
            return a < b ? -1 : 1;
        }
    });
    modules.forEach(function (mod) {
        // convert each module path into an array of package names, followed
        // by the trailing path within the last module:
        //
        // root/node_modules/parent/node_modules/child/file/path.js =>
        //  ['root', 'parent', 'child', 'file/path.js'
        var packages = mod.path.split(new RegExp("\/" + escapeRegExp(module_path) + "\/"));
        var filename = '';
        if (packages.length > 1) {
            var lastSegment = packages.pop();
            var lastPackageName = lastSegment.slice(0, lastSegment.search(/\/|$/));
            packages.push(lastPackageName);
            filename = lastSegment.slice(lastPackageName.length + 1);
        }
        else {
            filename = packages[0];
        }
        packages.shift();
        var parent = statsTree;
        parent.size += mod.size;
        packages.forEach(function (packageName) {
            var existing = parent.children.filter(function (child) { return child.packageName === packageName; });
            if (existing.length > 0) {
                existing[0].size += mod.size;
                parent = existing[0];
            }
            else {
                var newChild = {
                    packageName: packageName,
                    size: mod.size,
                    children: []
                };
                parent.children.push(newChild);
                parent = newChild;
            }
        });
    });
    return statsTree;
}
exports.dependencySizeTree = dependencySizeTree;
