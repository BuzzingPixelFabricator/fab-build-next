/*----------------------------------------------------------------------------*\
    # Copyright 2019, BuzzingPixel, LLC

    # This program is free software: you can redistribute it and/or modify
    # it under the terms of the Apache License 2.0.
    # http://www.apache.org/licenses/LICENSE-2.0
\*----------------------------------------------------------------------------*/

/* global FAB:true */
/* global __dirname */

FAB.notify = function(message, isError) {
    var notifier = require('node-notifier');
    var title = 'Fabricator';
    var icon = __dirname + '/../icons/fab-success-icon.png';

    if (isError) {
        title += ' Error';
        icon = __dirname + '/../icons/fab-error-icon.png';
    }

    notifier.notify({
        title: title,
        message: message,
        icon: icon
    });
};
