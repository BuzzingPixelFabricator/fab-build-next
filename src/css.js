/*----------------------------------------------------------------------------*\
    # Copyright 2017, BuzzingPixel, LLC

    # This program is free software: you can redistribute it and/or modify
    # it under the terms of the Apache License 2.0.
    # http://www.apache.org/licenses/LICENSE-2.0

    # This file is an example and not required
\*----------------------------------------------------------------------------*/

// Get Node requirements
var recursive = require('recursive-readdir-sync');
var path = require('path');
var postcss = require('postcss');
var postcssNext = require('postcss-cssnext');
var CleanCSS = require('clean-css');
var watch = require('watch');

// Set up variables
var fabCacheDirectory = global.projectRoot + '/fabCache';
var fabCacheCssDirectory = fabCacheDirectory + '/css';
var fabCacheCssBundleFile = fabCacheCssDirectory + '/bundle.css';
var cssLoc = global.projectRoot + '/' + FAB.config.source + '/css';
var customReset = cssLoc + '/reset.css';
var bundleContents = '';
var cssOutputDir = global.projectRoot + '/' + FAB.config.assets + '/css';
var cssOutput = cssOutputDir + '/style.min.css';
var outputDirPath = '';

// Run CSS function
function runCss() {
    // Start with the reset if it exists
    if (FAB.fileExists(customReset)) {
        FAB.writeFile(fabCacheCssBundleFile, FAB.readFile(customReset));
    }

    // Add all other CSS files
    recursive(cssLoc).forEach(function(file) {
        if (path.extname(file) !== '.css' || file === customReset) {
            return;
        }
        FAB.writeFile(fabCacheCssBundleFile, FAB.readFile(file), true);
    });

    // Get the concatenated file
    bundleContents = FAB.readFile(fabCacheCssBundleFile).toString();

    // Minify the concatenated file
    if (FAB.config.minifyCss) {
        bundleContents = new CleanCSS().minify(bundleContents).styles;
    }

    // Process CSS with postcss
    postcss([postcssNext]).process(bundleContents).then(function(result) {
        // Write the output to the min file
        FAB.writeFile(cssOutput, result.css);

        // Send notification
        FAB.notify('CSS Compiled');
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
