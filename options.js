const defaultSites = [
    { name: 'Facebook', domain: 'facebook.com', enabled: true },
    { name: 'Instagram', domain: 'instagram.com', enabled: true },
    { name: 'Twitter', domain: 'twitter.com', enabled: true },
    { name: 'LinkedIn', domain: 'linkedin.com', enabled: true },
    { name: 'TikTok', domain: 'tiktok.com', enabled: true },
    { name: 'YouTube', domain: 'youtube.com', enabled: true },
    { name: 'Reddit', domain: 'reddit.com', enabled: true },
    { name: 'Snapchat', domain: 'snapchat.com', enabled: true },
    { name: 'Pinterest', domain: 'pinterest.com', enabled: true },
    { name: 'WhatsApp Web', domain: 'web.whatsapp.com', enabled: true }
];

const defaultMessages = [
    "You're stronger than this distraction! 💪",
    "Focus on your goals, not your feed! 🎯",
    "Every moment away is progress! ✨",
    "Your future self will thank you! 🙏",
    "Stay focused, stay productive! 🚀",
    "You've got this! Keep going! 💯",
    "Time is precious - use it wisely! ⏰",
    "Distraction is temporary, success is permanent! 🌟"
];

document.addEventListener('DOMContentLoaded', async () => {
    const sitesList = document.getElementById('sitesList');
    const messagesList = document.getElementById('messagesList');
    const customSitesList = document.getElementById('customSitesList');
    const newMessageInput = document.getElementById('newMessage');
    const addMessageBtn = document.getElementById('addMessage');
    const customSiteInput = document.getElementById('customSite');
    const addCustomSiteBtn = document.getElementById('addCustomSite');
    const saveSettingsBtn = document.getElementById('saveSettings');
    const resetSettingsBtn = document.getElementById('resetSettings');

    // Load settings
    const loadSettings = async () => {
        try {
            const result = await safeStorageGet(['blockedSites', 'motivationalMessages', 'customSites']);
            
            const sites = result.blockedSites || defaultSites;
            const messages = result.motivationalMessages || defaultMessages;
            const customSites = result.customSites || [];

            renderSites(sites);
            renderMessages(messages);
            renderCustomSites(customSites);
        } catch (error) {
            console.error('Load settings error:', error);
            alert('Failed to load settings. Using defaults.');
            renderSites(defaultSites);
            renderMessages(defaultMessages);
            renderCustomSites([]);
        }
    };

    const renderSites = (sites) => {
        sitesList.innerHTML = '';
        sites.forEach(site => {
            const item = document.createElement('div');
            item.className = 'site-item';
            item.innerHTML = `
                <input type="checkbox" id="site-${site.domain}" ${site.enabled ? 'checked' : ''} data-domain="${site.domain}">
                <label for="site-${site.domain}">${site.name}</label>
            `;
            sitesList.appendChild(item);
        });
    };

    const renderMessages = (messages) => {
        messagesList.innerHTML = '';
        messages.forEach((message, index) => {
            const item = document.createElement('div');
            item.className = 'message-item';
            item.innerHTML = `
                <span>${message}</span>
                <button class="remove-message" data-index="${index}">Remove</button>
            `;
            messagesList.appendChild(item);
        });

        // Add remove listeners
        document.querySelectorAll('.remove-message').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                try {
                    const index = parseInt(e.target.dataset.index);
                    const result = await safeStorageGet(['motivationalMessages']);
                    const messages = result.motivationalMessages || defaultMessages;
                    messages.splice(index, 1);
                    const setResult = await safeStorageSet({ motivationalMessages: messages });
                    if (setResult.success) {
                        renderMessages(messages);
                    } else {
                        alert('Failed to remove message. Please try again.');
                    }
                } catch (error) {
                    console.error('Remove message error:', error);
                    alert('An error occurred. Please try again.');
                }
            });
        });
    };

    const renderCustomSites = (customSites) => {
        customSitesList.innerHTML = '';
        customSites.forEach((site, index) => {
            const item = document.createElement('div');
            item.className = 'custom-site-item';
            item.innerHTML = `
                <span>${site}</span>
                <button class="remove-custom-site" data-index="${index}">Remove</button>
            `;
            customSitesList.appendChild(item);
        });

        // Add remove listeners
        document.querySelectorAll('.remove-custom-site').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                try {
                    const index = parseInt(e.target.dataset.index);
                    const result = await safeStorageGet(['customSites']);
                    const customSites = result.customSites || [];
                    customSites.splice(index, 1);
                    const setResult = await safeStorageSet({ customSites: customSites });
                    if (setResult.success) {
                        renderCustomSites(customSites);
                    } else {
                        alert('Failed to remove site. Please try again.');
                    }
                } catch (error) {
                    console.error('Remove custom site error:', error);
                    alert('An error occurred. Please try again.');
                }
            });
        });
    };

    addMessageBtn.addEventListener('click', async () => {
        try {
            const message = newMessageInput.value.trim();
            if (message) {
                if (message.length > 200) {
                    alert('Message is too long. Please keep it under 200 characters.');
                    return;
                }
                const result = await safeStorageGet(['motivationalMessages']);
                const messages = result.motivationalMessages || defaultMessages;
                messages.push(message);
                const setResult = await safeStorageSet({ motivationalMessages: messages });
                if (setResult.success) {
                    renderMessages(messages);
                    newMessageInput.value = '';
                } else {
                    alert('Failed to add message. Please try again.');
                }
            }
        } catch (error) {
            console.error('Add message error:', error);
            alert('An error occurred. Please try again.');
        }
    });

    newMessageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addMessageBtn.click();
        }
    });

    addCustomSiteBtn.addEventListener('click', async () => {
        try {
            let site = customSiteInput.value.trim();
            if (site) {
                const validation = validateDomain(site);
                if (!validation.valid) {
                    alert(validation.error);
                    return;
                }
                
                const result = await safeStorageGet(['customSites']);
                const customSites = result.customSites || [];
                if (!customSites.includes(validation.domain)) {
                    customSites.push(validation.domain);
                    const setResult = await safeStorageSet({ customSites: customSites });
                    if (setResult.success) {
                        renderCustomSites(customSites);
                        customSiteInput.value = '';
                    } else {
                        alert('Failed to add site. Please try again.');
                    }
                } else {
                    alert('This site is already in the list!');
                }
            }
        } catch (error) {
            console.error('Add custom site error:', error);
            alert('An error occurred. Please try again.');
        }
    });

    customSiteInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addCustomSiteBtn.click();
        }
    });

    saveSettingsBtn.addEventListener('click', async () => {
        try {
            // Get all site checkboxes
            const checkboxes = document.querySelectorAll('#sitesList input[type="checkbox"]');
            const sites = Array.from(checkboxes).map(cb => ({
                name: cb.nextElementSibling.textContent,
                domain: cb.dataset.domain,
                enabled: cb.checked
            }));

            const setResult = await safeStorageSet({ blockedSites: sites });
            
            if (setResult.success) {
                // Reload blocking rules
                chrome.runtime.sendMessage({ action: 'updateBlockingRules' }).catch(err => console.error('Message error:', err));
                alert('Settings saved successfully!');
            } else {
                alert('Failed to save settings. Please try again.');
            }
        } catch (error) {
            console.error('Save settings error:', error);
            alert('An error occurred while saving. Please try again.');
        }
    });

    resetSettingsBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            try {
                const setResult = await safeStorageSet({
                    blockedSites: defaultSites,
                    motivationalMessages: defaultMessages,
                    customSites: []
                });
                
                if (setResult.success) {
                    loadSettings();
                    chrome.runtime.sendMessage({ action: 'updateBlockingRules' }).catch(err => console.error('Message error:', err));
                } else {
                    alert('Failed to reset settings. Please try again.');
                }
            } catch (error) {
                console.error('Reset settings error:', error);
                alert('An error occurred. Please try again.');
            }
        }
    });

    loadSettings();
});

