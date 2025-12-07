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
    const result = await chrome.storage.local.get(['blockedSites', 'motivationalMessages', 'customSites']);
    
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

// Handle tab updates to check if blocked site is accessed
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading' && tab.url) {
        try {
            const result = await chrome.storage.local.get(['isBlocking', 'blockedDomains']);
            
            if (result.isBlocking) {
                // Check if block hasn't expired
                const blockCheck = await chrome.storage.local.get(['blockUntil']);
                if (blockCheck.blockUntil && Date.now() >= blockCheck.blockUntil) {
                    // Block expired, stop blocking
                    await chrome.storage.local.set({ isBlocking: false, blockUntil: null });
                    return;
                }
                
                const url = new URL(tab.url);
                const hostname = url.hostname.replace('www.', '').toLowerCase();
                
                // Skip if already on block page
                if (tab.url.includes('block.html')) {
                    return;
                }
                
                if (result.blockedDomains && result.blockedDomains.length > 0) {
                    const isBlocked = result.blockedDomains.some(domain => {
                        const cleanDomain = domain.toLowerCase().replace('www.', '');
                        return hostname === cleanDomain || hostname.endsWith('.' + cleanDomain);
                    });
                    
                    if (isBlocked) {
                        // Redirect to block page
                        await chrome.tabs.update(tabId, {
                            url: chrome.runtime.getURL(`block.html?domain=${encodeURIComponent(hostname)}`)
                        });
                        
                        // Track the blocked visit
                        trackVisit(hostname);
                    }
                }
            }
        } catch (error) {
            console.error('Error checking blocked site:', error);
        }
    }
});

// Track usage statistics
async function trackVisit(domain) {
    try {
        const today = new Date().toDateString();
        const result = await chrome.storage.local.get(['usageStats']);
        const stats = result.usageStats || {};
        
        if (!stats[today]) {
            stats[today] = { visits: 0, timeSaved: 0, blocks: 0 };
        }
        
        stats[today].visits += 1;
        stats[today].blocks += 1;
        stats[today].timeSaved += 5; // Assume 5 minutes saved per block
        
        await chrome.storage.local.set({ usageStats: stats });
        
        // Update today's stats
        const todayStats = {
            timeSaved: stats[today].timeSaved,
            blocks: stats[today].blocks
        };
        await chrome.storage.local.set({ todayStats: todayStats });
    } catch (error) {
        console.error('Error tracking visit:', error);
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
chrome.runtime.onStartup.addListener(() => {
    updateBlockingRules();
});

updateBlockingRules();

