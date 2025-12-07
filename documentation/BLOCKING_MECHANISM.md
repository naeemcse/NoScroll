# Blocking Mechanism Documentation

## Overview

The extension blocks social media sites by injecting a content overlay that covers the newsfeed/content area while allowing other functionality (like messaging) to remain accessible.

## Blocking Strategy

### Not a Full Page Block

Unlike traditional blockers that redirect or block entire pages, this extension:
- ✅ Allows page to load normally
- ✅ Blocks only newsfeed/content areas
- ✅ Keeps navigation, messaging, profile accessible
- ✅ Shows motivational message overlay

### Why This Approach?

1. **User Experience**: Users can still access important features
2. **Flexibility**: Can message someone if needed
3. **Awareness**: User sees the site but content is blocked
4. **Effectiveness**: Prevents mindless scrolling

## Blocking Flow

### Step-by-Step Process

```
1. User navigates to blocked site (e.g., facebook.com)
   ↓
2. Background script (background.js) detects tab update
   ↓
3. Checks: isBlocking && site in blockedDomains
   ↓
4. Checks: site has temporary access?
   ↓
5. If no access:
   - Content script (content.js) injects
   - Finds newsfeed/content selectors
   - Creates black overlay
   - Displays motivational message
   - Hides content areas
   ↓
6. If has access:
   - Page loads normally
   - Time tracking starts
```

## Content Script Injection

### When Content Script Runs

- **Timing**: `document_idle` (after DOM loads)
- **Scope**: All URLs (`<all_urls>`)
- **Frame**: Main frame only (not iframes)

### Injection Process

```javascript
// 1. Check blocking state
const result = await chrome.storage.local.get(['isBlocking', 'blockedDomains', 'siteAccess']);

// 2. Verify site is blocked
const isBlocked = blockedDomains.some(domain => hostname.includes(domain));

// 3. Check access permissions
const hasAccess = siteAccess[domain] && (
  siteAccess[domain].allowedUntil === null || // Forever
  Date.now() < siteAccess[domain].allowedUntil // Temporary
);

// 4. If blocked and no access: Inject overlay
if (isBlocked && !hasAccess) {
  blockContentArea();
}
```

## Site-Specific Selectors

### Facebook

```javascript
selectors: [
  '[role="main"]',
  '[role="feed"]',
  'div[data-pagelet="FeedUnit"]',
  'div[data-pagelet="Stories"]',
  'div[role="feed"]'
]
```

### Instagram

```javascript
selectors: [
  'article',
  'main[role="main"]',
  'div[role="dialog"]',
  'section main'
]
```

### Twitter/X

```javascript
selectors: [
  '[data-testid="primaryColumn"]',
  '[data-testid="tweet"]',
  'section[role="region"]'
]
```

### YouTube

```javascript
selectors: [
  '#contents',
  '#primary',
  '#secondary',
  'ytd-browse[page-subtype="home"]',
  'ytd-rich-grid-renderer'
]
```

### LinkedIn

```javascript
selectors: [
  '.feed-container',
  '.feed-container__content',
  'div[data-test-id="feed-container"]'
]
```

### Reddit

```javascript
selectors: [
  '[data-testid="post-container"]',
  '.Post',
  'div[data-testid="subreddit-sidebar"]'
]
```

### TikTok

```javascript
selectors: [
  '[data-e2e="recommend-list-item"]',
  '.video-feed-item'
]
```

### Fallback Selectors

If site not in list, uses common patterns:
```javascript
[
  'main',
  '[role="main"]',
  '[role="feed"]',
  'article',
  '.feed',
  '#content',
  '.content'
]
```

## Overlay Implementation

### Overlay Structure

```html
<div id="social-media-blocker-overlay">
  <div class="icon">🚫</div>
  <div class="message">Motivational Message</div>
</div>
```

### Overlay Styling

```css
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
z-index: 999999;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
```

### Content Hiding

```javascript
// Hide content areas
contentSelectors.forEach(selector => {
  const elements = document.querySelectorAll(selector);
  elements.forEach(el => {
    el.style.display = 'none';
  });
});
```

## Dynamic Content Handling

### Mutation Observer

Sites load content dynamically (infinite scroll, etc.), so we use MutationObserver:

```javascript
const observer = new MutationObserver(() => {
  hideContent(); // Re-hide new content
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
```

### SPA Navigation

