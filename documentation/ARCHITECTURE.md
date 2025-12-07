# Architecture Documentation

## System Overview

Social Media Eradicator is a Chrome extension built with Manifest V3 that blocks social media sites and tracks usage. The architecture consists of multiple components working together.

## Component Architecture

```
┌─────────────────────────────────────────────────┐
│           Extension Components                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐    ┌──────────────┐          │
│  │   Popup UI   │    │  Options UI  │          │
│  │  (popup.html)│    │(options.html)│          │
│  └──────┬───────┘    └──────┬───────┘          │
│         │                   │                   │
│         └─────────┬─────────┘                   │
│                   │                             │
│         ┌─────────▼─────────┐                   │
│         │  Background Script │                   │
│         │  (background.js)  │                   │
│         └─────────┬─────────┘                   │
│                   │                             │
│         ┌─────────▼─────────┐                   │
│         │  Content Script   │                   │
│         │   (content.js)   │                   │
│         └──────────────────┘                   │
│                                                 │
│  ┌──────────────────────────────────────┐      │
│  │     Chrome Storage API               │      │
│  │     (chrome.storage.local)           │      │
│  └──────────────────────────────────────┘      │
└─────────────────────────────────────────────────┘
```

## File Structure

```
eradicator/
├── manifest.json          # Extension configuration
├── popup.html/css/js      # Main popup interface
├── options.html/css/js    # Settings page
├── background.js          # Service worker
├── content.js             # Content script (injected)
├── block.html/css/js      # Blocked site page
├── stats.html/css/js      # Statistics page
├── utils.js               # Utility functions
├── chart.umd.min.js       # Chart.js library
└── icons/                 # Extension icons
```

## Component Details

### 1. Manifest (manifest.json)

**Purpose**: Extension configuration and permissions

**Key Features**:
- Manifest V3 format
- Defines permissions (storage, tabs, alarms)
- Registers service worker
- Configures content scripts
- Sets up web accessible resources

**Permissions**:
- `storage`: Access to chrome.storage.local
- `tabs`: Read tab URLs and update tabs
- `alarms`: Schedule blocking expiration

### 2. Background Service Worker (background.js)

**Purpose**: Core blocking logic and data management

**Responsibilities**:
- Initialize default settings
- Update blocking rules
- Track site visits and usage
- Handle tab updates
- Manage site access permissions
- Process usage statistics

**Key Functions**:
- `updateBlockingRules()`: Updates list of blocked domains
- `trackVisit()`: Records blocked visit attempts
- `trackUsage()`: Records allowed site usage
- `trackTimeSpent()`: Calculates time spent on sites
- `trackEntryAttempt()`: Logs entry attempts

**Lifecycle**:
- Runs when extension starts
- Persists across browser sessions
- Handles messages from popup/options
- Monitors tab updates

### 3. Content Script (content.js)

**Purpose**: Inject blocking overlay on blocked sites

**Responsibilities**:
- Check if site should be blocked
- Verify access permissions
- Inject black overlay on newsfeed
- Display motivational messages
- Track time spent on allowed sites

**Execution**:
- Runs at `document_idle`
- Executes on all URLs
- Checks blocking state from storage
- Applies site-specific selectors

**Blocking Method**:
1. Check if blocking is active
2. Check if site is in blocked list
3. Check if site has temporary access
4. If blocked: Inject overlay
5. If allowed: Track time spent

### 4. Popup Interface (popup.html/js/css)

**Purpose**: Main user interface

**Features**:
- Display blocking status
- Show today's usage statistics
- Site access control (allow/revoke)
- Quick actions (stats, settings)

**Data Flow**:
```
User clicks icon
    ↓
Popup opens
    ↓
Loads state from storage
    ↓
Displays current status
    ↓
User interacts (allow access, etc.)
    ↓
Updates storage
    ↓
Sends message to background
```

### 5. Options Page (options.html/js/css)

**Purpose**: Configuration interface

**Features**:
- Enable/disable blocked sites
- Add custom sites
- Manage motivational messages
- Reset to defaults

**Settings Managed**:
- Blocked sites list
- Custom sites
- Motivational messages
- All preferences

### 6. Statistics Page (stats.html/js/css)

**Purpose**: Usage analytics and visualization

**Features**:
- Daily/Weekly/Monthly views
- Interactive charts (Chart.js)
- Website usage breakdown
- Data export
- Data clearing

**Charts**:
1. Time-based chart (days/weeks/months)
2. Website usage chart (domains vs time)

### 7. Block Page (block.html/js/css)

**Purpose**: Display when site is blocked

**Features**:
- Motivational message
- Blocked domain display
- Time remaining info
- Allow access option
- Extend block option

## Data Flow

### Blocking Flow

```
User visits facebook.com
    ↓
Background: tab.onUpdated fires
    ↓
Check: isBlocking && site in blockedDomains
    ↓
Check: site has access?
    ↓
If no access:
    Content script injects overlay
    Show motivational message
    Track entry attempt
    ↓
If has access:
    Allow page to load
    Start time tracking
    Track visit
```

### Access Grant Flow

```
User clicks "Allow Access" in popup
    ↓
Select duration (5min, 10min, etc.)
    ↓
Update siteAccess in storage
    ↓
Reload affected tabs
    ↓
Content script detects access
    ↓
Start time tracking
    ↓
Page becomes accessible
```

