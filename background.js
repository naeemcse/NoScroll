// Background service worker for blocking sites and tracking usage

const defaultSites = [
    'facebook.com',
    'instagram.com',
    'twitter.com',
    'linkedin.com',
    'tiktok.com',
    'youtube.com',
    'reddit.com',
    'snapchat.com',
    'pinterest.com',
    'web.whatsapp.com'
];

// Initialize storage with defaults
chrome.runtime.onInstalled.addListener(async () => {
    const result = await chrome.storage.local.get(['blockedSites', 'motivationalMessages', 'customSites', 'isBlocking']);
    
    if (!result.blockedSites) {
        await chrome.storage.local.set({
            blockedSites: defaultSites.map(domain => ({ name: domain, domain, enabled: true })),
            motivationalMessages: [
                "You're stronger than this distraction! 💪",
                "Focus on your goals, not your feed! 🎯",
                "Every moment away is progress! ✨",
                "Your future self will thank you! 🙏",
                "Stay focused, stay productive! 🚀",
                "You've got this! Keep going! 💯",
                "Time is precious - use it wisely! ⏰",
                "Distraction is temporary, success is permanent! 🌟"
            ],
            customSites: []
        });
    }
    
    // Always enable blocking by default
    if (!result.isBlocking) {
        await chrome.storage.local.set({ isBlocking: true, blockUntil: null });
    }
    
    await updateBlockingRules();
});

// Update blocking rules based on settings
async function updateBlockingRules() {
    try {
        const result = await chrome.storage.local.get(['blockedSites', 'customSites']);
        const blockedSites = result.blockedSites || [];
        const customSites = result.customSites || [];
        
        const enabledSites = blockedSites.filter(site => site.enabled).map(site => site.domain);
        const allBlockedDomains = [...enabledSites, ...customSites];
        
        // Store blocked domains for content script
        await chrome.storage.local.set({ blockedDomains: allBlockedDomains });
    } catch (error) {
        console.error('Error updating blocking rules:', error);
    }
}

// Handle messages from popup and options
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startBlocking') {
        handleStartBlocking(message.duration);
    } else if (message.action === 'stopBlocking') {
        handleStopBlocking();
    } else if (message.action === 'updateBlockingRules') {
        updateBlockingRules();
    } else if (message.action === 'trackVisit') {
        trackVisit(message.domain);
    }
    
    sendResponse({ success: true });
    return true;
});

