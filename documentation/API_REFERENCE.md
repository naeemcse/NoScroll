# API Reference Documentation

## Overview

This document provides detailed reference for all functions, APIs, and utilities used in the Social Media Eradicator extension.

## Chrome Extension APIs

### chrome.storage.local

#### Get Data

```javascript
// Get all data
const result = await chrome.storage.local.get(null);

// Get specific keys
const result = await chrome.storage.local.get(['isBlocking', 'blockedDomains']);

// Get single key
const result = await chrome.storage.local.get('usageStats');
```

#### Set Data

```javascript
// Set single value
await chrome.storage.local.set({ isBlocking: true });

// Set multiple values
await chrome.storage.local.set({
  isBlocking: true,
  blockUntil: Date.now() + 3600000
});
```

#### Listen to Changes

```javascript
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    for (let key in changes) {
      console.log(`${key} changed:`, changes[key].newValue);
    }
  }
});
```

### chrome.tabs

#### Query Tabs

```javascript
// Get all tabs
const tabs = await chrome.tabs.query({});

// Get active tab
const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

// Get tabs with specific URL
const tabs = await chrome.tabs.query({ url: '*://facebook.com/*' });
```

#### Update Tab

```javascript
// Update tab URL
await chrome.tabs.update(tabId, { url: 'https://example.com' });

// Reload tab
await chrome.tabs.reload(tabId);
```

#### Create Tab

```javascript
// Open new tab
await chrome.tabs.create({ url: 'https://example.com' });

// Open extension page
await chrome.tabs.create({ url: chrome.runtime.getURL('stats.html') });
```

### chrome.runtime

#### Send Message

```javascript
// Send message to background
chrome.runtime.sendMessage({ 
  action: 'startBlocking', 
  duration: 30 
}, (response) => {
  console.log('Response:', response);
});

// With async/await
const response = await chrome.runtime.sendMessage({ action: 'updateBlockingRules' });
```

#### Receive Message

```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startBlocking') {
    // Handle message
    sendResponse({ success: true });
  }
  return true; // Keep channel open for async response
});
```

#### Get URL

```javascript
// Get extension URL
const url = chrome.runtime.getURL('stats.html');
// Returns: chrome-extension://[id]/stats.html
```

### chrome.alarms

#### Create Alarm

```javascript
// Create alarm for blocking expiration
chrome.alarms.create('stopBlocking', { 
  when: Date.now() + (30 * 60 * 1000) // 30 minutes
});
```

#### Clear Alarm

```javascript
chrome.alarms.clear('stopBlocking');
```

#### Listen to Alarm

```javascript
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'stopBlocking') {
    // Handle alarm
  }
});
```

## Utility Functions (utils.js)

### validateDomain(domain)

Validates and cleans domain format.

**Parameters:**
- `domain` (string): Domain to validate

**Returns:**
```javascript
{
  valid: boolean,
  error?: string,
  domain?: string  // Cleaned domain
}
```

**Example:**
```javascript
const result = validateDomain('www.facebook.com');
// Returns: { valid: true, domain: 'facebook.com' }
```

### validateDuration(duration)

Validates time duration.

**Parameters:**
- `duration` (number): Duration in minutes

**Returns:**
```javascript
{
  valid: boolean,
  error?: string,
  duration?: number
}
```

**Example:**
```javascript
const result = validateDuration(30);
// Returns: { valid: true, duration: 30 }
```

### formatTime(minutes)

Formats minutes to readable string.

**Parameters:**
- `minutes` (number): Minutes to format

**Returns:** (string) Formatted time

**Examples:**
```javascript
formatTime(0)    // "0m"
formatTime(30)   // "30m"
formatTime(60)   // "1h"
formatTime(90)   // "1h 30m"
formatTime(120)  // "2h"
```

### safeStorageGet(keys)

Safely gets data from storage with error handling.

**Parameters:**
- `keys` (string|array): Key(s) to get

**Returns:** (Promise<object>) Storage data

**Example:**
```javascript
const result = await safeStorageGet(['isBlocking', 'blockedDomains']);
```

### safeStorageSet(items)

Safely sets data in storage with error handling.

**Parameters:**
- `items` (object): Data to set

**Returns:**
```javascript
{
  success: boolean,
  error?: string
}
```

**Example:**
```javascript
const result = await safeStorageSet({ isBlocking: true });
if (result.success) {
  // Success
}
```

### isBlockingActive()

Checks if blocking is currently active.

**Returns:** (Promise<boolean>)

**Example:**
```javascript
const active = await isBlockingActive();
if (active) {
  // Blocking is on
}
```

### getRemainingBlockTime()

Gets remaining block time in minutes.

**Returns:** (Promise<number>) Minutes remaining

**Example:**
```javascript
const remaining = await getRemainingBlockTime();
console.log(`${remaining} minutes left`);
```

## Background Script Functions

### updateBlockingRules()

Updates the list of blocked domains based on settings.

**Process:**
1. Gets blocked sites and custom sites
2. Filters enabled sites
3. Combines into single array
4. Stores in `blockedDomains`

**Example:**
```javascript
await updateBlockingRules();
```

### trackVisit(domain)

Tracks a blocked visit attempt.

**Parameters:**
- `domain` (string): Domain that was blocked

**Stores:**
- Entry attempt in `entryAttempts` array
- Timestamp and domain

