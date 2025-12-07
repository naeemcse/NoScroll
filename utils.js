// Utility functions for validation and error handling

/**
 * Validate domain format
 */
function validateDomain(domain) {
    if (!domain || typeof domain !== 'string') {
        return { valid: false, error: 'Domain must be a non-empty string' };
    }
    
    // Remove protocol and www if present
    let cleanDomain = domain.trim()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '');
    
    // Basic domain validation
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    if (!domainRegex.test(cleanDomain)) {
        return { valid: false, error: 'Invalid domain format' };
    }
    
    return { valid: true, domain: cleanDomain };
}

/**
 * Validate time duration
 */
function validateDuration(duration) {
    const num = parseInt(duration);
    if (isNaN(num) || num <= 0) {
        return { valid: false, error: 'Duration must be a positive number' };
    }
    if (num > 1440) {
        return { valid: false, error: 'Duration cannot exceed 1440 minutes (24 hours)' };
    }
    return { valid: true, duration: num };
}

/**
 * Format time in minutes to readable string
 */
function formatTime(minutes) {
    if (!minutes || minutes === 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
}

/**
 * Safe storage get with error handling
 */
async function safeStorageGet(keys) {
    try {
        return await chrome.storage.local.get(keys);
    } catch (error) {
        console.error('Storage get error:', error);
        return {};
    }
}

/**
 * Safe storage set with error handling
 */
async function safeStorageSet(items) {
    try {
        await chrome.storage.local.set(items);
        return { success: true };
    } catch (error) {
        console.error('Storage set error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Check if blocking is active
 */
async function isBlockingActive() {
    try {
        const result = await chrome.storage.local.get(['isBlocking', 'blockUntil']);
        if (result.isBlocking && result.blockUntil) {
            return Date.now() < result.blockUntil;
        }
        return false;
    } catch (error) {
        console.error('Error checking block status:', error);
        return false;
    }
}

/**
 * Get remaining block time in minutes
 */
async function getRemainingBlockTime() {
    try {
        const result = await chrome.storage.local.get(['blockUntil']);
        if (result.blockUntil) {
            const remaining = Math.max(0, Math.floor((result.blockUntil - Date.now()) / 1000 / 60));
            return remaining;
        }
        return 0;
    } catch (error) {
        console.error('Error getting remaining time:', error);
        return 0;
    }
}

/**
 * Show notification
 */
function showNotification(title, message, type = 'basic') {
    if (chrome.notifications) {
        chrome.notifications.create({
            type: type,
            iconUrl: chrome.runtime.getURL('icons/icon48.png'),
            title: title,
            message: message
        });
    }
}

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

