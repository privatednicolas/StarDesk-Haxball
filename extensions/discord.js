(function() {
    'use strict';

    if (!Injector.isMainFrame()) return;

    var DISCORD_INVITE  = 'https://discord.gg/v3EgE8ZBe7';
    var UPDATE_INTERVAL = 5000;

    var intervalId = null;
    var startTime  = null;

    var state = {
        inGame:  false,
        scores:  { red: 0, blue: 0 },
        players: 0,
        room:    null
    };

    window.addEventListener('message', function(e) {
        if (!e.data || e.data.type !== 'hxd-discord-state') return;

        var wasInGame = state.inGame;
        state.inGame  = !!e.data.inGame;
        state.scores  = e.data.scores  || { red: 0, blue: 0 };
        state.players = e.data.players || 0;
        state.room    = e.data.room    || null;

        if (state.inGame !== wasInGame) {
            startTime = Math.floor(Date.now() / 1000);
        }

        sendPresence();
    });

    function buildPresence() {
        var buttons = [{ label: 'Join our Discord', url: DISCORD_INVITE }];

        if (!state.inGame) {
            return {
                details:        'In the menu',
                state:          'StarDesk \u2014 HaxBall Client',
                largeImageKey:  'haxball_logo',
                largeImageText: 'StarDesk',
                smallImageKey:  'playing',
                smallImageText: 'stardesk.app',
                buttons:        buttons,
                instance:       false
            };
        }

        var room      = state.room ? state.room.substring(0, 40) : 'HaxBall';
        var scoreStr  = '\uD83D\uDD34 ' + state.scores.red + '  \uD83D\uDD35 ' + state.scores.blue;
        var playerStr = state.players > 0 ? '  \u2022  ' + state.players + ' players' : '';

        return {
            details:        'Playing in: ' + room,
            state:          'Score: ' + scoreStr + playerStr,
            startTimestamp: startTime || Math.floor(Date.now() / 1000),
            largeImageKey:  'haxball_logo',
            largeImageText: 'StarDesk',
            smallImageKey:  'playing',
            smallImageText: state.players + ' players in room',
            buttons:        buttons,
            instance:       true
        };
    }

    function sendPresence() {
        if (window.__stardesk && window.__stardesk.setDiscordPresence) {
            window.__stardesk.setDiscordPresence(buildPresence());
        }
    }

    function start() {
        if (intervalId) return;
        sendPresence();
        intervalId = setInterval(sendPresence, UPDATE_INTERVAL);
    }

    var waitForApi = setInterval(function() {
        if (window.__stardesk && window.__stardesk.setDiscordPresence) {
            clearInterval(waitForApi);
            startTime = Math.floor(Date.now() / 1000);
            start();
        }
    }, 500);

    window.addEventListener('beforeunload', function() {
        if (intervalId) clearInterval(intervalId);
    });

    window.DiscordPresence = { send: sendPresence };
})();