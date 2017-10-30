/*----------------------------------------------------------------------------*\
    # Copyright 2017, BuzzingPixel, LLC

    # This program is free software: you can redistribute it and/or modify
    # it under the terms of the Apache License 2.0.
    # http://www.apache.org/licenses/LICENSE-2.0

    # This file is an example and not required
\*----------------------------------------------------------------------------*/

// Get Node requirements
FAB.postcss = require('postcss');
var recursive = require('recursive-readdir-sync');
var path = require('path');
var postcssNext = require('postcss-cssnext');
var CleanCSS = require('clean-css');
var watch = require('watch');
var fs = require('fs');

// Set up variables
var fabCacheDirectory = global.projectRoot + '/fabCache';
var fabCacheCssDirectory = fabCacheDirectory + '/css';
var fabCacheCssBundleFile = fabCacheCssDirectory + '/bundle.css';
var cssLoc = global.projectRoot + '/' + FAB.config.source + '/css';
var customReset = cssLoc + '/reset.css';
var customReset2 = cssLoc + '/reset.pcss';
var mixinsDir = cssLoc + '/mixins';
var nodeModulesDir = global.projectRoot + '/node_modules';
var bundleContents = '';
var cssOutputDir = global.projectRoot + '/' + FAB.config.assets + '/css';
var cssOutput = cssOutputDir + '/style.min.css';
var outputDirPath = '';

// Run CSS function
function runCss() {
    var postcssMixins;
    var jsMixins = {};
    var thisJsMixins;

    // Clear out the cache file
    FAB.writeFile(fabCacheCssBundleFile, '');

    // Add module files
    fs.readdirSync(nodeModulesDir).forEach(function(file) {
        // Get file stats
        var dir = nodeModulesDir + '/' + file;
        var stat = fs.lstatSync(dir);
        var packageJsonLoc = nodeModulesDir + '/' + file + '/package.json';
        var packageJson;

        // If this is not a directory, or package.json does not exist,
        // we can immediately move on
        if (! stat.isDirectory() || ! FAB.fileExists(packageJsonLoc)) {
            return;
        }

        // Get the package json
        packageJson = require(packageJsonLoc);

        // If post css build key does not exist, we can move on
        if (! packageJson.fabricatorPostCssBuild ||
            ! packageJson.fabricatorPostCssBuild.files
        ) {
            return;
        }

        // Iterate through files and add them
        packageJson.fabricatorPostCssBuild.files.forEach(function(cssFile) {
            // If the file does not exist, we can stop here
            if (! FAB.fileExists(dir + '/' + cssFile)) {
                return;
            }

            // Add the file to our bundle
            FAB.writeFile(
                fabCacheCssBundleFile,
                FAB.readFile(dir + '/' + cssFile),
                true
            );
        });
    });

    // Add mixins
    recursive(mixinsDir).forEach(function(file) {
        // Get the file extension
        var ext = path.extname(file);

        // If the file extension is not one of our extensions
        if (ext !== '.css' && ext !== '.pcss') {
            // And if it's not a js extension
            if (ext !== '.js') {
                return;
            }

            // If this file is cached, delete the cache
            if (require.cache[file]) {
                delete require.cache[file];
            }

            // Get the mixins
            thisJsMixins = require(file);

            // If the return type is not an object, we should move on
            if (typeof thisJsMixins.mixins !== 'object') {
                return;
            }

            // Add the mixins to the object
            for (var mixinName in thisJsMixins.mixins) {
                jsMixins[mixinName] = thisJsMixins.mixins[mixinName];
            }

            // End here
            return;
        }

        // Add the contents of the file to our concatenated CSS bundle file
        FAB.writeFile(fabCacheCssBundleFile, FAB.readFile(file), true);
    });

    // Start with the reset if it exists
    if (FAB.fileExists(customReset)) {
        FAB.writeFile(fabCacheCssBundleFile, FAB.readFile(customReset), true);
    } else if (FAB.fileExists(customReset2)) {
        FAB.writeFile(fabCacheCssBundleFile, FAB.readFile(customReset2), true);
    }

    // Add all other CSS files
    recursive(cssLoc).forEach(function(file) {
        // Get the file extension
        var ext = path.extname(file);

        // If the file extension is not one of our extensions
        // or the file is in the mixins directory
        // or it's the custom reset file, we should ignore it
        if (
            (ext !== '.css' && ext !== '.pcss') ||
            file.indexOf(mixinsDir) === 0 ||
            file === customReset ||
            file === customReset2
        ) {
            return;
        }

        // Add the contents of the file to our concatenated CSS bundle file
        FAB.writeFile(fabCacheCssBundleFile, FAB.readFile(file), true);
    });

    // Get the concatenated file
    bundleContents = FAB.readFile(fabCacheCssBundleFile).toString();

    // Minify the concatenated file
    if (FAB.config.minifyCss) {
        bundleContents = new CleanCSS().minify(bundleContents).styles;
    }

    postcssMixins = require('postcss-mixins')({
        mixins: jsMixins
    });

    // Process CSS with postcss
    FAB.postcss([postcssMixins, postcssNext])
        .process(bundleContents)
        .then(function(result) {
            // Write the output to the min file
            FAB.writeFile(cssOutput, result.css);

            // Send notification
            FAB.notify('CSS Compiled');
        })
        .catch(function(error) {
            FAB.notify('PostCSS compile error', true);
            FAB.out.error('There was a PostCSS compile error');
            console.log(error);
            FAB.out.error('END PostCSS compile error');
        });
}

// Create the output directory
cssOutputDir.split('/').forEach(function(path) {
    if (! path) {
        return;
    }
    outputDirPath += '/' + path;
    FAB.mkdirIfNotExists(outputDirPath);
});

// Create the fabCache directories
FAB.mkdirIfNotExists(fabCacheDirectory);
FAB.mkdirIfNotExists(fabCacheCssDirectory);

// Create the bundled CSS file
FAB.writeFile(fabCacheCssBundleFile);

// Watch for changes
watch.watchTree(
    cssLoc,
    {
        interval: 0.5
    },
    function() {
        FAB.out.info('Compiling CSS...');
        runCss();
        FAB.out.success('CSS compiled, watching for CSS changes...');
    }
);
