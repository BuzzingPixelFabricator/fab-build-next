/*----------------------------------------------------------------------------*\
    # Copyright 2017, BuzzingPixel, LLC

    # This program is free software: you can redistribute it and/or modify
    # it under the terms of the Apache License 2.0.
    # http://www.apache.org/licenses/LICENSE-2.0
\*----------------------------------------------------------------------------*/

/* global FAB:true */
/* global global */

// Get the base project file
var baseProjectFile = require('./baseProjectFile.json');
var sep = FAB.path.sep;

// Project file
var projectFile = {};

// Project file overrides
var projectFileOverrides = {};

// Final config
var config = {};

// Get the project file
if (FAB.fileExists(global.projectRoot + sep + 'project.json')) {
    projectFile = require(global.projectRoot + sep + 'project.json');
}

// Get project file overrides if they exist
if (FAB.fileExists(global.projectRoot + sep + 'projectOverrides.json')) {
    projectFileOverrides = require(global.projectRoot + sep + 'projectOverrides.json');
}

// Loop through baseProjectFile, set properties based on order of succession
for (var key in baseProjectFile) {
    if (projectFileOverrides[key] !== undefined) {
        config[key] = projectFileOverrides[key];
    } else if (projectFile[key] !== undefined) {
        config[key] = projectFile[key];
    } else {
        config[key] = baseProjectFile[key];
    }
}

FAB.config = config;

// Do directory seperator replacements for WINDOZE
if (sep !== '/') {
    FAB.config.assets = FAB.config.assets.replace(/\//g, sep);
    FAB.config.source = FAB.config.source.replace(/\//g, sep);
    FAB.config.critical.destination = FAB.config.critical.destination.replace(/\//g, sep);

    FAB.config.libSync.forEach(function(val, i) {
        FAB.config.libSync[i] = val.replace(/\//g, sep);
    });

    FAB.config.compileCss.cssFiles.forEach(function(val, i) {
        FAB.config.compileCss.cssFiles[i] = val.replace(/\//g, sep);
    });

    FAB.config.compileCss.mixinFiles.forEach(function(val, i) {
        FAB.config.compileCss.mixinFiles[i] = val.replace(/\//g, sep);
    });

    FAB.config.jsBuild.forEach(function(val, i) {
        FAB.config.jsBuild[i] = val.replace(/\//g, sep);
    });

    FAB.config.watch.forEach(function(val, i) {
        FAB.config.watch[i] = val.replace(/\//g, sep);
    });
}

// Set up internal config
FAB.internalConfig = {};

// Set up the primary cache directory
FAB.internalConfig.fabCacheDirectory = global.projectRoot + sep + 'fabCache';
FAB.mkdirIfNotExists(FAB.internalConfig.fabCacheDirectory);
FAB.writeFile(FAB.internalConfig.fabCacheDirectory + sep + '.gitignore', '*\n');

// Libsync
FAB.internalConfig.libSyncWatch = [];

// Set up CSS output
FAB.internalConfig.cssOutputDir = global.projectRoot + sep + FAB.config.assets + sep + 'css';
FAB.internalConfig.cssOutput = FAB.internalConfig.cssOutputDir + sep + 'style.min.css';

// Set up JS output
FAB.internalConfig.jsOutputDir = global.projectRoot + sep + FAB.config.assets + sep + 'js';
FAB.internalConfig.jsOutput = FAB.internalConfig.jsOutputDir + sep + 'script.min.js';
