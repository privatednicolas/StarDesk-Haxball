self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'downloadFile') {
        (async function() {
            try {
                let dataUrl;
                if (request.base64) {
                    dataUrl = 'data:application/octet-stream;base64,' + request.base64;
                } else if (request.url) {
                    dataUrl = request.url;
                }
                if (dataUrl) {
                    await chrome.downloads.download({
                        url: dataUrl,
                        filename: request.filename,
                        saveAs: true
                    });
                    sendResponse({
                        success: true
                    });
                }
            } catch (e) {
                sendResponse({
                    success: false,
                    error: e.message
                });
            }
        })();
        return true;
    }
    return true;
});