// Content script to block newsfeed/content area and show motivational messages

(function() {
    'use strict';
    
    // Check if overlay already exists
    if (document.getElementById('social-media-blocker-overlay')) {
        return;
    }

    const initBlocking = async () => {

    // Check if we're on a blocked site and if blocking is active
    const result = await chrome.storage.local.get(['isBlocking', 'blockedDomains', 'siteAccess']);
    
    if (!result.isBlocking || !result.blockedDomains) {
        return;
    }

    const hostname = window.location.hostname.replace('www.', '').toLowerCase();
    const isBlocked = result.blockedDomains.some(domain => {
        const cleanDomain = domain.toLowerCase().replace('www.', '');
        return hostname === cleanDomain || hostname.endsWith('.' + cleanDomain);
    });

    if (!isBlocked) {
        return;
    }

    // Check if this site has temporary access
    const siteAccess = result.siteAccess || {};
    const siteKey = hostname.replace('www.', '');
    const access = siteAccess[siteKey];
    
    if (access) {
        // Check if access is forever (null) or still valid
        if (access.allowedUntil === null) {
            // Forever access, don't block - track time spent
            startTimeTracking(hostname);
            return;
        } else if (access.allowedUntil && Date.now() < access.allowedUntil) {
            // Temporary access still valid, don't block - track time spent
            startTimeTracking(hostname);
            return;
        }
    }

    // Function to track time spent on allowed sites
    function startTimeTracking(domain) {
        const startTime = Date.now();
        const siteKey = domain.replace('www.', '').toLowerCase();
        
        // Track time every minute
        const timeTracker = setInterval(async () => {
            const result = await chrome.storage.local.get(['siteAccess', 'usageStats']);
            const siteAccess = result.siteAccess || {};
            const access = siteAccess[siteKey];
            
            // Check if access is still valid
            const hasAccess = access && (
                access.allowedUntil === null || // Forever
                (access.allowedUntil && Date.now() < access.allowedUntil) // Temporary
            );
            
            if (!hasAccess) {
                // Access expired, stop tracking
                clearInterval(timeTracker);
                return;
            }
            
            // Update time spent (1 minute passed)
            const today = new Date().toDateString();
            const stats = result.usageStats || {};
            if (!stats[today]) {
                stats[today] = { visits: 0, timeSpent: 0, entryAttempts: [], domainUsage: {} };
            }
            if (!stats[today].domainUsage) {
                stats[today].domainUsage = {};
            }
            
            stats[today].timeSpent = (stats[today].timeSpent || 0) + 1;
            stats[today].domainUsage[siteKey] = (stats[today].domainUsage[siteKey] || 0) + 1;
            
            await chrome.storage.local.set({ usageStats: stats });
            
            // Update today's stats
            const todayStats = {
                timeSpent: stats[today].timeSpent || 0,
                visits: stats[today].visits || 0
            };
            await chrome.storage.local.set({ todayStats: todayStats });
        }, 60000); // Every minute
        
        // Track time when page unloads
        window.addEventListener('beforeunload', async () => {
            const timeSpent = Math.floor((Date.now() - startTime) / 1000 / 60);
            if (timeSpent > 0) {
                const today = new Date().toDateString();
                const result = await chrome.storage.local.get(['usageStats']);
                const stats = result.usageStats || {};
                if (!stats[today]) {
                    stats[today] = { visits: 0, timeSpent: 0, entryAttempts: [], domainUsage: {} };
                }
                if (!stats[today].domainUsage) {
                    stats[today].domainUsage = {};
                }
                
                stats[today].timeSpent = (stats[today].timeSpent || 0) + timeSpent;
                stats[today].domainUsage[siteKey] = (stats[today].domainUsage[siteKey] || 0) + timeSpent;
                
                await chrome.storage.local.set({ usageStats: stats });
            }
            clearInterval(timeTracker);
        });
    }

    // Get motivational message
    const msgResult = await chrome.storage.local.get(['motivationalMessages']);
    const messages = msgResult.motivationalMessages || [
        "You're stronger than this distraction! 💪",
        "Focus on your goals, not your feed! 🎯"
    ];
    const randomMessage = messages.length > 0 
        ? messages[Math.floor(Math.random() * messages.length)]
        : "Stay focused! 💪";

    // Function to block content area
    const blockContentArea = () => {
        // Site-specific selectors for newsfeed/content areas
        const selectors = {
            'facebook.com': [
                '[role="main"]',
                '[role="feed"]',
                'div[data-pagelet="FeedUnit"]',
                'div[data-pagelet="Stories"]',
                'div[role="feed"]'
            ],
            'instagram.com': [
                'article',
                'main[role="main"]',
                'div[role="dialog"]',
                'section main'
            ],
            'twitter.com': [
                '[data-testid="primaryColumn"]',
                '[data-testid="tweet"]',
                'section[role="region"]'
            ],
            'youtube.com': [
                '#contents',
                '#primary',
                '#secondary',
                'ytd-browse[page-subtype="home"]',
                'ytd-rich-grid-renderer'
            ],
            'linkedin.com': [
                '.feed-container',
                '.feed-container__content',
                'div[data-test-id="feed-container"]'
            ],
            'reddit.com': [
                '[data-testid="post-container"]',
                '.Post',
                'div[data-testid="subreddit-sidebar"]'
            ],
            'tiktok.com': [
                '[data-e2e="recommend-list-item"]',
                '.video-feed-item'
            ]
        };

        // Get selectors for current site
        let contentSelectors = [];
        for (const [domain, sel] of Object.entries(selectors)) {
            if (hostname.includes(domain)) {
                contentSelectors = sel;
                break;
            }
        }

        // If no specific selectors, use common patterns
        if (contentSelectors.length === 0) {
            contentSelectors = [
                'main',
                '[role="main"]',
                '[role="feed"]',
                'article',
                '.feed',
                '#content',
                '.content'
            ];
        }

        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'social-media-blocker-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            z-index: 999999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            padding: 40px;
            box-sizing: border-box;
            text-align: center;
        `;

        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 30px;
            line-height: 1.5;
            max-width: 600px;
        `;
        messageDiv.textContent = randomMessage;

        const iconDiv = document.createElement('div');
        iconDiv.style.cssText = `
            font-size: 64px;
            margin-bottom: 20px;
        `;
        iconDiv.textContent = '🚫';

        overlay.appendChild(iconDiv);
        overlay.appendChild(messageDiv);

        // Try to hide content areas
        const hideContent = () => {
            contentSelectors.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => {
                        if (el && !el.closest('#social-media-blocker-overlay')) {
                            el.style.display = 'none';
                        }
                    });
                } catch (e) {
                    // Selector might not be valid, ignore
                }
            });
        };

        // Hide content immediately
        hideContent();

        // Also hide content on mutations (for dynamic content)
        const observer = new MutationObserver(() => {
            hideContent();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Add overlay to page
        document.body.appendChild(overlay);

        // Prevent scrolling
        document.body.style.overflow = 'hidden';
    };

    // Block content area
    blockContentArea();

        // Re-block on navigation (for SPAs)
        let lastUrl = location.href;
        const urlObserver = new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                setTimeout(() => {
                    if (!document.getElementById('social-media-blocker-overlay')) {
                        blockContentArea();
                    }
                }, 500);
            }
        });
        urlObserver.observe(document, { subtree: true, childList: true });
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBlocking);
    } else {
        initBlocking();
    }
})();
