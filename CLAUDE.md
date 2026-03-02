# CCM Stakeholder Map


## GitHub Actions suspended (account-wide)

GitHub Actions are disabled on the entire `jamditis` GitHub account until further notice. This means:
- **No CI/CD pipelines will run** — builds, tests, deploys all fail silently
- **GitHub Pages deploys won't work** — even "legacy" static deploys that used Actions under the hood
- **No automated workflows** — PR checks, scheduled jobs, release automation are all dead

**For any project that previously deployed via GitHub Actions or GitHub Pages, you must use an alternative** (manual deploy, Cloudflare Pages, Firebase Hosting, direct FTP, etc.). Do not create or rely on `.github/workflows/` files.

## Bug-fixing workflow

When a bug is reported, don't immediately attempt to fix it. Instead:

1. **Write a failing test first** that reproduces the bug
2. **Launch subagents** to work on fixing the bug
3. **Verify the fix** by running the test — a passing test proves the bug is fixed

---

Interactive web tool for creating "ally/obstacle maps" and onboarding field guides for the Center for Cooperative Media.

**Live site:** https://jamditis.github.io/ccm-stakeholder-map/
**Repository:** https://github.com/jamditis/ccm-stakeholder-map

## Project structure

```
ccm-stakeholder-map/
├── docs/                        # GitHub Pages source (builds from here)
│   ├── index.html               # Main app with Tailwind CDN config
│   ├── css/styles.css           # Custom styles, animations, category colors
│   ├── js/
│   │   ├── app.js               # Main app controller, event handling, UI coordination
│   │   ├── canvas.js            # SVG-based map visualization, drag/drop, zoom/pan
│   │   ├── storage.js           # localStorage CRUD, JSON import/export
│   │   ├── templates.js         # Sector templates, category definitions
│   │   └── export.js            # PDF, HTML, Markdown generation
│   ├── workshop-games/          # Strategic plan workshop toolkit (standalone)
│   │   ├── index.html           # Game hub / chooser page
│   │   ├── styles.css           # Shared game styles (DM Serif Display + DM Sans)
│   │   ├── word-games.html      # Scavenger hunt, six-word summaries, found poetry
│   │   ├── priority-auction.html # $100 budget bidding on goals
│   │   ├── devils-advocate.html  # Structured debate to stress-test strategies
│   │   ├── stakeholder-lens.html # Role-play as different stakeholders
│   │   ├── assumption-mapper.html # Uncover and rate hidden assumptions
│   │   ├── plan-remix.html       # Cut/add/rewrite exercise with voting
│   │   └── pokemon-battle.html   # Goals as creatures with stats and battles
│   ├── import-template.csv      # CSV template for spreadsheet import
│   ├── import-template.json     # JSON template for direct import
│   ├── favicon.svg              # Site favicon
│   └── .nojekyll               # Prevents Jekyll processing on GitHub Pages
├── csv_to_json.py               # Python CSV-to-JSON converter (optional CLI tool)
├── index.html                   # Root copy (same as docs/)
├── css/                         # Root copy (same as docs/)
├── js/                          # Root copy (same as docs/)
└── README.md
```

## Tech stack

- **No build step** - Opens directly in browser, deploys to GitHub Pages
- **Vanilla JavaScript** - No framework, global objects (App, Canvas, Storage, Templates, Export)
- **Tailwind CSS via CDN** - Config embedded in index.html `<script>` tag
- **html2pdf.js** - Client-side PDF generation for field guide export
- **localStorage** - All data persists locally, no backend

## Design system

**Fonts:**
- Display: Source Serif 4 (editorial headings)
- Body: DM Sans (modern UI text)

