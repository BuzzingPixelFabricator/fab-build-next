/*----------------------------------------------------------------------------*\
    # Copyright 2017, BuzzingPixel, LLC

    # This program is free software: you can redistribute it and/or modify
    # it under the terms of the Apache License 2.0.
    # http://www.apache.org/licenses/LICENSE-2.0

    # This file is an example and not required
\*----------------------------------------------------------------------------*/

/* global FAB:true */
/* global global */

// Get the base project file
var baseProjectFile = require('./baseProjectFile.json');

// Project file
var projectFile = {};

// Project file overrides
var projectFileOverrides = {};

// Final config
var config = {};

// Get the project file
if (FAB.fileExists(global.projectRoot + '/project.json')) {
    projectFile = require(global.projectRoot + '/project.json');
}

// Get project file overrides if they exist
if (FAB.fileExists(global.projectRoot + '/projectOverrides.json')) {
    projectFileOverrides = require(global.projectRoot + '/projectOverrides.json');
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

// Set up internal config
FAB.internalConfig = {};

// Set up the primary cache directory
FAB.internalConfig.fabCacheDirectory = global.projectRoot + '/fabCache';
FAB.mkdirIfNotExists(FAB.internalConfig.fabCacheDirectory);
FAB.writeFile(FAB.internalConfig.fabCacheDirectory + '/.gitignore', '*\n');

// Set up CSS output
FAB.internalConfig.cssOutputDir = global.projectRoot + '/' + FAB.config.assets + '/css';
FAB.internalConfig.cssOutput = FAB.internalConfig.cssOutputDir + '/style.min.css';

// Set up JS output
FAB.internalConfig.jsOutputDir = global.projectRoot + '/' + FAB.config.assets + '/js';
FAB.internalConfig.jsOutput = FAB.internalConfig.jsOutputDir + '/script.min.js';