### Time Tracking Flow

```
Site has access granted
    ↓
Content script: startTimeTracking()
    ↓
Record startTime
    ↓
Every 60 seconds:
    Add 1 minute to domainUsage[domain]
    Update storage
    ↓
On page unload:
    Calculate remaining time
    Add to domainUsage[domain]
    Remove active session
    Update total timeSpent
```

## Communication Patterns

### Popup ↔ Background

```javascript
// Popup sends message
chrome.runtime.sendMessage({ 
  action: 'startBlocking', 
  duration: 30 
});

// Background receives
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startBlocking') {
    // Handle action
  }
});
```

### Content Script ↔ Storage

```javascript
// Content script reads
const result = await chrome.storage.local.get(['isBlocking', 'blockedDomains']);

// Content script writes (via background)
chrome.runtime.sendMessage({ action: 'trackVisit', domain: 'facebook.com' });
```

### Options ↔ Background

```javascript
// Options updates storage
await chrome.storage.local.set({ blockedSites: sites });

// Notify background to update rules
chrome.runtime.sendMessage({ action: 'updateBlockingRules' });
```

## Storage Architecture

### Data Organization

```
chrome.storage.local
├── Configuration
│   ├── blockedSites
│   ├── customSites
│   ├── motivationalMessages
│   └── siteAccess
├── State
│   ├── isBlocking
│   ├── blockUntil
│   └── blockedDomains
└── Statistics
    ├── usageStats (by date)
    └── todayStats (summary)
```

### Data Access Patterns

**Read Pattern**:
```javascript
const result = await chrome.storage.local.get(['key1', 'key2']);
```

**Write Pattern**:
```javascript
await chrome.storage.local.set({ key: value });
```

**Watch Pattern**:
```javascript
chrome.storage.onChanged.addListener((changes, area) => {
  // React to changes
});
```

## Security Architecture

### Content Security Policy

- **No inline scripts**: All scripts in separate files
- **No eval()**: Chart.js 4.4.0+ (no eval)
- **No external scripts**: Chart.js included locally
- **Self-only**: Scripts from extension only

### Permission Model

- **Minimal permissions**: Only what's needed
- **No broad permissions**: Specific host permissions
- **User control**: User can revoke access anytime

### Data Isolation

- **Extension-only storage**: Not accessible by websites
- **No cross-origin access**: Data stays in extension
- **No network transmission**: All data local

## Performance Considerations

### Background Script

- **Event-driven**: Only runs when needed
- **Lightweight**: Minimal memory footprint
- **Efficient storage**: Batch operations when possible

### Content Script

- **Lazy loading**: Only runs on blocked sites
- **Minimal DOM manipulation**: Efficient selectors
- **Debounced updates**: Avoid excessive storage writes

### Storage Operations

- **Async operations**: Never block UI
- **Batch reads**: Get multiple keys at once
- **Selective writes**: Only update changed data

## Error Handling

### Storage Errors

```javascript
try {
  await chrome.storage.local.set({ data });
} catch (error) {
  console.error('Storage error:', error);
  // Fallback behavior
}
```

### Message Errors

```javascript
chrome.runtime.sendMessage({ action: 'update' })
  .catch(err => console.error('Message error:', err));
```

### Chart Errors

```javascript
if (typeof Chart === 'undefined') {
  console.error('Chart.js not loaded');
  return;
}
```

## Extension Lifecycle

### Installation

1. Extension installed
2. `onInstalled` event fires
3. Default settings initialized
4. Blocking enabled by default
5. Rules updated

### Startup

1. Browser starts
2. Background script initializes
3. Loads state from storage
4. Updates blocking rules
5. Ready to block sites

### Update

1. Extension updated
2. `onInstalled` fires with `reason: 'update'`
3. Migrate data if needed
4. Update blocking rules
5. Preserve user settings

### Uninstall

1. Extension removed
2. All data deleted (browser behavior)
3. No cleanup needed

## Browser APIs Used

### Chrome Extension APIs

- `chrome.storage.local`: Data storage
- `chrome.tabs`: Tab management
- `chrome.runtime`: Messaging
- `chrome.alarms`: Scheduling

### Web APIs

- `localStorage`: Not used (use chrome.storage instead)
- `fetch`: Not used (no network requests)
- `DOM APIs`: Content manipulation
- `Canvas API`: Chart rendering

## Dependencies

### External Libraries

- **Chart.js 4.4.0**: Chart visualization
  - Included locally (chart.umd.min.js)
  - No CDN dependency
  - CSP compliant

### No Other Dependencies

- Pure JavaScript
- No build tools required
- No package manager needed

## Scalability

### Current Limits

- **Storage**: ~10MB (sufficient for years)
- **Blocked sites**: Unlimited
- **Custom sites**: Unlimited
- **Messages**: Unlimited
- **Statistics**: Unlimited days

### Performance

- **Fast**: All operations async
- **Lightweight**: Minimal resource usage
- **Responsive**: UI never blocks

## Future Architecture Considerations

Potential improvements:
- Background sync for settings
- Cross-device sync (optional)
- More efficient data structures
- Compression for old data
- IndexedDB for large datasets

---

**See Also:**
- [Data Storage](./DATA_STORAGE.md) - Storage details
- [Time Tracking](./TIME_TRACKING.md) - Tracking mechanism
- [API Reference](./API_REFERENCE.md) - Function docs

