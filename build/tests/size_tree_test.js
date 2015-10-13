/// <reference path="../typings/typings.d.ts" />
var chai_1 = require('chai');
var fs = require('fs');
var size_tree = require('../size_tree');
describe('printDependencySizeTree()', function () {
    it('should print the size tree', function () {
        var output = '';
        var statsJsonStr = fs.readFileSync('tests/stats.json').toString();
        var statsJson = JSON.parse(statsJsonStr);
        var depsTree = size_tree.dependencySizeTree(statsJson, "node_modules");
        size_tree.printDependencySizeTree(depsTree, 0, function (line) { return output += '\n' + line; });
        chai_1.expect(output).to.equal("\nmarked: 27.53 kB (14.9%)\n  <self>: 27.53 kB (100%)\nlru-cache: 6.29 kB (3.40%)\n  <self>: 6.29 kB (100%)\nstyle-loader: 717 B (0.379%)\n  <self>: 717 B (100%)\n<self>: 150.33 kB (81.3%)");
    });
});
describe('dependencySizeTree()', function () {
    it('should produce correct results where loaders are used', function () {
        var webpackOutput = {
            version: '1.2.3',
            hash: 'unused',
            time: 100,
            assetsByChunkName: {},
            assets: [],
            chunks: [],
            modules: [{
                    id: 0,
                    identifier: '/path/to/loader.js!/path/to/project/node_modules/dep/foo.js',
                    size: 1234,
                    name: './foo.js'
                }]
        };
        var depsTree = size_tree.dependencySizeTree(webpackOutput, "node_modules");
        chai_1.expect(depsTree).to.deep.equal({
            packageName: '<root>',
            size: 1234,
            children: [{
                    packageName: 'dep',
                    size: 1234,
                    children: []
                }]
        });
    });
});
