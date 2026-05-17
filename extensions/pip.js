(function() {
    'use strict';

    if (!Injector.isGameFrame()) return;

    var pipActive = false;
    var pipVideo = null;
    var pipStream = null;

    function getGameCanvas() {
        return document.querySelector('canvas');
    }

    function startPiP() {
        var canvas = getGameCanvas();
        if (!canvas) return;

        if (!document.pictureInPictureEnabled) return;

        if (!pipVideo) {
            pipVideo = document.createElement('video');
            pipVideo.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;';
            pipVideo.muted = true;
            pipVideo.autoplay = true;
            pipVideo.playsInline = true;
            document.body.appendChild(pipVideo);

            pipVideo.addEventListener('leavepictureinpicture', function() {
                pipActive = false;
                if (pipStream) {
                    pipStream.getTracks().forEach(function(t) { t.stop(); });
                    pipStream = null;
                    pipVideo.srcObject = null;
                }
            });
        }

        var fps = 24;
        try {
            var saved = localStorage.getItem('haxball_pip_fps');
            if (saved) fps = parseInt(saved) || 24;
        } catch(e) {}

        pipStream = canvas.captureStream(fps);
        pipVideo.srcObject = pipStream;

        pipVideo.play().then(function() {
            return pipVideo.requestPictureInPicture();
        }).then(function() {
            pipActive = true;
        }).catch(function(err) {
            if (pipStream) {
                pipStream.getTracks().forEach(function(t) { t.stop(); });
                pipStream = null;
                pipVideo.srcObject = null;
            }
        });
    }

    function stopPiP() {
        if (document.pictureInPictureElement) {
            document.exitPictureInPicture().catch(function() {});
        }
        if (pipStream) {
            pipStream.getTracks().forEach(function(t) { t.stop(); });
            pipStream = null;
        }
        if (pipVideo) {
            pipVideo.srcObject = null;
        }
        pipActive = false;
    }

    function togglePiP() {
        if (pipActive || document.pictureInPictureElement) {
            stopPiP();
        } else {
            startPiP();
        }
    }

    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            e.stopPropagation();
            togglePiP();
        }
    }, true);

    Injector.log('PiP loaded');
})();
