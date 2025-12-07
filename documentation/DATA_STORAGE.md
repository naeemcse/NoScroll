# Data Storage Documentation

## Overview

Social Media Eradicator uses **Chrome Storage API (chrome.storage.local)** to store all data locally in your browser. No data is sent to external servers, and no cookies are used for data storage.

## Storage Mechanism

### Chrome Storage API

The extension uses `chrome.storage.local`, which is:
- **Local-only**: Data never leaves your browser
- **Persistent**: Survives browser restarts
- **Isolated**: Only accessible by this extension
- **Quota**: ~10MB limit (more than sufficient for usage data)

### Why Not Cookies?

- Cookies are sent with every HTTP request (privacy concern)
- Limited storage capacity (~4KB per cookie)
- Can be accessed by websites (security risk)
- Not suitable for structured data

### Why Not localStorage?

- `localStorage` is accessible by websites (XSS vulnerability)
- `chrome.storage.local` is extension-only (more secure)
- Better API for async operations
- Automatic sync capabilities (if needed in future)

## Data Structure

### Main Storage Keys

```javascript
{
  // Blocking state
  "isBlocking": boolean,           // Whether blocking is active
  "blockUntil": number,             // Timestamp when block expires (null = forever)
  "blockDuration": number,          // Duration in minutes
  
  // Site configuration
  "blockedSites": Array<{          // List of blocked sites
    name: string,                   // Display name
    domain: string,                // Domain to block
    enabled: boolean               // Whether site is enabled
  }>,
  "customSites": Array<string>,     // Custom domains to block
  "blockedDomains": Array<string>,   // All enabled domains (computed)
  
  // Site access control
  "siteAccess": {                  // Temporary access permissions
    [domain]: {
      allowed: boolean,
      allowedUntil: number|null,    // Timestamp or null for forever
      allowedAt: number            // When access was granted
    }
  },
  
  // Motivational messages
  "motivationalMessages": Array<string>,  // Custom messages
  
  // Usage statistics
  "usageStats": {                  // Daily usage data
    [dateString]: {
      visits: number,              // Number of visits
      timeSpent: number,            // Total time in minutes
      blocks: number,              // Number of blocks
      breaks: number,              // Number of breaks taken
      entryAttempts: Array<{       // Entry attempt log
        domain: string,
        timestamp: number,
        blocked: boolean,
        allowed: boolean
      }>,
      activeSessions: {            // Active browsing sessions
        [domain]: {
          startTime: number,
          domain: string
        }
      },
      domainUsage: {               // Time spent per domain
        [domain]: number           // Minutes spent
      }
    }
  },
  
  // Today's summary
  "todayStats": {
    timeSpent: number,             // Minutes spent today
    visits: number                 // Visits today
  }
}
```

## Data Lifecycle

### Initialization

On extension installation:
1. Default blocked sites are set
2. Default motivational messages are loaded
3. Blocking is enabled by default
4. Empty usage stats structure is initialized

### Daily Reset

- Data is **never automatically deleted**
- Each day gets its own entry in `usageStats`
- Old data accumulates (can be cleared manually)
- No expiration or cleanup policies

### Data Persistence

- Data persists across:
  - Browser restarts
  - Extension updates
  - Computer restarts
- Data is lost only when:
  - Extension is uninstalled
  - Browser data is cleared
  - User manually clears data

## Storage Locations

### Chrome/Edge/Brave
```
Windows: %LOCALAPPDATA%\Google\Chrome\User Data\Default\Local Extension Settings\[extension-id]
macOS: ~/Library/Application Support/Google/Chrome/Default/Local Extension Settings/[extension-id]
Linux: ~/.config/google-chrome/Default/Local Extension Settings/[extension-id]
```

### Storage Format

Data is stored in LevelDB format (binary), but accessed via Chrome Storage API as JSON.

## Data Access

### Reading Data

```javascript
// Get all data
const result = await chrome.storage.local.get(null);

// Get specific keys
const result = await chrome.storage.local.get(['usageStats', 'isBlocking']);

// Get single key
const result = await chrome.storage.local.get('usageStats');
```

