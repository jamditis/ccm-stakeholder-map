# CCM Stakeholder Map

Interactive web tool for creating "ally/obstacle maps" and onboarding field guides for the Center for Cooperative Media.

**Live site:** https://jamditis.github.io/ccm-stakeholder-map/
**Repository:** https://github.com/jamditis/ccm-stakeholder-map

## Project structure

```
ccm-stakeholder-map/
├── docs/                    # GitHub Pages source (builds from here)
│   ├── index.html           # Main app with Tailwind CDN config
│   ├── css/styles.css       # Custom styles, animations, category colors
│   ├── js/
│   │   ├── app.js           # Main app controller, event handling, UI coordination
│   │   ├── canvas.js        # SVG-based map visualization, drag/drop, zoom/pan
│   │   ├── storage.js       # localStorage CRUD, JSON import/export
│   │   ├── templates.js     # Sector templates, category definitions
│   │   └── export.js        # PDF, HTML, Markdown generation
│   └── .nojekyll            # Prevents Jekyll processing on GitHub Pages
├── index.html               # Root copy (same as docs/)
├── css/                     # Root copy (same as docs/)
├── js/                      # Root copy (same as docs/)
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
- `Canvas.render()` - Draws all nodes and connections
- `Canvas.createNode(stakeholder)` - Generates SVG node element
- Handles drag/drop, zoom/pan, tooltips, context menus

### storage.js
- `Storage.getAllMaps()` / `Storage.getMap(id)` - Read operations
- `Storage.createMap(data)` / `Storage.updateMap(id, updates)` - Write operations
- `Storage.addStakeholder(mapId, data)` - Add stakeholder with golden-angle positioning
- `Storage.exportMap(id)` / `Storage.importMap(json)` - Import/export

### templates.js
- `Templates.sectors` - Pre-built templates for CCM areas
- `Templates.categoryInfo` - Color and label definitions
- `Templates.connectionTypes` - Relationship type definitions

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

GitHub Pages is configured to build from the `/docs` folder on the `main` branch. Push to main and the site updates automatically.

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