### trackUsage(domain, isAllowed)

Tracks usage when access is allowed.

**Parameters:**
- `domain` (string): Domain being accessed
- `isAllowed` (boolean): Whether access was granted

**Stores:**
- Visit count
- Active session start time
- Entry attempt log

### trackTimeSpent(domain)

Calculates and stores time spent on a domain.

**Parameters:**
- `domain` (string): Domain to track

**Calculates:**
- Time from session start to now
- Adds to `domainUsage[domain]`
- Updates total `timeSpent`

### trackEntryAttempt(domain)

Logs when user tries to access blocked site.

**Parameters:**
- `domain` (string): Domain attempted

**Stores:**
- Timestamp
- Domain
- Blocked status

## Content Script Functions

### startTimeTracking(domain)

Starts tracking time spent on allowed site.

**Parameters:**
- `domain` (string): Domain to track

**Process:**
1. Records start time
2. Sets interval (every 60 seconds)
3. Updates `domainUsage` every minute
4. Calculates final time on unload

### blockContentArea()

Injects overlay and blocks content areas.

**Process:**
1. Gets site-specific selectors
2. Hides content elements
3. Creates overlay with message
4. Sets up mutation observer
5. Prevents scrolling

## Popup Functions

### loadState()

Loads current blocking state and statistics.

**Updates:**
- Status indicator
- Today's statistics
- UI state

### loadSiteAccessControls()

Loads and renders site access control list.

**Process:**
1. Gets blocked sites
2. Gets current access permissions
3. Renders list with status
4. Adds event listeners

### allowSiteAccess(domain, duration)

Grants temporary access to a site.

**Parameters:**
- `domain` (string): Domain to allow
- `duration` (string|number): Duration or 'forever'

**Process:**
1. Updates `siteAccess[domain]`
2. Sets `allowedUntil` timestamp
3. Reloads affected tabs
4. Tracks as break

### revokeSiteAccess(domain)

Revokes access to a site immediately.

**Parameters:**
- `domain` (string): Domain to revoke

**Process:**
1. Removes from `siteAccess`
2. Reloads affected tabs
3. Site becomes blocked again

## Statistics Functions

### processData(stats, view)

Processes usage statistics for chart display.

**Parameters:**
- `stats` (object): Raw usage stats
- `view` (string): 'daily', 'weekly', or 'monthly'

**Returns:** (array) Processed data points

### processWebsiteData(stats, filter)

Processes website usage data by domain.

**Parameters:**
- `stats` (object): Raw usage stats
- `filter` (string): 'today', '7days', or '30days'

**Returns:** (array) Website usage data

**Process:**
1. Determines date range
2. Aggregates `domainUsage` per domain
3. Sorts by time spent
4. Returns top 15

### updateChart(data)

Updates the time-based usage chart.

**Parameters:**
- `data` (array): Chart data points

**Chart Type:** Bar chart
**Axes:** Time on Y, dates on X

### updateWebsiteChart(data)

Updates the website usage chart.

**Parameters:**
- `data` (array): Website usage data

**Chart Type:** Horizontal bar chart
**Axes:** Websites on Y, time on X

## Message Actions

### Background Message Handlers

```javascript
// Start blocking
{ action: 'startBlocking', duration: number }

// Stop blocking
{ action: 'stopBlocking' }

// Update blocking rules
{ action: 'updateBlockingRules' }

// Track visit
{ action: 'trackVisit', domain: string }
```

## Storage Keys Reference

### Configuration Keys

- `blockedSites`: Array of site objects
- `customSites`: Array of domain strings
- `motivationalMessages`: Array of message strings
- `blockedDomains`: Array of enabled domains (computed)

### State Keys

- `isBlocking`: Boolean
- `blockUntil`: Number (timestamp) or null
- `blockDuration`: Number (minutes)
- `siteAccess`: Object mapping domain to access info

### Statistics Keys

- `usageStats`: Object mapping date to daily stats
- `todayStats`: Object with today's summary

## Error Handling Patterns

### Storage Errors

```javascript
try {
  await chrome.storage.local.set({ data });
} catch (error) {
  console.error('Storage error:', error);
  // Fallback or user notification
}
```

### Message Errors

```javascript
chrome.runtime.sendMessage({ action: 'update' })
  .catch(err => {
    console.error('Message error:', err);
    // Handle gracefully
  });
```

### Chart Errors

```javascript
if (typeof Chart === 'undefined') {
  console.error('Chart.js not loaded');
  // Show fallback UI
  return;
}
```

## Best Practices

### Async/Await

Always use async/await for storage operations:

```javascript
// Good
const result = await chrome.storage.local.get(['key']);

// Bad
chrome.storage.local.get(['key'], (result) => {
  // Callback hell
});
```

### Error Handling

Always handle errors:

```javascript
try {
  await operation();
} catch (error) {
  console.error('Error:', error);
  // User-friendly message
}
```

### Data Validation

Validate before storing:

```javascript
const validation = validateDomain(domain);
if (!validation.valid) {
  alert(validation.error);
  return;
}
```

---

**See Also:**
- [Architecture](./ARCHITECTURE.md) - System design
- [Data Storage](./DATA_STORAGE.md) - Storage details
- [Time Tracking](./TIME_TRACKING.md) - Tracking implementation

