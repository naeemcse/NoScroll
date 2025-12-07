# User Guide

## Getting Started

### Installation

1. Download or clone this repository
2. Open Chrome/Edge/Brave
3. Navigate to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked"
6. Select the `eradicator` folder

### First Time Setup

1. Click the extension icon in your toolbar
2. Extension is active by default
3. All default social media sites are blocked
4. You're ready to go!

## Using the Extension

### Main Popup

When you click the extension icon, you'll see:

- **Status Indicator**: Shows if blocking is active
- **Today's Usage**: Time spent and visits today
- **Site Access Control**: Manage access to blocked sites
- **Quick Actions**: View statistics or open settings

### Blocking Sites

**By Default:**
- All configured sites are blocked automatically
- No need to start/stop blocking
- Sites are always blocked unless you grant access

**What Gets Blocked:**
- Newsfeed/content areas
- Main scrolling content
- Distracting feeds

**What Stays Accessible:**
- Messaging features
- Profile pages
- Navigation menus
- Other non-feed content

### Granting Access

**Temporary Access:**
1. Click extension icon
2. Find site in "Site Access Control"
3. Select duration (5 min, 10 min, 30 min, 1 hour, or Forever)
4. Click "Allow Access"
5. Site becomes accessible for selected duration

**Revoking Access:**
1. Click extension icon
2. Find site with active access
3. Click "Revoke Access"
4. Site is immediately blocked again

### Viewing Statistics

1. Click extension icon
2. Click "View Statistics"
3. See your usage data:
   - Daily/Weekly/Monthly views
   - Time spent charts
   - Website usage breakdown
   - Detailed statistics

## Settings

### Accessing Settings

1. Click extension icon
2. Click "Settings" button

### Blocked Sites

**Enable/Disable Sites:**
- Check/uncheck sites to block
- Click "Save Settings"

**Default Sites:**
- Facebook
- Instagram
- Twitter
- LinkedIn
- TikTok
- YouTube
- Reddit
- Snapchat
- Pinterest
- WhatsApp Web

### Custom Sites

**Add Custom Site:**
1. Enter domain (e.g., `reddit.com`)
2. Click "Add Site"
3. Site is immediately blocked

**Remove Custom Site:**
- Click "Remove" next to site

### Motivational Messages

**Add Message:**
1. Enter your message
2. Click "Add Message"
3. Message appears when sites are blocked

**Remove Message:**
- Click "Remove" next to message

**Default Messages:**
- Pre-loaded with 8 motivational messages
- You can customize or remove them

## Statistics Page

### Views

**Daily View:**
- Last 30 days
- Daily time spent and blocks
- Bar chart visualization

**Weekly View:**
- Last 12 weeks
- Weekly aggregates
- Trend analysis

**Monthly View:**
- Last 12 months
- Monthly summaries
- Long-term patterns

### Website Usage Graph

**Features:**
- Shows which websites you use most
- Time spent per website
- Filter by: Today, Last 7 Days, Last 30 Days

**Reading the Graph:**
- Websites listed on left (Y-axis)
- Time shown as bars (X-axis)
- Longer bar = more time spent
- Hover for exact time

### Data Management

**Export Data:**
1. Click "Export Data"
2. Downloads JSON file
3. Contains all usage statistics

**Clear Data:**
1. Click "Clear All Data"
2. Confirm deletion
3. All statistics removed

## Understanding the Data

### Time Spent

- **What it means**: Total minutes spent on allowed sites
- **How calculated**: From when access granted to when you leave
- **Accuracy**: Within 1-2 minutes

### Times Opened

- **What it means**: Number of times you accessed blocked sites
- **Counted when**: You grant access and visit the site
- **Includes**: All access grants, even if brief

### Blocks Prevented

- **What it means**: Times you tried to access but were blocked
- **Shown when**: You visit blocked site without access
- **Motivational**: Shows how many distractions you avoided

## Tips for Best Results

### Setting Up

1. **Start with defaults**: Use default blocked sites
2. **Add custom sites**: Block any distracting sites
3. **Customize messages**: Add personal motivational messages
4. **Test blocking**: Visit a blocked site to see it work

### Using Access Control

1. **Be intentional**: Only grant access when really needed
2. **Use short durations**: Start with 5-10 minutes
3. **Revoke early**: If you don't need it, revoke access
4. **Track your usage**: Check statistics regularly

### Staying Focused

1. **Check statistics**: See how much time you're saving
2. **Set goals**: Try to reduce time spent
3. **Use streaks**: Maintain daily blocking
4. **Review weekly**: Check weekly statistics

## Troubleshooting

### Sites Not Blocking

**Check:**
1. Extension enabled?
2. Site in blocked list?
3. Blocking active (should be by default)?
4. Try reloading the page

**Solutions:**
- Reload extension
- Check settings
- Verify site is in list
- Clear browser cache

### Access Not Working

**Check:**
1. Access granted in popup?
2. Duration not expired?
3. Site name matches exactly?

**Solutions:**
- Check popup for access status
- Grant access again
- Verify domain name

### Statistics Not Updating

**Check:**
1. Have you granted access?
2. Have you visited sites?
3. Data cleared recently?

**Solutions:**
- Grant access and use sites
- Wait a few minutes
- Check browser console

### Extension Not Loading

**Check:**
1. Developer mode enabled?
2. Correct folder selected?
3. Manifest errors?

**Solutions:**
- Enable developer mode
- Select correct folder
- Check for errors in console

## Privacy

### Your Data

- **Stored locally**: All data in your browser
- **No external servers**: Nothing sent online
- **No cookies**: Extension doesn't use cookies
- **You control**: Export or delete anytime

### What's Tracked

- Time spent on allowed sites
- Number of visits
- Block attempts
- Access grants

### What's NOT Tracked

- Passwords
- Personal information
- Browsing history (only blocked attempts)
- Other websites

## Keyboard Shortcuts

Currently no keyboard shortcuts, but you can:
- Click extension icon for quick access
- Use browser shortcuts for tabs
- Use settings page for configuration

## Mobile Support

- Extension works on desktop browsers
- Chrome/Edge on mobile may have limitations
- Best experience on desktop

## Getting Help

1. Check this documentation
2. Review [FAQ](./FAQ.md)
3. Check browser console for errors
4. Open issue on GitHub

---

**See Also:**
- [FAQ](./FAQ.md) - Common questions
- [Features](./FEATURES.md) - All features
- [Architecture](./ARCHITECTURE.md) - How it works

