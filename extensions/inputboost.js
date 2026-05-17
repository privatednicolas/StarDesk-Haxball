(function() {
    if (Injector.isMainFrame()) return;
    if (!Injector.isGameFrame()) return;

    function optimizeEventListeners() {
        var originalAddEventListener = EventTarget.prototype.addEventListener;
        var passiveEvents = {
            'wheel': true, 'mousewheel': true,
            'touchstart': true, 'touchmove': true,
            'touchend': true, 'touchcancel': true
        };
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            var newOptions = options;
            if (passiveEvents[type]) {
                if (typeof options === 'boolean') {
                    newOptions = { capture: options, passive: true };
                } else if (typeof options === 'object') {
                    newOptions = Object.assign({}, options, { passive: true });
                } else {
                    newOptions = { passive: true };
                }
            }
            return originalAddEventListener.call(this, type, listener, newOptions);
        };
    }

    var hasScheduler = typeof window.scheduler !== 'undefined' && window.scheduler && window.scheduler.postTask;

    function scheduleHighPriority(callback) {
        if (hasScheduler) {
            window.scheduler.postTask(callback, { priority: 'user-blocking' });
        } else {
            callback();
        }
    }

    function setupPointerRawUpdate(canvas) {
        if (!canvas || !('onpointerrawupdate' in window)) return;
        var lastX = 0, lastY = 0;
        canvas.addEventListener('pointerrawupdate', function(e) {
            if (Math.abs(e.clientX - lastX) > 0.5 || Math.abs(e.clientY - lastY) > 0.5) {
                lastX = e.clientX;
                lastY = e.clientY;
                canvas.dispatchEvent(new MouseEvent('mousemove', {
                    clientX: e.clientX, clientY: e.clientY,
                    bubbles: true, cancelable: true
                }));
            }
        }, { passive: true });
    }

    function optimizeKeyboardInput() {
        var gameKeys = new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','ShiftLeft','ControlLeft','KeyX']);
        var pressedKeys = new Set();
        document.addEventListener('keydown', function(e) {
            if (gameKeys.has(e.code)) {
                if (pressedKeys.has(e.code)) return;
                pressedKeys.add(e.code);
            }
        }, { capture: true, passive: true });
        document.addEventListener('keyup', function(e) {
            pressedKeys.delete(e.code);
        }, { capture: true, passive: true });
    }

    function reduceVsyncLag() {
        var channel = new MessageChannel();
        var pendingCallback = null;
        channel.port1.onmessage = function() {
            if (pendingCallback) {
                var cb = pendingCallback;
                pendingCallback = null;
                cb();
            }
        };
        window.scheduleImmediate = function(callback) {
            pendingCallback = callback;
            channel.port2.postMessage(null);
        };
    }

    function disableBrowserSmoothing() {
        if (CSS.supports && CSS.supports('scroll-behavior', 'auto')) {
            var style = document.createElement('style');
            style.textContent = '* { scroll-behavior: auto !important; }';
            document.head.appendChild(style);
        }
    }

    optimizeEventListeners();
    optimizeKeyboardInput();
    reduceVsyncLag();
    disableBrowserSmoothing();

    Injector.waitForElement('canvas').then(function(canvas) {
        setupPointerRawUpdate(canvas);
    }).catch(function() {});

    window.InputBoost = {
        isEnabled: function() { return true; },
        setEnabled: function() {},
        scheduleHighPriority: scheduleHighPriority
    };
})();
