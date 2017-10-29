FAB.notify = function(message, isError) {
    var notifier = require('node-notifier');
    var title = 'Fabricator';

    if (isError) {
        title += ' Error';
    }

    notifier.notify({
        title: title,
        message: message
    });
};
