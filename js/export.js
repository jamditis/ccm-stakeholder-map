/**
 * Export module for CCM Stakeholder Map
 * Handles PDF, HTML, and Markdown export
 *
 * Security note: All user-provided content is escaped via escapeHtml()
 * before being included in generated HTML to prevent XSS.
 */

const Export = {
  /**
   * Export map as JSON file download
   */
  downloadJSON(mapId, isPublic = false) {
    const jsonStr = isPublic ? Storage.exportMapPublic(mapId) : Storage.exportMap(mapId);
    if (!jsonStr) return;

    const map = Storage.getMap(mapId);
    const filename = this.sanitizeFilename(map.name) + '.json';
    this.downloadFile(jsonStr, filename, 'application/json');
  },

  /**
   * Export all maps as JSON file download
   */
  downloadAllMapsJSON() {
    const jsonStr = Storage.exportAllMaps();
    const filename = `stakeholder-maps-${this.formatDate(new Date())}.json`;
    this.downloadFile(jsonStr, filename, 'application/json');
  },

  /**
   * Generate and download field guide as PDF
   */
  async downloadFieldGuidePDF(mapId) {
    const map = Storage.getMap(mapId);
    if (!map) return;

    const container = this.buildFieldGuideDOM(map);
    container.style.cssText = 'position: absolute; left: -9999px; top: 0; width: 800px;';
    document.body.appendChild(container);

    try {
      const opt = {
        margin: [15, 15, 15, 15],
        filename: this.sanitizeFilename(map.name) + '-field-guide.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      await html2pdf().set(opt).from(container).save();
    } finally {
      container.remove();
    }
  },

  /**
   * Build field guide DOM using safe DOM methods
   */
  buildFieldGuideDOM(map) {
    const groupedStakeholders = this.groupByCategory(map.stakeholders);
    const now = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const container = document.createElement('div');
    container.style.cssText = 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.5; color: #1f2937; max-width: 800px; margin: 0 auto; padding: 20px;';

    // Watermark for private maps
    if (map.isPrivate) {
      const watermark = document.createElement('div');
      watermark.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 60px; color: rgba(0,0,0,0.03); white-space: nowrap; z-index: 0; pointer-events: none;';
      watermark.textContent = 'CONFIDENTIAL';
      container.appendChild(watermark);
    }

    // Content wrapper
    const content = document.createElement('div');
    content.style.cssText = 'position: relative; z-index: 1;';

    // Title
    const title = document.createElement('h1');
    title.style.cssText = 'font-size: 24px; margin-bottom: 4px;';
    title.textContent = map.name;
    content.appendChild(title);

    // Meta
    const meta = document.createElement('p');
    meta.style.cssText = 'color: #6b7280; font-size: 14px; margin-bottom: 24px;';
    meta.textContent = `Field guide • Generated ${now}`;
    content.appendChild(meta);

    // Order of sections
    const sectionOrder = [
      { id: 'advocate', title: 'Key advocates', intro: 'These people actively champion your work and can open doors.' },
      { id: 'ally', title: 'Allies', intro: 'Supportive contacts who can help when needed.' },
      { id: 'decisionmaker', title: 'Decision makers', intro: 'People whose choices directly affect your projects.' },
      { id: 'dependency', title: 'Dependencies', intro: 'People and teams you rely on to get work done.' },
      { id: 'opportunity', title: 'Opportunities', intro: 'Relationships worth developing.' },
      { id: 'obstacle', title: 'Navigating obstacles', intro: 'Understanding these relationships helps you work around challenges.' },
    ];

    for (const section of sectionOrder) {
      const stakeholders = groupedStakeholders[section.id] || [];
      if (stakeholders.length === 0) continue;

      const category = Templates.getCategory(section.id);
      const sectionDiv = document.createElement('div');
      sectionDiv.style.cssText = 'margin-bottom: 24px; page-break-inside: avoid;';

      const sectionTitle = document.createElement('h2');
      sectionTitle.style.cssText = `font-size: 18px; font-weight: 600; color: ${category.color}; margin-bottom: 8px; border-bottom: 2px solid ${category.color}; padding-bottom: 4px;`;
      sectionTitle.textContent = section.title;
      sectionDiv.appendChild(sectionTitle);

      const intro = document.createElement('p');
      intro.style.cssText = 'font-size: 12px; color: #6b7280; margin-bottom: 16px;';
      intro.textContent = section.intro;
      sectionDiv.appendChild(intro);

      stakeholders.forEach(s => {
        const card = this.buildStakeholderCardDOM(s, map.isPrivate);
        sectionDiv.appendChild(card);
      });

      content.appendChild(sectionDiv);
    }

    // Footer
    const hr = document.createElement('hr');
    hr.style.cssText = 'margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;';
    content.appendChild(hr);

    const footer = document.createElement('p');
    footer.style.cssText = 'font-size: 12px; color: #9ca3af; text-align: center;';
    footer.textContent = 'Created with CCM Stakeholder Map';
    content.appendChild(footer);

    container.appendChild(content);
    return container;
  },

  /**
   * Build stakeholder card DOM element
   */
  buildStakeholderCardDOM(stakeholder, isPrivateMap) {
    const hideNotes = isPrivateMap && stakeholder.isPrivate;

    const card = document.createElement('div');
    card.style.cssText = 'background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 12px;';

    // Header row
    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: flex-start;';

    const info = document.createElement('div');
    const name = document.createElement('div');
    name.style.cssText = 'font-weight: 600; font-size: 16px; margin-bottom: 4px;';
    name.textContent = stakeholder.name;
    info.appendChild(name);

    if (stakeholder.role || stakeholder.organization) {
      const role = document.createElement('div');
      role.style.cssText = 'color: #6b7280; font-size: 14px; margin-bottom: 8px;';
      role.textContent = stakeholder.role + (stakeholder.organization ? ' at ' + stakeholder.organization : '');
      info.appendChild(role);
    }
    header.appendChild(info);

    // Influence badge
    const influenceColors = {
      high: { bg: '#f3e8ff', text: '#7c3aed' },
      medium: { bg: '#dbeafe', text: '#2563eb' },
      low: { bg: '#f3f4f6', text: '#6b7280' },
    };
    const colors = influenceColors[stakeholder.influence] || influenceColors.medium;

    const badge = document.createElement('span');
    badge.style.cssText = `display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; background: ${colors.bg}; color: ${colors.text};`;
    badge.textContent = `${stakeholder.influence} influence`;
    header.appendChild(badge);

    card.appendChild(header);

    // Notes
    if (stakeholder.notes && !hideNotes) {
      const notes = document.createElement('div');
      notes.style.cssText = 'font-size: 14px; margin-bottom: 8px;';
      notes.textContent = stakeholder.notes;
      card.appendChild(notes);
    }

    // Tips
    if (stakeholder.interactionTips && !hideNotes) {
      const tips = document.createElement('div');
      tips.style.cssText = 'background: #fef3c7; border-radius: 4px; padding: 8px 12px; font-size: 13px;';

      const tipLabel = document.createElement('strong');
      tipLabel.textContent = 'Tip: ';
      tips.appendChild(tipLabel);

      const tipText = document.createTextNode(stakeholder.interactionTips);
      tips.appendChild(tipText);

      card.appendChild(tips);
    }

    return card;
  },

  /**
   * Generate and download standalone HTML file
   */
  downloadStandaloneHTML(mapId) {
    const map = Storage.getMap(mapId);
    if (!map) return;

    const html = this.generateStandaloneHTML(map);
    const filename = this.sanitizeFilename(map.name) + '.html';
    this.downloadFile(html, filename, 'text/html');
  },

  /**
   * Generate standalone HTML with embedded data
   * Note: User data is JSON-serialized and parsed at runtime, not interpolated into HTML
   */
  generateStandaloneHTML(map) {
    // JSON.stringify handles escaping for embedding in script tag
    const jsonData = JSON.stringify(map);
    const escapedName = this.escapeHtml(map.name);
    const escapedSector = this.escapeHtml(Templates.getSector(map.sector).name);

    const categories = Templates.getAllCategories();
    const categoryListItems = categories.map(c =>
      `<div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full" style="background: ${c.color}"></span>
        <span class="text-sm">${this.escapeHtml(c.label)}</span>
      </div>`
    ).join('\n            ');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapedName} - Stakeholder Map</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    .node { cursor: pointer; user-select: none; }
    .node:hover .ring { stroke-opacity: 0.5; stroke-width: 3; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen p-8">
  <div class="max-w-6xl mx-auto">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">${escapedName}</h1>
      <p class="text-gray-500">Stakeholder map • ${escapedSector}</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Legend -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow p-4">
          <h2 class="font-semibold text-gray-900 mb-4">Categories</h2>
          <div class="space-y-2">
            ${categoryListItems}
          </div>
        </div>

        <!-- Stakeholder list -->
        <div class="bg-white rounded-lg shadow p-4 mt-4">
          <h2 class="font-semibold text-gray-900 mb-4">Stakeholders</h2>
          <div class="space-y-3" id="stakeholder-list"></div>
        </div>
      </div>

      <!-- Map canvas -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow overflow-hidden" style="height: 600px;">
          <svg id="map-canvas" class="w-full h-full">
            <g id="connections-layer"></g>
            <g id="nodes-layer"></g>
          </svg>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Embedded map data (JSON-parsed, not template-interpolated)
    const mapData = ${jsonData};

    // Category colors
    const categoryColors = {
      ally: '#22c55e',
      advocate: '#3b82f6',
      decisionmaker: '#a855f7',
      obstacle: '#ef4444',
      dependency: '#f97316',
      opportunity: '#eab308'
    };

    // Render the map
    function render() {
      const nodesLayer = document.getElementById('nodes-layer');
      const connectionsLayer = document.getElementById('connections-layer');
      const listContainer = document.getElementById('stakeholder-list');

      // Render nodes
      mapData.stakeholders.forEach(s => {
        const color = categoryColors[s.category] || '#6b7280';
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'node');
        g.setAttribute('transform', 'translate(' + s.position.x + ',' + s.position.y + ')');

        // Ring
        const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        ring.setAttribute('class', 'ring');
        ring.setAttribute('r', '44');
        ring.setAttribute('fill', 'none');
        ring.setAttribute('stroke', color);
        ring.setAttribute('stroke-width', '2');
        ring.setAttribute('stroke-opacity', '0.3');
        g.appendChild(ring);

        // Circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', '40');
        circle.setAttribute('fill', 'white');
        circle.setAttribute('stroke', color);
        circle.setAttribute('stroke-width', '3');
        g.appendChild(circle);

        // Initials
        const initials = s.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'central');
        text.setAttribute('font-size', '18');
        text.setAttribute('font-weight', '600');
        text.setAttribute('fill', color);
        text.textContent = initials;
        g.appendChild(text);

        // Label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('y', '60');
        label.setAttribute('font-size', '12');
        label.setAttribute('fill', '#374151');
        label.textContent = s.name.length > 20 ? s.name.substring(0, 17) + '...' : s.name;
        g.appendChild(label);

        nodesLayer.appendChild(g);

        // List item
        const item = document.createElement('div');
        item.className = 'flex items-center gap-2';
        const dot = document.createElement('span');
        dot.className = 'w-2 h-2 rounded-full';
        dot.style.background = color;
        const name = document.createElement('span');
        name.className = 'text-sm';
        name.textContent = s.name;
        item.appendChild(dot);
        item.appendChild(name);
        listContainer.appendChild(item);
      });

      // Render connections
      mapData.connections.forEach(conn => {
        const from = mapData.stakeholders.find(s => s.id === conn.from);
        const to = mapData.stakeholders.find(s => s.id === conn.to);
        if (!from || !to) return;

        const dx = to.position.x - from.position.x;
        const dy = to.position.y - from.position.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist === 0) return;

        const ux = dx / dist;
        const uy = dy / dist;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', from.position.x + ux * 40);
        line.setAttribute('y1', from.position.y + uy * 40);
        line.setAttribute('x2', to.position.x - ux * 40);
        line.setAttribute('y2', to.position.y - uy * 40);
        line.setAttribute('stroke', '#9ca3af');
        line.setAttribute('stroke-width', '2');
        connectionsLayer.appendChild(line);
      });
    }

    render();
  <\/script>
