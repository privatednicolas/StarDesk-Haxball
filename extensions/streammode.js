(function() {
    if (!Injector.isGameFrame()) return;

    var streamEnabled = false;
    var STORAGE_KEY = 'stardesk_streammode';
    var styleId = '__stardesk_streammode_style__';

    var STREAM_CSS = [
        '.chatbox-view { display: none !important; }',
        '.bar-container { display: none !important; }',
        '.game-timer-view { display: none !important; }',
        '.stats-view { display: none !important; }',
        'canvas { position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 1 !important; }'
    ].join('\n');

    function loadState() {
        try {
            return localStorage.getItem(STORAGE_KEY) === 'true';
        } catch(e) { return false; }
    }

    function saveState(val) {
        try { localStorage.setItem(STORAGE_KEY, val ? 'true' : 'false'); } catch(e) {}
    }

    function applyStreamMode() {
        var existing = document.getElementById(styleId);
        if (streamEnabled) {
            if (!existing) {
                var style = document.createElement('style');
                style.id = styleId;
                style.textContent = STREAM_CSS;
                (document.head || document.documentElement).appendChild(style);
            }
        } else {
            if (existing) existing.remove();
        }
    }

    function toggle() {
        streamEnabled = !streamEnabled;
        saveState(streamEnabled);
        applyStreamMode();
    }

    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'F10') {
            e.preventDefault();
            e.stopPropagation();
            toggle();
        }
    }, true);

    streamEnabled = loadState();
    setTimeout(function() {
        applyStreamMode();
    }, 1500);

    Injector.log('StreamMode loaded');
})();
