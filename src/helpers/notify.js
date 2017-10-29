FAB.notify = function(message) {
    var notifier = require('node-notifier');

    notifier.notify({
        title: 'Fabricator',
        message: message
    });
};
