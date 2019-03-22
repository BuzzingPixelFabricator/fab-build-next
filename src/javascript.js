/*----------------------------------------------------------------------------*\
    # Copyright 2019, BuzzingPixel, LLC

    # This program is free software: you can redistribute it and/or modify
    # it under the terms of the Apache License 2.0.
    # http://www.apache.org/licenses/LICENSE-2.0
\*----------------------------------------------------------------------------*/

/* global FAB:true */
/* global global */

// Get Node requirements
var UglifyJS = require('terser');

// Set up variables
var sep = FAB.path.sep;
var jsLoc = global.projectRoot + sep + FAB.config.source + sep + 'js';
var setupLoc = jsLoc + sep + 'setup.js';
var mainLoc = jsLoc + sep + 'main.js';
var nodeModulesDir = global.projectRoot + sep + 'node_modules';
var jsOutputDir = FAB.internalConfig.jsOutputDir;
var jsOutput = FAB.internalConfig.jsOutput;
var jsMapOutput = jsOutputDir + sep + 'script.min.js.map';
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
    var replacer = global.projectRoot + sep;
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

    // Add module files
    FAB.fs.readdirSync(nodeModulesDir).forEach(function(file) {
        // Get file stats
        var dir = nodeModulesDir + sep + file;
        var stat = FAB.fs.lstatSync(dir);
        var packageJsonLoc = nodeModulesDir + sep + file + sep + 'package.json';
        var packageJson;

        // If this is not a directory, or package.json does not exist,
        // we can immediately move on
        if (! stat.isDirectory() || ! FAB.fileExists(packageJsonLoc)) {
            return;
        }

        // Get the package json
        packageJson = require(packageJsonLoc);

        // If we don't have a fabricatorJsBuild, we should stop
        if (! packageJson.fabricatorJsBuild ||
            ! packageJson.fabricatorJsBuild.files
        ) {
            return;
        }

        // Iterate through files
        packageJson.fabricatorJsBuild.files.forEach(function(jsFileCandidate) {
            // Add the directory to the path
            jsFileCandidate = dir + sep + jsFileCandidate;

            // If the file does not exist, we can stop here
            if (! FAB.fileExists(jsFileCandidate)) {
                return;
            }

            // Add file content
            code[jsFileCandidate] = FAB.readFile(jsFileCandidate).toString();
        });
    });

    // Add js build files
    FAB.config.jsBuild.forEach(function(file) {
        var fileLoc = global.projectRoot + sep + file;

        // If the file does not exist, we can stop here
        if (! FAB.fileExists(fileLoc)) {
            return;
        }

        // Add file content
        code[file] = FAB.readFile(fileLoc).toString();
    });

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
        FAB.notify('JS Compile Error', true);
        FAB.out.error('There was an error compiling Javascript');
        FAB.out.error('Error: ' + processed.error.message);
        FAB.out.error('File: ' + processed.error.filename);
        FAB.out.error('Line: ' + processed.error.line);
        FAB.out.error('Column: ' + processed.error.col);
        FAB.out.error('Position: ' + processed.error.pos);

        FAB.postErrorMsg([
            'Project: ' + FAB.config.postErrorsTo.projectName,
            'Error type: JS Compile Error',
            'Error: ' + processed.error.message,
            'File: ' + processed.error.filename,
            'Line: ' + processed.error.line,
            'Column: ' + processed.error.col,
            'Position: ' + processed.error.pos
        ]);

        if (FAB.internalConfig.watch) {
            FAB.out.success('Watching for JS changes...');
        }

        return;
    }

    if (FAB.config.sourceMaps) {
        FAB.writeFile(jsMapOutput, processed.map);
        sourceMapCode = '\n//# sourceMappingURL=script.min.js.map';
    }

    FAB.writeFile(jsOutput, processed.code + sourceMapCode);

    // Send notification
    FAB.notify('JS Compiled');

    if (FAB.internalConfig.watch) {
        FAB.out.success('JS compiled, watching for JS changes...');
    } else {
        FAB.out.success('JS compiled');
    }
}

// Create the output directory
jsOutputDir.split(sep).forEach(function(path, i) {
    if (! path) {
        return;
    }
    if (i === 0 && path.indexOf(':') > -1) {
        outputDirPath += path;
    } else {
        outputDirPath += sep + path;
        FAB.mkdirIfNotExists(outputDirPath);
    }
});

if (FAB.internalConfig.watch) {
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
} else {
    runJs();
}
