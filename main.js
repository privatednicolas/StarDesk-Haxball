const {
    app,
    BrowserWindow,
    session,
    shell,
    ipcMain,
    protocol,
    globalShortcut,
    clipboard
} = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');


const lock = app.requestSingleInstanceLock();
if (!lock) {
    app.quit();
}

let discordRPC = null;
let discordClient = null;
let discordReady = false;
const DISCORD_CLIENT_ID = '1474601231199633488';

function initDiscord() {
    try {
        discordRPC = require('discord-rpc');
        discordRPC.register(DISCORD_CLIENT_ID);
        discordClient = new discordRPC.Client({ transport: 'ipc' });
        discordClient.on('ready', function() {
            discordReady = true;
            startDiscordPolling();
            discordClient.setActivity({
                details: 'HaxBall Desktop',
                state: 'In the menu',
                largeImageKey: 'haxball_logo',
                largeImageText: 'StarDesk',
                instance: false
            }).catch(function() {});
        });
        discordClient.on('disconnected', function() {
            discordReady = false;
            discordClient = null;
            if (discordPollInterval) { clearInterval(discordPollInterval); discordPollInterval = null; }
            setTimeout(initDiscord, 15000);
        });
        discordClient.login({ clientId: DISCORD_CLIENT_ID }).catch(function(e) {
            setTimeout(initDiscord, 15000);
        });
    } catch(e) {
    }
}

app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('disable-frame-rate-limit');
app.commandLine.appendSwitch('disable-gpu-vsync');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-features', 'PrivateNetworkAccessSendPreflights,PrivateNetworkAccessRespectPreflightResults,BlockInsecurePrivateNetworkRequests');

const PORT = 5483;
let mainWindow = null;
let server = null;
let gameCode = null;
let currentZoomPercent = 100;

function loadGameCode() {
    var gamePath = path.join(__dirname, 'game.js');
    if (fs.existsSync(gamePath)) {
        try { return fs.readFileSync(gamePath, 'utf8'); } catch(e) { return null; }
    }
    return null;
}

function extractExtensions() {
    var srcPath = path.join(__dirname, 'extensions');
    if (!app.isPackaged) return srcPath;

    var tempPath = path.join(app.getPath('temp'), 'hxd_ext_clean');
    try {
        if (fs.existsSync(tempPath)) fs.rmSync(tempPath, { recursive: true, force: true });
        fs.mkdirSync(tempPath, { recursive: true });
        var files = fs.readdirSync(srcPath);
        for (var i = 0; i < files.length; i++) {
            var src = path.join(srcPath, files[i]);
            var dst = path.join(tempPath, files[i]);
            if (fs.statSync(src).isFile()) fs.copyFileSync(src, dst);
        }
        if (fs.existsSync(path.join(tempPath, 'manifest.json'))) return tempPath;
    } catch(e) {}
    return srcPath;
}

function showZoomIndicator(pct) {
    if (!mainWindow || !mainWindow.webContents) return;
    mainWindow.webContents.executeJavaScript(
        '(function(){' +
        '  var old=document.getElementById("hxd-zoom");if(old)old.remove();' +
        '  var d=document.createElement("div");d.id="hxd-zoom";' +
        '  d.textContent="Zoom: ' + pct + '%";' +
        '  d.style.cssText="position:fixed;bottom:20px;right:20px;color:#fff;padding:8px 16px;z-index:999999;font-family:system-ui,sans-serif;font-size:14px;pointer-events:none;text-shadow:0 2px 4px rgba(0,0,0,0.5);";' +
        '  document.body.appendChild(d);' +
        '  setTimeout(function(){d.style.opacity="0";d.style.transition="opacity 0.3s";setTimeout(function(){d.remove();},300);},2000);' +
        '})();'
    ).catch(function() {});
}

ipcMain.handle('open-external', async (event, url) => {
    if (url && typeof url === 'string') shell.openExternal(url);
    return { success: true };
});
ipcMain.handle('close-app', async () => { app.quit(); });

ipcMain.on('discord-presence', function(event, presence) {
    if (!discordReady || !discordClient || !presence) return;
    discordClient.setActivity(presence).catch(function() {});
});

var discordPollInterval = null;
var discordLastInGame   = false;
var discordStartTime    = null;
var discordSavedRoom    = null;
var DISCORD_INVITE      = 'https://discord.gg/v3EgE8ZBe7';

