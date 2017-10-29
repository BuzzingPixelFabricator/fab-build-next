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
