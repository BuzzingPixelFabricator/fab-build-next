/*----------------------------------------------------------------------------*\
    # Copyright 2017, BuzzingPixel, LLC

    # This program is free software: you can redistribute it and/or modify
    # it under the terms of the Apache License 2.0.
    # http://www.apache.org/licenses/LICENSE-2.0
\*----------------------------------------------------------------------------*/

/* global FAB:true */
/* global global */
/* global JSON */

// Set up variables
var jsLoc = global.projectRoot + '/' + FAB.config.source + '/js';
var replacer = global.projectRoot + '/';
var jshintRcPath = global.projectRoot + '/.jshintrc';
var options;

if (FAB.fileExists(jshintRcPath)) {
    options = JSON.parse(FAB.readFile(jshintRcPath).toString());
}

// Function for running JSHint
function runJsHint() {
    // Iterate through the JS files
    FAB.recursive(jsLoc).forEach(function(file) {
        // If this is not a JS file, we can skip it
        if (FAB.path.extname(file) !== '.js') {
            return;
        }

        // Get instance of JSHint
        var jshint = require('jshint');

        // Run JSHINT
        jshint.JSHINT(FAB.readFile(file).toString(), options);

        // If there are no errors, we can stop here
        if (! jshint.JSHINT.errors.length) {
            return;
        }

        // Get the filename path
        var fileNamePath = file.slice(file.indexOf(replacer) + replacer.length);

        // Send notifications
        FAB.notify('JSHint error', true);
        FAB.out.error('JSHint error: ' + fileNamePath);
        FAB.out.prettyJSON(jshint.JSHINT.errors);

        // Start error message array
        var errMsg = [
            'Project: ' + FAB.config.postErrorsTo.projectName,
            'JSHint error: ' + fileNamePath
        ];

        // Iterate through errors and push them into the array
        jshint.JSHINT.errors.forEach(function(obj) {
            errMsg.push('-------');

            for (var i in obj) {
                errMsg.push(i + ': ' + obj[i]);
            }
        });

        // Post the errors
        FAB.postErrorMsg(errMsg);

        // That's the end of the error
        FAB.out.error('End JSHint error: ' + fileNamePath);
    });
}

// Watch for changes
FAB.watch.watchTree(
    jsLoc,
    {
        interval: 0.5
    },
    function() {
        runJsHint();
    }
);
