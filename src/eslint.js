/*----------------------------------------------------------------------------*\
    # Copyright 2019, BuzzingPixel, LLC

    # This program is free software: you can redistribute it and/or modify
    # it under the terms of the Apache License 2.0.
    # http://www.apache.org/licenses/LICENSE-2.0
\*----------------------------------------------------------------------------*/

/* global FAB:true */
/* global global */
/* global JSON */

// Set up variables
var sep = FAB.path.sep;
var jsLoc = global.projectRoot + sep + FAB.config.source + sep + 'js';
var replacer = global.projectRoot + sep;
var eslintRcPath = global.projectRoot + sep + '.eslintrc';
var config;

if (FAB.fileExists(eslintRcPath)) {
    config = JSON.parse(FAB.readFile(eslintRcPath).toString());
}

// Function for running ESLint
function runEsLint() {
    FAB.recursive(jsLoc).forEach(function(file) {
        // If this is not a JS file, we can skip it
        if (FAB.path.extname(file) !== '.js') {
            return;
        }

        // Get the ESLint CLIEngine. This handles getting our eslint configs
        var CLIEngine = require('eslint').CLIEngine;
        var cli = new CLIEngine();

        // Get the relative filename path
        var fileNamePath = file.slice(file.indexOf(replacer) + replacer.length);

        // Run
        var result = cli.executeOnText(FAB.readFile(file).toString(), fileNamePath, true);

        if (result.errorCount < 1) {
            return;
        }

        var errOut = [];

        result.results.forEach(function(err) {
            errOut.push({
                filePath: err.filePath,
                messages: err.messages,
                errorCount: err.errorCount,
                warningCount: err.warningCount
            });
        });

        // Send notifications
        FAB.notify('ESLint error', true);
        FAB.out.error('ESLint error: ' + fileNamePath);
        FAB.out.prettyJSON(errOut);

        // Start error message array
        var errMsg = [
            'Project: ' + FAB.config.postErrorsTo.projectName,
            'JSHint error: ' + fileNamePath
        ];

        // Iterate through errors and push them into the array
        errOut.forEach(function(obj) {
            errMsg.push('-------');

            for (var i in obj) {
                errMsg.push(i + ': ' + obj[i]);
            }
        });

        // Post the errors
        FAB.postErrorMsg(errMsg);

        // That's the end of the error
        FAB.out.error('End ESLint error: ' + fileNamePath);
    });
}

// Watch for changes
FAB.watch.watchTree(
    jsLoc,
    {
        interval: 0.5
    },
    function() {
        runEsLint();
    }
);
