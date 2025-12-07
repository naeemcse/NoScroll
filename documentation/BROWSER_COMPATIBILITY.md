# Browser Compatibility

## Supported Browsers

### ✅ Fully Supported

**Chrome (Manifest V3)**
- Version: 88+
- Status: Fully functional
- Features: All features work

**Microsoft Edge (Chromium)**
- Version: 88+
- Status: Fully functional
- Features: All features work

**Brave Browser**
- Version: Latest
- Status: Fully functional
- Features: All features work

**Opera**
- Version: Latest (Chromium-based)
- Status: Fully functional
- Features: All features work

### ⚠️ Partial Support

**Firefox**
- Status: Requires modifications
- Issue: Uses Manifest V2
- Solution: Convert manifest.json
- Features: Most features work after conversion

**Safari**
- Status: Not supported
- Issue: Different extension system
- Solution: Would need separate implementation
- Features: N/A

## Manifest Version

### Current: Manifest V3

- Required for Chrome 88+
- Uses service workers
- Modern API structure
- Better performance

### For Firefox: Manifest V2

Would need:
- Background page instead of service worker
- Different API calls
- Modified manifest structure

## Feature Compatibility

### Chrome Storage API

✅ **Chrome/Edge/Brave/Opera**: Full support
⚠️ **Firefox**: Uses different storage API
❌ **Safari**: Different storage system

### Content Scripts

✅ **All Chromium browsers**: Full support
⚠️ **Firefox**: Similar but different API
❌ **Safari**: Different implementation

### Tabs API

✅ **All Chromium browsers**: Full support
⚠️ **Firefox**: Similar API
❌ **Safari**: Different API

## Known Limitations

### Popup Width

- **Chrome**: Max ~800px (browser limit)
- **Edge**: Same as Chrome
- **Brave**: Same as Chrome
- **Opera**: Same as Chrome

### Incognito Mode

- **Chrome**: Works if enabled in settings
- **Edge**: Works if enabled in settings
- **Brave**: Works if enabled in settings
- **Opera**: Works if enabled in settings

### Mobile Browsers

- **Chrome Mobile**: Limited support
- **Edge Mobile**: Limited support
- **Safari Mobile**: Not supported

## Testing

### Tested Browsers

- ✅ Chrome 120+
- ✅ Edge 120+
- ✅ Brave Latest
- ⚠️ Firefox (not tested, needs conversion)
- ❌ Safari (not supported)

### Test Checklist

For each browser:
- [ ] Extension loads
- [ ] Blocking works
- [ ] Access control works
- [ ] Statistics display
- [ ] Settings save
- [ ] Charts render

## Migration Notes

### From Manifest V2 to V3

If converting for Firefox:
1. Change `manifest_version` to 2
2. Replace `service_worker` with `background.scripts`
3. Update API calls
4. Test thoroughly

### Cross-Browser Considerations

- Use standard Chrome APIs
- Avoid browser-specific features
- Test in multiple browsers
- Handle API differences

## Recommendations

### For Users

- Use Chrome, Edge, or Brave for best experience
- Firefox users: Wait for V2 conversion or use Chromium browser
- Safari users: Use Chrome or Edge

### For Developers

- Develop in Chrome first
- Test in Edge and Brave
- Consider Firefox conversion if needed
- Document browser-specific issues

---

**See Also:**
- [Architecture](./ARCHITECTURE.md) - System design
- [Development](./DEVELOPMENT.md) - Development guide
- [Chrome Extensions Docs](https://developer.chrome.com/docs/extensions/)

