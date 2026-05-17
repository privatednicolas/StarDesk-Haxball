(function() {
    if (!Injector.isGameFrame()) return;

    function setupLeaveObserver() {
        if (!document.body) {
            setTimeout(setupLeaveObserver, 100);
            return;
        }

        var opts = { childList: true, subtree: true };

        var observer = new MutationObserver(function(mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var added = mutations[i].addedNodes;
                for (var j = 0; j < added.length; j++) {
                    var node = added[j];
                    if (node.nodeType === 1 && node.classList && node.classList.contains('leave-room-view')) {
                        var leaveBtn = node.querySelector('[data-hook="leave"]');
                        if (leaveBtn) {
                            Injector.log('Auto-clicking leave button');
                            leaveBtn.click();
                        }
                    }
                }
            }
        });

        observer.observe(document.body, opts);
        Injector.log('Leave room observer setup');

        Injector.onView('game-state-view', function() {
            observer.disconnect();
        });
        Injector.onViewLeave('game-state-view', function() {
            observer.observe(document.body, opts);
        });
    }

    setupLeaveObserver();

    Injector.log('Leave room (no confirmation) loaded');
})();