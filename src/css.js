/*----------------------------------------------------------------------------*\
    # Copyright 2017, BuzzingPixel, LLC

    # This program is free software: you can redistribute it and/or modify
    # it under the terms of the Apache License 2.0.
    # http://www.apache.org/licenses/LICENSE-2.0
\*----------------------------------------------------------------------------*/

/* global FAB:true */
/* global global */

// Get Node requirements
var postcssNext = require('postcss-cssnext');
var CleanCSS = require('clean-css');
var hexRGBA = require('postcss-hexrgba');

// Set up variables
var fabCacheDirectory = FAB.internalConfig.fabCacheDirectory;
var fabCacheCssDirectory = fabCacheDirectory + '/css';
var fabCacheCssBundleFile = fabCacheCssDirectory + '/bundle.css';
var cssLoc = global.projectRoot + '/' + FAB.config.source + '/css';
var customReset = cssLoc + '/reset.css';
var customReset2 = cssLoc + '/reset.pcss';
var mixinsDir = cssLoc + '/mixins';
var nodeModulesDir = global.projectRoot + '/node_modules';
var bundleContents = '';
var cssOutputDir = FAB.internalConfig.cssOutputDir;
var cssOutput = FAB.internalConfig.cssOutput;
var outputDirPath = '';
var jsMixins = {};

// Function for parsing mixins files
function parseMixinsFile(file) {
    // Get the file extension
    var ext = FAB.path.extname(file);
    var thisJsMixins;

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
}

// Run CSS function
function runCss() {
    var postcssMixins;
    jsMixins = {};

    FAB.out.info('Compiling CSS...');

    // Clear out the cache file
    FAB.writeFile(fabCacheCssBundleFile, '');

    // Add module files
    FAB.fs.readdirSync(nodeModulesDir).forEach(function(file) {
        // Get file stats
        var dir = nodeModulesDir + '/' + file;
        var stat = FAB.fs.lstatSync(dir);
        var packageJsonLoc = nodeModulesDir + '/' + file + '/package.json';
        var packageJson;

        // If this is not a directory, or package.json does not exist,
        // we can immediately move on
        if (! stat.isDirectory() || ! FAB.fileExists(packageJsonLoc)) {
            return;
        }

        // Get the package json
        packageJson = require(packageJsonLoc);

        // If we don't have a fabricatorPostCssBuild, we should stop
        if (! packageJson.fabricatorPostCssBuild) {
            return;
        }

        // If we have a mixinFiles key, we should do some stuff
        if (packageJson.fabricatorPostCssBuild.mixinFiles) {
            // Iterate through files and parse them
            packageJson.fabricatorPostCssBuild.mixinFiles.forEach(function(mixinFile) {
                // If the file does not exist, we can stop here
                if (! FAB.fileExists(dir + '/' + mixinFile)) {
                    return;
                }

                // Parse the file
                parseMixinsFile(dir + '/' + mixinFile);
            });
        }

        // If we have a reset key, we should do some stuff
        if (packageJson.fabricatorPostCssBuild.cssResetFiles) {
            // Iterate through files and add them
            packageJson.fabricatorPostCssBuild.cssResetFiles.forEach(function(cssFile) {
                // If the file does not exist, we can stop here
                if (! FAB.fileExists(dir + '/' + cssFile)) {
                    return;
                }

                // Get the previous bundle contents (we want the reset to come first
                var prevContents = FAB.readFile(fabCacheCssBundleFile).toString();

                // Add the file to our bundle
                FAB.writeFile(
                    fabCacheCssBundleFile,
                    FAB.readFile(dir + '/' + cssFile).toString() + prevContents
                );
            });
        }

        // If we have a cssFiles key, we should do some stuff
        if (packageJson.fabricatorPostCssBuild.cssFiles) {
            // Iterate through files and add them
            packageJson.fabricatorPostCssBuild.cssFiles.forEach(function(cssFile) {
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
        }
    });

    // Parse mixins
    FAB.recursive(mixinsDir).forEach(function(file) {
        parseMixinsFile(file);
    });

    // Compile CSS mixins
    if (FAB.config.compileCss.mixinFiles) {
        FAB.config.compileCss.mixinFiles.forEach(function(file) {
            var thisFile = global.projectRoot + '/' + file;

            if (! FAB.fileExists(thisFile)) {
                return;
            }

            parseMixinsFile(thisFile);
        });
    }

    // Start with the reset if it exists
    if (FAB.fileExists(customReset)) {
        FAB.writeFile(fabCacheCssBundleFile, FAB.readFile(customReset), true);
    } else if (FAB.fileExists(customReset2)) {
        FAB.writeFile(fabCacheCssBundleFile, FAB.readFile(customReset2), true);
    }

    // Compile CSS
    if (FAB.config.compileCss.cssFiles) {
        FAB.config.compileCss.cssFiles.forEach(function(file) {
            var thisFile = global.projectRoot + '/' + file;

            if (! FAB.fileExists(thisFile)) {
                return;
            }

            FAB.writeFile(fabCacheCssBundleFile, FAB.readFile(thisFile), true);
        });
    }

    // Add all other CSS files
    FAB.recursive(cssLoc).forEach(function(file) {
        // Get the file extension
        var ext = FAB.path.extname(file);

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
    FAB.postcss([postcssMixins, postcssNext, hexRGBA])
        .process(bundleContents)
        .then(function(result) {
            // Write the output to the min file
            FAB.writeFile(cssOutput, result.css);

            // Send notification
            FAB.notify('CSS Compiled');
            FAB.out.success('CSS compiled, watching for CSS changes...');
        })
        .catch(function(error) {
            FAB.notify('PostCSS compile error', true);
            FAB.out.error('There was a PostCSS compile error');
            FAB.out.error('Error: ' + error.name);
            FAB.out.error('Reason: ' + error.reason);
            FAB.out.error('Message: ' + error.message);

            FAB.postErrorMsg([
                'Project: ' + FAB.config.postErrorsTo.projectName,
                'Error type: PostCSS compile error',
                'Error: ' + error.name,
                'Reason: ' + error.reason,
                'Message: ' + error.message
            ]);

            FAB.out.error('END PostCSS compile error');
            FAB.out.success('Watching for CSS changes...');
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

// Create the css cache directory
FAB.mkdirIfNotExists(fabCacheCssDirectory);

// Create the bundled CSS file
FAB.writeFile(fabCacheCssBundleFile);

// Watch for changes
FAB.watch.watchTree(
    cssLoc,
    {
        interval: 0.5
    },
    function() {
        runCss();
    }
);
