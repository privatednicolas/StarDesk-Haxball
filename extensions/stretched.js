(function() {
    if (Injector.isMainFrame()) return;

    var STORAGE_KEY = 'stretched_resolution';

    var RESOLUTIONS = [
        { label: 'Native', width: 0, height: 0 },
        { label: '800x600 (4:3)', width: 800, height: 600 },
        { label: '1024x768 (4:3)', width: 1024, height: 768 },
        { label: '1280x960 (4:3)', width: 1280, height: 960 },
        { label: '1440x1080 (4:3)', width: 1440, height: 1080 },
        { label: '1280x1024 (5:4)', width: 1280, height: 1024 },
        { label: '1440x900 (16:10)', width: 1400, height: 900 },
        { label: '1680x1050 (16:10)', width: 1680, height: 1050 },
        { label: '1920x1200 (16:10)', width: 1920, height: 1200 },
        { label: '1280x720 (16:9)', width: 1280, height: 720 },
        { label: '1600x900 (16:9)', width: 1600, height: 900 },
        { label: '1920x1080 (16:9)', width: 1920, height: 1080 }
    ];

    function getSavedResolution() {
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return { width: 0, height: 0 };
    }

    function saveResolution(width, height) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ width: width, height: height }));
    }

    function injectIntoVideoSection(videoSection) {
        if (videoSection.querySelector('#stretched-res-row')) return;

        var currentRes = getSavedResolution();

        var container = document.createElement('div');
        container.id = 'stretched-res-row';
        container.style.cssText = 'display:flex;align-items:center;padding:6px 0;';

        var label = document.createElement('span');
        label.style.cssText = 'flex:1;font-size:13px;';
        label.textContent = 'Stretch resolution';

        var select = document.createElement('select');
        select.id = 'stretched-res-select';
        select.style.cssText = 'margin-left:8px;padding:4px 8px;background:var(--theme-bg-secondary,#222);color:var(--theme-text-primary,#fff);border:1px solid var(--theme-border,#444);border-radius:4px;';

        RESOLUTIONS.forEach(function(res) {
            var option = document.createElement('option');
            option.value = res.width + 'x' + res.height;
            option.textContent = res.label;
            if (res.width === currentRes.width && res.height === currentRes.height) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        select.onchange = function() {
            var parts = select.value.split('x');
            saveResolution(parseInt(parts[0]) || 0, parseInt(parts[1]) || 0);
            window.dispatchEvent(new Event('resize'));
        };

        container.appendChild(label);
        container.appendChild(select);
        videoSection.insertBefore(container, videoSection.firstChild);
    }

    function onDialogReady(dialog) {
        var videoSection = dialog.querySelector('[data-hook="videosec"]');
        if (videoSection) {
            injectIntoVideoSection(videoSection);
            return;
        }
        var obs = new MutationObserver(function(_, self) {
            var vs = dialog.querySelector('[data-hook="videosec"]');
            if (vs) {
                self.disconnect();
                injectIntoVideoSection(vs);
            }
        });
        obs.observe(dialog, { childList: true, subtree: true });
    }

    var bodyObserver = new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
            var nodes = mutations[i].addedNodes;
            for (var j = 0; j < nodes.length; j++) {
                var node = nodes[j];
                if (node.nodeType !== 1) continue;
                if (node.classList && node.classList.contains('dialog')) {
                    var attrObs = new MutationObserver(function(muts, self) {
                        for (var m = 0; m < muts.length; m++) {
                            if (muts[m].attributeName === 'data-ready') {
                                self.disconnect();
                                onDialogReady(muts[m].target);
                                return;
                            }
                        }
                    });
                    attrObs.observe(node, { attributes: true });

                    if (node.getAttribute('data-ready') === '1') {
                        onDialogReady(node);
                    }
                }
            }
        }
    });

    Injector.waitForHead().then(function() {
        if (document.body) {
            bodyObserver.observe(document.body, { childList: true });
        }
    });
})();
