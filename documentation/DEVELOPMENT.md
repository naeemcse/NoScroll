# Development Guide

## Setup

### Prerequisites

- Chrome, Edge, or Brave browser
- Text editor (VS Code, Sublime, etc.)
- Basic knowledge of JavaScript, HTML, CSS

### Getting the Code

```bash
# Clone repository
git clone https://github.com/naeemcse/NoScroll.git

# Navigate to extension folder
cd NoScroll/eradicator
```

### Loading in Browser

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `eradicator` folder

## Project Structure

```
eradicator/
├── manifest.json          # Extension manifest
├── popup.html/css/js      # Main popup
├── options.html/css/js    # Settings page
├── background.js          # Service worker
├── content.js             # Content script
├── block.html/css/js      # Block page
├── stats.html/css/js      # Statistics page
├── utils.js               # Utilities
├── chart.umd.min.js       # Chart.js library
└── icons/                 # Extension icons
```

## Development Workflow

### Making Changes

1. Edit files in your editor
2. Go to `chrome://extensions/`
3. Click reload icon on extension card
4. Test your changes

### Debugging

**Popup:**
- Right-click extension icon → "Inspect popup"
- Opens DevTools for popup

**Background Script:**
- Go to `chrome://extensions/`
- Click "service worker" link
- Opens DevTools for background

**Content Script:**
- Open DevTools on the webpage
- Console shows content script logs

**Options Page:**
- Right-click options page → "Inspect"
- Standard DevTools

### Testing

**Manual Testing:**
1. Test blocking on different sites
2. Test access granting/revoking
3. Test statistics display
4. Test settings changes

**Checklist:**
- [ ] Blocking works on all default sites
- [ ] Access control works
- [ ] Statistics update correctly
- [ ] Settings save properly
- [ ] No console errors

## Code Style

### JavaScript

- Use `async/await` for async operations
- Use `const` and `let` (no `var`)
- Use arrow functions where appropriate
- Add comments for complex logic

### CSS

- Use consistent naming (BEM-like)
- Mobile-responsive design
- Use CSS variables for colors
- Comment complex styles

### HTML

- Semantic HTML5
- Accessible markup
- Proper form labels
- ARIA attributes where needed

## Adding Features

### Adding a New Blocked Site

1. Edit `options.js`:
```javascript
const defaultSites = [
  // ... existing sites
  { name: 'NewSite', domain: 'newsite.com', enabled: true }
];
```

2. Add selectors in `content.js`:
```javascript
const selectors = {
  // ... existing
  'newsite.com': [
    'selector1',
    'selector2'
  ]
};
```

### Adding a New Chart

1. Add canvas to `stats.html`
2. Add chart function in `stats.js`
3. Update data processing
4. Style in `stats.css`

### Adding a New Setting

1. Add UI in `options.html`
2. Add handler in `options.js`
3. Store in `chrome.storage.local`
4. Use in relevant components

## Building

### No Build Step Required

- Extension works as-is
- No compilation needed
- No bundling required
- Just load the folder

### For Distribution

1. Test thoroughly
2. Update version in `manifest.json`
3. Create ZIP file
4. Submit to Chrome Web Store (if publishing)

## Version Management

### Version Number

Update in `manifest.json`:
```json
{
  "version": "1.0.0"
}
```

### Changelog

Document changes:
- New features
- Bug fixes
- Breaking changes
- Improvements

## Common Tasks

### Adding a New Utility Function

1. Add to `utils.js`
2. Export if needed
3. Import in files that use it
4. Document the function

### Updating Dependencies

**Chart.js:**
1. Download new version
2. Replace `chart.umd.min.js`
3. Test charts still work
4. Update version reference

### Modifying Blocking Logic

1. Edit `content.js` for overlay
2. Edit `background.js` for rules
3. Test on multiple sites
4. Verify access control works

## Debugging Tips

### Console Logging

```javascript
// Use console.log for debugging
console.log('Debug info:', data);

// Remove before committing
```

### Breakpoints

- Set breakpoints in DevTools
- Step through code
- Inspect variables
- Watch expressions

### Storage Inspection

```javascript
// In console
chrome.storage.local.get(null, (data) => {
  console.log('All data:', data);
});
```

## Testing Checklist

### Functionality

- [ ] Blocking works
- [ ] Access control works
- [ ] Statistics update
- [ ] Settings save
- [ ] Charts display
- [ ] Messages show

### Edge Cases

- [ ] Multiple tabs
- [ ] Tab switching
- [ ] Browser restart
- [ ] Extension reload
- [ ] Access expiration
- [ ] Empty data

### Browser Compatibility

- [ ] Chrome
- [ ] Edge
- [ ] Brave
- [ ] Different versions

## Performance

### Optimization Tips

1. **Minimize storage writes**: Batch operations
2. **Efficient selectors**: Use specific selectors
3. **Debounce updates**: Don't update too frequently
4. **Lazy loading**: Load data when needed

### Monitoring

- Check memory usage
- Monitor storage size
- Watch for leaks
- Profile performance

## Security

### Best Practices

1. **Validate input**: Always validate user input
2. **Sanitize data**: Clean data before storing
3. **Error handling**: Handle errors gracefully
4. **No eval()**: Never use eval()
5. **CSP compliant**: Follow CSP rules

## Contributing

### Pull Requests

1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit PR with description

### Code Review

- Follow code style
- Add comments
- Update documentation
- Test edge cases

## Resources

### Documentation

- [Chrome Extensions Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/)
- [Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)

### Tools

- Chrome DevTools
- Extension Reloader
- Storage Inspector

---

**See Also:**
- [Architecture](./ARCHITECTURE.md) - System design
- [API Reference](./API_REFERENCE.md) - Function docs
- [Data Storage](./DATA_STORAGE.md) - Storage details

