/*----------------------------------------------------------------------------*\
    # Copyright 2019, BuzzingPixel, LLC

    # This program is free software: you can redistribute it and/or modify
    # it under the terms of the Apache License 2.0.
    # http://www.apache.org/licenses/LICENSE-2.0
\*----------------------------------------------------------------------------*/

/* global FAB:true */

FAB.writeFile = function(path, content, concat) {
    if (! content) {
        content = '';
    }

    if (concat === true && FAB.fileExists(path)) {
        content = FAB.readFile(path) + content;
    }

    require('fs').writeFileSync(path, content);
};
