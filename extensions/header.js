(function() {
    if (!Injector.isMainFrame()) return;
    if (window.__headerInjected) return;
    window.__headerInjected = true;

    var LOGO_SVG = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 736 736" width="60" height="60"><path fill="#FBFBFB" opacity="5" stroke="none" d="M257.334839,303.443329 C258.518097,308.725067 259.200714,313.730743 260.838623,318.401428 C267.268402,336.736847 281.050323,344.906616 299.943329,340.451660 C328.753265,333.658295 357.464600,326.387939 386.030548,318.630585 C456.477417,299.500061 526.816528,279.972565 597.208435,260.639343 C598.965942,260.156647 600.834412,260.078156 602.651123,259.811157 C602.744995,260.220612 602.838806,260.630066 602.932617,261.039490 C595.412048,263.882355 587.857544,266.639069 580.376160,269.581635 C515.867432,294.954163 451.084808,319.663513 386.997345,346.060089 C356.471436,358.633209 326.989594,373.878143 297.575836,388.967407 C277.295807,399.371124 260.223846,414.078735 249.501190,434.785889 C241.561584,450.118591 237.373505,466.761932 234.052109,483.620758 C233.718048,485.316376 233.327896,487.000946 232.501419,488.578125 C231.666733,478.260925 231.475616,467.837738 229.799973,457.658997 C228.381592,449.043121 225.893021,440.457764 222.720047,432.309875 C217.728287,419.491425 207.473419,413.654663 193.890259,413.005737 C172.363800,411.977356 152.007828,417.442169 131.772186,423.752899 C129.733261,424.388794 127.611305,424.758484 126.728516,424.967499 C149.198044,411.762909 172.513611,398.101837 195.788528,384.371857 C218.992813,370.683533 233.445435,350.146759 241.966797,325.019867 C246.525681,311.577118 251.055191,298.124390 255.486755,285.005341 C256.060303,290.786926 256.666718,296.900146 257.334839,303.443329 Z"/></svg>';

    var HEADER_CSS = '\
        .header { display: none !important; }\
        #custom-header {\
            position: fixed; top: 0; left: 0; right: 0; height: 48px;\
            background: #141414; border-bottom: 1px solid #232323;\
            display: flex; align-items: center; justify-content: space-between;\
            padding: 0 20px; z-index: 99999; font-family: "Space Grotesk", system-ui, -apple-system, sans-serif;\
        }\
        #custom-header .header-left { flex: 1; display: flex; align-items: center; }\
        #custom-header .header-left svg .logo-fill { fill: #888; }\
        #custom-header .header-center { flex: 2; display: flex; justify-content: center; }\
        #custom-header .room-link-bar {\
            display: flex; background: #1a1a1a; border-radius: 6px;\
            overflow: hidden; width: 100%; max-width: 400px;\
        }\
        #custom-header #room-link-input {\
            flex: 1; background: transparent; border: none; padding: 8px 12px;\
            color: #fff; font-size: 13px; outline: none;\
            user-select: text !important; -webkit-user-select: text !important;\
        }\
        #custom-header #room-link-input::placeholder { color: #666; }\
        #custom-header #room-link-btn {\
            background: #272727; border: none; padding: 8px 12px;\
            color: #fff; cursor: pointer; display: flex; align-items: center;\
        }\
        #custom-header #room-link-btn:hover { background: #333; }\
        #custom-header .header-right { flex: 1; display: flex; justify-content: flex-end; gap: 8px; }\
        #custom-header #hide-header-btn {\
            background: transparent; border: none; color: #666; cursor: pointer; padding: 4px; display: flex;\
        }\
        #custom-header #hide-header-btn:hover { color: #fff; }\
        #logo-btn svg { pointer-events: none; }\
        #logo-btn { pointer-events: auto !important; }\
        #show-header-btn {\
            position: fixed; top: 8px; left: 8px; background: transparent; border: none;\
            color: rgba(255,255,255,0.3); cursor: pointer; padding: 6px; z-index: 99999; display: none;\
        }\
        #show-header-btn:hover { color: rgba(255,255,255,0.7); }\
        html, body { margin: 0 !important; padding: 0 !important; height: 100% !important; overflow: hidden !important; }\
        .view-wrapper, .game-view { margin-top: 0 !important; padding-top: 48px !important; box-sizing: border-box !important; height: 100% !important; }\
        iframe[src*="game.html"], iframe[src*="html5.haxball"] { position: fixed !important; top: 48px !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100% !important; height: calc(100vh - 48px) !important; border: none !important; }\
    ';

    Injector.waitForElement('body').then(function() {
        var noTranslate = document.createElement('meta');
        noTranslate.name = 'google';
        noTranslate.content = 'notranslate';
        document.head.appendChild(noTranslate);
        document.documentElement.classList.add('notranslate');
        document.documentElement.setAttribute('translate', 'no');
        var fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap';
        document.head.appendChild(fontLink);
        var iframeObserver = new MutationObserver(function(mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var addedNodes = mutations[i].addedNodes;
                for (var j = 0; j < addedNodes.length; j++) {
                    var node = addedNodes[j];
                    if (node.tagName === 'IFRAME') {
                        var headerVisible = document.getElementById('custom-header') && document.getElementById('custom-header').style.display !== 'none';
                        var top = headerVisible ? '48px' : '0';
                        var height = headerVisible ? 'calc(100vh - 48px)' : '100vh';
                        node.style.cssText = 'position: fixed !important; top: ' + top + ' !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100% !important; height: ' + height + ' !important; border: none !important;';
                    }
                }
            }
        });
        iframeObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        var oldHeader = document.querySelector('.header');
        if (oldHeader) oldHeader.style.display = 'none';
        if (document.getElementById('custom-header')) return;

        Injector.injectCSS('header-css', HEADER_CSS);

        var header = document.createElement('div');
        header.id = 'custom-header';
        header.innerHTML = '\
            <div class="header-left"><button id="logo-btn" style="background:transparent;border:none;cursor:pointer;padding:0;display:flex;align-items:center;">' + LOGO_SVG + '</button></div>\
            <div class="header-center">\
                <div class="room-link-bar">\
                    <input type="text" id="room-link-input" placeholder="Paste the room link here..." />\
                    <button id="room-link-btn">\
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>\
                    </button>\
                </div>\
            </div>\
            <div class="header-right">\
                <button id="hide-header-btn" title="Hide header">\
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg>\
                </button>\
            </div>\
        ';
        document.body.insertBefore(header, document.body.firstChild);

        var showBtn = document.createElement('button');
        showBtn.id = 'show-header-btn';
        showBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>';
        document.body.appendChild(showBtn);

        setupHeaderEvents(header, showBtn);

        Injector.log('Header created');
    }).catch(function(e) {
        Injector.log('Header error: ' + e.message);
    });

    function setupHeaderEvents(header, showBtn) {
        var codeRegex = /^[a-zA-Z0-9_-]{8,15}$/;
        var urlRegex = /^(https?:\/\/)?(www\.)?haxball\.com\/play\?c=([a-zA-Z0-9_-]{8,15})$/;

        function goToRoom() {
            var input = document.getElementById('room-link-input');
            var link = input.value.trim();
            if (!link) return;

            var roomCode = '';
            var urlMatch = link.match(urlRegex);

            if (urlMatch) {
                roomCode = urlMatch[3];
            } else if (codeRegex.test(link)) {
                roomCode = link;
            }

            if (roomCode) {
                window.history.pushState({}, '', '/play?c=' + roomCode);
                var iframe = document.querySelector('iframe[src*="game.html"], iframe[src*="html5.haxball"]');
                if (iframe && iframe.contentWindow && iframe.contentWindow.B) {
                    iframe.contentWindow.B.eg(roomCode);
                } else {
                    window.location.href = 'https://www.haxball.com/play?c=' + roomCode;
                }
            }
        }

        function updateLayout(headerVisible) {
            var top = headerVisible ? '48px' : '0';
            var height = headerVisible ? 'calc(100vh - 48px)' : '100vh';
            var padding = headerVisible ? '48px' : '0';

            var iframes = document.querySelectorAll('iframe[src*="game.html"], iframe[src*="html5.haxball"]');
            for (var i = 0; i < iframes.length; i++) {
                iframes[i].style.cssText = 'position: fixed !important; top: ' + top + ' !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100% !important; height: ' + height + ' !important; border: none !important;';
            }

            var viewWrapper = document.querySelector('.view-wrapper');
            if (viewWrapper) viewWrapper.style.paddingTop = padding;

            var gameView = document.querySelector('.game-view');
            if (gameView) gameView.style.paddingTop = padding;
        }

        function hideHeader() {
            header.style.display = 'none';
            showBtn.style.display = 'flex';
            updateLayout(false);
        }

        function showHeaderFn() {
            header.style.display = 'flex';
            showBtn.style.display = 'none';
            updateLayout(true);
        }

        var logoBtn = document.getElementById('logo-btn');
        logoBtn.onclick = function() {
            if (window.electronAPI) {
                window.electronAPI.openExternal('https://discord.gg/v3EgE8ZBe7');
            } else {
                window.open('https://discord.gg/v3EgE8ZBe7', '_blank');
            }
        };

        document.getElementById('room-link-btn').addEventListener('click', goToRoom);
        document.getElementById('room-link-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') goToRoom();
        });
        document.getElementById('hide-header-btn').addEventListener('click', hideHeader);
        showBtn.addEventListener('click', showHeaderFn);

        function handleToggleHeader() {
            if (header.style.display === 'none') {
                showHeaderFn();
            } else {
                hideHeader();
            }
        }

        document.addEventListener('keydown', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key === "'") {
                e.preventDefault();
                handleToggleHeader();
            }
        });
        window.addEventListener('message', function(e) {
            if (e.data && e.data.type === 'toggleHeader') {
                handleToggleHeader();
            }
        });
    }
})();