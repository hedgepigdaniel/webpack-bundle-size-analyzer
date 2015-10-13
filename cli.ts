/// <reference path="typings/typings.d.ts" />

import commander = require('commander');
import fs = require('fs');

import size_tree = require('./size_tree');
import webpack_stats = require('./webpack_stats');

commander.version('0.1.0')
         .usage('[options] <Webpack JSON output> [module paths ...]')
         .description(
 `Analyzes the JSON output from 'webpack --json'
  and displays the total size of JS modules
  contributed by each NPM package that has been included in the bundle.`
  );

commander.parse(process.argv);

if (!commander.args[0]) {
	console.error('No Webpack JSON output file specified. Use `webpack --json` to generate it.');
	process.exit(1);
}

const multiplePaths = commander.args.length > 1;

let paths: string[];
if (multiplePaths) {
	paths = commander.args.slice(1);
} else {
	paths = ["node_modules"];
}

const bundleStatsJson = fs.readFileSync(commander.args[0]).toString();
const bundleStats = <webpack_stats.WebpackJsonOutput>JSON.parse(bundleStatsJson);

paths.forEach(function(path) {
	if (multiplePaths) {
		console.log("Dependencies in " + path + ":");
	}
	let depTree = size_tree.dependencySizeTree(bundleStats, path);
	size_tree.printDependencySizeTree(depTree);
	if (multiplePaths) {
		console.log("\n");
	}
});

