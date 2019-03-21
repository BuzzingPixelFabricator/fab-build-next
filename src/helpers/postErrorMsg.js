/*----------------------------------------------------------------------------*\
    # Copyright 2019, BuzzingPixel, LLC

    # This program is free software: you can redistribute it and/or modify
    # it under the terms of the Apache License 2.0.
    # http://www.apache.org/licenses/LICENSE-2.0
\*----------------------------------------------------------------------------*/

/* global FAB:true */

FAB.postErrorMsg = function(message) {
    // IF there is no URL we can stop here
    if (! FAB.config.postErrorsTo.url) {
        return;
    }

    // Get the request functionality
    var request = require('request');

    // Set up the options
    var options = {
        url: FAB.config.postErrorsTo.url,
        method: 'POST',
        headers: {
            'User-Agent': 'BuzzingPixel Fabricator',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    // Get form data object
    var formData = FAB.config.postErrorsTo.formPostData;

    var finalMessage = message;

    if (Array.isArray(message)) {
        finalMessage = message.join('\n');
    }

    // Add the message to the form data
    formData[FAB.config.postErrorsTo.formMessageKey] = finalMessage;

    // Add the form data to the form options
    options.form = formData;

    // Send the request and validate the response
    request(options, function(error) {
        if (error) {
            FAB.notify('Unable to post error to specified URL', true);
            FAB.out.error('Unable to post error to specified URL');
        }
    });
};