**Color palette (defined in Tailwind config):**
- `ink` (#1a1a1a) - Primary text, buttons
- `paper` (#faf9f7) - Page background
- `cream` (#f5f3ef) - Secondary backgrounds
- `stone` (#e8e4de) - Borders, dividers
- `muted` (#8a8580) - Secondary text

**Category colors (each has DEFAULT, light, dark variants):**
- `ally` - Green (#2d9d5d)
- `advocate` - Blue (#4a7fc7)
- `decisionmaker` - Purple (#8b5fc7)
- `obstacle` - Red (#cf5858)
- `dependency` - Orange (#d4874c)
- `opportunity` - Yellow (#c4a82e)

## Key modules

### app.js
- `App.init()` - Entry point, binds events, loads maps
- `App.selectMap(mapId)` - Switches active map
- `App.openStakeholderModal()` - Add/edit stakeholder form
- `App.setView('canvas'|'list')` - Toggle between views

### canvas.js
- `Canvas.init(mapId)` - Initialize SVG canvas for a map
- `Canvas.render()` - Draws all nodes, connections, and connections panel
- `Canvas.createNode(stakeholder)` - Generates SVG node element with connect button
- `Canvas.createConnectionLine(connection, fromNode, toNode)` - Creates colored connection lines with labels
- `Canvas.renderConnectionsPanel(connections, stakeholders)` - Renders the connections list panel
- Handles drag/drop, zoom/pan, tooltips, context menus

### storage.js
- `Storage.getAllMaps()` / `Storage.getMap(id)` - Read operations
- `Storage.createMap(data)` / `Storage.updateMap(id, updates)` - Write operations
- `Storage.addStakeholder(mapId, data)` - Add stakeholder with golden-angle positioning
- `Storage.exportMap(id)` / `Storage.importMap(json)` - Import/export

### templates.js
- `Templates.sectors` - Pre-built templates for CCM areas
- `Templates.categoryInfo` - Color and label definitions
- `Templates.connectionTypes` - Relationship type definitions with colors
- `Templates.getConnectionType(typeId)` - Get connection type info by ID

### export.js
- `Export.downloadJSON(mapId)` - Raw data export
- `Export.downloadFieldGuidePDF(mapId)` - Formatted PDF with sections
- `Export.downloadStandaloneHTML(mapId)` - Self-contained HTML file
- `Export.downloadMarkdown(mapId)` - Markdown document

## Data model

```javascript
// Map
{
  id: "uuid",
  name: "Map name",
  sector: "collaborative-reporting",
  isPrivate: false,
  created: "ISO date",
  updated: "ISO date",
  stakeholders: [...],
  connections: [...]
}

// Stakeholder
{
  id: "uuid",
  name: "Jane Smith",
  role: "Director",
  organization: "Knight Foundation",
  category: "advocate",
  influence: "high",
  notes: "...",
  interactionTips: "...",
  avatar: "https://...",
  isPrivate: false,
  position: { x: 250, y: 150 }
}

// Connection
{
  id: "uuid",
  from: "stakeholder-id",
  to: "stakeholder-id",
  type: "reports-to",
  notes: "Weekly check-ins"
}
```

## Development

```bash
# Local testing - just open in browser
open docs/index.html

# Or serve locally
python3 -m http.server 8000 --directory docs
```

## Deployment

Deployed via Cloudflare Pages (personal account, direct upload from `/docs`).

```bash
bash deploy.sh    # uploads docs/ to ccm-stakeholder-map.pages.dev
```

**Pages URL:** https://ccm-stakeholder-map.pages.dev

## Common tasks

**Add a new category:**
1. Add color to Tailwind config in `docs/index.html`
2. Add to `Templates.categoryInfo` in `templates.js`
3. Add option to category `<select>` in index.html
4. Add CSS classes in `styles.css`

**Add a new export format:**
1. Add method to `Export` object in `export.js`
2. Add button to export menu in `index.html`
3. Bind click handler in `App.bindExportMenu()`

**Modify node appearance:**
1. Edit `Canvas.createNode()` in `canvas.js`
2. Update `NODE_RADIUS` constant if changing size
3. Adjust CSS in `styles.css` for hover/selected states

## Import/export

### CSV workflow (recommended for most users)

For users who prefer spreadsheets over JSON, use the CSV template and Python converter:

**Step 1:** Download `import-template.csv` and fill it out in Excel or Google Sheets

**CSV columns:**
| Column | Required | Description |
|--------|----------|-------------|
| name | Yes | Person's name |
| category | Yes | ally, advocate, decisionmaker, obstacle, dependency, or opportunity |
| role | No | Job title |
| organization | No | Company/org name |
| influence | No | high, medium, or low (default: medium) |
| notes | No | Background info |
| interaction_tips | No | How to work with them |
| avatar_url | No | URL to photo |
| is_private | No | true or false (default: false) |

**Step 2:** Convert to JSON using the Python script:

```bash
python csv_to_json.py stakeholders.csv output.json
# or just:
python csv_to_json.py stakeholders.csv  # outputs to stakeholders_map.json
```

**Step 3:** Import the JSON file into the app using the Import button

The script automatically:
- Calculates positions using golden angle distribution
- Validates categories and influence levels
- Reports errors for invalid rows
- Creates a properly formatted JSON file

### JSON import (direct)

The Import button accepts `.json` files in two formats:

**Single map:**
```json
{
  "name": "My Stakeholder Map",
  "sector": "custom",
  "isPrivate": false,
  "stakeholders": [
    {
      "name": "Jane Smith",
      "role": "Director",
      "organization": "Example Foundation",
      "category": "advocate",
      "influence": "high",
      "notes": "Key decision maker for funding",
      "interactionTips": "Prefers email, responds within 24h",
      "position": { "x": 400, "y": 300 }
    }
  ],
  "connections": []
}
```

**Multiple maps (bulk):**
```json
{
  "maps": [
    { "name": "Map 1", "stakeholders": [...] },
    { "name": "Map 2", "stakeholders": [...] }
  ]
}
```

**Required fields:**
- `name` - Map name (string)
- `stakeholders` - Array of stakeholder objects

**Stakeholder fields:**
- `name` (required) - Person's name
- `category` (required) - One of: `ally`, `advocate`, `decisionmaker`, `obstacle`, `dependency`, `opportunity`
- `role` - Job title
- `organization` - Company/org name
- `influence` - One of: `high`, `medium`, `low`
- `notes` - Background info
- `interactionTips` - How to work with them
- `avatar` - URL to photo
- `isPrivate` - Hide from exports (boolean)
- `position` - `{ "x": number, "y": number }` for canvas placement

**Connection fields:**
- `from` - Stakeholder ID (use temp IDs, they get remapped on import)
- `to` - Stakeholder ID
- `type` - One of: `works-with`, `reports-to`, `influences`, `blocks`, `supports`, `depends-on`
- `notes` - Relationship details

**Connection type colors:**
| Type | Color | Style |
|------|-------|-------|
| works-with | Gray (#9ca3af) | Solid |
| reports-to | Purple (#8b5fc7) | Solid |
| influences | Blue (#4a7fc7) | Dashed |
| blocks | Red (#ef4444) | Dashed |
| supports | Green (#22c55e) | Solid |
| depends-on | Orange (#f97316) | Dashed |

**Template files:**
- `docs/import-template.csv` - CSV template for spreadsheet users
- `docs/import-template.json` - JSON template for direct import
- `csv_to_json.py` - Python script to convert CSV to JSON

### Browser-based CSV import

The app also supports direct CSV import in the browser (no Python needed). The import menu in the UI provides a "Download CSV template" button and a "Import CSV" option that parses the file client-side using the same golden-angle positioning logic.

## Workshop games toolkit

**Live:** https://jamditis.github.io/ccm-stakeholder-map/workshop-games/
**Source:** `docs/workshop-games/`

A standalone set of 7 interactive games for teams working through a strategic plan. Each game is a self-contained HTML page with its own JavaScript. They share a common stylesheet (`workshop-games/styles.css`) and a hub page (`workshop-games/index.html`).

### Games

| Game | File | Time | Purpose |
|------|------|------|---------|
| Word games | `word-games.html` | 30-35 min | Close reading via scavenger hunt, six-word summaries, found poetry |
| Priority auction | `priority-auction.html` | 25-30 min | Allocate $100 fake budget to reveal real priorities |
| Devil's advocate | `devils-advocate.html` | 30-40 min | Structured debate to stress-test strategies |
| Stakeholder lens | `stakeholder-lens.html` | 25-35 min | Role-play as funder, community member, new board member, etc. |
| Assumption mapper | `assumption-mapper.html` | 25-30 min | Uncover hidden assumptions, rate as Confident/Uncertain/Risky |
| Plan remix | `plan-remix.html` | 30-40 min | Cut 2, add 1, rewrite 1 — then vote on best remixes |
| Goal battle | `pokemon-battle.html` | 35-45 min | Pokemon-style game: goals become creatures with 6 stats |

### Goal battle details

The most interactive game. Goals become "creatures" with 6 stats:
- **HP** (Sustainability), **ATK** (Impact), **DEF** (Evidence), **SP.ATK** (Ambition), **SP.DEF** (Buy-in), **SPD** (Feasibility)

Goal types: Growth, Equity, Operations, Community, Innovation, Culture. Features an interactive card builder with live-updating stat cards and a battle simulator that draws random challenges (budget crunch, staff exodus, etc.). Uses Press Start 2P pixel font.

### Design system (workshop games)

- **Fonts:** DM Serif Display (headings) + DM Sans (body)
- **Styling:** Each game has a unique accent color; shared CSS variables in `styles.css`
- **Layout:** Print-friendly, Zoom-friendly for hybrid/remote workshops
- **No dependencies on the main app** — the games are fully standalone

### Common modifications

**Add a new game:**
1. Create new HTML file in `docs/workshop-games/`
2. Link the shared `styles.css`
3. Add navigation link to `index.html` hub page nav
4. Add game card to the hub page grid

**Customize for a specific organization:**
Each game has placeholder sections (marked in the HTML) where you paste your organization's actual strategic plan goals, strategies, etc.

## Known issues and fixes

### SVG node hover instability (fixed 2026-01-30)

**Problem:** Stakeholder nodes would flicker/jump when hovering or clicking.

**Root cause:** Two CSS issues:
1. `.stakeholder-node:hover { transform: scale(1.05); }` conflicted with SVG `transform` attribute used for positioning
2. Tailwind's `transition: all` on parent SVG elements caused `getBoundingClientRect()` to return fluctuating values

**Fix applied to `css/styles.css`:**
- Removed `transform: scale()` from hover state
- Added `transition: none !important` to `#map-canvas`, `#canvas-transform`, `#nodes-layer`
- Changed hover effects to only modify child element stroke-width

**Important CSS rule:** Never apply CSS `transform` to `.stakeholder-node` - it will override the SVG positioning transform and break the layout.

### Connection enhancements (added 2026-01-30)

**Features added:**
1. **Colored connection lines** - Each connection type has a distinct color with matching arrowhead
2. **Connection labels** - Relationship type shown as text label on the connection line curve
3. **Connect button on hover** - Small button appears at 45° angle on nodes, clicking opens connection modal
4. **Connections panel** - Collapsible panel listing all connections with delete buttons
5. **Connections in exports** - PDF and Markdown exports now include a "Relationships" section

**Implementation details:**
- Colored arrowhead markers defined in SVG `<defs>` section (one per connection type)
- Connection labels use white text-shadow for readability over grid background
- Connect button uses CSS opacity transition, only visible on `.stakeholder-node:hover`
- Connections panel renders via `Canvas.renderConnectionsPanel()` called from `Canvas.render()`
