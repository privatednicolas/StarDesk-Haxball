(function() {
    'use strict';

    var EXTRAPOLATION_KEYS_STORAGE = 'haxball_extrapolation_keys';

    var defaultExtrapolationKeys = [{
            key: '...',
            value: 0
        },
        {
            key: '...',
            value: 0
        },
        {
            key: '...',
            value: 0
        }
    ];

    function loadExtrapolationKeys() {
        try {
            var s = localStorage.getItem(EXTRAPOLATION_KEYS_STORAGE);
            return s ? JSON.parse(s) : defaultExtrapolationKeys;
        } catch (e) {
            return defaultExtrapolationKeys;
        }
    }

    var extrapolationKeys = loadExtrapolationKeys();

    document.addEventListener('extrapolation-keys-updated', function() {
        extrapolationKeys = loadExtrapolationKeys();
    });

    function applyExtrapolation(value) {
        localStorage.setItem('haxball_extrapolation', value);
        var cmdInput = document.querySelector('input[data-hook="input"]') || document.querySelector('.chatbox-view input[type="text"]');
        if (cmdInput) {
            cmdInput.value = '/extrapolation ' + value;
            cmdInput.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                bubbles: true,
                cancelable: true
            }));
        }
    }

    function keysMatch(pressed, configured) {
        if (!configured) return false;
        return pressed === configured || pressed.toLowerCase() === configured.toLowerCase();
    }

    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        var k = e.key;

        if (e.ctrlKey || e.altKey || e.metaKey) return;
        for (var i = 0; i < extrapolationKeys.length; i++) {
            var ek = extrapolationKeys[i];
            if (keysMatch(k, ek.key)) {
                e.preventDefault();
                e.stopPropagation();
                applyExtrapolation(ek.value);
                return;
            }
        }

    }, true);

    var CAMERA_KEYS_STORAGE = 'haxball_camera_keys';

    function loadCameraKeys() {
        try {
            var s = localStorage.getItem(CAMERA_KEYS_STORAGE);
            return s ? JSON.parse(s) : {};
        } catch (e) {
            return {};
        }
    }
    var cameraKeys = loadCameraKeys();
    document.addEventListener('camera-keys-updated', function() {
        cameraKeys = loadCameraKeys();
    });

    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.ctrlKey || e.altKey || e.metaKey) return;

        for (var level in cameraKeys) {
            var ck = cameraKeys[level];
            if (ck && keysMatch(e.key, ck)) {
                e.preventDefault();
                e.stopPropagation();
                var lvl = parseInt(level);
                document.dispatchEvent(new KeyboardEvent('keydown', {
                    key: String(lvl),
                    code: 'Digit' + lvl,
                    keyCode: 48 + lvl,
                    bubbles: true,
                    cancelable: true
                }));
                return;
            }
        }
    }, true);

    Injector.log('Shortcuts loaded');
})();