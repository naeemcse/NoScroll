document.addEventListener('DOMContentLoaded', async () => {
    const todayTime = document.getElementById('todayTime');
    const todayVisits = document.getElementById('todayVisits');
    const viewStats = document.getElementById('viewStats');
    const openSettings = document.getElementById('openSettings');
    const siteAccessList = document.getElementById('siteAccessList');

    // Ensure blocking is always active
    const ensureBlockingActive = async () => {
        const result = await safeStorageGet(['isBlocking']);
        if (!result.isBlocking) {
            await safeStorageSet({ isBlocking: true, blockUntil: null });
        }
    };

    // Load current state
    const loadState = async () => {
        try {
            await ensureBlockingActive();
            
            // Update stats - show time spent and visits
            const result = await safeStorageGet(['todayStats']);
            if (result.todayStats) {
                const minutes = result.todayStats.timeSpent || 0;
                const hours = Math.floor(minutes / 60);
                const mins = minutes % 60;
                todayTime.textContent = `${hours}h ${mins}m`;
                todayVisits.textContent = result.todayStats.visits || 0;
            } else {
                todayTime.textContent = '0h 0m';
                todayVisits.textContent = '0';
            }
        } catch (error) {
            console.error('Load state error:', error);
        }
    };

    viewStats.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('stats.html') });
    });

    openSettings.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    // Load and render site access controls
    const loadSiteAccessControls = async () => {
        try {
            await ensureBlockingActive();
            const result = await safeStorageGet(['blockedSites', 'siteAccess']);

            const blockedSites = result.blockedSites || [];
            const enabledSites = blockedSites.filter(site => site.enabled);
            const siteAccess = result.siteAccess || {};

            if (enabledSites.length === 0) {
                siteAccessList.innerHTML = '<div style="padding: 20px; text-align: center; color: #666; font-size: 13px;">No sites configured for blocking</div>';
                return;
            }

            siteAccessList.innerHTML = enabledSites.map(site => {
                const siteKey = site.domain.replace('www.', '').toLowerCase();
                const access = siteAccess[siteKey];
                const isAllowed = access && (
                    access.allowedUntil === null || // Forever
                    (access.allowedUntil && Date.now() < access.allowedUntil) // Temporary
                );
                const remaining = isAllowed && access.allowedUntil && access.allowedUntil !== null
                    ? Math.max(0, Math.floor((access.allowedUntil - Date.now()) / 1000 / 60))
                    : (isAllowed && access.allowedUntil === null ? '∞' : 0);

                return `
                    <div class="site-access-item" data-domain="${site.domain}">
                        <div class="site-access-info">
                            <div class="site-access-name">${site.name}</div>
                            <div class="site-access-status ${isAllowed ? 'allowed' : 'blocked'}">
                                ${isAllowed ? (remaining === '∞' ? 'Allowed (Forever)' : `Allowed (${remaining}m left)`) : 'Blocked'}
                            </div>
                        </div>
                        <div class="site-access-actions">
                            ${isAllowed ? `
                                <button class="access-btn access-btn-revoke" data-domain="${site.domain}" title="Revoke access immediately">
                                    Revoke Access
                                </button>
                            ` : `
                                <select class="access-duration-select" data-domain="${site.domain}">
                                    <option value="5">5 min</option>
                                    <option value="10">10 min</option>
                                    <option value="30">30 min</option>
                                    <option value="60">1 hour</option>
                                    <option value="forever">Forever</option>
                                </select>
                                <button class="access-btn access-btn-primary" data-domain="${site.domain}">
                                    Allow Access
                                </button>
                            `}
                        </div>
                    </div>
                `;
            }).join('');

            // Add event listeners to access buttons
            siteAccessList.querySelectorAll('.access-btn-primary').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const domain = e.target.dataset.domain;
                    const item = e.target.closest('.site-access-item');
                    const select = item.querySelector('.access-duration-select');
                    const duration = select.value;

                    await allowSiteAccess(domain, duration);
                    loadSiteAccessControls();
                });
            });

            // Add event listeners to revoke buttons
            siteAccessList.querySelectorAll('.access-btn-revoke').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const domain = e.target.dataset.domain;
                    await revokeSiteAccess(domain);
                    loadSiteAccessControls();
                });
            });
        } catch (error) {
            console.error('Load site access controls error:', error);
        }
    };

    // Allow site access
    const allowSiteAccess = async (domain, duration) => {
        try {
            const result = await safeStorageGet(['siteAccess']);
            const siteAccess = result.siteAccess || {};
            const siteKey = domain.replace('www.', '').toLowerCase();

            if (duration === 'forever') {
                siteAccess[siteKey] = {
                    allowed: true,
                    allowedUntil: null, // null means forever
                    allowedAt: Date.now()
                };
            } else {
                const minutes = parseInt(duration);
                if (isNaN(minutes) || minutes <= 0) {
                    alert('Invalid duration');
                    return;
                }
                siteAccess[siteKey] = {
                    allowed: true,
                    allowedUntil: Date.now() + (minutes * 60 * 1000),
                    allowedAt: Date.now()
                };
            }

            await safeStorageSet({ siteAccess: siteAccess });

            // Notify content script to reload
            chrome.tabs.query({}, (tabs) => {
                tabs.forEach(tab => {
                    if (tab.url && tab.url.includes(domain)) {
                        chrome.tabs.reload(tab.id);
                    }
                });
            });

            // Track access granted (will track time spent when user actually uses the site)
        } catch (error) {
            console.error('Allow site access error:', error);
            alert('Failed to allow access. Please try again.');
        }
    };

    // Revoke site access
    const revokeSiteAccess = async (domain) => {
        try {
            const result = await safeStorageGet(['siteAccess']);
            const siteAccess = result.siteAccess || {};
            const siteKey = domain.replace('www.', '').toLowerCase();

            // Remove access
            delete siteAccess[siteKey];

            await safeStorageSet({ siteAccess: siteAccess });

            // Notify content script to reload
            chrome.tabs.query({}, (tabs) => {
                tabs.forEach(tab => {
                    if (tab.url && tab.url.includes(domain)) {
                        chrome.tabs.reload(tab.id);
                    }
                });
            });

            alert('Access revoked. Site is now blocked again.');
        } catch (error) {
            console.error('Revoke site access error:', error);
            alert('Failed to revoke access. Please try again.');
        }
    };

    // Update every minute
    setInterval(() => {
        loadState();
        loadSiteAccessControls();
    }, 60000);
    
    loadState();
    loadSiteAccessControls();
});

