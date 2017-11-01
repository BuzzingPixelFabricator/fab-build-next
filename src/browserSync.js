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

var ignorePatterns = [
    '*.diff',
    '*.err',
    '*.log',
    '*.orig',
    '*.rej',
    '*.swo',
    '*.swp',
    '*.vi',
    '*.cache',
    '*.DS_Store',
    '*.tmp',
    '*error_log',
    '*Thumbs.db'
];

if (FAB.internalConfig.libSyncWatch.length) {
    FAB.internalConfig.libSyncWatch.forEach(function(watchPath) {
        watchFiles.push(watchPath);
    });
}

FAB.config.watch.forEach(function(file) {
    watchFiles.push(global.projectRoot + '/' + file);
});

ignorePatterns.forEach(function(ignore) {
    watchFiles.push('!' + ignore);
});

browserSync.init({
    files: watchFiles,
    ghostMode: false,
    injectChanges: true,
    notify: false,
    proxy: FAB.config.proxy,
    reloadDelay: 100,
    reloadDebounce: 100,
    reloadThrottle: 1000,
    watchOptions: {
        ignored: '.DS_Store'
    }
});
