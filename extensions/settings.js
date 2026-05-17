(function() {
    if (Injector.isMainFrame()) return;

        function createCacheTab(doc, tabs, dialog) {
            if (tabs.querySelector('button[data-hook="cachebtn"]')) return;

            var cacheBtn = doc.createElement('button');
            cacheBtn.setAttribute('data-hook', 'cachebtn');
            cacheBtn.textContent = 'Cache';
            cacheBtn.style.display = 'none';
            tabs.appendChild(cacheBtn);

            var cacheSection = doc.createElement('section');
            cacheSection.className = 'cache-section section';
            cacheSection.setAttribute('data-hook', 'cache-section');
            cacheSection.style.display = 'none';

            var container = doc.createElement('div');
            container.style.cssText = 'display:flex;flex-direction:column;gap:12px;';

            var intro = doc.createElement('div');
            intro.style.cssText = 'color:var(--theme-text-muted);font-size:13px;font-weight:500;margin-bottom:4px;padding-bottom:8px;border-bottom:1px solid var(--theme-border);text-align:center;';
            intro.textContent = 'Manage the application cache to improve performance';
            container.appendChild(intro);

            var sizeCard = doc.createElement('div');
            sizeCard.style.cssText = 'padding:14px 16px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;display:flex;align-items:center;justify-content:space-between;';

            var sizeLeft = doc.createElement('div');
            sizeLeft.style.cssText = 'display:flex;flex-direction:column;gap:3px;';

            var sizeLabel = doc.createElement('div');
            sizeLabel.style.cssText = 'color:var(--theme-text-primary);font-size:12px;font-weight:500;';
            sizeLabel.textContent = 'Cache size';

            var sizeDesc = doc.createElement('div');
            sizeDesc.style.cssText = 'color:var(--theme-text-muted);font-size:11px;';
            sizeDesc.textContent = 'Temporary network files, images and cached scripts';

            sizeLeft.appendChild(sizeLabel);
            sizeLeft.appendChild(sizeDesc);

            var sizeBadge = doc.createElement('div');
            sizeBadge.style.cssText = 'color:var(--theme-text-primary);font-size:13px;font-weight:600;font-family:monospace;background:var(--theme-bg-tertiary,#1f1f1f);padding:4px 10px;border-radius:4px;border:1px solid var(--theme-border);min-width:70px;text-align:center;';
            sizeBadge.textContent = '...';

            sizeCard.appendChild(sizeLeft);
            sizeCard.appendChild(sizeBadge);
            container.appendChild(sizeCard);

            function formatBytes(bytes) {
                if (bytes < 1024) return bytes + ' B';
                if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
                return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
            }

            var CACHE_PORT = 5483;

            function refreshSize() {
                sizeBadge.textContent = '...';
                fetch('http://127.0.0.1:' + CACHE_PORT + '/cache/size')
                    .then(function(r) { return r.json(); })
                    .then(function(res) {
                        if (!res.ok) { sizeBadge.textContent = 'N/D'; return; }
                        sizeBadge.textContent = formatBytes(res.bytes || 0);
                        if (res.bytes > 200 * 1024 * 1024) {
                            sizeBadge.style.color = '#ef4444';
                        } else if (res.bytes > 50 * 1024 * 1024) {
                            sizeBadge.style.color = '#f59e0b';
                        } else {
                            sizeBadge.style.color = 'var(--theme-text-primary)';
                        }
                    })
                    .catch(function() { sizeBadge.textContent = 'N/D'; });
            }

            var infoCard = doc.createElement('div');
            infoCard.style.cssText = 'padding:12px 14px;background:rgba(59,130,246,0.07);border:1px solid rgba(59,130,246,0.2);border-radius:6px;display:flex;flex-direction:column;gap:6px;';

            var infoTitle = doc.createElement('div');
            infoTitle.style.cssText = 'color:#3b82f6;font-size:11px;font-weight:600;margin-bottom:2px;display:flex;align-items:center;gap:6px;';
            infoTitle.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> What gets cleared?';

            var infoSe = doc.createElement('div');
            infoSe.style.cssText = 'color:var(--theme-text-muted);font-size:11px;line-height:1.6;';
            infoSe.innerHTML = 'Network cache (images, scripts, HTTP responses)<br>Shader cache (GPU)<br>Temporary service workers';

            var infoNo = doc.createElement('div');
            infoNo.style.cssText = 'color:var(--theme-text-muted);font-size:11px;line-height:1.6;margin-top:4px;padding-top:6px;border-top:1px solid rgba(59,130,246,0.15);';
            infoNo.innerHTML = 'Does NOT clear: your settings, keybinds, accounts, extrapolation or any personal data';

            infoCard.appendChild(infoTitle);
            infoCard.appendChild(infoSe);
            infoCard.appendChild(infoNo);
            container.appendChild(infoCard);

            var btnRow = doc.createElement('div');
            btnRow.style.cssText = 'display:flex;gap:8px;';

            var clearBtn = doc.createElement('button');
            clearBtn.style.cssText = 'flex:1;padding:10px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-primary);font-size:12px;font-weight:600;cursor:pointer;transition:background 0.15s;display:flex;align-items:center;justify-content:center;gap:8px;';
            clearBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg> Clear cache';
            clearBtn.onmouseenter = function() { clearBtn.style.background = 'var(--theme-bg-hover)'; clearBtn.style.borderColor = 'var(--theme-border-light)'; };
            clearBtn.onmouseleave = function() { clearBtn.style.background = 'var(--theme-bg-secondary)'; clearBtn.style.borderColor = 'var(--theme-border)'; };

            var refreshBtn = doc.createElement('button');
            refreshBtn.style.cssText = 'padding:10px 14px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-muted);font-size:12px;cursor:pointer;transition:background 0.15s;';
            refreshBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>';
            refreshBtn.title = 'Refresh size';
            refreshBtn.onmouseenter = function() { refreshBtn.style.background = 'var(--theme-bg-hover)'; };
            refreshBtn.onmouseleave = function() { refreshBtn.style.background = 'var(--theme-bg-secondary)'; };

            var statusMsg = doc.createElement('div');
            statusMsg.style.cssText = 'font-size:11px;text-align:center;min-height:16px;color:var(--theme-text-muted);';

            clearBtn.onclick = function() {
                clearBtn.disabled = true;
                clearBtn.style.opacity = '0.6';
                statusMsg.style.color = 'var(--theme-text-muted)';
                statusMsg.textContent = 'Clearing...';
                fetch('http://127.0.0.1:' + CACHE_PORT + '/cache/clear')
                    .then(function(r) { return r.json(); })
                    .then(function(res) {
                        clearBtn.disabled = false;
                        clearBtn.style.opacity = '1';
                        if (res.ok && res.success) {
                            statusMsg.style.color = '#22c55e';
                            statusMsg.textContent = 'Cache cleared successfully';
                            refreshSize();
                            setTimeout(function() { statusMsg.textContent = ''; }, 4000);
                        } else {
                            statusMsg.style.color = '#ef4444';
                            statusMsg.textContent = 'Error: ' + (res.error || 'desconocido');
                        }
                    })
                    .catch(function(e) {
                        clearBtn.disabled = false;
                        clearBtn.style.opacity = '1';
                        statusMsg.style.color = '#ef4444';
                        statusMsg.textContent = 'Connection error';
                    });
            };

            refreshBtn.onclick = function() { refreshSize(); };

            btnRow.appendChild(clearBtn);
            btnRow.appendChild(refreshBtn);
            container.appendChild(btnRow);
            container.appendChild(statusMsg);

            cacheSection.appendChild(container);

            var dialogContent = dialog.querySelector('.section') || dialog;
            dialogContent.parentNode.insertBefore(cacheSection, dialogContent.nextSibling);

            cacheBtn.addEventListener('click', function() {
                var sections = dialog.querySelectorAll('.tabcontents > .section');
                for (var i = 0; i < sections.length; i++) sections[i].style.display = 'none';  
                ['perf-section','multiauth-section','comandos-section','keybinds-section'].forEach(function(h) {
                    var s = dialog.querySelector('[data-hook="' + h + '"]');
                    if (s) s.style.display = 'none';
                });
                cacheSection.style.display = 'block';
                var allTabs = tabs.querySelectorAll('button');
                for (var i = 0; i < allTabs.length; i++) allTabs[i].classList.remove('selected');
                cacheBtn.classList.add('selected');
                refreshSize();
            });

            var otherTabs = tabs.querySelectorAll('button:not([data-hook="cachebtn"])');
            for (var i = 0; i < otherTabs.length; i++) {
                otherTabs[i].addEventListener('click', function() {
                    cacheSection.style.display = 'none';
                });
            }

            return cacheBtn;
        }

    function modifySettingsDialog(doc) {
        var dialog = doc.querySelector('.dialog.settings-view');
        if (!dialog) return;

        if (doc.getElementById('settings-sidebar-panel')) return;
        var tooltip = doc.getElementById('settings-sidebar-tooltip');
        if (!tooltip) {
            tooltip = doc.createElement('div');
            tooltip.id = 'settings-sidebar-tooltip';
            tooltip.style.cssText = 'position:fixed;background:var(--theme-tooltip-bg);color:var(--theme-text-primary);padding:6px 10px;border-radius:6px;font-size:12px;pointer-events:none;opacity:0;transition:opacity 0.15s;z-index:10000;white-space:nowrap;border:1px solid var(--theme-tooltip-border);box-shadow:0 4px 16px rgba(0,0,0,0.3);';
            doc.body.appendChild(tooltip);
        }

        function showTooltip(el, text) {
            var rect = el.getBoundingClientRect();
            tooltip.textContent = text;
            tooltip.style.left = (rect.right + 8) + 'px';
            tooltip.style.top = (rect.top + rect.height / 2 - 12) + 'px';
            tooltip.style.opacity = '1';
        }

        function hideTooltip() {
            tooltip.style.opacity = '0';
        }

        function addTooltip(el, text) {
            if (!el) return;
            el.addEventListener('mouseenter', function() {
                showTooltip(el, text);
            });
            el.addEventListener('mouseleave', hideTooltip);
            el.addEventListener('click', hideTooltip);
        }
        var sidebar = doc.createElement('div');
        sidebar.id = 'settings-sidebar-panel';
        sidebar.style.cssText = 'position:absolute;left:-50px;top:5px;bottom:5px;width:50px;background:var(--theme-bg-primary);border:1px solid var(--theme-border);border-radius:8px 0 0 8px;display:flex;flex-direction:column;gap:8px;padding:10px 6px;box-sizing:border-box;z-index:-1;';

        sidebar.addEventListener('mouseleave', hideTooltip);

        var tabs = dialog.querySelector('.tabs');

        var tabIcons = {
            'soundbtn': {
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
                tooltip: 'Sound',
                order: 1
            },
            'videobtn': {
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
                tooltip: 'Video',
                order: 2
            },
            'inputbtn': {
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M6 16h12"/></svg>',
                tooltip: 'Controls',
                order: 3
            },
            'perfbtn': {
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
                tooltip: 'Performance',
                order: 4
            },
            'avatarbtn': {
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>',
                tooltip: 'Avatars',
                order: 5
            },
            'tokenbtn': {
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',
                tooltip: 'Host Token',
                order: 6
            },
            'multiauthbtn': {
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="4"/><path d="M9 13c-4 0-6 2-6 5v1h12v-1c0-3-2-5-6-5"/><path d="M16 11h6m-3-3v6"/></svg>',
                tooltip: 'Multi-Auth',
                order: 7
            },
            'miscbtn': {
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
                tooltip: 'Misc',
                order: 8
            },
            'comandosbtn': {
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
                tooltip: 'Commands',
                order: 9
            },
            'keybindsbtn': {
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/></svg>',
                tooltip: 'Shortcuts',
                order: 10
            },
            'cachebtn': {
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>',
                tooltip: 'Cache',
                order: 11
            }
        };

        var tabOrder = ['soundbtn', 'videobtn', 'inputbtn', 'perfbtn', 'avatarbtn', 'tokenbtn', 'multiauthbtn', 'miscbtn', 'comandosbtn', 'keybindsbtn', 'cachebtn'];

        function createPerfTab(doc, tabs) {
            if (tabs.querySelector('button[data-hook="perfbtn"]')) return;

            var perfBtn = doc.createElement('button');
            perfBtn.setAttribute('data-hook', 'perfbtn');
            perfBtn.textContent = 'Rendimiento';
            perfBtn.style.display = 'none';
            tabs.appendChild(perfBtn);

            var perfSection = doc.createElement('section');
            perfSection.className = 'perf-section section';
            perfSection.setAttribute('data-hook', 'perf-section');
            perfSection.style.display = 'none';

            var PERF_OPTIONS = [{
                    hook: 'tmisc-simplelines',
                    title: 'Simplified lines',
                    desc: 'Reduces field line thickness from 3px to 1px. Fewer pixels to draw.'
                },
                {
                    hook: 'tmisc-ultrasimplelines',
                    title: 'Curves as straight lines',
                    desc: 'Converts all curved lines to straight lines. Drawing straight lines is much faster.'
                },
                {
                    hook: 'tmisc-culling',
                    title: 'Viewport culling',
                    desc: 'Skips drawing objects outside the screen. On large maps, avoids rendering invisible elements.'
                },
                {
                    hook: 'tmisc-showavatars',
                    title: 'Disable avatars and colors',
                    desc: 'Removes custom avatars and uses standard team colors. Fewer textures.'
                },
                {
                    hook: 'tmisc-shownames',
                    title: 'Disable player names',
                    desc: 'Hides player names. Less text to render.'
                },
                {
                    hook: 'tmisc-simplefield',
                    title: 'Simplified field',
                    desc: 'Uses solid colors on the field instead of gradients. Simpler rendering.'
                },
                {
                    hook: 'tmisc-lowqualitycircles',
                    title: 'Low quality circles',
                    desc: 'Pre-renders circles. Faster but visually pixelated.'
                },
                {
                    hook: 'tmisc-showanimations',
                    title: 'Disable goal animations',
                    desc: 'Removes goal animations. Prevents momentary FPS drops.'
                },
                {
                    hook: 'tmisc-showindicator',
                    title: 'Disable player indicator',
                    desc: 'The circle showing your position. Saves some rendering.'
                },
                {
                    hook: 'tmisc-showchat',
                    title: 'Disable chat indicator',
                    desc: 'The bubble that appears when someone talks. Removes that extra rendering.'
                },
                {
                    hook: 'tmisc-highpriority',
                    title: 'High priority',
                    desc: 'Gives more system resources to the game. May affect other programs. Use with caution!',
                    warning: true
                }
            ];

            var container = doc.createElement('div');
            container.style.cssText = 'display:flex;flex-direction:column;gap:2px;max-height:calc(90vh - 160px);overflow-y:auto;';

            var header = doc.createElement('div');
            header.style.cssText = 'color:var(--theme-text-muted);font-size:11px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--theme-border);';
            header.style.cssText = 'color:var(--theme-text-muted);font-size:13px;font-weight:500;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid var(--theme-border);text-align:center;';
            header.innerHTML = 'Enable options to improve FPS';
            container.appendChild(header);

            PERF_OPTIONS.forEach(function(opt) {
                var row = doc.createElement('div');
                row.className = 'perf-option-row';
                row.style.cssText = 'display:flex;align-items:flex-start;gap:10px;padding:6px 8px;border-radius:6px;cursor:pointer;';
                row.setAttribute('data-perf-hook', opt.hook);

                row.onmouseenter = function() {
                    row.style.background = 'var(--theme-bg-hover)';
                };
                row.onmouseleave = function() {
                    row.style.background = '';
                };

                var checkbox = doc.createElement('div');
                checkbox.className = 'perf-checkbox';
                checkbox.style.cssText = 'width:18px;height:18px;border:2px solid var(--theme-border-light);border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;';
                checkbox.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="opacity:0;"><polyline points="20 6 9 17 4 12"/></svg>';

                var textDiv = doc.createElement('div');
                textDiv.style.cssText = 'flex:1;min-width:0;';

                var titleRow = doc.createElement('div');
                titleRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:2px;';

                var title = doc.createElement('span');
                title.style.cssText = 'color:var(--theme-text-primary);font-size:13px;font-weight:500;';
                title.textContent = opt.title;
                titleRow.appendChild(title);

                if (opt.warning) {
                    var warning = doc.createElement('span');
                    warning.style.cssText = 'color:#f59e0b;font-size:10px;font-weight:600;padding:2px 6px;background:rgba(245,158,11,0.15);border-radius:4px;';
                    warning.textContent = 'Caution';
                    titleRow.appendChild(warning);
                }

                textDiv.appendChild(titleRow);

                var desc = doc.createElement('div');
                desc.style.cssText = 'color:var(--theme-text-muted);font-size:11px;line-height:1.4;';
                desc.textContent = opt.desc;
                textDiv.appendChild(desc);

                row.appendChild(checkbox);
                row.appendChild(textDiv);

                (function(hookName) {
                    row.onclick = function() {
                        var miscSection = dialog.querySelector('[data-hook="miscsec"]');
                        if (miscSection) {
                            var originalToggle = miscSection.querySelector('[data-hook="' + hookName + '"]');
                            if (originalToggle) {
                                originalToggle.click();
                                setTimeout(updatePerfCheckboxes, 100);
                            }
                        }
                    };
                })(opt.hook);

                container.appendChild(row);
            });
            var exportImportSection = doc.createElement('div');
            exportImportSection.style.cssText = 'display:flex;gap:10px;margin-top:16px;padding-top:12px;border-top:1px solid var(--theme-border);';

            var PERF_STORAGE_KEYS = [
                'simple_lines', 'ultra_simple_lines', 'culling_enabled',
                'show_avatars', 'show_names', 'simple_field',
                'low_quality_circles', 'show_animations', 'show_indicator',
                'show_chat_indicator', 'high_priority',
                'canvas_boost_scale', 'input_boost_enabled',
                'fps_limit', 'resolution_scale', 'viewmode'
            ];

            function generatePerfCode() {
                var config = {};
                PERF_STORAGE_KEYS.forEach(function(key) {
                    var val = localStorage.getItem(key);
                    if (val !== null) config[key] = val;
                });
                return btoa(JSON.stringify(config)).replace(/=/g, '');
            }

            function applyPerfCode(code) {
                try {
                    while (code.length % 4 !== 0) code += '=';
                    var config = JSON.parse(atob(code));
                    PERF_STORAGE_KEYS.forEach(function(key) {
                        localStorage.removeItem(key);
                    });
                    for (var key in config) {
                        if (PERF_STORAGE_KEYS.indexOf(key) !== -1) {
                            localStorage.setItem(key, config[key]);
                        }
                    }
                    return true;
                } catch (e) {
                    return false;
                }
            }

            var exportBtn = doc.createElement('button');
            exportBtn.style.cssText = 'flex:1;padding:10px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-primary);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;';
            exportBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Export';
            exportBtn.onmouseenter = function() {
                exportBtn.style.background = 'var(--theme-bg-hover)';
            };
            exportBtn.onmouseleave = function() {
                exportBtn.style.background = 'var(--theme-bg-secondary)';
            };
            exportBtn.onclick = function() {
                var code = generatePerfCode();
                navigator.clipboard.writeText(code).then(function() {
                    var orig = exportBtn.innerHTML;
                    exportBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>Copied!';
                    exportBtn.style.borderColor = '#22c55e';
                    setTimeout(function() {
                        exportBtn.innerHTML = orig;
                        exportBtn.style.borderColor = '';
                    }, 2000);
                });
            };

            var importBtn = doc.createElement('button');
            importBtn.style.cssText = 'flex:1;padding:10px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-primary);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;';
            importBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Import';
            importBtn.onmouseenter = function() {
                importBtn.style.background = 'var(--theme-bg-hover)';
            };
            importBtn.onmouseleave = function() {
                importBtn.style.background = 'var(--theme-bg-secondary)';
            };
            importBtn.onclick = function() {
                var orig = importBtn.innerHTML;
                navigator.clipboard.readText().then(function(code) {
                    code = code.trim();
                    if (!code) {
                        importBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Clipboard empty';
                        importBtn.style.borderColor = '#dc2626';
                        setTimeout(function() {
                            importBtn.innerHTML = orig;
                            importBtn.style.borderColor = '';
                        }, 2000);
                        return;
                    }
                    if (applyPerfCode(code)) {
                        importBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>Applied! Reload';
                        importBtn.style.borderColor = '#22c55e';
                        setTimeout(function() {
                            importBtn.innerHTML = orig;
                            importBtn.style.borderColor = '';
                        }, 3000);
                    } else {
                        importBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Invalid code';
                        importBtn.style.borderColor = '#dc2626';
                        setTimeout(function() {
                            importBtn.innerHTML = orig;
                            importBtn.style.borderColor = '';
                        }, 2000);
                    }
                }).catch(function() {
                    importBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>No permission';
                    importBtn.style.borderColor = '#dc2626';
                    setTimeout(function() {
                        importBtn.innerHTML = orig;
                        importBtn.style.borderColor = '';
                    }, 2000);
                });
            };

            exportImportSection.appendChild(exportBtn);
            exportImportSection.appendChild(importBtn);
            container.appendChild(exportImportSection);

            var exportImportTip = doc.createElement('div');
            exportImportTip.style.cssText = 'color:var(--theme-text-muted);font-size:10px;margin-top:6px;text-align:center;';
            exportImportTip.textContent = 'Share your performance settings with friends!';
            container.appendChild(exportImportTip);

            perfSection.appendChild(container);

            function updatePerfCheckboxes() {
                var miscSection = dialog.querySelector('[data-hook="miscsec"]');
                if (!miscSection) return;

                PERF_OPTIONS.forEach(function(opt) {
                    var perfRow = perfSection.querySelector('[data-perf-hook="' + opt.hook + '"]');
                    if (!perfRow) return;
                    var originalToggle = miscSection.querySelector('[data-hook="' + opt.hook + '"]');
                    if (!originalToggle) return;
                    var perfCheckbox = perfRow.querySelector('.perf-checkbox');
                    if (!perfCheckbox) return;
                    var svg = perfCheckbox.querySelector('svg');
                    if (!svg) return;

                    var icons = originalToggle.getElementsByTagName('i');
                    var isToggleActive = false;
                    for (var i = 0; i < icons.length; i++) {
                        if (icons[i].classList.contains('icon-ok')) {
                            isToggleActive = true;
                            break;
                        }
                    }

                    var isInverted = ['tmisc-showavatars', 'tmisc-shownames', 'tmisc-showanimations', 'tmisc-showindicator', 'tmisc-showchat'].indexOf(opt.hook) !== -1;
                    var isActive = isInverted ? !isToggleActive : isToggleActive;

                    if (isActive) {
                        perfCheckbox.style.background = '#22c55e';
                        perfCheckbox.style.borderColor = '#22c55e';
                        svg.style.opacity = '1';
                        svg.style.stroke = '#fff';
                    } else {
                        perfCheckbox.style.background = '';
                        perfCheckbox.style.borderColor = '';
                        svg.style.opacity = '0';
                    }
                });
            }

            var dialogContent = dialog.querySelector('.section') || dialog;
            dialogContent.parentNode.insertBefore(perfSection, dialogContent.nextSibling);

            perfBtn.addEventListener('click', function() {
                var sections = dialog.querySelectorAll('.tabcontents > .section');
                for (var i = 0; i < sections.length; i++) {
                    sections[i].style.display = 'none';
                }
                var multiAuthSection = dialog.querySelector('[data-hook="multiauth-section"]');
                if (multiAuthSection) multiAuthSection.style.display = 'none';

                perfSection.style.display = 'block';
                updatePerfCheckboxes();

                var allTabs = tabs.querySelectorAll('button');
                for (var i = 0; i < allTabs.length; i++) {
                    allTabs[i].classList.remove('selected');
                }
                perfBtn.classList.add('selected');
            });

            var originalTabs = tabs.querySelectorAll('button:not([data-hook="perfbtn"])');
            for (var i = 0; i < originalTabs.length; i++) {
                originalTabs[i].addEventListener('click', function() {
                    perfSection.style.display = 'none';
                });
            }

            return perfBtn;
        }

        function createMultiAuthTab(doc, tabs) {
            if (tabs.querySelector('button[data-hook="multiauthbtn"]')) return;

            var multiAuthBtn = doc.createElement('button');
            multiAuthBtn.setAttribute('data-hook', 'multiauthbtn');
            multiAuthBtn.textContent = 'Multi-Auth';
            multiAuthBtn.style.display = 'none';
            tabs.appendChild(multiAuthBtn);

            var multiAuthSection = doc.createElement('section');
            multiAuthSection.className = 'multiauth-section section';
            multiAuthSection.setAttribute('data-hook', 'multiauth-section');
            multiAuthSection.style.display = 'none';

            var MAX_AUTHS = 5;
            var STORAGE_KEY = 'haxdesk_multi_auths';
            var CURRENT_AUTH_KEY = 'player_auth_key';

            function getStoredAuths() {
                try {
                    var data = localStorage.getItem(STORAGE_KEY);
                    return data ? JSON.parse(data) : [];
                } catch (e) {
                    return [];
                }
            }

            function saveAuths(auths) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(auths));
            }

            function getCurrentAuth() {
                return localStorage.getItem(CURRENT_AUTH_KEY) || '';
            }

            function setCurrentAuth(authKey) {
                if (authKey) localStorage.setItem(CURRENT_AUTH_KEY, authKey);
            }

            function truncateAuth(auth) {
                if (!auth || auth.length < 20) return auth || '';
                return auth.substring(0, 8) + '...' + auth.substring(auth.length - 8);
            }

            function isValidAuth(auth) {
                if (!auth || typeof auth !== 'string') return false;
                var parts = auth.split('.');
                return parts.length === 4 && parts[0].length > 0;
            }

            var container = doc.createElement('div');
            container.style.cssText = 'display:flex;flex-direction:column;gap:12px;';

            var header = doc.createElement('div');
            header.style.cssText = 'color:var(--theme-text-muted);font-size:11px;margin-bottom:4px;padding-bottom:8px;border-bottom:1px solid var(--theme-border);';

            var currentAuth = getCurrentAuth();
            var auths = getStoredAuths();
            var currentAuthObj = auths.find(function(a) {
                return a.key === currentAuth;
            });
            var currentName = currentAuthObj ? currentAuthObj.name : '';

            if (currentAuth) {
                header.innerHTML = 'Current auth: <span style="color:var(--theme-text-primary);font-family:monospace;">' + truncateAuth(currentAuth) + '</span>' + (currentName ? ' (' + currentName + ')' : '');
            } else {
                header.innerHTML = 'No active auth. Maximum 5 auths.';
            }
            container.appendChild(header);

            function updateHeader() {
                var current = getCurrentAuth();
                var authsList = getStoredAuths();
                var found = authsList.find(function(a) {
                    return a.key === current;
                });
                var name = found ? found.name : '';
                if (current) {
                    header.innerHTML = 'Current auth: <span style="color:var(--theme-text-primary);font-family:monospace;">' + truncateAuth(current) + '</span>' + (name ? ' (' + name + ')' : '');
                } else {
                    header.innerHTML = 'No active auth. Maximum 5 auths.';
                }
            }

            var listContainer = doc.createElement('div');
            listContainer.style.cssText = 'display:flex;flex-direction:column;gap:6px;max-height:200px;overflow-y:auto;';

            function renderAuthList() {
                listContainer.innerHTML = '';
                var auths = getStoredAuths();
                var currentAuth = getCurrentAuth();

                if (auths.length === 0) {
                    var emptyMsg = doc.createElement('div');
                    emptyMsg.style.cssText = 'color:var(--theme-text-muted);font-size:12px;text-align:center;padding:20px;';
                    emptyMsg.textContent = 'No saved auths. Add one below.';
                    listContainer.appendChild(emptyMsg);
                    return;
                }

                auths.forEach(function(authObj, index) {
                    var row = doc.createElement('div');
                    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:10px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;';

                    var isActive = authObj.key === currentAuth;
                    if (isActive) {
                        row.style.borderColor = '#22c55e';
                        row.style.background = 'rgba(34, 197, 94, 0.1)';
                    }

                    var indicator = doc.createElement('div');
                    indicator.style.cssText = 'width:8px;height:8px;border-radius:50%;flex-shrink:0;' + (isActive ? 'background:#22c55e;' : 'background:var(--theme-border);');
                    row.appendChild(indicator);

                    var info = doc.createElement('div');
                    info.style.cssText = 'flex:1;min-width:0;';

                    var name = doc.createElement('div');
                    name.style.cssText = 'color:var(--theme-text-primary);font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
                    name.textContent = authObj.name || ('Auth ' + (index + 1));
                    info.appendChild(name);

                    var keyPreview = doc.createElement('div');
                    keyPreview.style.cssText = 'color:var(--theme-text-muted);font-size:10px;font-family:monospace;';
                    keyPreview.textContent = truncateAuth(authObj.key);
                    info.appendChild(keyPreview);

                    row.appendChild(info);

                    if (!isActive) {
                        var useBtn = doc.createElement('button');
                        useBtn.style.cssText = 'padding:6px 12px;background:#3b82f6;border:none;border-radius:4px;color:#fff;font-size:11px;cursor:pointer;';
                        useBtn.textContent = 'Use';
                        useBtn.onmouseenter = function() {
                            useBtn.style.background = '#2563eb';
                        };
                        useBtn.onmouseleave = function() {
                            useBtn.style.background = '#3b82f6';
                        };
                        useBtn.onclick = function() {
                            setCurrentAuth(authObj.key);
                            updateHeader();
                            renderAuthList();
                            if (window.showToast) window.showToast('Auth changed! Restart the app to apply.', 'success');
                        };
                        row.appendChild(useBtn);
                    }

                    var removeBtn = doc.createElement('button');
                    removeBtn.style.cssText = 'padding:6px 8px;background:transparent;border:1px solid var(--theme-border);border-radius:4px;color:var(--theme-text-muted);font-size:11px;cursor:pointer;';
                    removeBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
                    removeBtn.onmouseenter = function() {
                        removeBtn.style.borderColor = '#dc2626';
                        removeBtn.style.color = '#dc2626';
                    };
                    removeBtn.onmouseleave = function() {
                        removeBtn.style.borderColor = '';
                        removeBtn.style.color = '';
                    };
                    removeBtn.onclick = function() {
                        var newAuths = auths.filter(function(_, i) {
                            return i !== index;
                        });
                        saveAuths(newAuths);
                        renderAuthList();
                        if (window.showToast) window.showToast('Auth deleted', 'info');
                    };
                    row.appendChild(removeBtn);

                    listContainer.appendChild(row);
                });
            }

            container.appendChild(listContainer);

            var addSection = doc.createElement('div');
            addSection.style.cssText = 'margin-top:12px;padding-top:12px;border-top:1px solid var(--theme-border);';

            var addLabel = doc.createElement('div');
            addLabel.style.cssText = 'color:var(--theme-text-primary);font-size:12px;font-weight:500;margin-bottom:8px;';
            addLabel.textContent = 'Add New Auth';
            addSection.appendChild(addLabel);

            var nameInput = doc.createElement('input');
            nameInput.type = 'text';
            nameInput.placeholder = 'Name (optional)';
            nameInput.style.cssText = 'width:100%;padding:8px 12px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-primary);font-size:12px;margin-bottom:8px;box-sizing:border-box;';
            addSection.appendChild(nameInput);

            var authInput = doc.createElement('input');
            authInput.type = 'text';
            authInput.placeholder = 'Auth Key (e.g.: idkey.xxx.xxx.xxx)';
            authInput.style.cssText = 'width:100%;padding:8px 12px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-primary);font-size:12px;margin-bottom:8px;box-sizing:border-box;font-family:monospace;';
            addSection.appendChild(authInput);

            var btnRow = doc.createElement('div');
            btnRow.style.cssText = 'display:flex;gap:8px;';

            var addBtn = doc.createElement('button');
            addBtn.style.cssText = 'flex:1;padding:10px;background:#22c55e;border:none;border-radius:6px;color:#fff;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;';
            addBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add';
            addBtn.onmouseenter = function() {
                addBtn.style.background = '#16a34a';
            };
            addBtn.onmouseleave = function() {
                addBtn.style.background = '#22c55e';
            };
            addBtn.onclick = function() {
                var authKey = authInput.value.trim();
                var authName = nameInput.value.trim();

                if (!authKey) {
                    if (window.showToast) window.showToast('Enter an auth key', 'error');
                    return;
                }
                if (!isValidAuth(authKey)) {
                    if (window.showToast) window.showToast('Invalid format. Use: idkey.xxx.xxx.xxx', 'error');
                    return;
                }

                var auths = getStoredAuths();
                if (auths.some(function(a) {
                        return a.key === authKey;
                    })) {
                    if (window.showToast) window.showToast('This auth is already saved', 'error');
                    return;
                }
                if (auths.length >= MAX_AUTHS) {
                    if (window.showToast) window.showToast('Limit of ' + MAX_AUTHS + ' auths reached', 'error');
                    return;
                }

                auths.push({
                    name: authName || '',
                    key: authKey
                });
                saveAuths(auths);
                authInput.value = '';
                nameInput.value = '';
                renderAuthList();
                if (window.showToast) window.showToast('Auth added!', 'success');
            };
            btnRow.appendChild(addBtn);

            var saveCurrentBtn = doc.createElement('button');
            saveCurrentBtn.style.cssText = 'padding:10px 16px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-primary);font-size:12px;cursor:pointer;';
            saveCurrentBtn.textContent = 'Save Current';
            saveCurrentBtn.onmouseenter = function() {
                saveCurrentBtn.style.background = 'var(--theme-bg-hover)';
            };
            saveCurrentBtn.onmouseleave = function() {
                saveCurrentBtn.style.background = 'var(--theme-bg-secondary)';
            };
            saveCurrentBtn.onclick = function() {
                var currentAuth = getCurrentAuth();
                if (!currentAuth) {
                    if (window.showToast) window.showToast('No current auth to save', 'error');
                    return;
                }

                var auths = getStoredAuths();
                if (auths.some(function(a) {
                        return a.key === currentAuth;
                    })) {
                    if (window.showToast) window.showToast('Current auth is already saved', 'info');
                    return;
                }
                if (auths.length >= MAX_AUTHS) {
                    if (window.showToast) window.showToast('Limit of ' + MAX_AUTHS + ' auths reached', 'error');
                    return;
                }

                var authName = nameInput.value.trim() || ('Auth ' + (auths.length + 1));
                auths.push({
                    name: authName,
                    key: currentAuth
                });
                saveAuths(auths);
                nameInput.value = '';
                renderAuthList();
                if (window.showToast) window.showToast('Current auth saved!', 'success');
            };
            btnRow.appendChild(saveCurrentBtn);

            addSection.appendChild(btnRow);
            container.appendChild(addSection);

            var tip = doc.createElement('div');
            tip.style.cssText = 'color:var(--theme-text-muted);font-size:10px;margin-top:12px;padding:8px;background:var(--theme-bg-secondary);border-radius:6px;';
            tip.textContent = 'After changing auth, restart the app to apply.';
            container.appendChild(tip);

            multiAuthSection.appendChild(container);
            renderAuthList();

            var dialogContent = dialog.querySelector('.section') || dialog;
            dialogContent.parentNode.insertBefore(multiAuthSection, dialogContent.nextSibling);

            multiAuthBtn.addEventListener('click', function() {
                var sections = dialog.querySelectorAll('.tabcontents > .section');
                for (var i = 0; i < sections.length; i++) {
                    sections[i].style.display = 'none';
                }
                var perfSection = dialog.querySelector('[data-hook="perf-section"]');
                if (perfSection) perfSection.style.display = 'none';

                multiAuthSection.style.display = 'block';
                updateHeader();
                renderAuthList();

                var allTabs = tabs.querySelectorAll('button');
                for (var i = 0; i < allTabs.length; i++) {
                    allTabs[i].classList.remove('selected');
                }
                multiAuthBtn.classList.add('selected');
            });

            var originalTabs = tabs.querySelectorAll('button:not([data-hook="multiauthbtn"])');
            for (var i = 0; i < originalTabs.length; i++) {
                originalTabs[i].addEventListener('click', function() {
                    multiAuthSection.style.display = 'none';
                });
            }

            return multiAuthBtn;
        }

        function createComandosTab(doc, tabs) {
            if (tabs.querySelector('button[data-hook="comandosbtn"]')) return;

            var comandosBtn = doc.createElement('button');
            comandosBtn.setAttribute('data-hook', 'comandosbtn');
            comandosBtn.textContent = 'Comandos';
            comandosBtn.style.display = 'none';
            tabs.appendChild(comandosBtn);

            var comandosSection = doc.createElement('section');
            comandosSection.className = 'comandos-section section';
            comandosSection.setAttribute('data-hook', 'comandos-section');
            comandosSection.style.display = 'none';

            var COMANDOS = [{
                    cmd: '/av ~ /avatar <text>',
                    desc: 'Changes your player avatar (max 2 characters or 1 emoji)'
                },
                {
                    cmd: 'Discord Rich Presence (RPC)',
                    desc: 'Automatically displays your current game status on Discord DESKTOP — room name, score, time elapsed, etc. Not supported on Discord NAVIGATOR'
                },
                {
                    cmd: '/clear_avatar',
                    desc: 'Removes your custom avatar, showing your player number'
                },
                {
                    cmd: 'Ctrl + P',
                    desc: 'Opens a floating Picture-in-Picture window of the game, always visible above other windows. Useful for watching game while using other apps'
                },
                {
                    cmd: '/gif <emoji1> <emoji2>',
                    desc: 'Creates an animated avatar alternating between two emojis'
                },
                {
                    cmd: '/ungif',
                    desc: 'Removes the animated avatar'
                },
                {
                    cmd: 'F9',
                    desc: 'Takes a screenshot with the exact date and time'
                },
                {
                    cmd: 'F10',
                    desc: 'Toggles Stream Mode: hides all UI and shows only the field (ideal for streaming or focus)'
                },
                {
                    cmd: 'F11',
                    desc: 'Toggles fullscreen'
                },
                {
                    cmd: '/ex ~ /extrapolation <ms>',
                    desc: 'Adjusts game extrapolation to compensate for input lag'
                },
                {
                    cmd: '/handicap <ms>',
                    desc: 'Adds artificial lag to balance matches against players with higher ping'
                },
                {
                    cmd: '/colors <team angle textColor c1 c2 c3>',
                    desc: 'Changes a team color (red/blue) in hexadecimal. Admins only'
                },
                {
                    cmd: '/colors <team> clear',
                    desc: 'Restores the default team colors. Admins only'
                },
                {
                    cmd: '/checksum',
                    desc: 'Gets the current stadium checksum to verify its integrity'
                },
                {
                    cmd: '/store',
                    desc: 'Saves the current stadium to your custom stadiums list'
                },
                {
                    cmd: '/set_password <password>',
                    desc: 'Sets a password for the room. Host only'
                },
                {
                    cmd: '/clear_password',
                    desc: 'Removes the room password. Host only'
                },
                {
                    cmd: '/recaptcha on/off',
                    desc: 'Enables or disables reCAPTCHA to join. Host only'
                },
                {
                    cmd: '/clear_bans',
                    desc: 'Clears the list of banned players. Host only'
                },
                {
                    cmd: '/kick_ratelimit <min rate burst>',
                    desc: 'Configures the kick rate limit. Admins only. e.g.: /kick_ratelimit 2 15 3'
                }
            ];

            var container = doc.createElement('div');
            container.style.cssText = 'display:flex;flex-direction:column;gap:8px;';

            var intro = doc.createElement('div');
            intro.style.cssText = 'color:var(--theme-text-muted);font-size:13px;font-weight:500;margin-bottom:4px;padding-bottom:8px;border-bottom:1px solid var(--theme-border);text-align:center;';
            intro.textContent = 'List of commands and features available in the game';
            container.appendChild(intro);

            COMANDOS.forEach(function(item) {
                var card = doc.createElement('div');
                card.style.cssText = 'padding:10px 12px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;cursor:default;';
                card.onmouseenter = function() {
                    card.style.background = 'var(--theme-bg-hover)';
                    card.style.borderColor = 'var(--theme-border-light)';
                };
                card.onmouseleave = function() {
                    card.style.background = 'var(--theme-bg-secondary)';
                    card.style.borderColor = 'var(--theme-border)';
                };

                var cmdRow = doc.createElement('div');
                cmdRow.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:4px;';

                var icon = doc.createElement('span');
                icon.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;opacity:0.5;"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>';
                cmdRow.appendChild(icon);

                var code = doc.createElement('code');
                code.style.cssText = 'color:var(--theme-text-primary);font-size:11px;font-family:monospace;background:var(--theme-bg-tertiary, #1f1f1f);padding:2px 6px;border-radius:3px;font-weight:500;';
                code.textContent = item.cmd;
                cmdRow.appendChild(code);

                var descDiv = doc.createElement('div');
                descDiv.style.cssText = 'color:var(--theme-text-muted);font-size:11px;line-height:1.4;padding-left:18px;';
                descDiv.textContent = item.desc;

                card.appendChild(cmdRow);
                card.appendChild(descDiv);
                container.appendChild(card);
            });

            var note = doc.createElement('div');
            note.style.cssText = 'margin-top:4px;padding:10px 12px;background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.25);border-radius:6px;display:flex;gap:8px;align-items:flex-start;';
            note.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" style="flex-shrink:0;margin-top:1px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg><span style="color:var(--theme-text-muted);font-size:11px;line-height:1.4;">Most are typed in the game chat. Some require admin or host privileges.</span>';
            container.appendChild(note);

            comandosSection.appendChild(container);

            var dialogContent = dialog.querySelector('.section') || dialog;
            dialogContent.parentNode.insertBefore(comandosSection, dialogContent.nextSibling);

            comandosBtn.addEventListener('click', function() {
                var sections = dialog.querySelectorAll('.tabcontents > .section');
                for (var i = 0; i < sections.length; i++) {
                    sections[i].style.display = 'none';
                }
                var perfSec = dialog.querySelector('[data-hook="perf-section"]');
                if (perfSec) perfSec.style.display = 'none';
                var multiSec = dialog.querySelector('[data-hook="multiauth-section"]');
                if (multiSec) multiSec.style.display = 'none';

                comandosSection.style.display = 'block';
                comandosSection.style.maxHeight = 'calc(90vh - 160px)';
                comandosSection.style.overflowY = 'auto';

                var allTabs = tabs.querySelectorAll('button');
                for (var i = 0; i < allTabs.length; i++) {
                    allTabs[i].classList.remove('selected');
                }
                comandosBtn.classList.add('selected');
            });

            var originalTabs = tabs.querySelectorAll('button:not([data-hook="comandosbtn"])');
            for (var i = 0; i < originalTabs.length; i++) {
                originalTabs[i].addEventListener('click', function() {
                    comandosSection.style.display = 'none';
                    comandosSection.style.maxHeight = '';
                    comandosSection.style.overflowY = '';
                });
            }

            return comandosBtn;
        }

        function createKeybindsTab(doc, tabs) {
            if (tabs.querySelector('button[data-hook="keybindsbtn"]')) return;

            var EXTRAPOLATION_KEYS_STORAGE = 'haxball_extrapolation_keys';
            var CAMERA_KEYS_STORAGE = 'haxball_camera_keys';

            var defaultExtrapolationKeys = [{
                    key: '1',
                    value: 0
                },
                {
                    key: '2',
                    value: 100
                },
                {
                    key: '3',
                    value: 200
                }
            ];

            var specialKeysMap = {
                'EQUAL': '+',
                'PLUS': '+',
                'MINUS': '-',
                'COMMA': ',',
                'PERIOD': '.',
                'SLASH': '/',
                'BACKSLASH': '\\',
                'SEMICOLON': ';',
                'QUOTE': "\'",
                'BRACKETLEFT': '[',
                'BRACKETRIGHT': ']',
                'BACKQUOTE': '`',
                'SPACE': 'Space'
            };

            function getKeyDisplay(key) {
                if (!key) return '?';
                var u = key.toUpperCase();
                return specialKeysMap[u] || (key.length === 1 ? u : key);
            }

            function loadExtrapolationKeys() {
                try {
                    var s = localStorage.getItem(EXTRAPOLATION_KEYS_STORAGE);
                    return s ? JSON.parse(s) : JSON.parse(JSON.stringify(defaultExtrapolationKeys));
                } catch (e) {
                    return JSON.parse(JSON.stringify(defaultExtrapolationKeys));
                }
            }

            function saveExtrapolationKeys(keys) {
                try {
                    localStorage.setItem(EXTRAPOLATION_KEYS_STORAGE, JSON.stringify(keys));
                    document.dispatchEvent(new Event('extrapolation-keys-updated'));
                } catch (e) {}
            }

            function loadCameraKeys() {
                try {
                    var s = localStorage.getItem(CAMERA_KEYS_STORAGE);
                    return s ? JSON.parse(s) : {};
                } catch (e) {
                    return {};
                }
            }

            function saveCameraKeys(keys) {
                try {
                    localStorage.setItem(CAMERA_KEYS_STORAGE, JSON.stringify(keys));
                    document.dispatchEvent(new Event('camera-keys-updated'));
                } catch (e) {}
            }

            var extrapolationKeys = loadExtrapolationKeys();
            var cameraKeys = loadCameraKeys();

            var keybindsBtn = doc.createElement('button');
            keybindsBtn.setAttribute('data-hook', 'keybindsbtn');
            keybindsBtn.textContent = 'Atajos';
            keybindsBtn.style.display = 'none';
            tabs.appendChild(keybindsBtn);

            var keybindsSection = doc.createElement('section');
            keybindsSection.className = 'keybinds-section section';
            keybindsSection.setAttribute('data-hook', 'keybinds-section');
            keybindsSection.style.display = 'none';

            function showPressKeyOverlay(callback) {
                var overlay = doc.getElementById('keybinds-presskey-overlay');
                if (!overlay) {
                    overlay = doc.createElement('div');
                    overlay.id = 'keybinds-presskey-overlay';
                    overlay.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:999999;align-items:center;justify-content:center;';
                    overlay.innerHTML = '<div style="background:var(--theme-bg-secondary);padding:28px 40px;border-radius:10px;color:var(--theme-text-primary);font-size:15px;font-weight:500;border:1px solid var(--theme-border);text-align:center;"><div style=\'margin-bottom:8px;opacity:0.6;font-size:12px;\'>Press a key</div><div style=\'font-size:22px;\'>...</div><div style=\'margin-top:12px;opacity:0.4;font-size:11px;\'>ESC to cancel</div></div>';
                    doc.body.appendChild(overlay);
                }
                overlay.style.display = 'flex';
                var handleKey = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (['Control', 'Shift', 'Alt', 'Meta'].indexOf(e.key) !== -1) return;
                    overlay.style.display = 'none';
                    doc.removeEventListener('keydown', handleKey, true);
                    callback(e.key === 'Escape' ? null : e.key);
                };
                doc.addEventListener('keydown', handleKey, true);
            }

            function makeKeyBtn(displayText, onClick) {
                var btn = doc.createElement('button');
                btn.textContent = displayText;
                btn.style.cssText = 'padding:6px 14px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:4px;color:var(--theme-text-primary);cursor:pointer;font-size:12px;font-weight:600;min-width:52px;';
                btn.onmouseenter = function() {
                    btn.style.background = 'var(--theme-bg-hover)';
                };
                btn.onmouseleave = function() {
                    btn.style.background = 'var(--theme-bg-secondary)';
                };
                btn.onclick = onClick;
                return btn;
            }

            function sectionHeader(text, iconSvg) {
                var div = doc.createElement('div');
                div.style.cssText = 'color:var(--theme-text-primary);font-size:13px;font-weight:600;margin-bottom:8px;display:flex;align-items:center;gap:6px;';
                div.innerHTML = iconSvg + text;
                return div;
            }

            function renderKeybindsSection() {
                keybindsSection.innerHTML = '';

                var wrap = doc.createElement('div');
                wrap.style.cssText = 'display:flex;flex-direction:column;gap:16px;';
                var exBlock = doc.createElement('div');
                exBlock.appendChild(sectionHeader('Extrapolation', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;opacity:0.6;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>'));

                var note = doc.createElement('div');
                note.style.cssText = 'color:var(--theme-text-muted);font-size:11px;margin-bottom:8px;';
                note.textContent = 'Applies that extrapolation value';
                exBlock.appendChild(note);

                extrapolationKeys.forEach(function(kc, idx) {
                    var row = doc.createElement('div');
                    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;margin-bottom:6px;';

                    var keyBtn = makeKeyBtn(getKeyDisplay(kc.key), function() {
                        showPressKeyOverlay(function(key) {
                            if (key) {
                                extrapolationKeys[idx].key = key;
                                saveExtrapolationKeys(extrapolationKeys);
                                renderKeybindsSection();
                            }
                        });
                    });

                    var valInput = doc.createElement('input');
                    valInput.type = 'text';
                    valInput.inputMode = 'numeric';
                    valInput.value = kc.value;
                    valInput.placeholder = '0';
                    valInput.style.cssText = 'flex:1;padding:6px 8px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:4px;color:var(--theme-text-primary);font-size:12px;outline:none;';
                    valInput.onkeydown = function(e) {
                        e.stopPropagation();
                    };
                    valInput.oninput = function() {
                        valInput.value = valInput.value.replace(/[^0-9-]/g, '');
                        var v = parseInt(valInput.value);
                        extrapolationKeys[idx].value = isNaN(v) ? 0 : v;
                        saveExtrapolationKeys(extrapolationKeys);
                    };

                    var delBtn = doc.createElement('button');
                    delBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';
                    delBtn.style.cssText = 'background:transparent;border:none;color:var(--theme-text-muted);cursor:pointer;padding:4px;';
                    delBtn.onmouseenter = function() {
                        delBtn.style.color = '#ef4444';
                    };
                    delBtn.onmouseleave = function() {
                        delBtn.style.color = 'var(--theme-text-muted)';
                    };
                    delBtn.onclick = function() {
                        extrapolationKeys.splice(idx, 1);
                        saveExtrapolationKeys(extrapolationKeys);
                        renderKeybindsSection();
                    };

                    row.appendChild(keyBtn);
                    row.appendChild(valInput);
                    row.appendChild(delBtn);
                    exBlock.appendChild(row);
                });

                var addExBtn = doc.createElement('button');
                addExBtn.style.cssText = 'width:100%;padding:8px;background:var(--theme-bg-secondary);border:1px dashed var(--theme-border);border-radius:6px;color:var(--theme-text-muted);cursor:pointer;font-size:12px;';
                addExBtn.textContent = 'Add extrapolation shortcut';
                addExBtn.onmouseenter = function() {
                    addExBtn.style.borderColor = 'var(--theme-border-light)';
                    addExBtn.style.color = 'var(--theme-text-primary)';
                };
                addExBtn.onmouseleave = function() {
                    addExBtn.style.borderColor = 'var(--theme-border)';
                    addExBtn.style.color = 'var(--theme-text-muted)';
                };
                addExBtn.onclick = function() {
                    extrapolationKeys.push({
                        key: 'Q',
                        value: 0
                    });
                    saveExtrapolationKeys(extrapolationKeys);
                    renderKeybindsSection();
                };
                exBlock.appendChild(addExBtn);
                wrap.appendChild(exBlock);
                var camBlock = doc.createElement('div');
                camBlock.appendChild(sectionHeader('Camera levels', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;opacity:0.6;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>'));

                var camNote = doc.createElement('div');
                camNote.style.cssText = 'color:var(--theme-text-muted);font-size:11px;margin-bottom:8px;';
                camNote.textContent = 'Activates that camera level';
                camBlock.appendChild(camNote);

                for (var level = 0; level <= 7; level++) {
                    (function(lvl) {
                        var customKey = cameraKeys[lvl.toString()];
                        var row = doc.createElement('div');
                        row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;margin-bottom:6px;';

                        var lbl = doc.createElement('span');
                        lbl.style.cssText = 'color:var(--theme-text-muted);font-size:12px;';
                        lbl.textContent = 'Camera level ' + lvl + '  (default key: ' + lvl + ')';

                        var keyBtn = makeKeyBtn(customKey ? getKeyDisplay(customKey) : lvl.toString(), function() {
                            showPressKeyOverlay(function(key) {
                                if (key) {
                                    cameraKeys[lvl.toString()] = key;
                                    saveCameraKeys(cameraKeys);
                                    renderKeybindsSection();
                                }
                            });
                        });

                        row.appendChild(lbl);
                        row.appendChild(keyBtn);
                        camBlock.appendChild(row);
                    })(level);
                }
                wrap.appendChild(camBlock);
                var resetAll = doc.createElement('button');
                resetAll.textContent = 'Reset all';
                resetAll.style.cssText = 'width:100%;padding:10px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-muted);cursor:pointer;font-size:12px;margin-top:4px;';
                resetAll.onmouseenter = function() {
                    resetAll.style.color = '#ef4444';
                    resetAll.style.borderColor = '#ef4444';
                };
                resetAll.onmouseleave = function() {
                    resetAll.style.color = 'var(--theme-text-muted)';
                    resetAll.style.borderColor = 'var(--theme-border)';
                };
                resetAll.onclick = function() {
                    try {
                        localStorage.removeItem(EXTRAPOLATION_KEYS_STORAGE);
                        localStorage.removeItem(CAMERA_KEYS_STORAGE);
                    } catch (e) {}
                    extrapolationKeys = JSON.parse(JSON.stringify(defaultExtrapolationKeys));
                    cameraKeys = {};
                    document.dispatchEvent(new Event('extrapolation-keys-updated'));
                    document.dispatchEvent(new Event('camera-keys-updated'));
                    renderKeybindsSection();
                };
                wrap.appendChild(resetAll);

                keybindsSection.appendChild(wrap);
            }

            var dialogContent = dialog.querySelector('.section') || dialog;
            dialogContent.parentNode.insertBefore(keybindsSection, dialogContent.nextSibling);

            keybindsBtn.addEventListener('click', function() {
                var sections = dialog.querySelectorAll('.tabcontents > .section');
                for (var i = 0; i < sections.length; i++) {
                    sections[i].style.display = 'none';
                }
                ['perf-section', 'multiauth-section', 'comandos-section'].forEach(function(h) {
                    var s = dialog.querySelector('[data-hook="' + h + '"]');
                    if (s) s.style.display = 'none';
                });
                keybindsSection.style.display = 'block';
                keybindsSection.style.maxHeight = 'calc(90vh - 160px)';
                keybindsSection.style.overflowY = 'auto';
                renderKeybindsSection();
                var allTabs = tabs.querySelectorAll('button');
                for (var i = 0; i < allTabs.length; i++) {
                    allTabs[i].classList.remove('selected');
                }
                keybindsBtn.classList.add('selected');
            });

            var otherTabs = tabs.querySelectorAll('button:not([data-hook="keybindsbtn"])');
            for (var i = 0; i < otherTabs.length; i++) {
                otherTabs[i].addEventListener('click', function() {
                    keybindsSection.style.display = 'none';
                    keybindsSection.style.maxHeight = '';
                    keybindsSection.style.overflowY = '';
                });
            }

            return keybindsBtn;
        }
        var pendingButtons = {};

        var STRETCHED_KEY = 'stretched_resolution';
        var STRETCHED_RES = [
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

        function injectStretched(dlg, d) {
            var videoSection = dlg.querySelector('[data-hook="videosec"]');
            if (!videoSection || dlg.querySelector('#stretched-res-row')) return;
            var savedRes = { width: 0, height: 0 };
            try { var s = localStorage.getItem(STRETCHED_KEY); if (s) savedRes = JSON.parse(s); } catch(e) {}

            var row = d.createElement('div');
            row.id = 'stretched-res-row';
            row.style.cssText = 'display:flex;align-items:center;';

            var lbl = d.createElement('span');
            lbl.style.cssText = 'font-size:13px;white-space:nowrap;';
            lbl.textContent = 'Stretch:';

            var sel = d.createElement('select');
            sel.style.cssText = 'margin-left:8px;padding:4px 8px;background:var(--theme-bg-secondary,#222);color:var(--theme-text-primary,#fff);border:1px solid var(--theme-border,#444);border-radius:4px;';

            STRETCHED_RES.forEach(function(res) {
                var opt = d.createElement('option');
                opt.value = res.width + 'x' + res.height;
                opt.textContent = res.label;
                if (res.width === savedRes.width && res.height === savedRes.height) opt.selected = true;
                sel.appendChild(opt);
            });

            sel.onchange = function() {
                var parts = sel.value.split('x');
                try { localStorage.setItem(STRETCHED_KEY, JSON.stringify({ width: parseInt(parts[0]) || 0, height: parseInt(parts[1]) || 0 })); } catch(e) {}
                window.dispatchEvent(new Event('resize'));
            };

            row.appendChild(lbl);
            row.appendChild(sel);
            videoSection.appendChild(row);
        }

        function createSidebarButton(originalBtn) {
            var hook = originalBtn.getAttribute('data-hook');
            if (sidebar.querySelector('[data-hook-ref="' + hook + '"]')) return;

            var iconData = tabIcons[hook] || {
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>',
                tooltip: originalBtn.textContent,
                order: 99
            };

            var sidebarBtn = doc.createElement('button');
            sidebarBtn.className = 'settings-sidebar-btn';
            sidebarBtn.setAttribute('data-hook-ref', hook);
            sidebarBtn.setAttribute('data-order', iconData.order || 99);
            sidebarBtn.innerHTML = iconData.icon;

            if (originalBtn.classList.contains('selected')) {
                sidebarBtn.classList.add('selected');
            }

            addTooltip(sidebarBtn, iconData.tooltip);

            sidebarBtn.onclick = function() {
                var allBtns = sidebar.querySelectorAll('.settings-sidebar-btn:not([data-close])');
                for (var j = 0; j < allBtns.length; j++) {
                    allBtns[j].classList.remove('selected');
                }
                sidebarBtn.classList.add('selected');

                if (hook !== 'perfbtn') {
                    var perfSection = dialog.querySelector('[data-hook="perf-section"]');
                    if (perfSection) perfSection.style.display = 'none';
                }

                if (hook !== 'multiauthbtn') {
                    var multiAuthSection = dialog.querySelector('[data-hook="multiauth-section"]');
                    if (multiAuthSection) multiAuthSection.style.display = 'none';
                }

                if (hook !== 'comandosbtn') {
                    var comandosSection = dialog.querySelector('[data-hook="comandos-section"]');
                    if (comandosSection) {
                        comandosSection.style.display = 'none';
                        dialog.style.maxHeight = '';
                        dialog.style.height = '';
                        var tc = dialog.querySelector('.tabcontents');
                        if (tc) {
                            tc.style.maxHeight = '';
                            tc.style.overflowY = '';
                        }
                    }
                }

                if (hook !== 'keybindsbtn') {
                    var keybindsSection = dialog.querySelector('[data-hook="keybinds-section"]');
                    if (keybindsSection) {
                        keybindsSection.style.display = 'none';
                        dialog.style.maxHeight = '';
                        dialog.style.height = '';
                        var tc = dialog.querySelector('.tabcontents');
                        if (tc) {
                            tc.style.maxHeight = '';
                            tc.style.overflowY = '';
                        }
                    }
                }

                if (hook !== 'cachebtn') {
                    var cacheSectionEl = dialog.querySelector('[data-hook="cache-section"]');
                    if (cacheSectionEl) {
                        cacheSectionEl.style.display = 'none';
                        dialog.style.maxHeight = '';
                        dialog.style.height = '';
                        var tc = dialog.querySelector('.tabcontents');
                        if (tc) {
                            tc.style.maxHeight = '';
                            tc.style.overflowY = '';
                        }
                    }
                }

                if (hook !== 'perfbtn' && hook !== 'multiauthbtn' && hook !== 'comandosbtn' && hook !== 'keybindsbtn' && hook !== 'cachebtn') {
                    var sections = dialog.querySelectorAll('.tabcontents > .section');
                    for (var k = 0; k < sections.length; k++) {
                        sections[k].style.display = '';
                    }
                }

                originalBtn.click();

                if (hook === 'videobtn') {
                    injectStretched(dialog, doc);
                }
            };

            originalBtn.addEventListener('click', function() {
                var allBtns = sidebar.querySelectorAll('.settings-sidebar-btn:not([data-close])');
                for (var j = 0; j < allBtns.length; j++) {
                    allBtns[j].classList.remove('selected');
                }
                sidebarBtn.classList.add('selected');
            });

            pendingButtons[hook] = sidebarBtn;
        }

        function insertButtonsInOrder() {
            var spacer = sidebar.querySelector('[data-spacer]');
            for (var i = 0; i < tabOrder.length; i++) {
                var hook = tabOrder[i];
                if (pendingButtons[hook]) {
                    if (spacer) {
                        sidebar.insertBefore(pendingButtons[hook], spacer);
                    } else {
                        sidebar.appendChild(pendingButtons[hook]);
                    }
                }
            }
        }

        var tabButtons = tabs ? tabs.querySelectorAll('button') : [];
        for (var i = 0; i < tabButtons.length; i++) {
            createSidebarButton(tabButtons[i]);
        }

        if (tabs) {
            var perfTabBtn = createPerfTab(doc, tabs);
            if (perfTabBtn) createSidebarButton(perfTabBtn);

            var multiAuthTabBtn = createMultiAuthTab(doc, tabs);
            if (multiAuthTabBtn) createSidebarButton(multiAuthTabBtn);

            var comandosTabBtn = createComandosTab(doc, tabs);
            if (comandosTabBtn) createSidebarButton(comandosTabBtn);

            var keybindsTabBtn = createKeybindsTab(doc, tabs);
            if (keybindsTabBtn) createSidebarButton(keybindsTabBtn);

            var cacheTabBtn = createCacheTab(doc, tabs, dialog);
            if (cacheTabBtn) createSidebarButton(cacheTabBtn);
        }

        var spacer = doc.createElement('div');
        spacer.style.cssText = 'flex:1;';
        spacer.setAttribute('data-spacer', 'true');
        sidebar.appendChild(spacer);

        insertButtonsInOrder();

        var closeBtn = dialog.querySelector('button[data-hook="close"]');
        if (closeBtn) {
            var sidebarCloseBtn = doc.createElement('button');
            sidebarCloseBtn.className = 'settings-sidebar-btn';
            sidebarCloseBtn.setAttribute('data-close', 'true');
            sidebarCloseBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
            addTooltip(sidebarCloseBtn, 'Close');
            sidebarCloseBtn.onclick = function() {
                closeBtn.click();
            };
            sidebar.appendChild(sidebarCloseBtn);
        }

        if (tabs) tabs.style.display = 'none';
        if (closeBtn) closeBtn.style.display = 'none';

        dialog.style.position = 'relative';
        dialog.appendChild(sidebar);
        dialog.setAttribute('data-ready', '1');

        if (tabs) {
            var tabsObserver = new MutationObserver(function(mutations) {
                var needsReorder = false;
                for (var m = 0; m < mutations.length; m++) {
                    var added = mutations[m].addedNodes;
                    for (var n = 0; n < added.length; n++) {
                        if (added[n].tagName === 'BUTTON') {
                            createSidebarButton(added[n]);
                            needsReorder = true;
                        }
                    }
                }
                if (needsReorder) insertButtonsInOrder();
            });
            tabsObserver.observe(tabs, {
                childList: true
            });
        }

        injectStretched(dialog, doc);
        Injector.log('Settings sidebar injected');
    }

    function hideTooltip() {
        var tooltip = document.getElementById('settings-sidebar-tooltip');
        if (tooltip) tooltip.style.opacity = '0';
    }

    function init() {
        if (!Injector.isGameFrame()) return;
        var observer = new MutationObserver(function() {
            var settingsDialog = document.querySelector('.dialog.settings-view');
            if (settingsDialog && !document.getElementById('settings-sidebar-panel')) {
                modifySettingsDialog(document);
            }
        });

        Injector.waitForHead().then(function() {
            if (document.body) {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
        });

        Injector.log('Settings module loaded');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();