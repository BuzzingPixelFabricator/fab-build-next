/*----------------------------------------------------------------------------*\
    # Copyright 2017, BuzzingPixel, LLC

    # This program is free software: you can redistribute it and/or modify
    # it under the terms of the Apache License 2.0.
    # http://www.apache.org/licenses/LICENSE-2.0
\*----------------------------------------------------------------------------*/

/* global FAB:true */

// Run fab setup
require('./fabSetup');

// Run initial cleanup
require('./initialCleanup');

// Run lib sync
if (typeof FAB.config.libSync === 'object' &&
    FAB.config.libSync.constructor === Array
) {
    require('./libSync.js');
}

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

// Run JSCS
if (FAB.config.enableJSCS) {
    require('./jscs.js');
}

// Run browser sync
if (FAB.config.proxy !== false) {
    require('./browserSync.js');
}
