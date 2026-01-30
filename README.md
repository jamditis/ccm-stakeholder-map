# CCM Stakeholder Map

An interactive web tool for creating "ally/obstacle maps" and onboarding field guides. Built for the Center for Cooperative Media.

**[Try it live →](https://cooperativemedia.github.io/ccm-stakeholder-map/)**

## Features

- **Visual map canvas** — Drag-and-drop stakeholder nodes with zoom/pan
- **Six relationship categories** — Allies, advocates, decision makers, obstacles, dependencies, opportunities
- **Connection mapping** — Draw relationships between stakeholders
- **Field guide export** — Generate PDF onboarding documents
- **Multiple export formats** — JSON, PDF, standalone HTML, Markdown
- **Privacy controls** — Mark maps and notes as private
- **Sector templates** — Pre-built templates for collaborative reporting, training, research, and membership

## Usage

1. Click "Create new map" or select a template
2. Add stakeholders with the "+ Add stakeholder" button
3. Drag nodes to arrange your map
4. Right-click nodes to add connections or edit
5. Export as PDF field guide or share as standalone HTML

## Local development

No build step required. Just open `docs/index.html` in a browser.

```bash
# Clone the repo
git clone https://github.com/cooperativemedia/ccm-stakeholder-map.git
cd ccm-stakeholder-map

# Open in browser
open docs/index.html
```

## Tech stack

- Vanilla JavaScript (no framework)
- Tailwind CSS (CDN)
- html2pdf.js for PDF export
- localStorage for data persistence

## License

MIT
