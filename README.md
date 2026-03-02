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
- **Color-coded connection lines** with relationship labels (supports, reports-to, influences, etc.)
- **Connections panel** showing all relationships with quick delete
- **Connect button** appears on node hover for easy relationship creation
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

## Import options

### CSV (recommended for spreadsheet users)
1. Download `import-template.csv` from the app's import menu
2. Fill it out in Excel or Google Sheets
3. Import directly in the browser — no extra tools needed

A Python converter (`csv_to_json.py`) is also available for command-line workflows.

### JSON
Import `.json` files directly. Supports single maps or bulk import of multiple maps. See `import-template.json` for the expected format.

## Workshop games toolkit

**[Browse the games →](https://jamditis.github.io/ccm-stakeholder-map/workshop-games/)**

A set of 7 interactive games for teams working through a strategic plan together. Each game is a standalone HTML page with facilitator instructions, timers, and interactive elements.

| Game | Time | What it does |
|------|------|-------------|
| **Word games** | 30-35 min | Scavenger hunt, six-word summaries, and found poetry to force close reading |
| **Priority auction** | 25-30 min | $100 fake currency per person — bid on goals to reveal real priorities |
| **Devil's advocate** | 30-40 min | Structured debate where teams argue against strategies to stress-test the plan |
| **Stakeholder lens** | 25-35 min | Role-play as different stakeholders (funder, community member, etc.) reading the plan |
| **Assumption mapper** | 25-30 min | Uncover hidden assumptions and rate confidence levels |
| **Plan remix** | 30-40 min | Cut 2 things, add 1, rewrite 1 — then vote on the best remixes |
| **Goal battle** | 35-45 min | Pokemon-style game where goals become creatures with stats like Feasibility and Buy-in |

All games are designed for in-person or hybrid workshops and include print-friendly layouts.

## Usage

1. **Create a map** — Click "New map" or select a template
2. **Add stakeholders** — Use the "+ Add stakeholder" button or double-click the canvas
3. **Arrange your map** — Drag nodes to meaningful positions
4. **Add connections** — Hover a node and click the connect button, or right-click and select "Add connection"
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
├── docs/                        # GitHub Pages source
│   ├── index.html               # Main app
│   ├── css/styles.css           # Custom styles
│   ├── js/
│   │   ├── app.js               # Main controller
│   │   ├── canvas.js            # SVG visualization
│   │   ├── storage.js           # localStorage CRUD
│   │   ├── templates.js         # Sector templates
│   │   └── export.js            # PDF/HTML/MD generation
│   ├── workshop-games/          # Strategic plan workshop toolkit
│   │   ├── index.html           # Game hub / chooser
│   │   ├── styles.css           # Shared game styles
│   │   ├── word-games.html
│   │   ├── priority-auction.html
│   │   ├── devils-advocate.html
│   │   ├── stakeholder-lens.html
│   │   ├── assumption-mapper.html
│   │   ├── plan-remix.html
│   │   └── pokemon-battle.html  # Goal battle (Pokemon-style)
│   ├── import-template.csv      # CSV template for spreadsheet import
│   └── import-template.json     # JSON template for direct import
├── csv_to_json.py               # Python CSV-to-JSON converter
├── CLAUDE.md                    # AI assistant context
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
