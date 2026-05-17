(function() {
    'use strict';

    if (window !== window.top) return;

    const pad = (n) => (n < 10 ? '0' : '') + n;

    const SVG_CALENDAR = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
    const SVG_CLOCK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';

    function showOverlay(date, time, cb) {
        var old = document.getElementById('hxd-screenshot-overlay');
        if (old) old.remove();

        var el = document.createElement('div');
        el.id = 'hxd-screenshot-overlay';
        el.style.cssText = [
            'position:fixed',
            'bottom:20px',
            'right:20px',
            'background:rgba(18,18,18,0.92)',
            'color:#fff',
            'padding:10px 14px',
            'border-radius:7px',
            'font-family:"Space Grotesk",system-ui,sans-serif',
            'font-size:12px',
            'z-index:999999',
            'border:1px solid #333',
            'pointer-events:none',
            'box-shadow:0 4px 16px rgba(0,0,0,0.4)',
            'opacity:0',
            'transition:opacity 0.15s'
        ].join(';');

        el.innerHTML =
            '<div style="display:flex;align-items:center;gap:7px;margin-bottom:5px;color:#aaa">' +
            '<span style="display:inline-flex">' + SVG_CALENDAR + '</span>' +
            '<span>' + date + '</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:7px;color:#aaa">' +
            '<span style="display:inline-flex">' + SVG_CLOCK + '</span>' +
            '<span>' + time + '</span>' +
            '</div>';

        document.body.appendChild(el);

        requestAnimationFrame(function() {
            el.style.opacity = '1';
            setTimeout(cb, 80);
        });

        setTimeout(function() {
            el.style.opacity = '0';
            setTimeout(function() {
                el.remove();
            }, 200);
        }, 1800);
    }

    document.addEventListener('keydown', function(e) {
        if (e.key !== 'F9') return;
        e.preventDefault();

        var now = new Date();
        var date = pad(now.getDate()) + '/' + pad(now.getMonth() + 1) + '/' + now.getFullYear();
        var time = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());

        showOverlay(date, time, function() {
            window.postMessage({
                type: 'hxd-take-screenshot',
                date: date,
                time: time
            }, '*');
        });
    }, {
        passive: false
    });
})();