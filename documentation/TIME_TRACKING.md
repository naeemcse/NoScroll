# Time Tracking Documentation

## Overview

The extension tracks time spent on blocked websites when access is granted. This document explains how time tracking works, how calculations are performed, and how data is aggregated.

## Time Tracking Mechanism

### When Time is Tracked

Time tracking occurs when:
1. User grants access to a blocked site (via popup)
2. Site becomes accessible (temporary or forever)
3. User actually visits and uses the site
4. User navigates away or closes the tab

### What is NOT Tracked

- Time when sites are blocked (no usage = no tracking)
- Time on non-blocked sites
- Time before extension installation
- Time in incognito mode (if extension disabled)

## Tracking Methods

### Method 1: Active Session Tracking

**Location**: `content.js` - `startTimeTracking()`

When a site has access granted:
1. Session start time is recorded when page loads
2. Timer runs every 60 seconds (1 minute intervals)
3. Each minute adds 1 minute to `domainUsage[domain]`
4. On page unload, remaining time is calculated and added

```javascript
// Start tracking when page loads
const startTime = Date.now();
const siteKey = domain.replace('www.', '').toLowerCase();

// Track every minute
setInterval(() => {
  stats[today].domainUsage[siteKey] += 1; // Add 1 minute
}, 60000);

// Final calculation on unload
const timeSpent = Math.floor((Date.now() - startTime) / 1000 / 60);
stats[today].domainUsage[siteKey] += timeSpent;
```

### Method 2: Background Tracking

**Location**: `background.js` - `trackUsage()`

When tab is updated:
1. Checks if site has access
2. Records visit count
3. Starts session tracking in storage
4. Updates when tab closes

### Method 3: Session Completion

**Location**: `background.js` - `trackTimeSpent()`

When tab closes or navigates:
1. Calculates time from session start
2. Adds to `domainUsage[domain]`
3. Removes active session
4. Updates total time spent

## Time Calculation

### Basic Formula

```
Time Spent (minutes) = (End Time - Start Time) / 1000 / 60
```

### Example Calculation

```javascript
// User grants access at 2:00 PM
const startTime = new Date('2025-12-07T14:00:00').getTime(); // 1701964800000

// User closes tab at 2:15 PM
const endTime = new Date('2025-12-07T14:15:00').getTime();   // 1701965700000

// Calculate time spent
const timeSpent = Math.floor((endTime - startTime) / 1000 / 60);
// Result: 15 minutes
```

### Rounding

- Time is rounded **down** to nearest minute
- Partial minutes are not counted
- Minimum tracked time: 1 minute
- Maximum: No limit

## Data Aggregation

### Daily Aggregation

For each day, time is aggregated per domain:

```javascript
{
  "Mon Dec 07 2025": {
    "domainUsage": {
      "facebook.com": 45,    // 45 minutes on Facebook
      "youtube.com": 120,    // 2 hours on YouTube
      "twitter.com": 15      // 15 minutes on Twitter
    },
    "timeSpent": 180         // Total: 3 hours
  }
}
```

### Weekly Aggregation

For weekly view:
1. Get all days in the week
2. Sum `domainUsage` for each domain
3. Display total per domain

```javascript
// Week of Dec 1-7
facebook.com: 45 + 30 + 60 + 45 + 20 + 15 + 10 = 225 minutes
youtube.com: 120 + 90 + 150 + 180 + 200 + 160 + 140 = 1040 minutes
```

### Monthly Aggregation

For monthly view:
1. Get all days in the month
2. Sum `domainUsage` for each domain
3. Display total per domain

## Statistics Calculation

### Total Time Spent

```javascript
// Sum all timeSpent values
let total = 0;
Object.values(usageStats).forEach(day => {
  total += day.timeSpent || 0;
});
```

### Average Daily Time

```javascript
// Calculate average
const days = Object.keys(usageStats).length;
const average = total / days;
```

### Time per Website

```javascript
// Aggregate by domain
const websiteTime = {};
Object.values(usageStats).forEach(day => {
  if (day.domainUsage) {
    Object.keys(day.domainUsage).forEach(domain => {
      websiteTime[domain] = (websiteTime[domain] || 0) + day.domainUsage[domain];
    });
  }
});
```

## Time Display Format

### Formatting Function

```javascript
function formatTime(minutes) {
  if (minutes === 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
}
```

### Examples

