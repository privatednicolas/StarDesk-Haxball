var Injector = {
    waitForHead: function() {
        return new Promise(function(resolve) {
            if (document.head) return resolve(document.head);
            var observer = new MutationObserver(function(_, obs) {
                if (document.head) {
                    obs.disconnect();
                    resolve(document.head);
                }
            });
            observer.observe(document.documentElement || document, {
                childList: true,
                subtree: true
            });
        });
    },

    waitForElement: function(selector, timeout) {
        timeout = timeout || 10000;
        return new Promise(function(resolve, reject) {
            var el = document.querySelector(selector);
            if (el) return resolve(el);

            var check = function() {
                if (!document.body) {
                    setTimeout(check, 10);
                    return;
                }
                var observer = new MutationObserver(function(_, obs) {
                    var found = document.querySelector(selector);
                    if (found) {
                        obs.disconnect();
                        resolve(found);
                    }
                });
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
                setTimeout(function() {
                    observer.disconnect();
                    reject(new Error('Timeout: ' + selector));
                }, timeout);
            };
            check();
        });
    },

    injectCSS: function(id, css) {
        if (document.getElementById(id)) return Promise.resolve();
        return this.waitForHead().then(function(head) {
            if (document.getElementById(id)) return;
            var style = document.createElement('style');
            style.id = id;
            style.textContent = css;
            head.appendChild(style);
        });
    },

    log: function(msg) {
        /* disabled */ },

    isMainFrame: function() {
        return window.self === window.top;
    },

    isGameFrame: function() {
        var loc = window.location.href;
        return !this.isMainFrame() && (loc.indexOf('game.html') !== -1 || loc.indexOf('html5.haxball.com') !== -1);
    },
    _viewListeners: {},
    _lastView: null,

    onView: function(viewClass, callback) {
        if (!this._viewListeners[viewClass]) {
            this._viewListeners[viewClass] = [];
        }
        this._viewListeners[viewClass].push(callback);
    },
    onViewLeave: function(viewClass, callback) {
        if (!this._viewListeners['_leave_' + viewClass]) {
            this._viewListeners['_leave_' + viewClass] = [];
        }
        this._viewListeners['_leave_' + viewClass].push(callback);
    },

    _initViewObserver: function() {
        var self = this;
        this.waitForElement("div[class$='view']").then(function(el) {
            var currentView = el.parentNode;

            var observer = new MutationObserver(function(mutations) {
                var candidates = mutations.flatMap(function(x) {
                    return Array.from(x.addedNodes);
                }).filter(function(x) {
                    return x.className && typeof x.className === 'string';
                });
                if (candidates.length >= 1) {
                    for (var i = 0; i < candidates.length; i++) {
                        var viewClass = candidates[i].className;
                        if (viewClass === 'chat-row') continue;
                        if (self._lastView && self._lastView !== viewClass) {
                            for (var key in self._viewListeners) {
                                if (key.indexOf('_leave_') === 0) {
                                    var leaveViewClass = key.replace('_leave_', '');
                                    if (self._lastView === leaveViewClass || self._lastView.indexOf(leaveViewClass) !== -1) {
                                        var leaveListeners = self._viewListeners[key];
                                        for (var l = 0; l < leaveListeners.length; l++) {
                                            try {
                                                leaveListeners[l]();
                                            } catch (e) {}
                                        }
                                    }
                                }
                            }
                        }

                        self._lastView = viewClass;
                        for (var key in self._viewListeners) {
                            if (key.indexOf('_leave_') === 0) continue;
                            if (viewClass === key || viewClass.indexOf(key) !== -1) {
                                var listeners = self._viewListeners[key];
                                for (var j = 0; j < listeners.length; j++) {
                                    try {
                                        listeners[j](candidates[i], viewClass);
                                    } catch (e) {}
                                }
                            }
                        }
                    }
                }
            });

            observer.observe(currentView, {
                childList: true,
                subtree: true
            });
            self.log('View observer initialized');
        }).catch(function() {});
    }
};

window.Injector = Injector;
(function() {
    var toastContainer = null;

    function getContainer() {
        if (toastContainer && document.body.contains(toastContainer)) return toastContainer;
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = 'position:fixed;top:20px;right:20px;z-index:999999;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
        document.body.appendChild(toastContainer);
        return toastContainer;
    }

    function showToast(message, type, duration) {
        type = type || 'info';
        duration = duration || 4000;

        var container = getContainer();
        var toast = document.createElement('div');

        var bgColor = type === 'error' ? '#dc2626' : type === 'success' ? '#22c55e' : '#333';
        toast.style.cssText = 'background:' + bgColor + ';color:#fff;padding:12px 20px;border-radius:8px;font-size:14px;max-width:350px;box-shadow:0 4px 12px rgba(0,0,0,0.3);pointer-events:auto;opacity:0;transform:translateX(100%);transition:all 0.3s ease;';
        toast.textContent = message;

        container.appendChild(toast);
        setTimeout(function() {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 10);
        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(function() {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, duration);
    }
    window.showToast = showToast;
    window.alert = function(msg) {
        showToast(msg, 'info', 5000);
    };

    window.confirm = function(msg) {
        showToast(msg, 'info', 5000);
        return true;
    };

    window.prompt = function(msg, defaultVal) {
        showToast(msg, 'info', 5000);
        return defaultVal || null;
    };
})();
if (Injector.isGameFrame()) {
    Injector._initViewObserver();
    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === "'") {
            e.preventDefault();
            e.stopPropagation();
            window.parent.postMessage({
                type: 'toggleHeader'
            }, '*');
        }
    }, true);
}
if (Injector.isMainFrame()) {
    var saveAs = function(blob, filename) {
        var URL = window.URL || window.webkitURL;
        var url = URL.createObjectURL(blob);
        var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
        save_link.href = url;
        save_link.download = filename;

        var event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        save_link.dispatchEvent(event);

        setTimeout(function() {
            URL.revokeObjectURL(url);
        }, 60000);
    };

    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'haxball-save-replay') {
            var base64 = event.data.data;
            var filename = event.data.filename;
            var byteChars = atob(base64);
            var byteNumbers = new Array(byteChars.length);
            for (var i = 0; i < byteChars.length; i++) {
                byteNumbers[i] = byteChars.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            var blob = new Blob([byteArray], {
                type: 'application/octet-stream'
            });

            saveAs(blob, filename);
            var lang = window.__haxLang || 'pt';
            var msg = lang === 'es' ? 'Replay guardado en Descargas' : 'Replay salvo na pasta Downloads';
            var container = document.getElementById('toast-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'toast-container';
                container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:999999;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
                document.body.appendChild(container);
            }

            var toast = document.createElement('div');
            toast.style.cssText = 'background:var(--theme-bg-tertiary, #272727);color:var(--theme-text-primary, #fff);padding:12px 16px;border-radius:8px;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;gap:10px;border:1px solid var(--theme-border, #333);opacity:0;transform:translateX(100%);transition:all 0.3s ease;pointer-events:auto;';
            var icon = document.createElement('span');
            icon.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            icon.style.cssText = 'display:flex;align-items:center;flex-shrink:0;';

            var text = document.createElement('span');
            text.textContent = msg;

            toast.appendChild(icon);
            toast.appendChild(text);
            container.appendChild(toast);
            setTimeout(function() {
                toast.style.opacity = '1';
                toast.style.transform = 'translateX(0)';
            }, 10);
            setTimeout(function() {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(function() {
                    if (toast.parentNode) toast.parentNode.removeChild(toast);
                }, 300);
            }, 4000);
        }
    });
}