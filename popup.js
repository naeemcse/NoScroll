document.addEventListener('DOMContentLoaded', async () => {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const statusDot = statusIndicator.querySelector('.status-dot');
    const toggleBlock = document.getElementById('toggleBlock');
    const blockDuration = document.getElementById('blockDuration');
    const todayTime = document.getElementById('todayTime');
    const todayBlocks = document.getElementById('todayBlocks');
    const viewStats = document.getElementById('viewStats');
    const openSettings = document.getElementById('openSettings');

    // Load current state
    const loadState = async () => {
        try {
            const result = await safeStorageGet(['isBlocking', 'blockUntil', 'todayStats']);
            
            if (result.isBlocking && result.blockUntil) {
                const now = Date.now();
                if (now < result.blockUntil) {
                    updateUI(true, result.blockUntil);
                } else {
                    // Block expired
                    await safeStorageSet({ isBlocking: false, blockUntil: null });
                    updateUI(false);
                }
            } else {
                updateUI(false);
            }

            // Update stats
            if (result.todayStats) {
                const minutes = result.todayStats.timeSaved || 0;
                const hours = Math.floor(minutes / 60);
                const mins = minutes % 60;
                todayTime.textContent = `${hours}h ${mins}m`;
                todayBlocks.textContent = result.todayStats.blocks || 0;
            } else {
                todayTime.textContent = '0h 0m';
                todayBlocks.textContent = '0';
            }
        } catch (error) {
            console.error('Load state error:', error);
            updateUI(false);
        }
    };

    const updateUI = (blocking, blockUntil = null) => {
        if (blocking) {
            statusDot.classList.add('active');
            statusText.textContent = 'Active';
            toggleBlock.textContent = 'Stop Blocking';
            toggleBlock.classList.add('blocking');
            
            if (blockUntil) {
                const remaining = Math.max(0, Math.floor((blockUntil - Date.now()) / 1000 / 60));
                if (remaining > 0) {
                    statusText.textContent = `Active (${remaining}m left)`;
                }
            }
        } else {
            statusDot.classList.remove('active');
            statusText.textContent = 'Inactive';
            toggleBlock.textContent = 'Start Blocking';
            toggleBlock.classList.remove('blocking');
        }
    };

    toggleBlock.addEventListener('click', async () => {
        try {
            const result = await safeStorageGet(['isBlocking']);
            
            if (result.isBlocking) {
                // Stop blocking
                await safeStorageSet({ isBlocking: false, blockUntil: null });
                updateUI(false);
                chrome.runtime.sendMessage({ action: 'stopBlocking' }).catch(err => console.error('Message error:', err));
            } else {
                // Start blocking
                const duration = parseInt(blockDuration.value);
                const validation = validateDuration(duration);
                
                if (!validation.valid) {
                    alert(validation.error);
                    return;
                }
                
                const blockUntil = Date.now() + (duration * 60 * 1000);
                const setResult = await safeStorageSet({ 
                    isBlocking: true, 
                    blockUntil: blockUntil,
                    blockDuration: duration 
                });
                
                if (setResult.success) {
                    updateUI(true, blockUntil);
                    chrome.runtime.sendMessage({ action: 'startBlocking', duration: duration }).catch(err => console.error('Message error:', err));
                } else {
                    alert('Failed to start blocking. Please try again.');
                }
            }
        } catch (error) {
            console.error('Toggle block error:', error);
            alert('An error occurred. Please try again.');
        }
    });

    viewStats.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('stats.html') });
    });

    openSettings.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    // Update every minute
    setInterval(loadState, 60000);
    loadState();
});

