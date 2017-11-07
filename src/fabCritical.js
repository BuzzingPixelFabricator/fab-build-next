/*----------------------------------------------------------------------------*\
    # Copyright 2017, BuzzingPixel, LLC

    # This program is free software: you can redistribute it and/or modify
    # it under the terms of the Apache License 2.0.
    # http://www.apache.org/licenses/LICENSE-2.0
\*----------------------------------------------------------------------------*/

/* global FAB:true */
/* global process */
/* global global */

// Run fab setup
require('./fabSetup');

// Get critical
var critical = require('critical');

// Get URL
var nodeUrl = require('url');

// Get json
var getJSON = require('get-json');

// Set up config
var config = {
    file: '',
    cssFile: '',
    jsonUrl: ''
};

var fileOutputPath;
var fileOutputFile;
var mkPath = '';
var criticalConfig = {
    inline: false,
    width: 1920,
    height: 1500,
    minify: true
};

// Iterate through args
process.argv.forEach(function(arg) {
    // Parse argument
    var parseArg = arg.split('=');

    // Set variables
    var name;
    var val;

    // Make sure this argument has a name and a val
    if (parseArg.length !== 2) {
        return;
    }

    // Set name and value
    name = parseArg[0];
    val = parseArg[1];

    // If this is not a config item of ours, we should end
    if (! name) {
        return;
    }

    // Set the config item
    config[name] = val;
});

// If there is a file, set it
if (config.file) {
    fileOutputPath = global.projectRoot + '/' + FAB.config.critical.destination + '/' + config.file;
    fileOutputFile = fileOutputPath + '/style.min.css';

    fileOutputPath.split('/').forEach(function(path) {
        if (! path) {
            return;
        }
        mkPath += '/' + path;
        FAB.mkdirIfNotExists(mkPath);
    });

    FAB.writeFile(fileOutputFile, '');

    criticalConfig.src = global.projectRoot + '/' + config.file;
    criticalConfig.dest = fileOutputFile;

    if (config.cssFile) {
        criticalConfig.css = [global.projectRoot + '/' + config.cssFile];
    }

    critical.generate(criticalConfig);
}

if (config.jsonUrl) {
    getJSON(config.jsonUrl, function(err, resp) {
        resp.forEach(function(url) {
            var parsedUrl = nodeUrl.parse(url);
            var fileOutputPath = global.projectRoot + '/' + FAB.config.critical.destination + parsedUrl.pathname;
            var fileOutputFile;
            var mkPath = '';

            if (parsedUrl.pathname !== '/') {
                fileOutputFile = fileOutputPath + '/style.min.css';
            } else {
                fileOutputFile = fileOutputPath + 'style.min.css';
            }

            fileOutputPath.split('/').forEach(function(path) {
                if (! path) {
                    return;
                }
                mkPath += '/' + path;
                FAB.mkdirIfNotExists(mkPath);
            });

            FAB.writeFile(fileOutputFile, '');

            criticalConfig.src = url;
            criticalConfig.dest = fileOutputFile;

            if (config.cssFile) {
                criticalConfig.css = [global.projectRoot + '/' + config.cssFile];
            }

            critical.generate(criticalConfig);
        });
    });
}
