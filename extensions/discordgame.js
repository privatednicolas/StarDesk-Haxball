(function() {
    'use strict';

    var loc = window.location.href;
    var isGame = !Injector.isMainFrame() && 
                 (loc.indexOf('game.html') !== -1 || 
                  loc.indexOf('html5.haxball.com') !== -1);

    if (Injector.isMainFrame()) {
        return;
    }

    var UPDATE_INTERVAL = 3000;
    var intervalId = null;
    var lastPayload = '';

    function getText(selector) {
        var el = document.querySelector(selector);
        return el ? el.textContent.trim() : null;
    }

    function getRoomName() {
        var selectors = [
            '[data-hook="room-name"]',
            '.room-link-view .name',
            '.bar .name',
            '.room-name',
            'h2',
            '.title'
        ];
        for (var i = 0; i < selectors.length; i++) {
            var el = document.querySelector(selectors[i]);
            if (el && el.textContent.trim()) return el.textContent.trim();
        }
        var title = document.title;
        if (title && title !== 'HaxBall' && title.length > 0) return title;
        return null;
    }

    function getPlayerCount() {
        var items = document.querySelectorAll('.player-list-item');
        return items ? items.length : 0;
    }

    function isInGame() {
        return !!document.querySelector('.game-state-view') ||
               !!document.querySelector('[data-hook="red-score"]');
    }

    function getScores() {
        return {
            red:  parseInt(getText('[data-hook="red-score"]'),  10) || 0,
            blue: parseInt(getText('[data-hook="blue-score"]'), 10) || 0
        };
    }

    function sendState() {
        var inGame  = isInGame();
        var scores  = getScores();
        var players = getPlayerCount();
        var room    = getRoomName();

        var payload = inGame + '|' + scores.red + '|' + scores.blue + '|' + players + '|' + room;
        if (payload === lastPayload) return;
        lastPayload = payload;

        window.parent.postMessage({
            type:    'hxd-discord-state',
            inGame:  inGame,
            scores:  scores,
            players: players,
            room:    room
        }, '*');
    }

    function start() {
        if (intervalId) return;
        sendState();
        intervalId = setInterval(sendState, UPDATE_INTERVAL);
    }

    if (document.body) {
        start();
    } else {
        document.addEventListener('DOMContentLoaded', start);
        setTimeout(start, 2000);
    }
})();