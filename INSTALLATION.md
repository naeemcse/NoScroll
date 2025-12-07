# Installation Guide

## Quick Start

1. **Download the Extension**
   - Make sure all files are in the `eradicator` folder

2. **Load in Chrome/Edge/Brave**
   - Open your browser
   - Go to `chrome://extensions/` (or `edge://extensions/` for Edge)
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `eradicator` folder
   - The extension should now appear!

3. **First Time Setup**
   - Click the extension icon in your toolbar
   - Review the default blocked sites (you can customize in Settings)
   - Add your own motivational messages (optional)
   - Start blocking!

## Adding Icons (Optional but Recommended)

The extension will work without icons, but adding them improves the appearance:

1. Create or download three icon images:
   - 16x16 pixels → save as `icons/icon16.png`
   - 48x48 pixels → save as `icons/icon48.png`
   - 128x128 pixels → save as `icons/icon128.png`

2. Place them in the `eradicator/icons/` folder

3. Reload the extension in `chrome://extensions/`

## Testing the Extension

1. **Test Blocking**
   - Start blocking with a short duration (10 minutes)
   - Try to visit a blocked site (e.g., facebook.com)
   - You should see the block page with a motivational message

2. **Test Settings**
   - Open Settings from the popup
   - Toggle sites on/off
   - Add a custom site
   - Add a motivational message
   - Save settings

3. **Test Statistics**
   - Visit some blocked sites while blocking is active
   - Open Statistics from the popup
   - Check that data appears in the charts

## Troubleshooting

### Extension Not Loading
- Check that all required files are present
- Check browser console for errors (F12)
- Make sure you're using a Chromium-based browser (Chrome, Edge, Brave)

### Sites Not Being Blocked
- Verify blocking is active (check popup status)
- Check that the site is in your blocked list (Settings)
- Try refreshing the page
- Check browser console for errors

### Statistics Not Updating
- Make sure you've accessed blocked sites while blocking is active
- Check browser console for errors
- Try clearing extension data and starting fresh

### Icons Not Showing
- Verify icon files are in `icons/` folder
- Check file names match exactly: `icon16.png`, `icon48.png`, `icon128.png`
- Reload the extension after adding icons

## Browser Compatibility

- ✅ Chrome 88+ (Manifest V3)
- ✅ Edge 88+ (Chromium-based)
- ✅ Brave (latest)
- ✅ Opera (latest)
- ⚠️ Firefox (requires manifest v2 conversion)
- ⚠️ Safari (not supported)

## Next Steps

1. Customize your blocked sites
2. Add personal motivational messages
3. Set up your preferred blocking durations
4. Start tracking your productivity!

---

**Need Help?** Check the main README.md for more details.