var GAME_STATE_SCRIPT = [
    '(function() {',
    '  function searchFrames(win) {',
    '    try {',
    '      var inGame = !!win.document.querySelector(".game-state-view") || !!win.document.querySelector("[data-hook=\'red-score\']");',
    '      if (inGame) {',
    '        var red  = win.document.querySelector("[data-hook=\'red-score\']");',
    '        var blue = win.document.querySelector("[data-hook=\'blue-score\']");',
    '        var roomEl = win.document.querySelector("[data-hook=\'room-name\']");',
    '        return { inGame:true, red:red?parseInt(red.textContent)||0:0, blue:blue?parseInt(blue.textContent)||0:0, room:roomEl?roomEl.textContent.trim():null };',
    '      }',
    '      for (var i=0;i<win.frames.length;i++){var r=searchFrames(win.frames[i]);if(r)return r;}',
    '    } catch(e) {}',
    '    return null;',
    '  }',
    '  return searchFrames(window) || {inGame:false,red:0,blue:0,room:null};',
    '})();'
].join('\n');

function updateDiscordFromMain() {
    if (!discordReady || !discordClient || !mainWindow || !mainWindow.webContents) return;
    mainWindow.webContents.executeJavaScript(GAME_STATE_SCRIPT).then(function(data) {
        if (!data) return;
        if (data.inGame !== discordLastInGame) {
            discordStartTime  = Math.floor(Date.now() / 1000);
            discordLastInGame = data.inGame;
            if (!data.inGame) discordSavedRoom = null;
        }
        if (data.inGame && data.room) discordSavedRoom = data.room;
        var buttons  = [{ label: 'Join our Discord', url: DISCORD_INVITE }];
        var presence;
        if (!data.inGame) {
            presence = { details:'In the menu', state:'HaxBall Client', largeImageKey:'haxball_logo', largeImageText:'StarDesk', buttons:buttons, instance:false };
        } else {
            var room = (discordSavedRoom || data.room || 'Unknown room').substring(0,40);
            presence = { details:'Playing in: '+room, state:'Score: \uD83D\uDD34 '+data.red+'  \uD83D\uDD35 '+data.blue, startTimestamp:discordStartTime||Math.floor(Date.now()/1000), largeImageKey:'haxball_logo', largeImageText:'StarDesk', buttons:buttons, instance:true };
        }
        discordClient.setActivity(presence).catch(function() {});
    }).catch(function() {});
}

function startDiscordPolling() {
    if (discordPollInterval) return;
    discordStartTime    = Math.floor(Date.now() / 1000);
    discordPollInterval = setInterval(updateDiscordFromMain, 5000);
    updateDiscordFromMain();
}