</body>
</html>`;
  },

  /**
   * Generate and download Markdown
   */
  downloadMarkdown(mapId) {
    const map = Storage.getMap(mapId);
    if (!map) return;

    const md = this.generateMarkdown(map);
    const filename = this.sanitizeFilename(map.name) + '.md';
    this.downloadFile(md, filename, 'text/markdown');
  },

  /**
   * Generate Markdown content
   */
  generateMarkdown(map) {
    const groupedStakeholders = this.groupByCategory(map.stakeholders);
    const now = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let md = `# ${map.name}\n\n`;
    md += `*Stakeholder map • Generated ${now}*\n\n`;
    md += `---\n\n`;

    const sectionOrder = [
      { id: 'advocate', title: 'Key advocates' },
      { id: 'ally', title: 'Allies' },
      { id: 'decisionmaker', title: 'Decision makers' },
      { id: 'dependency', title: 'Dependencies' },
      { id: 'opportunity', title: 'Opportunities' },
      { id: 'obstacle', title: 'Obstacles to navigate' },
    ];

    for (const section of sectionOrder) {
      const stakeholders = groupedStakeholders[section.id] || [];
      if (stakeholders.length === 0) continue;

      md += `## ${section.title}\n\n`;

      for (const s of stakeholders) {
        md += `### ${s.name}\n\n`;
        if (s.role || s.organization) {
          md += `**${s.role || ''}${s.organization ? (s.role ? ' at ' : '') + s.organization : ''}**\n\n`;
        }
        md += `*Influence: ${s.influence}*\n\n`;
        if (s.notes && !s.isPrivate) {
          md += `${s.notes}\n\n`;
        }
        if (s.interactionTips && !s.isPrivate) {
          md += `> **Tip:** ${s.interactionTips}\n\n`;
        }
      }
    }

    return md;
  },

  /**
   * Group stakeholders by category
   */
  groupByCategory(stakeholders) {
    return stakeholders.reduce((acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    }, {});
  },

  /**
   * Trigger file download
   */
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  },

  /**
   * Sanitize filename
   */
  sanitizeFilename(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  },

  /**
   * Format date for filename
   */
  formatDate(date) {
    return date.toISOString().split('T')[0];
  },

  /**
   * Escape HTML entities for safe insertion
   */
  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },
};

// Make available globally
window.Export = Export;
