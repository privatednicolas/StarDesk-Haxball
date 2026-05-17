(function() {
    'use strict';

    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key.toUpperCase() === 'C') {
            var sel = window.getSelection();
            if (sel && sel.toString().length > 0) return;
        }
        if (e.ctrlKey && e.key.toUpperCase() === 'V') {
            var tag = e.target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        }
        if (e.key === 'F11' || e.keyCode === 122) return;
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
        if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
        if (e.ctrlKey && e.key.toUpperCase() === 'U') {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
        if (e.ctrlKey && e.key.toUpperCase() === 'S') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        if (e.ctrlKey && ['0', '+', '-', '_'].includes(e.key)) return;

    }, true);
    document.addEventListener('contextmenu', function(e) {
        var target = e.target;

        while (target && target !== document.body) {
            if (target.dataset && target.dataset.hook === 'listscroll') return;

            if (target.classList) {
                var classes = target.className;
                if (typeof classes === 'string') {
                    if (classes.indexOf('player-list-item') !== -1 && target.dataset && target.dataset.playerId) return;
                }
            }
            target = target.parentElement;
        }

        e.preventDefault();
    }, true);

    Injector.injectCSS('security-css',
        'html, body { overflow: hidden !important; } ' +
        '::-webkit-scrollbar { display: none !important; } ' +
        'body, div:not(.chatbox-view):not(.log):not(.log-contents), span, button, label, h1, h2, h3, table, tr, td, th, canvas, svg, img { user-select: none !important; -webkit-user-select: none !important; } ' +
        '.chatbox-view, .chatbox-view-contents, .log, .log-contents, .log-contents p, .chatbox-view p { user-select: text !important; -webkit-user-select: text !important; } ' +
        'input, textarea { user-select: text !important; -webkit-user-select: text !important; }'
    );
})();