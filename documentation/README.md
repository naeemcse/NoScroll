# Social Media Eradicator - Documentation Index

Welcome to the Social Media Eradicator documentation. This documentation provides comprehensive information about how the extension works, data storage, time tracking, and development guidelines.

## 📚 Documentation Structure

### For Users
- [User Guide](./USER_GUIDE.md) - How to use the extension
- [Features Overview](./FEATURES.md) - All available features
- [FAQ](./FAQ.md) - Frequently asked questions

### For Developers
- [Architecture Overview](./ARCHITECTURE.md) - System architecture and components
- [Data Storage](./DATA_STORAGE.md) - How data is stored and managed
- [Time Tracking](./TIME_TRACKING.md) - How time tracking works
- [Blocking Mechanism](./BLOCKING_MECHANISM.md) - How site blocking is implemented
- [API Reference](./API_REFERENCE.md) - Function and API documentation
- [Development Guide](./DEVELOPMENT.md) - Setup and development instructions

### Technical Details
- [Content Security Policy](./CSP.md) - CSP implementation and restrictions
- [Browser Compatibility](./BROWSER_COMPATIBILITY.md) - Supported browsers and limitations

## 🚀 Quick Start

1. **New to the extension?** Start with [User Guide](./USER_GUIDE.md)
2. **Want to understand how it works?** Read [Architecture Overview](./ARCHITECTURE.md)
3. **Interested in data privacy?** Check [Data Storage](./DATA_STORAGE.md)
4. **Planning to contribute?** See [Development Guide](./DEVELOPMENT.md)

## 📖 Documentation Files

| Document | Description |
|----------|-------------|
| [USER_GUIDE.md](./USER_GUIDE.md) | Complete user manual |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture and design |
| [DATA_STORAGE.md](./DATA_STORAGE.md) | Data storage mechanisms |
| [TIME_TRACKING.md](./TIME_TRACKING.md) | Time tracking implementation |
| [BLOCKING_MECHANISM.md](./BLOCKING_MECHANISM.md) | Site blocking system |
| [API_REFERENCE.md](./API_REFERENCE.md) | API and function reference |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Development setup guide |
| [CSP.md](./CSP.md) | Content Security Policy details |
| [BROWSER_COMPATIBILITY.md](./BROWSER_COMPATIBILITY.md) | Browser support information |
| [FAQ.md](./FAQ.md) | Frequently asked questions |

## 🔍 Key Topics

### Data Privacy
- All data stored locally in browser
- No external servers or cookies
- Uses Chrome Storage API (localStorage)
- No data collection or tracking

### Time Tracking
- Tracks time spent per website domain
- Aggregates data by day/week/month
- Calculates usage statistics
- Stores in structured format

### Blocking System
- Content script injection
- Newsfeed/content area blocking
- Motivational message display
- Site-specific access control

## 📝 Version Information

- **Current Version:** 1.0.0
- **Manifest Version:** 3
- **Last Updated:** December 2025

## 🤝 Contributing

See [DEVELOPMENT.md](./DEVELOPMENT.md) for contribution guidelines.

## 📄 License

MIT License - See [LICENSE](../LICENSE) file for details.

---

**Need Help?** Check the [FAQ](./FAQ.md) or open an issue on GitHub.

