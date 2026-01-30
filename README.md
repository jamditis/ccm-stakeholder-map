# CCM Stakeholder Map

An interactive web tool for creating "ally/obstacle maps" and onboarding field guides. Built for the Center for Cooperative Media.

**[Try it live →](https://jamditis.github.io/ccm-stakeholder-map/)**

## Inspiration

This tool was inspired by [@graceforpersonalityhires](https://www.tiktok.com/@graceforpersonalityhires) on TikTok, whose video ["I want an ally/obstacle map the day I start a new job!"](https://www.tiktok.com/@graceforpersonalityhires/video/7600541579677388045) sparked the idea of giving new employees a visual guide to organizational relationships on day one.

## What it does

Create visual maps of the people in your professional landscape:

- **Allies** — People who support your work
- **Advocates** — People who actively vouch for you
- **Decision makers** — People whose choices directly impact your work
- **Obstacles** — People who (for various reasons) make work harder
- **Dependencies** — People and teams you rely on
- **Opportunities** — Relationships worth developing

## Features

### Visual map canvas
- Drag-and-drop stakeholder nodes
- Color-coded categories
- Connection lines showing relationships
- Zoom and pan controls
- Double-click to add stakeholders at any position

### Stakeholder profiles
- Name, role, and organization
- Category and influence level
- Notes and interaction tips
- Optional photo/avatar
- Privacy toggle for sensitive information

### Export options
- **PDF field guide** — Formatted document organized by category with tips
- **Standalone HTML** — Self-contained file that works offline
- **JSON** — Raw data for backup or sharing
- **Markdown** — Text format for documentation

### Sector templates
Pre-built starting points for common CCM areas:
- Collaborative reporting
- Training & workshops
- Research
- Membership/community

### Privacy controls
- Mark entire maps as private (adds watermark to exports)
- Hide sensitive notes on individual stakeholders in shared exports

## Usage

1. **Create a map** — Click "New map" or select a template
2. **Add stakeholders** — Use the "+ Add stakeholder" button or double-click the canvas
3. **Arrange your map** — Drag nodes to meaningful positions
4. **Add connections** — Right-click a node and select "Add connection"
5. **Export** — Generate a PDF field guide or share as standalone HTML

## Local development

No build step required. The app runs entirely in the browser.

```bash
# Clone the repo
git clone https://github.com/jamditis/ccm-stakeholder-map.git
cd ccm-stakeholder-map

# Open directly in browser
open docs/index.html

# Or serve locally
python3 -m http.server 8000 --directory docs
# Then visit http://localhost:8000
```

## Tech stack

| Layer | Technology |
|-------|------------|
| UI | Vanilla JavaScript |
| Styling | [Tailwind CSS](https://tailwindcss.com) (CDN) |
| Typography | [Source Serif 4](https://fonts.google.com/specimen/Source+Serif+4) + [DM Sans](https://fonts.google.com/specimen/DM+Sans) |
| Canvas | SVG with drag-and-drop |
| PDF export | [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) |
| Persistence | localStorage (no backend required) |

## Project structure

```
ccm-stakeholder-map/
├── docs/                    # GitHub Pages source
│   ├── index.html           # Main app
│   ├── css/styles.css       # Custom styles
│   └── js/
│       ├── app.js           # Main controller
│       ├── canvas.js        # SVG visualization
│       ├── storage.js       # localStorage CRUD
│       ├── templates.js     # Sector templates
│       └── export.js        # PDF/HTML/MD generation
├── CLAUDE.md                # AI assistant context
└── README.md
```

## Data privacy

All data is stored locally in your browser's localStorage. Nothing is sent to any server. You own your data completely.

To back up your maps, use "Export all maps (JSON)" from the export menu.

## Contributing

Contributions welcome! This tool was built for the Center for Cooperative Media but is open source and can be adapted for any organization.

## License

MIT

---

*Built with help from [Claude Code](https://claude.ai/code)*
