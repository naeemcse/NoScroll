# Social Media Eradicator - Chrome Extension

A powerful browser extension to help you block social media sites, track your usage, and stay focused with motivational messages.

## Features

### 🚫 Site Blocking
- Block popular social media sites (Facebook, Instagram, Twitter, LinkedIn, TikTok, YouTube, Reddit, and more)
- Add custom websites to block
- Set blocking duration (10 minutes, 30 minutes, 1 hour, 2 hours, 4 hours, 8 hours, 24 hours)
- Start/stop blocking anytime

### 💪 Motivational Messages
- Customizable motivational messages shown when blocked sites are accessed
- Random message display to keep you motivated
- Add, remove, and manage your own messages

### 📊 Usage Statistics
- Track daily, weekly, and monthly usage
- Interactive charts and graphs (bar charts)
- View time saved and blocks prevented
- Track your streak of productive days
- Export your data as JSON

### ⚙️ Settings
- Enable/disable specific social media sites
- Add custom websites to block
- Manage motivational messages
- Reset to defaults

## Installation

### For Chrome/Edge/Brave (Chromium-based browsers)

1. Download or clone this repository
2. Open your browser and navigate to:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `eradicator` folder
6. The extension should now appear in your extensions list

### For Firefox

1. Firefox uses a different manifest format. You'll need to:
   - Convert manifest.json to manifest v2 format
   - Or use Firefox's WebExtensions API (most code should work with minor modifications)

## Usage

### Quick Start

1. Click the extension icon in your browser toolbar
2. Select a blocking duration from the dropdown
3. Click "Start Blocking"
4. When you try to access a blocked site, you'll see a motivational message

### Viewing Statistics

1. Click the extension icon
2. Click "View Statistics"
3. Switch between Daily, Weekly, and Monthly views
4. View your progress with interactive charts

### Customizing Settings

1. Click the extension icon
2. Click "Settings"
3. Configure:
   - Which sites to block
   - Motivational messages
   - Custom websites

## File Structure

```
eradicator/
├── manifest.json          # Extension manifest
├── popup.html             # Main popup interface
├── popup.css              # Popup styles
├── popup.js               # Popup functionality
├── options.html           # Settings page
├── options.css            # Settings styles
├── options.js             # Settings functionality
├── background.js          # Background service worker
├── content.js             # Content script for blocking
├── block.html             # Blocked site page
├── block.css              # Block page styles
├── block.js               # Block page functionality
├── stats.html             # Statistics page
├── stats.css              # Statistics styles
├── stats.js               # Statistics functionality
├── utils.js               # Utility functions
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # This file
```

## Permissions

The extension requires the following permissions:

- **storage**: To save your settings and usage statistics
- **tabs**: To detect and redirect blocked sites
- **webRequest**: To intercept and block site requests
- **alarms**: To automatically stop blocking after the set duration
- **host_permissions**: To access all URLs for blocking functionality

## Privacy

- All data is stored locally in your browser
- No data is sent to external servers
- You can export or clear your data anytime
- The extension works completely offline

## Troubleshooting

### Extension not blocking sites
- Make sure blocking is active (check the popup status)
- Verify the site is in your blocked list (Settings)
- Try refreshing the page or restarting the browser

### Statistics not updating
- Make sure you've accessed blocked sites while blocking is active
- Check browser console for errors (F12)
- Try clearing and resetting the extension

### Icons not showing
- Create the `icons` folder in the extension directory
- Add icon files: `icon16.png`, `icon48.png`, `icon128.png`
- You can use any 16x16, 48x48, and 128x128 pixel images

## Creating Icons

If you don't have icons, you can:

1. Use an online icon generator
2. Create simple icons with any image editor
3. Use placeholder images (the extension will work without them, but may show a default icon)

Recommended icon sizes:
- 16x16 pixels (icon16.png)
- 48x48 pixels (icon48.png)
- 128x128 pixels (icon128.png)

## Browser Compatibility

- ✅ Chrome (Manifest V3)
- ✅ Edge (Chromium-based)
- ✅ Brave
- ✅ Opera
- ⚠️ Firefox (requires manifest v2 conversion)
- ⚠️ Safari (requires different implementation)

## Development

### Making Changes

1. Edit the relevant files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

### Debugging

- Open browser DevTools (F12)
- Check the Console tab for errors
- Use the Extensions page to view service worker logs
- Check the Network tab for blocked requests

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## License

This project is open source and available for personal and commercial use.

## Support

For issues, questions, or suggestions, please open an issue on the repository.

---

**Stay focused, stay productive! 🚀**

