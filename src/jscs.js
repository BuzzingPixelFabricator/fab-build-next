/*----------------------------------------------------------------------------*\
    # Copyright 2019, BuzzingPixel, LLC

    # This program is free software: you can redistribute it and/or modify
    # it under the terms of the Apache License 2.0.
    # http://www.apache.org/licenses/LICENSE-2.0
\*----------------------------------------------------------------------------*/

/* global FAB:true */
/* global global */
/* global JSON */

// Get Node requirements
var Checker = require('jscs');
var checker = new Checker();

// Set up variables
var sep = FAB.path.sep;
var jsLoc = global.projectRoot + sep + FAB.config.source + sep + 'js';
var replacer = global.projectRoot + sep;
var jscsPath = global.projectRoot + sep + '.jscs.json';
var jscsPath2 = global.projectRoot + sep + '.jscsrc';
var options;

checker.registerDefaultRules();

if (FAB.fileExists(jscsPath)) {
    options = JSON.parse(FAB.readFile(jscsPath).toString());
} else if (FAB.fileExists(jscsPath2)) {
    options = JSON.parse(FAB.readFile(jscsPath2).toString());
}

if (options) {
    // checker.configure(options);
    checker.configure(options);
}

// Function for running JSHint
function runJSCS() {
    // Iterate through the JS files
    FAB.recursive(jsLoc).forEach(function(file) {
        // If this is not a JS file, we can skip it
        if (FAB.path.extname(file) !== '.js') {
            return;
        }

        var results = checker.checkString(FAB.readFile(file).toString());

        var errorList = results.getErrorList();

        // If there are no errors, we can stop here
        if (! errorList.length) {
            return;
        }

        // Get the filename path
        var fileNamePath = file.slice(file.indexOf(replacer) + replacer.length);

        // Send notification
        FAB.notify('JSCS error', true);

        // Send terminal error output
        FAB.out.error('JSCS error: ' + fileNamePath);

        // Output the error list
        results.getErrorList().forEach(function(error) {
            var colorizeOutput = true;
            console.log(results.explainError(error, colorizeOutput) + '\n');
            FAB.postErrorMsg([
                'Project: ' + FAB.config.postErrorsTo.projectName,
                'JSCS error: ' + fileNamePath,
                results.explainError(error, false)
            ]);
        });

        FAB.out.error('End JSCS error: ' + fileNamePath);
    });
}

// Watch for changes
FAB.watch.watchTree(
    jsLoc,
    {
        interval: 0.5
    },
    function() {
        runJSCS();
    }
);