// Handle tab updates - track time spent and visits
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (tab.url) {
        try {
            const result = await chrome.storage.local.get(['isBlocking', 'blockedDomains', 'siteAccess']);
            
            if (result.isBlocking) {
                const url = new URL(tab.url);
                const hostname = url.hostname.replace('www.', '').toLowerCase();
                
                // Skip extension pages
                if (tab.url.startsWith('chrome-extension://') || tab.url.startsWith('chrome://')) {
                    return;
                }
                
                if (result.blockedDomains && result.blockedDomains.length > 0) {
                    const isBlocked = result.blockedDomains.some(domain => {
                        const cleanDomain = domain.toLowerCase().replace('www.', '');
                        return hostname === cleanDomain || hostname.endsWith('.' + cleanDomain);
                    });
                    
                    if (isBlocked) {
                        // Check if site has access
                        const siteAccess = result.siteAccess || {};
                        const siteKey = hostname.replace('www.', '');
                        const access = siteAccess[siteKey];
                        
                        const hasAccess = access && (
                            access.allowedUntil === null || // Forever
                            (access.allowedUntil && Date.now() < access.allowedUntil) // Temporary
                        );
                        
                        if (changeInfo.status === 'loading') {
                            if (!hasAccess) {
                                // Track entry attempt (before blocking)
                                trackEntryAttempt(hostname);
                                trackVisit(hostname);
                            } else {
                                // Track visit when access is allowed
                                trackUsage(hostname, true);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error checking blocked site:', error);
        }
    }
});

// Track time spent when tab is closed
chrome.tabs.onRemoved.addListener(async (tabId) => {
    try {
        // Get the tab info before it's removed (we need to track which domain)
        // Since we can't get tab info after removal, we'll track time in content script
    } catch (error) {
        console.error('Error tracking tab removal:', error);
    }
});

// Track entry attempt (when user tries to access blocked site)
async function trackEntryAttempt(domain) {
    try {
        const today = new Date().toDateString();
        const result = await chrome.storage.local.get(['usageStats']);
        const stats = result.usageStats || {};
        
        if (!stats[today]) {
            stats[today] = { visits: 0, timeSaved: 0, blocks: 0, breaks: 0, entryAttempts: [] };
        }
        
        if (!stats[today].entryAttempts) {
            stats[today].entryAttempts = [];
        }
        
        // Log entry attempt with timestamp
        stats[today].entryAttempts.push({
            domain: domain,
            timestamp: Date.now(),
            blocked: true
        });
        
        await chrome.storage.local.set({ usageStats: stats });
    } catch (error) {
        console.error('Error tracking entry attempt:', error);
    }
}

// Track blocked visit (entry attempt)
async function trackVisit(domain) {
    try {
        const today = new Date().toDateString();
        const result = await chrome.storage.local.get(['usageStats']);
        const stats = result.usageStats || {};
        
        if (!stats[today]) {
            stats[today] = { visits: 0, timeSpent: 0, entryAttempts: [], activeSessions: {} };
        }
        
        // Just track entry attempt, don't count as visit since it was blocked
        if (!stats[today].entryAttempts) {
            stats[today].entryAttempts = [];
        }
        
        stats[today].entryAttempts.push({
            domain: domain,
            timestamp: Date.now(),
            blocked: true
        });
        
        await chrome.storage.local.set({ usageStats: stats });
    } catch (error) {
        console.error('Error tracking visit:', error);
    }
}

// Track usage when access is allowed - track visit and start time tracking
async function trackUsage(domain, isAllowed = false) {
    try {
        const today = new Date().toDateString();
        const result = await chrome.storage.local.get(['usageStats']);
        const stats = result.usageStats || {};
        
        if (!stats[today]) {
            stats[today] = { visits: 0, timeSpent: 0, entryAttempts: [], activeSessions: {} };
        }
        
        if (!stats[today].entryAttempts) {
            stats[today].entryAttempts = [];
        }
        
        if (!stats[today].activeSessions) {
            stats[today].activeSessions = {};
        }
        
        if (!stats[today].domainUsage) {
            stats[today].domainUsage = {};
        }
        
        // Track visit
        if (isAllowed) {
            stats[today].visits = (stats[today].visits || 0) + 1;
            
            // Start tracking session time
            const siteKey = domain.replace('www.', '').toLowerCase();
            stats[today].activeSessions[siteKey] = {
                startTime: Date.now(),
                domain: domain
            };
        }
        
        // Log usage entry
        stats[today].entryAttempts.push({
            domain: domain,
            timestamp: Date.now(),
            blocked: false,
            allowed: isAllowed
        });
        
        await chrome.storage.local.set({ usageStats: stats });
        
        // Update today's stats
        const todayStats = {
            timeSpent: stats[today].timeSpent || 0,
            visits: stats[today].visits || 0
        };
        await chrome.storage.local.set({ todayStats: todayStats });
    } catch (error) {
        console.error('Error tracking usage:', error);
    }
}

// Track time spent when tab is closed or user navigates away
async function trackTimeSpent(domain) {
    try {
        const today = new Date().toDateString();
        const result = await chrome.storage.local.get(['usageStats']);
        const stats = result.usageStats || {};
        
        if (!stats[today] || !stats[today].activeSessions) {
            return;
        }
        
        const siteKey = domain.replace('www.', '').toLowerCase();
        const session = stats[today].activeSessions[siteKey];
        
        if (session && session.startTime) {
            const timeSpent = Math.floor((Date.now() - session.startTime) / 1000 / 60); // in minutes
            stats[today].timeSpent = (stats[today].timeSpent || 0) + timeSpent;
            
            // Track per domain
            if (!stats[today].domainUsage) {
                stats[today].domainUsage = {};
            }
            stats[today].domainUsage[siteKey] = (stats[today].domainUsage[siteKey] || 0) + timeSpent;
            
            // Remove session
            delete stats[today].activeSessions[siteKey];
            
            await chrome.storage.local.set({ usageStats: stats });
            
            // Update today's stats
            const todayStats = {
                timeSpent: stats[today].timeSpent || 0,
                visits: stats[today].visits || 0
            };
            await chrome.storage.local.set({ todayStats: todayStats });
        }
    } catch (error) {
        console.error('Error tracking time spent:', error);
    }
}

function handleStartBlocking(duration) {
    const blockUntil = Date.now() + (duration * 60 * 1000);
    chrome.storage.local.set({ isBlocking: true, blockUntil: blockUntil });
    
    // Set alarm to stop blocking
    chrome.alarms.create('stopBlocking', { when: blockUntil });
}

function handleStopBlocking() {
    chrome.storage.local.set({ isBlocking: false, blockUntil: null });
    chrome.alarms.clear('stopBlocking');
}

// Handle alarm to stop blocking
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'stopBlocking') {
        handleStopBlocking();
    }
});

// Initialize blocking rules on startup
chrome.runtime.onStartup.addListener(async () => {
    // Ensure blocking is always active
    await chrome.storage.local.set({ isBlocking: true, blockUntil: null });
    await updateBlockingRules();
});

// Ensure blocking is always active
chrome.runtime.onInstalled.addListener(async () => {
    await chrome.storage.local.set({ isBlocking: true, blockUntil: null });
});

updateBlockingRules();

