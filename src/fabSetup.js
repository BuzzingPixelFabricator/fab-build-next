/*----------------------------------------------------------------------------*\
    # Copyright 2017, BuzzingPixel, LLC

    # This program is free software: you can redistribute it and/or modify
    # it under the terms of the Apache License 2.0.
    # http://www.apache.org/licenses/LICENSE-2.0
\*----------------------------------------------------------------------------*/

/* global FAB:true */
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
