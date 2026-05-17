'use strict';
(function() {
    function loadGameScript() {
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'http://127.0.0.1:5483/game-min.js', false);
            xhr.send();
            if (xhr.status === 200 && xhr.responseText) {
                var script = document.createElement('script');
                script.textContent = xhr.responseText;
                document.documentElement.appendChild(script);
                return true;
            }
        } catch (e) {}
        return false;
    }

    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'haxball-download-request') {
            var data = event.data.data;
            var filename = event.data.filename;
            var bytes = new Uint8Array(data);
            var binary = '';
            for (var i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            var base64 = btoa(binary);
            chrome.runtime.sendMessage({
                action: 'downloadFile',
                base64: base64,
                filename: filename
            });
        }
    });

    var gameLoaded = loadGameScript();

    if (!gameLoaded) {
        document.documentElement.innerHTML = '<html><head><meta charset="utf-8"><style>body{background:#141414;color:#fff;font-family:system-ui;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;flex-direction:column;gap:16px;}h2{margin:0;}p{color:#888;margin:0;}</style></head><body><h2>Failed to load HaxBall</h2><p>Could not connect to the local server.</p></body></html>';
    }
})();