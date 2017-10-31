/*----------------------------------------------------------------------------*\
    # Copyright 2017, BuzzingPixel, LLC

    # This program is free software: you can redistribute it and/or modify
    # it under the terms of the Apache License 2.0.
    # http://www.apache.org/licenses/LICENSE-2.0

    # This file is an example and not required
\*----------------------------------------------------------------------------*/

/* global FAB:true */
/* global global */

var browserSync = require('browser-sync').create();

var watchFiles = [
    FAB.internalConfig.cssOutput,
    FAB.internalConfig.jsOutput
];

if (FAB.internalConfig.libSyncWatch.length) {
    FAB.internalConfig.libSyncWatch.forEach(function(watchPath) {
        watchFiles.push(watchPath);
    });
}

FAB.config.watch.forEach(function(file) {
    watchFiles.push(global.projectRoot + '/' + file);
});

browserSync.init({
    files: watchFiles,
    ghostMode: false,
    injectChanges: true,
    notify: false,
    proxy: FAB.config.proxy
});
