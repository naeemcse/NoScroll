// Content script to enhance blocking and show motivational messages

(async () => {
    // Check if we're on a blocked site
    const result = await chrome.storage.local.get(['isBlocking', 'blockedDomains']);
    
    if (result.isBlocking && result.blockedDomains) {
        const hostname = window.location.hostname.replace('www.', '');
        const isBlocked = result.blockedDomains.some(domain => hostname.includes(domain));
        
        if (isBlocked) {
            // Prevent page from loading
            document.documentElement.innerHTML = '';
            document.documentElement.style.display = 'none';
            
            // Redirect to block page
            window.location.href = chrome.runtime.getURL(`block.html?domain=${encodeURIComponent(hostname)}`);
        }
    }
})();