app.on('ready', function() {
    require('events').EventEmitter.defaultMaxListeners = 20;
    initDiscord();
    gameCode = loadGameCode();
    if (!gameCode) {
        var w = new BrowserWindow({ width: 500, height: 200 });
        w.loadURL('data:text/html,<h2 style="font-family:sans-serif;padding:20px;color:red">Error: game.js no encontrado.</h2>');
        return;
    }

    var extPath = extractExtensions();

    server = http.createServer(function(req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
        var url = req.url.split('?')[0];
        if (url === '/secure/game-script') {
            res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
            res.end(JSON.stringify({ script: gameCode })); return;
        }
        if (url === '/secure/extensions') {
            res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
            res.end(JSON.stringify({ scripts: {} })); return;
        }
        if (url === '/game-min.js') {
            res.writeHead(200, { 'Content-Type': 'application/javascript', 'Cache-Control': 'no-store' });
            res.end(gameCode); return;
        }
        if (url === '/cache/size') {
            session.defaultSession.getCacheSize().then(function(bytes) {
                res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
                res.end(JSON.stringify({ ok: true, bytes: bytes }));
            }).catch(function(e) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: e.message }));
            });
            return;
        }
        if (url === '/cache/clear') {
            session.defaultSession.clearCache().then(function() {
                return session.defaultSession.clearStorageData({
                    storages: ['appcache', 'shadercache', 'serviceworkers', 'cachestorage']
                });
            }).then(function() {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, success: true }));
            }).catch(function(e) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: e.message }));
            });
            return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
    });

    server.listen(PORT, '127.0.0.1', function() {
    });

    protocol.registerBufferProtocol('hxd', function(request, callback) {
        if (request.url === 'hxd://game-min.js') {
            if (!gameCode) { callback({ error: -2 }); return; }
            callback({ mimeType: 'application/javascript', data: Buffer.from(gameCode, 'utf8') });
        } else {
            callback({ error: -2 });
        }
    });

    session.defaultSession.webRequest.onBeforeRequest(function(details, callback) {
        var url = details.url;
        if (url.indexOf('127.0.0.1') !== -1 || url.indexOf('localhost') !== -1 || url.indexOf('hxd://') !== -1) {
            callback({}); return;
        }
        if (url.indexOf('game-min.js') !== -1) {
            callback({ redirectURL: 'hxd://game-min.js' });
        } else {
            callback({});
        }
    });

    var loadExt = (session.defaultSession.extensions && session.defaultSession.extensions.loadExtension)
        ? session.defaultSession.extensions.loadExtension.bind(session.defaultSession.extensions)
        : session.defaultSession.loadExtension.bind(session.defaultSession);

    loadExt(extPath, { allowFileAccess: true })
        .catch(function(err) {
            setTimeout(function() {
                loadExt(extPath, { allowFileAccess: true })
            }, 1000);
        });

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        title: 'HaxBall Desktop',
        icon: path.join(__dirname, 'icon.ico'),
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false,
            allowRunningInsecureContent: true,
            devTools: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.setMenu(null);
    mainWindow.webContents.on('context-menu', function(e) { e.preventDefault(); });
    mainWindow.webContents.setWindowOpenHandler(function(details) {
        shell.openExternal(details.url);
        return { action: 'deny' };
    });

    globalShortcut.register('CommandOrControl+Shift+I', function() {
        if (mainWindow) mainWindow.webContents.toggleDevTools();
    });

    mainWindow.webContents.on('before-input-event', function(e, input) {
        if (input.type !== 'keyDown') return;

        if (input.key === 'F11') {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
            return;
        }

        if (input.key === 'F9') {
            e.preventDefault();
            var now = new Date();
            var _p = function(n) { return (n < 10 ? '0' : '') + n; };
            var _date = _p(now.getDate()) + '/' + _p(now.getMonth() + 1) + '/' + now.getFullYear();
            var _h24 = now.getHours();
            var _ampm = _h24 >= 12 ? 'PM' : 'AM';
            var _h12 = _h24 % 12 || 12;
            var _time = _h12 + ':' + _p(now.getMinutes()) + ':' + _p(now.getSeconds()) + ' ' + _ampm;

            var jsShow = [
                '(function(){',
                '  var e=document.getElementById("hxd-ss");if(e)e.remove();',
                '  var d=document.createElement("div");',
                '  d.id="hxd-ss";',
                '  d.style.cssText="position:fixed;bottom:20px;right:20px;background:rgba(15,15,15,0.93);color:#fff;padding:10px 14px;border-radius:7px;font-family:system-ui,sans-serif;font-size:12px;line-height:1.6;z-index:2147483647;border:1px solid #444;pointer-events:none;box-shadow:0 4px 16px rgba(0,0,0,0.5);white-space:pre;";',
                '  d.textContent="' + _date + '  ' + _time + '";',
                '  document.documentElement.appendChild(d);',
                '  setTimeout(function(){d.style.transition="opacity 0.25s";d.style.opacity="0";setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},300);},1600);',
                '})();'
            ].join('');
            var jsRemove = '(function(){var e=document.getElementById("hxd-ss");if(e){e.style.transition="opacity 0.25s";e.style.opacity="0";setTimeout(function(){if(e.parentNode)e.parentNode.removeChild(e);},300);}})();';

            mainWindow.webContents.executeJavaScript(jsShow).then(function() {
                setTimeout(function() {
                    mainWindow.webContents.capturePage().then(function(img) {
                        clipboard.writeImage(img);
                        mainWindow.webContents.executeJavaScript(jsRemove).catch(function() {});
                    }).catch(function() {});
                }, 16);
            }).catch(function() {});
            return;
        }

        if (input.control && input.key === '0') {
            e.preventDefault();
            currentZoomPercent = 100;
            mainWindow.webContents.setZoomFactor(1.0);
            showZoomIndicator(100);
        }
        if (input.control && input.key === '+') {
            e.preventDefault();
            currentZoomPercent = Math.min(currentZoomPercent + 10, 300);
            mainWindow.webContents.setZoomFactor(currentZoomPercent / 100);
            showZoomIndicator(currentZoomPercent);
        }
        if (input.control && input.key === '-') {
            e.preventDefault();
            currentZoomPercent = Math.max(currentZoomPercent - 10, 10);
            mainWindow.webContents.setZoomFactor(currentZoomPercent / 100);
            showZoomIndicator(currentZoomPercent);
        }
    });

    mainWindow.once('ready-to-show', function() { mainWindow.show(); });
    setTimeout(function() {
        if (mainWindow && !mainWindow.isVisible()) mainWindow.show();
    }, 3000);

    mainWindow.loadURL('https://www.haxball.com/play');
    mainWindow.webContents.on('will-prevent-unload', function(e) { e.preventDefault(); });
    mainWindow.on('closed', function() { mainWindow = null; });

    app.on('second-instance', function() {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    startDiscordPolling();
});

app.on('window-all-closed', function() { app.quit(); });

app.on('will-quit', function() {
    if (discordPollInterval) clearInterval(discordPollInterval);
    if (discordClient) { try { Promise.resolve(discordClient.destroy()).catch(function(){}); } catch(e) {} }
    globalShortcut.unregisterAll();
    if (server) server.close();
});