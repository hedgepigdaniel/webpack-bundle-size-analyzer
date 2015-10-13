/// <reference path="typings/typings.d.ts" />
var commander = require('commander');
var fs = require('fs');
var size_tree = require('./size_tree');
commander.version('0.1.0')
    .usage('[options] <Webpack JSON output> [module paths ...]')
    .description("Analyzes the JSON output from 'webpack --json'\n  and displays the total size of JS modules\n  contributed by each NPM package that has been included in the bundle.");
commander.parse(process.argv);
if (!commander.args[0]) {
    console.error('No Webpack JSON output file specified. Use `webpack --json` to generate it.');
    process.exit(1);
}
var multiplePaths = commander.args.length > 1;
var paths;
if (multiplePaths) {
    paths = commander.args.slice(1);
}
else {
    paths = ["node_modules"];
}
var bundleStatsJson = fs.readFileSync(commander.args[0]).toString();
var bundleStats = JSON.parse(bundleStatsJson);
paths.forEach(function (path) {
    if (multiplePaths) {
        console.log("Dependencies in " + path + ":");
    }
    var depTree = size_tree.dependencySizeTree(bundleStats, path);
    size_tree.printDependencySizeTree(depTree);
    if (multiplePaths) {
        console.log("\n");
    }
});
