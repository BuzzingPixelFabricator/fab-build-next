/*----------------------------------------------------------------------------*\
    # Copyright 2017, BuzzingPixel, LLC

    # This program is free software: you can redistribute it and/or modify
    # it under the terms of the Apache License 2.0.
    # http://www.apache.org/licenses/LICENSE-2.0

    # This file is an example and not required
\*----------------------------------------------------------------------------*/

/* global FAB:true */
/* global global */

// Get Node requirements
var UglifyJS = require('uglify-js');

// Set up variables
var jsLoc = global.projectRoot + '/' + FAB.config.source + '/js';
var setupLoc = jsLoc + '/setup.js';
var mainLoc = jsLoc + '/main.js';
var jsOutputDir = FAB.internalConfig.jsOutputDir;
var jsOutput = FAB.internalConfig.jsOutput;
var jsMapOutput = jsOutputDir + '/script.min.js.map';
var outputDirPath = '';

// Set up options
var options = {
    sourceMap: FAB.config.sourceMaps,
    mangle: FAB.config.minifyJs,
    compress: FAB.config.minifyJs,
    output: {
        beautify: ! FAB.config.minifyJs
    }
};

// Run JS function
function runJs() {
    var code = {};
    var replacer = global.projectRoot + '/';
    var name;
    var processed;
    var sourceMapCode = '';

    FAB.out.info('Compiling JS...');

    // Make sure FAB is defined
    code.fabNameSpace1 = "window.FABNAMESPACE = '" + FAB.config.jsNamespace + "';";
    code.fabNameSpace2 = 'window[window.FABNAMESPACE] = window.window[window.FABNAMESPACE] || {};';

    // Start with the setup file if it exists
    if (FAB.fileExists(setupLoc)) {
        name = setupLoc.slice(setupLoc.indexOf(replacer) + replacer.length);
        code[name] = FAB.readFile(setupLoc).toString();
    }

    // Add all other JS files except main
    FAB.recursive(jsLoc).forEach(function(file) {
        if (FAB.path.extname(file) !== '.js' ||
            file === setupLoc ||
            file === mainLoc
        ) {
            return;
        }
        name = file.slice(file.indexOf(replacer) + replacer.length);
        code[name] = FAB.readFile(file).toString();
    });

    // Add the main file if it exists
    if (FAB.fileExists(mainLoc)) {
        name = mainLoc.slice(mainLoc.indexOf(replacer) + replacer.length);
        code[name] = FAB.readFile(mainLoc).toString();
    }

    processed = UglifyJS.minify(code, options);

    if (processed.error) {
        FAB.out.error('There was an error compiling Javascript');
        FAB.out.prettyJSON(processed.error);
        FAB.notify('JS Compile Error', true);
        FAB.out.error('Watching for JS changes...');
        return;
    }

    if (FAB.config.sourceMaps) {
        FAB.writeFile(jsMapOutput, processed.map);
        sourceMapCode = '\n//# sourceMappingURL=script.min.js.map';
    }

    FAB.writeFile(jsOutput, processed.code + sourceMapCode);

    // Send notification
    FAB.notify('JS Compiled');

    FAB.out.success('JS compiled, watching for JS changes...');
}

// Create the output directory
jsOutputDir.split('/').forEach(function(path) {
    if (! path) {
        return;
    }
    outputDirPath += '/' + path;
    FAB.mkdirIfNotExists(outputDirPath);
});

// Watch for changes
FAB.watch.watchTree(
    jsLoc,
    {
        interval: 0.5
    },
    function() {
        runJs();
    }
);