For Single Page Applications (React, Vue, etc.):

```javascript
let lastUrl = location.href;
const urlObserver = new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(blockContentArea, 500); // Re-block on navigation
  }
});
```

## Access Control System

### Temporary Access

When user grants access:
1. `siteAccess[domain]` is updated
2. `allowedUntil` timestamp set
3. Content script checks access
4. If valid: No blocking
5. If expired: Blocking resumes

### Forever Access

```javascript
siteAccess[domain] = {
  allowed: true,
  allowedUntil: null, // null = forever
  allowedAt: Date.now()
}
```

### Access Expiration

```javascript
// Check if access expired
if (access.allowedUntil && Date.now() >= access.allowedUntil) {
  // Access expired, block again
  delete siteAccess[domain];
}
```

## Blocking Rules Update

### When Rules Update

1. User enables/disables sites in settings
2. User adds custom sites
3. Extension initializes
4. Settings saved

### Update Process

```javascript
async function updateBlockingRules() {
  const result = await chrome.storage.local.get(['blockedSites', 'customSites']);
  const enabledSites = blockedSites.filter(site => site.enabled);
  const allBlockedDomains = [...enabledSites.map(s => s.domain), ...customSites];
  await chrome.storage.local.set({ blockedDomains: allBlockedDomains });
}
```

## Blocking States

### State 1: Blocking Active

- `isBlocking: true`
- `blockUntil: null` (forever) or timestamp
- Sites in `blockedDomains` are blocked
- Content overlay shown

### State 2: Blocking Inactive

- `isBlocking: false`
- No sites blocked
- All sites accessible
- No overlay shown

### State 3: Site Has Access

- `isBlocking: true` (global blocking active)
- `siteAccess[domain].allowed: true`
- This specific site not blocked
- Time tracking active

## Blocking Detection

### Tab Update Detection

```javascript
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && tab.url) {
    // Check if site should be blocked
    // Redirect or let content script handle
  }
});
```

### Content Script Detection

```javascript
// Runs on every page load
const result = await chrome.storage.local.get(['isBlocking', 'blockedDomains']);
if (result.isBlocking) {
  // Check if this site is blocked
  // Inject overlay if needed
}
```

## Motivational Messages

### Message Selection

```javascript
const messages = await chrome.storage.local.get(['motivationalMessages']);
const randomMessage = messages[Math.floor(Math.random() * messages.length)];
```

### Message Display

- Shown in overlay center
- Large, readable font
- White text on dark background
- Changes on each block

## Performance Optimization

### Efficient Selectors

- Use specific selectors when possible
- Avoid overly broad selectors
- Cache selector results
- Limit DOM queries

### Lazy Blocking

- Only block when needed
- Don't block extension pages
- Skip if already blocked
- Check access before blocking

### Memory Management

- Clean up observers on unload
- Remove overlays when not needed
- Limit mutation observer scope
- Clear intervals properly

## Edge Cases

### Multiple Tabs

- Each tab blocks independently
- No cross-tab interference
- Access granted per domain (not per tab)

### Incognito Mode

- Extension may be disabled
- Blocking may not work
- Depends on browser settings

### Extension Disabled

- No blocking occurs
- Content script doesn't run
- All sites accessible

### Site Structure Changes

- Selectors may break
- Fallback selectors used
- May need selector updates

## Troubleshooting

### Blocking Not Working

**Check:**
1. Extension enabled?
2. Site in blocked list?
3. Blocking active?
4. Content script loading?
5. Browser console errors?

**Solutions:**
- Reload extension
- Check blocked sites list
- Verify blocking is active
- Check content script injection
- Review console for errors

### Overlay Not Showing

**Check:**
1. Content script running?
2. Selectors correct?
3. Site structure changed?
4. CSS conflicts?

**Solutions:**
- Verify content script loaded
- Update selectors if needed
- Check for CSS conflicts
- Test with fallback selectors

### Partial Blocking

**Check:**
1. Selectors too specific?
2. Dynamic content not caught?
3. Mutation observer working?

**Solutions:**
- Add more selectors
- Check mutation observer
- Increase observer scope
- Add delay for dynamic content

---

**See Also:**
- [Architecture](./ARCHITECTURE.md) - System design
- [Content Script](./API_REFERENCE.md#content-script) - Implementation details
- [Site Selectors](./API_REFERENCE.md#site-selectors) - Selector reference