- `0` minutes → `0m`
- `30` minutes → `30m`
- `60` minutes → `1h`
- `90` minutes → `1h 30m`
- `120` minutes → `2h`

## Tracking Accuracy

### Factors Affecting Accuracy

1. **Page Load Time**: Small delay before tracking starts
2. **Timer Precision**: 1-minute intervals (not second-precise)
3. **Tab Switching**: Time continues if tab is backgrounded
4. **Browser Sleep**: Time may not track if computer sleeps

### Estimated Accuracy

- **Within 1-2 minutes** for sessions < 1 hour
- **Within 5 minutes** for sessions > 1 hour
- **Most accurate** for continuous browsing
- **Less accurate** for frequent tab switching

## Time Tracking Flow

### Complete Flow Diagram

```
User grants access (10 minutes)
    ↓
Site becomes accessible
    ↓
Page loads → startTimeTracking() starts
    ↓
Every 60 seconds → Add 1 minute to domainUsage
    ↓
User browses site
    ↓
User closes tab/navigates away
    ↓
beforeunload event → Calculate remaining time
    ↓
Add final time to domainUsage
    ↓
Update total timeSpent
    ↓
Data saved to chrome.storage.local
```

## Data Structure

### Time Tracking Data

```javascript
{
  "usageStats": {
    "Mon Dec 07 2025": {
      "timeSpent": 180,              // Total minutes today
      "domainUsage": {               // Per-domain breakdown
        "facebook.com": 45,
        "youtube.com": 120,
        "twitter.com": 15
      },
      "activeSessions": {            // Currently active
        "facebook.com": {
          "startTime": 1701964800000,
          "domain": "facebook.com"
        }
      },
      "visits": 5,                   // Number of visits
      "entryAttempts": [             // All access attempts
        {
          "domain": "facebook.com",
          "timestamp": 1701964800000,
          "blocked": false,
          "allowed": true
        }
      ]
    }
  }
}
```

## Edge Cases

### Multiple Tabs Same Site

- Each tab tracks independently
- Time is summed when tabs close
- No double-counting

### Access Expires During Use

- Timer stops when access expires
- Time up to expiration is counted
- Site becomes blocked automatically

### Forever Access

- Time tracking continues indefinitely
- No expiration check
- Can be revoked manually

### Browser Restart

- Active sessions are lost
- Time up to restart is saved
- New sessions start fresh

## Performance Considerations

### Storage Updates

- Updates every 60 seconds per active site
- Minimal performance impact
- Async operations don't block UI

### Memory Usage

- Active sessions stored in memory
- Cleared when tab closes
- No memory leaks

### CPU Usage

- Timer runs every 60 seconds
- Minimal CPU usage
- Efficient interval management

## Troubleshooting

### Time Not Tracking

**Possible Causes:**
1. Access not granted properly
2. Content script not loading
3. Storage permission denied
4. Browser extension disabled

**Solutions:**
- Check extension is enabled
- Verify site has access in popup
- Check browser console for errors
- Reload the extension

### Incorrect Time

**Possible Causes:**
1. Clock changed on computer
2. Browser timezone issues
3. Timer drift
4. Multiple tabs confusion

**Solutions:**
- Time is relative, not absolute
- Small discrepancies are normal
- Check if multiple tabs open
- Verify access duration

### Time Not Displaying

**Possible Causes:**
1. No data for selected period
2. Chart not loading
3. Data format issue

**Solutions:**
- Check if any access was granted
- Verify Chart.js loaded
- Check browser console
- Try different time filter

## Best Practices

### For Accurate Tracking

1. **Grant specific durations** (not forever) for better tracking
2. **Close tabs properly** to ensure final time is saved
3. **Don't switch tabs rapidly** (may miss some time)
4. **Check statistics regularly** to verify accuracy

### For Developers

1. **Always use Date.now()** for timestamps
2. **Calculate in milliseconds**, convert to minutes
3. **Round down** to avoid over-counting
4. **Handle edge cases** (tab close, browser restart)

## Future Improvements

Potential enhancements:
- Second-level precision
- Background tab detection
- Idle time detection
- More accurate session tracking
- Real-time updates

---

**See Also:**
- [Data Storage](./DATA_STORAGE.md) - How data is stored
- [Architecture](./ARCHITECTURE.md) - System design
- [API Reference](./API_REFERENCE.md) - Function documentation

