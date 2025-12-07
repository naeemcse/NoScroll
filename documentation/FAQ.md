# Frequently Asked Questions (FAQ)

## General Questions

### What is Social Media Eradicator?

A Chrome extension that helps you stay focused by blocking distracting social media sites. It shows motivational messages when you try to access blocked sites and tracks your usage.

### Is it free?

Yes, completely free and open source.

### Does it work offline?

Yes, the extension works completely offline. No internet connection needed after installation.

## Installation

### How do I install it?

1. Download the code
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extension folder

### Do I need to install anything else?

No, just load the extension folder. No Node.js, npm, or build tools needed.

### Can I install it from Chrome Web Store?

Currently only available as unpacked extension. Chrome Web Store submission may come later.

## Usage

### How do I block sites?

Sites are blocked by default. Just install and they're blocked automatically.

### How do I unblock a site temporarily?

1. Click extension icon
2. Find site in "Site Access Control"
3. Select duration
4. Click "Allow Access"

### Can I block sites forever?

Yes, select "Forever" when granting access. You can revoke it anytime.

### How do I add custom sites to block?

1. Click extension icon → Settings
2. Scroll to "Custom Sites"
3. Enter domain (e.g., `reddit.com`)
4. Click "Add Site"

## Blocking

### What gets blocked?

Only the newsfeed/content scrolling areas. Navigation, messaging, and profiles remain accessible.

### Why can I still see the site?

The page loads normally, but the newsfeed is covered with a black overlay and motivational message.

### Can I still message people?

Yes! Messaging features remain accessible. Only the feed is blocked.

### Does it block on mobile?

Works best on desktop browsers. Mobile support may be limited.

## Statistics

### How is time tracked?

Time is tracked when you grant access to a site. It counts from when you visit until you leave.

### Is the time accurate?

Generally within 1-2 minutes. It tracks in 1-minute intervals.

### Why is my time 0?

Time is only tracked when you grant access and actually use the site. If you never grant access, time stays at 0.

### Can I export my data?

Yes! Click "Export Data" in the Statistics page to download a JSON file.

### Can I clear my data?

Yes! Click "Clear All Data" in Statistics. This removes all usage statistics but keeps your settings.

## Privacy

### Where is my data stored?

All data is stored locally in your browser using Chrome Storage API. Nothing is sent to external servers.

### Does it use cookies?

No, the extension doesn't use cookies. All data is in browser storage.

### Can websites see my data?

No, extension storage is isolated. Websites cannot access it.

### Is my data sent anywhere?

No, all data stays in your browser. No external servers, no analytics, no tracking.

### Can I delete my data?

Yes, you can clear all statistics data anytime. Settings can also be reset.

## Technical

### What browsers does it support?

- Chrome (latest)
- Edge (Chromium-based)
- Brave
- Opera

Firefox and Safari require different implementations.

### Does it work in incognito mode?

Depends on browser settings. Some browsers disable extensions in incognito by default.

### Why do I see CSP errors?

If you see Content Security Policy errors, make sure Chart.js is loaded locally (not from CDN). This should be fixed in the current version.

### Why aren't charts showing?

1. Check if Chart.js loaded (browser console)
2. Verify you have usage data
3. Try reloading the extension
4. Check browser console for errors

## Troubleshooting

### Extension not blocking sites

**Solutions:**
1. Check extension is enabled
2. Verify site is in blocked list
3. Reload the extension
4. Check browser console for errors

### Access not working

**Solutions:**
1. Check access is granted in popup
2. Verify duration hasn't expired
3. Try revoking and re-granting
4. Reload the page

### Statistics not updating

**Solutions:**
1. Make sure you've granted access
2. Actually visit and use the site
3. Wait a few minutes
4. Check browser console

### Popup too small

**Solutions:**
1. Extension popup width is set to 850px
2. If still small, it may be browser limitation
3. Try maximizing browser window
4. Check if other extensions interfere

### Icons not showing

**Solutions:**
1. Add icon files to `icons/` folder
2. Name them: `icon16.png`, `icon48.png`, `icon128.png`
3. Reload extension
4. Extension works without icons (shows default)

## Customization

### Can I change the blocked sites?

Yes! Go to Settings and enable/disable sites or add custom ones.

### Can I customize messages?

Yes! Go to Settings → Motivational Messages to add/remove messages.

### Can I change the blocking duration?

Blocking is always on by default. You can grant temporary access for specific durations.

## Data

### How much data does it store?

Very little. Typical usage: < 1MB even after months of use.

### Does it slow down my browser?

No, minimal performance impact. All operations are async and efficient.

### Will it use a lot of memory?

No, very lightweight. Only tracks active sessions, which are cleared when tabs close.

## Advanced

### Can I modify the code?

Yes! It's open source. Feel free to modify for your needs.

### Can I contribute?

Yes! Contributions welcome. See [Development Guide](./DEVELOPMENT.md).

### How do I report bugs?

Open an issue on GitHub with:
- Browser and version
- Steps to reproduce
- Console errors (if any)
- Screenshots (if helpful)

### Can I request features?

Yes! Open an issue on GitHub with your feature request.

## Limitations

### Known Limitations

1. **Browser popup width**: Limited by browser (max ~800px)
2. **Time accuracy**: Within 1-2 minutes
3. **Dynamic content**: Some sites may need selector updates
4. **Mobile**: Limited mobile browser support

### What it CAN'T do

- Block sites completely (only newsfeed)
- Track time on non-blocked sites
- Sync across devices
- Block in other browsers automatically

## Support

### Where can I get help?

1. Check this FAQ
2. Read [User Guide](./USER_GUIDE.md)
3. Check [Architecture](./ARCHITECTURE.md) docs
4. Open GitHub issue

### Is there a community?

Currently no official community, but GitHub issues are welcome.

---

**See Also:**
- [User Guide](./USER_GUIDE.md) - Complete usage guide
- [Architecture](./ARCHITECTURE.md) - How it works
- [Development](./DEVELOPMENT.md) - For developers

