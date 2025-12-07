document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const domain = urlParams.get('domain') || 'this site';
    
    const blockedDomain = document.getElementById('blockedDomain');
    const motivationalMessage = document.getElementById('motivationalMessage');
    const timeInfo = document.getElementById('timeInfo');
    const goBack = document.getElementById('goBack');
    const extendBlock = document.getElementById('extendBlock');
    const todayBlocks = document.getElementById('todayBlocks');
    const timeSaved = document.getElementById('timeSaved');

    blockedDomain.textContent = domain;

    // Load and display random motivational message
    const loadMessage = async () => {
        try {
            const result = await safeStorageGet(['motivationalMessages']);
            const messages = result.motivationalMessages || [
                "You're stronger than this distraction! 💪",
                "Focus on your goals, not your feed! 🎯"
            ];
            if (messages.length > 0) {
                const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                motivationalMessage.textContent = randomMessage;
            } else {
                motivationalMessage.textContent = "Stay focused! 💪";
            }
        } catch (error) {
            console.error('Load message error:', error);
            motivationalMessage.textContent = "Stay focused! 💪";
        }
    };

    // Update time info
    const updateTimeInfo = async () => {
        try {
            const result = await safeStorageGet(['blockUntil']);
            if (result.blockUntil) {
                const remaining = Math.max(0, Math.floor((result.blockUntil - Date.now()) / 1000 / 60));
                if (remaining > 0) {
                    timeInfo.textContent = `Block active for ${formatTime(remaining)} more`;
                } else {
                    timeInfo.textContent = 'Block expired';
                }
            } else {
                timeInfo.textContent = '';
            }
        } catch (error) {
            console.error('Update time info error:', error);
        }
    };

    // Update stats
    const updateStats = async () => {
        try {
            const result = await safeStorageGet(['todayStats']);
            if (result.todayStats) {
                todayBlocks.textContent = result.todayStats.blocks || 0;
                const minutes = result.todayStats.timeSaved || 0;
                timeSaved.textContent = formatTime(minutes);
            } else {
                todayBlocks.textContent = '0';
                timeSaved.textContent = '0m';
            }
        } catch (error) {
            console.error('Update stats error:', error);
        }
    };

    goBack.addEventListener('click', () => {
        window.history.back();
    });

    extendBlock.addEventListener('click', async () => {
        try {
            const duration = prompt('Extend block for how many minutes?', '30');
            if (duration && !isNaN(duration)) {
                const validation = validateDuration(parseInt(duration));
                if (!validation.valid) {
                    alert(validation.error);
                    return;
                }
                
                const result = await safeStorageGet(['blockUntil']);
                const currentUntil = result.blockUntil || Date.now();
                const newUntil = currentUntil + (parseInt(duration) * 60 * 1000);
                const setResult = await safeStorageSet({ blockUntil: newUntil });
                
                if (setResult.success) {
                    chrome.runtime.sendMessage({ action: 'startBlocking', duration: parseInt(duration) }).catch(err => console.error('Message error:', err));
                    updateTimeInfo();
                } else {
                    alert('Failed to extend block. Please try again.');
                }
            }
        } catch (error) {
            console.error('Extend block error:', error);
            alert('An error occurred. Please try again.');
        }
    });

    loadMessage();
    updateTimeInfo();
    updateStats();

    // Update time info every minute
    setInterval(updateTimeInfo, 60000);
});

