/*----------------------------------------------------------------------------*\
    # Copyright 2019, BuzzingPixel, LLC

    # This program is free software: you can redistribute it and/or modify
    # it under the terms of the Apache License 2.0.
    # http://www.apache.org/licenses/LICENSE-2.0
\*----------------------------------------------------------------------------*/

/* global FAB:true */
/* global global */

// Get Node requirements
var UglifyJS = require('terser');

// Set up variables
var sep = FAB.path.sep;
var jsLoc = global.projectRoot + sep + FAB.config.source + sep + 'js';
var jsOutputDir = FAB.internalConfig.jsOutputDir;

// Set up options
var options = {
    sourceMap: FAB.config.sourceMaps,
    mangle: FAB.config.minifyJs,
    compress: FAB.config.minifyJs,
    output: {
        beautify: ! FAB.config.minifyJs
    }
};

// Run JS function
function runJsFile(filePath) {
    var outputFullPath = jsOutputDir + filePath.slice(filePath.indexOf(jsOutputDir) + jsOutputDir.length);
    var sourceMapFullPath = outputFullPath + '.map';
    var sourceMapName = FAB.path.basename(sourceMapFullPath);
    var sourceMapCode;
    var relativeReplacer = global.projectRoot + sep;
    var relativeName = filePath.slice(filePath.indexOf(relativeReplacer) + relativeReplacer.length).split(sep).join('/');
    var code = {};
    var processed;

    if (! FAB.fileExists(filePath)) {
        if (FAB.fileExists(sourceMapFullPath)) {
            FAB.fs.removeSync(sourceMapFullPath);
        }

        if (FAB.fileExists(outputFullPath)) {
            FAB.fs.removeSync(outputFullPath);
        }

        return;
    }

    if (FAB.config.jsFileExtensions.indexOf(FAB.path.extname(filePath)) < 0) {
        return;
    }

    code[relativeName] = FAB.readFile(filePath).toString();

    processed = UglifyJS.minify(code, options);

    if (processed.error) {
        FAB.notify('JS Compile Error', true);
        FAB.out.error('There was an error compiling Javascript');
        FAB.out.error('Error: ' + processed.error.message);
        FAB.out.error('File: ' + filePath);
        FAB.out.error('Line: ' + processed.error.line);
        FAB.out.error('Column: ' + processed.error.col);
        FAB.out.error('Position: ' + processed.error.pos);

        FAB.postErrorMsg([
            'Project: ' + FAB.config.postErrorsTo.projectName,
            'Error type: JS Compile Error',
            'Error: ' + processed.error.message,
            'File: ' + filePath,
            'Line: ' + processed.error.line,
            'Column: ' + processed.error.col,
            'Position: ' + processed.error.pos
        ]);

        return;
    }

    FAB.mkdirIfNotExists(FAB.path.dirname(outputFullPath));

    if (FAB.config.sourceMaps) {
        FAB.writeFile(sourceMapFullPath, processed.map);
        sourceMapCode = '\n//# sourceMappingURL=' + sourceMapName;
    }

    FAB.writeFile(outputFullPath, processed.code + sourceMapCode);
}

FAB.out.info('Compiling JS...');

FAB.recursive(jsLoc).forEach(function(filePath) {
    runJsFile(filePath);
});

if (FAB.internalConfig.watch) {
    FAB.out.success('JS compiled, watching for JS changes...');
} else {
    FAB.out.success('JS compiled');
}

if (FAB.internalConfig.watch) {
    // Watch for changes
    FAB.watch.watchTree(
        jsLoc,
        {
            interval: 0.5
        },
        function(filePath) {
            if (typeof filePath !== 'string') {
                return;
            }

            FAB.out.info('Compiling: ' + filePath + '...');

            runJsFile(filePath);

            FAB.out.success(filePath + ' compiled.');
            FAB.out.success('Watching for JS changes...');
        }
    );
}
