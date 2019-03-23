/*----------------------------------------------------------------------------*\
    # Copyright 2019, BuzzingPixel, LLC

    # This program is free software: you can redistribute it and/or modify
    # it under the terms of the Apache License 2.0.
    # http://www.apache.org/licenses/LICENSE-2.0
\*----------------------------------------------------------------------------*/

/* global FAB:true */
/* global global */

setTimeout(function() {
    var destFile;
    var finalSrcFile;
    var finalDestFile;

    FAB.out.info('Syncing files...');
    FAB.notify('Syncing files');

    for (var srcFile in FAB.internalConfig.fileSync) {
        destFile = false;

        if (FAB.internalConfig.fileSync.hasOwnProperty(srcFile)) {
            destFile = FAB.internalConfig.fileSync[srcFile];
        }

        if (! destFile) {
            continue;
        }

        finalSrcFile = global.projectRoot + FAB.path.sep + srcFile;

        finalDestFile = global.projectRoot + FAB.path.sep + FAB.config.assets + FAB.path.sep + destFile;

        FAB.fs.copyFileSync(finalSrcFile, finalDestFile);
    }

    FAB.out.success('Files synced');
}, 10);
