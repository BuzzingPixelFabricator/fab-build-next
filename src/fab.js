/*----------------------------------------------------------------------------*\
    # Copyright 2017, BuzzingPixel, LLC

    # This program is free software: you can redistribute it and/or modify
    # it under the terms of the Apache License 2.0.
    # http://www.apache.org/licenses/LICENSE-2.0

    # This file is an example and not required
\*----------------------------------------------------------------------------*/

/* global FAB:true */
/* global global */
/* global __dirname */

var path = require('path');

// Set fab
FAB = {};

// Require helpers
require('fs').readdirSync(__dirname + '/helpers').forEach(function(file) {
    if (path.extname(file) !== '.js') {
        return;
    }
    require('./helpers/' + file);
});

// Set the base config
require('./config.js');

// Make sure fab cache directory exists and is gitignored
var fabCacheDirectory = global.projectRoot + '/fabCache';
FAB.mkdirIfNotExists(fabCacheDirectory);
FAB.writeFile(fabCacheDirectory + '/.gitignore', '*\n');

// Run CSS
if (FAB.config.enableCss) {
    require('./css.js');
}

//  Run Javascript
if (FAB.config.enableJs) {
    require('./javascript.js');
}

// Run JSHint
if (FAB.config.enableJSHint) {
    require('./jshint.js');
}

// Run JSHint
if (FAB.config.enableJSCS) {
    require('./jscs.js');
}

// Run browser sync
if (FAB.config.proxy !== false) {
    require('./browserSync.js');
}
