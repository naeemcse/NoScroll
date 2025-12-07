# Content Security Policy (CSP) Documentation

## Overview

Chrome extensions enforce a strict Content Security Policy that restricts what scripts can run and where they can be loaded from. This document explains how the extension complies with CSP.

## CSP Restrictions

### What's Blocked

❌ **External Scripts**: Cannot load scripts from CDNs
❌ **Inline Scripts**: Cannot use `<script>` tags with code
❌ **eval()**: Cannot use `eval()` or similar functions
❌ **Remote Resources**: Limited external resource loading

### What's Allowed

✅ **Local Scripts**: Scripts from extension directory
✅ **Chrome APIs**: All Chrome extension APIs
✅ **Local Resources**: Files in extension package

## Our Implementation

### Chart.js Loading

**Problem**: Initially tried to load from CDN
```html
<!-- This violates CSP -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
```

**Solution**: Download and include locally
```html
<!-- CSP compliant -->
<script src="chart.umd.min.js"></script>
```

### No Inline Scripts

All JavaScript is in separate files:
- `popup.js`
- `options.js`
- `background.js`
- `content.js`
- `stats.js`
- `block.js`

### No eval()

Chart.js 4.4.0+ doesn't use `eval()`, making it CSP compliant.

## Manifest CSP

### Default CSP

Chrome extensions use this default CSP:
```
script-src 'self'; object-src 'self'
```

### Our Compliance

- All scripts from `'self'` (extension directory)
- No external scripts
- No inline scripts
- No eval()

## Common CSP Errors

### Error: "Refused to load script"

**Cause**: Trying to load external script

**Solution**: Include script locally

### Error: "Refused to execute inline script"

**Cause**: Inline `<script>` tag

**Solution**: Move to external file

### Error: "Refused to evaluate string as JavaScript"

**Cause**: Using `eval()` or similar

**Solution**: Use Chart.js 4.4.0+ (no eval)

## Best Practices

### For Developers

1. **Always include libraries locally**
2. **Never use inline scripts**
3. **Avoid eval() and similar**
4. **Test in extension context**

### Library Selection

- Choose CSP-compliant libraries
- Check library documentation
- Test in extension environment
- Have local fallback

## Troubleshooting CSP Issues

### Check Console

Look for CSP violation errors:
```
Refused to load script 'https://...' because it violates CSP
```

### Verify Scripts

1. Check all `<script>` tags
2. Ensure all scripts are local
3. Verify no inline scripts
4. Check for eval() usage

### Test Locally

1. Load extension unpacked
2. Check browser console
3. Look for CSP errors
4. Fix and reload

## Chart.js Specific

### Why Chart.js 4.4.0+

- Version 3.0.0+ removed eval()
- CSP compliant
- Works in extensions
- No external dependencies

### Loading Chart.js

```html
<!-- In stats.html -->
<script src="chart.umd.min.js"></script>
```

### Verifying Load

```javascript
// Check if loaded
if (typeof Chart !== 'undefined') {
  // Chart.js loaded
} else {
  console.error('Chart.js not loaded');
}
```

## Web Accessible Resources

### What They Are

Resources that can be loaded in web pages:
- `block.html`
- `stats.html`
- `chart.umd.min.js`

### Configuration

```json
{
  "web_accessible_resources": [
    {
      "resources": ["block.html", "stats.html", "chart.umd.min.js"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

## Security Benefits

### Why CSP Exists

- Prevents XSS attacks
- Blocks malicious scripts
- Protects user data
- Ensures extension security

### Our Compliance

- No security risks
- All code reviewed
- No external dependencies
- Local-only resources

---

**See Also:**
- [Architecture](./ARCHITECTURE.md) - System design
- [Development](./DEVELOPMENT.md) - Development guide
- [Chrome CSP Docs](https://developer.chrome.com/docs/extensions/mv3/content_security_policy/)

