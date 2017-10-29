/*----------------------------------------------------------------------------*\
    # Copyright 2017, BuzzingPixel, LLC

    # This program is free software: you can redistribute it and/or modify
    # it under the terms of the Apache License 2.0.
    # http://www.apache.org/licenses/LICENSE-2.0

    # This file is an example and not required
\*----------------------------------------------------------------------------*/

var browserSync = require("browser-sync").create();

var cssOutputDir = global.projectRoot + '/' + FAB.config.assets + '/css';
var cssOutput = cssOutputDir + '/style.min.css';
var watchFiles = [cssOutput];

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
