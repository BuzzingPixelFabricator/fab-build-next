/*----------------------------------------------------------------------------*\
    # Copyright 2017, BuzzingPixel, LLC

    # This program is free software: you can redistribute it and/or modify
    # it under the terms of the Apache License 2.0.
    # http://www.apache.org/licenses/LICENSE-2.0

    # This file is an example and not required
\*----------------------------------------------------------------------------*/

/* global FAB:true */

FAB.mkdirIfNotExists = function(dir) {
    var fs = require('fs');

    if (! fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
};
