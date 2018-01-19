/*----------------------------------------------------------------------------*\
    # Copyright 2017, BuzzingPixel, LLC

    # This program is free software: you can redistribute it and/or modify
    # it under the terms of the Apache License 2.0.
    # http://www.apache.org/licenses/LICENSE-2.0
\*----------------------------------------------------------------------------*/

/* global FAB:true */
/* global global */

var replacer = FAB.config.source + FAB.path.sep;
var timers = {};

function runLibSync(srcDir, targetDir) {
    if (! timers[srcDir]) {
        clearTimeout(timers[srcDir]);
    }

    timers[srcDir] = setTimeout(function() {
        FAB.out.info('Syncing lib files...');

        FAB.notify('Syncing lib files');

        require('sync-directory')(srcDir, targetDir, {
            type: 'copy'
        });

        FAB.out.success('Lib files synced, watching for lib file changes...');
    }, 200);
}

// Watch for changes
FAB.config.libSync.forEach(function(dir) {
    var dest = dir;
    var srcDir;
    var targetDir;

    if (dir.indexOf(replacer) > -1) {
        dest = dir.slice(dir.indexOf(replacer) + replacer.length);
    }

    srcDir = global.projectRoot + FAB.path.sep + dir;
    targetDir = global.projectRoot + FAB.path.sep + FAB.config.assets + FAB.path.sep + dest;

    FAB.internalConfig.libSyncWatch.push(srcDir + '/**');

    FAB.mkdirIfNotExists(srcDir);

    FAB.watch.watchTree(
        srcDir,
        {
            interval: 0.5
        },
        function() {
            runLibSync(srcDir, targetDir);
        }
    );
});
