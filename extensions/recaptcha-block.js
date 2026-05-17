document.addEventListener('contextmenu', function(e) {
    // Allow right-click on player list items so the admin/kick menu works
    var target = e.target;
    while (target && target !== document.body) {
        if (target.classList && typeof target.className === 'string' &&
            target.className.indexOf('player-list-item') !== -1 &&
            target.dataset && target.dataset.playerId) {
            return; // Let it through
        }
        target = target.parentElement;
    }
    e.preventDefault();
    e.stopPropagation();
    return false;
}, true);
document.addEventListener('click', function(e) {
    var target = e.target;

    while (target && target.tagName !== 'A') {
        target = target.parentElement;
    }

    if (target && target.href) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
}, true);