### Writing Data

```javascript
// Set single value
await chrome.storage.local.set({ isBlocking: true });

// Set multiple values
await chrome.storage.local.set({
  isBlocking: true,
  blockUntil: Date.now() + 3600000
});
```

### Listening to Changes

```javascript
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    // Handle changes
    if (changes.isBlocking) {
      console.log('Blocking state changed:', changes.isBlocking.newValue);
    }
  }
});
```

## Data Privacy

### What is Stored?

✅ **Stored Locally:**
- Blocked site preferences
- Custom sites list
- Motivational messages
- Usage statistics (time spent, visits)
- Access permissions

❌ **NOT Stored:**
- Passwords
- Personal information
- Browsing history (only blocked site attempts)
- IP addresses
- Device information

### Data Sharing

- **No external servers**: All data stays in your browser
- **No analytics**: No usage data is sent anywhere
- **No tracking**: Extension doesn't track you
- **No cookies**: No cookies are set or read

### Data Export

Users can export their data:
- Click "Export Data" in Statistics page
- Downloads as JSON file
- Contains all usage statistics
- Can be imported (future feature)

### Data Deletion

Users can clear data:
- Click "Clear All Data" in Statistics page
- Confirmation dialog prevents accidental deletion
- Removes all usage statistics
- Settings remain intact

## Storage Quota

### Limits

- **Chrome Storage Local**: ~10MB
- **Typical Usage**: < 1MB for years of data
- **Per Key Limit**: ~8MB (JSON stringified)

### Optimization

- Data is stored efficiently
- Old entries are not automatically deleted
- Users can manually clear if needed
- No compression needed for typical usage

## Data Structure Examples

### Example: Daily Stats Entry

```json
{
  "Mon Dec 07 2025": {
    "visits": 5,
    "timeSpent": 45,
    "blocks": 12,
    "breaks": 2,
    "entryAttempts": [
      {
        "domain": "facebook.com",
        "timestamp": 1701964800000,
        "blocked": true,
        "allowed": false
      }
    ],
    "activeSessions": {
      "youtube.com": {
        "startTime": 1701965000000,
        "domain": "youtube.com"
      }
    },
    "domainUsage": {
      "facebook.com": 15,
      "youtube.com": 30,
      "twitter.com": 0
    }
  }
}
```

### Example: Site Access Entry

```json
{
  "siteAccess": {
    "facebook.com": {
      "allowed": true,
      "allowedUntil": 1701968400000,
      "allowedAt": 1701964800000
    },
    "youtube.com": {
      "allowed": true,
      "allowedUntil": null,
      "allowedAt": 1701965000000
    }
  }
}
```

## Best Practices

### For Developers

1. **Always use async/await** with storage operations
2. **Handle errors** gracefully
3. **Validate data** before storing
4. **Use safe defaults** if data is missing
5. **Don't store sensitive information**

### For Users

1. **Export data regularly** if you want backups
2. **Clear old data** if storage becomes an issue
3. **Review settings** periodically
4. **Understand** that data is local-only

## Troubleshooting

### Data Not Saving

- Check browser console for errors
- Verify extension has storage permission
- Check if storage quota is exceeded
- Try reloading the extension

### Data Lost

- Check if extension was uninstalled/reinstalled
- Verify browser data wasn't cleared
- Check if in incognito mode (data not persistent)
- Look for backup exports

### Storage Full

- Clear old usage statistics
- Remove unused custom sites
- Reduce motivational messages
- Export and clear data

## Security Considerations

1. **No External Access**: Data cannot be accessed by websites
2. **Extension-Only**: Only this extension can read/write data
3. **No Network**: Data never transmitted over network
4. **Local Encryption**: Browser handles encryption at OS level

## Migration Notes

If updating the extension:
- Old data format is automatically migrated
- Missing fields get default values
- No data loss during updates
- Backward compatible structure

---

**See Also:**
- [Time Tracking](./TIME_TRACKING.md) - How time is calculated
- [Architecture](./ARCHITECTURE.md) - System design
- [API Reference](./API_REFERENCE.md) - Storage API usage

