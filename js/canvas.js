/**
 * Canvas module for CCM Stakeholder Map
 * SVG-based interactive map visualization
 */

const Canvas = {
  // State
  svg: null,
  transform: { x: 0, y: 0, scale: 1 },
  isDragging: false,
  isPanning: false,
  dragNode: null,
  dragOffset: { x: 0, y: 0 },
  selectedNode: null,
  currentMapId: null,
  tooltip: null,

  // Constants
  NODE_RADIUS: 40,
  MIN_ZOOM: 0.25,
  MAX_ZOOM: 2,
  ZOOM_STEP: 0.25,

  /**
   * Initialize the canvas
   */
  init(mapId) {
    this.svg = document.getElementById('map-canvas');
    this.currentMapId = mapId;
    this.createTooltip();
    this.bindEvents();
    this.render();
  },

  /**
   * Create tooltip element
   */
  createTooltip() {
    if (this.tooltip) return;

    this.tooltip = document.createElement('div');
    this.tooltip.className = 'node-tooltip';
    this.tooltip.style.display = 'none';
    document.body.appendChild(this.tooltip);
  },

  /**
   * Bind canvas events
   */
  bindEvents() {
    // Zoom controls
    document.getElementById('zoom-in-btn')?.addEventListener('click', () => this.zoom(this.ZOOM_STEP));
    document.getElementById('zoom-out-btn')?.addEventListener('click', () => this.zoom(-this.ZOOM_STEP));
    document.getElementById('zoom-reset-btn')?.addEventListener('click', () => this.resetView());

    // Canvas mouse events
    this.svg.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.svg.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.svg.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.svg.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
    this.svg.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });

    // Touch events for mobile
    this.svg.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    this.svg.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    this.svg.addEventListener('touchend', (e) => this.handleTouchEnd(e));

    // Double-click to add node
    this.svg.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
  },

  /**
   * Render the entire canvas
   */
  render() {
    if (!this.currentMapId) return;

    const map = Storage.getMap(this.currentMapId);
    if (!map) return;

    this.renderConnections(map.connections, map.stakeholders);
    this.renderNodes(map.stakeholders);
    this.updateTransform();
  },

  /**
   * Render stakeholder nodes
   */
  renderNodes(stakeholders) {
    const nodesLayer = document.getElementById('nodes-layer');
    nodesLayer.innerHTML = '';

    stakeholders.forEach((stakeholder) => {
      const node = this.createNode(stakeholder);
      nodesLayer.appendChild(node);
    });
  },

  /**
   * Create an SVG node for a stakeholder
   */
  createNode(stakeholder) {
    const category = Templates.getCategory(stakeholder.category);
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'stakeholder-node');
    g.setAttribute('data-id', stakeholder.id);
    g.setAttribute('transform', `translate(${stakeholder.position.x}, ${stakeholder.position.y})`);

    // Outer ring (shows category)
    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring.setAttribute('class', `node-ring ring-${stakeholder.category}`);
    ring.setAttribute('r', this.NODE_RADIUS + 4);
    ring.setAttribute('fill', 'none');
    ring.setAttribute('stroke', category.color);
    ring.setAttribute('stroke-width', '2');
    ring.setAttribute('stroke-opacity', '0.3');
    g.appendChild(ring);

    // Main circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', `node-circle`);
    circle.setAttribute('r', this.NODE_RADIUS);
    circle.setAttribute('fill', 'white');
    circle.setAttribute('stroke', category.color);
    circle.setAttribute('stroke-width', '3');
    g.appendChild(circle);

    // Avatar or initials
    if (stakeholder.avatar) {
      // Clip path for circular avatar
      const clipId = `clip-${stakeholder.id}`;
      const defs = this.svg.querySelector('defs') || this.svg.insertBefore(
        document.createElementNS('http://www.w3.org/2000/svg', 'defs'),
        this.svg.firstChild
      );

      const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
      clipPath.setAttribute('id', clipId);
      const clipCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      clipCircle.setAttribute('r', this.NODE_RADIUS - 4);
      clipPath.appendChild(clipCircle);
      defs.appendChild(clipPath);

      const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      image.setAttribute('href', stakeholder.avatar);
      image.setAttribute('x', -(this.NODE_RADIUS - 4));
      image.setAttribute('y', -(this.NODE_RADIUS - 4));
      image.setAttribute('width', (this.NODE_RADIUS - 4) * 2);
      image.setAttribute('height', (this.NODE_RADIUS - 4) * 2);
      image.setAttribute('clip-path', `url(#${clipId})`);
      image.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      g.appendChild(image);
    } else {
      // Initials
      const initials = this.getInitials(stakeholder.name);
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.setAttribute('font-size', '18');
      text.setAttribute('font-weight', '600');
      text.setAttribute('fill', category.color);
      text.textContent = initials;
      g.appendChild(text);
    }

    // Name label below node
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('y', this.NODE_RADIUS + 20);
    label.setAttribute('font-size', '12');
    label.setAttribute('fill', '#374151');
    label.textContent = this.truncateName(stakeholder.name, 20);
    g.appendChild(label);

    // Influence indicator
    if (stakeholder.influence === 'high') {
      const badge = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      badge.setAttribute('cx', this.NODE_RADIUS - 5);
      badge.setAttribute('cy', -this.NODE_RADIUS + 5);
      badge.setAttribute('r', '8');
      badge.setAttribute('fill', '#a855f7');
      g.appendChild(badge);

      const badgeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      badgeText.setAttribute('x', this.NODE_RADIUS - 5);
      badgeText.setAttribute('y', -this.NODE_RADIUS + 5);
      badgeText.setAttribute('text-anchor', 'middle');
      badgeText.setAttribute('dominant-baseline', 'central');
      badgeText.setAttribute('font-size', '10');
      badgeText.setAttribute('fill', 'white');
      badgeText.textContent = '★';
      g.appendChild(badgeText);
    }

    // Event handlers
    g.addEventListener('mousedown', (e) => this.startDragNode(e, stakeholder));
    g.addEventListener('mouseenter', (e) => this.showTooltip(e, stakeholder));
    g.addEventListener('mouseleave', () => this.hideTooltip());
    g.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.isDragging) {
        this.selectNode(stakeholder.id);
      }
    });
    g.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      App.openStakeholderModal(stakeholder.id);
    });

    // Right-click context menu
    g.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showNodeContextMenu(e, stakeholder);
    });

    return g;
  },

  /**
   * Render connection lines between nodes
   */
  renderConnections(connections, stakeholders) {
    const connectionsLayer = document.getElementById('connections-layer');
    connectionsLayer.innerHTML = '';

    connections.forEach((conn) => {
      const fromNode = stakeholders.find((s) => s.id === conn.from);
      const toNode = stakeholders.find((s) => s.id === conn.to);

      if (!fromNode || !toNode) return;

      const line = this.createConnectionLine(conn, fromNode, toNode);
      connectionsLayer.appendChild(line);
    });
  },

  /**
   * Create a connection line element
   */
  createConnectionLine(connection, fromNode, toNode) {
    const connType = Templates.getConnectionType(connection.type);
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('data-connection-id', connection.id);

    // Calculate line endpoints (edge of circles, not centers)
    const dx = toNode.position.x - fromNode.position.x;
    const dy = toNode.position.y - fromNode.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return g;

    const unitX = dx / distance;
    const unitY = dy / distance;

    const startX = fromNode.position.x + unitX * this.NODE_RADIUS;
    const startY = fromNode.position.y + unitY * this.NODE_RADIUS;
    const endX = toNode.position.x - unitX * (this.NODE_RADIUS + 10);
    const endY = toNode.position.y - unitY * (this.NODE_RADIUS + 10);

    // Create curved path for better aesthetics
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const offset = Math.min(30, distance * 0.1);
    const perpX = -unitY * offset;
    const perpY = unitX * offset;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', `connection-line type-${connection.type}`);
    path.setAttribute(
      'd',
      `M ${startX} ${startY} Q ${midX + perpX} ${midY + perpY} ${endX} ${endY}`
    );
    path.setAttribute('stroke', connType.color || '#9ca3af');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    path.setAttribute('marker-end', 'url(#arrowhead)');

    if (connType.style === 'dashed') {
      path.setAttribute('stroke-dasharray', '6 4');
    }

    g.appendChild(path);

    // Click handler for connection
    path.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showConnectionContextMenu(e, connection);
    });

    return g;
  },

  /**
   * Mouse event handlers
   */
  handleMouseDown(e) {
    if (e.target === this.svg || e.target.id === 'canvas-transform') {
      this.isPanning = true;
      this.dragOffset = { x: e.clientX - this.transform.x, y: e.clientY - this.transform.y };
      this.svg.style.cursor = 'grabbing';
    }
  },

  handleMouseMove(e) {
    if (this.isPanning) {
      this.transform.x = e.clientX - this.dragOffset.x;
      this.transform.y = e.clientY - this.dragOffset.y;
      this.updateTransform();
    } else if (this.dragNode) {
      this.isDragging = true;
      const point = this.screenToCanvas(e.clientX, e.clientY);
      const newX = point.x - this.dragOffset.x;
      const newY = point.y - this.dragOffset.y;

      // Update visual position
      const nodeEl = this.svg.querySelector(`[data-id="${this.dragNode.id}"]`);
      if (nodeEl) {
        nodeEl.setAttribute('transform', `translate(${newX}, ${newY})`);
      }

      // Update connections
      this.dragNode.position = { x: newX, y: newY };
      const map = Storage.getMap(this.currentMapId);
      this.renderConnections(map.connections, map.stakeholders);
    }
  },

  handleMouseUp(e) {
    if (this.dragNode && this.isDragging) {
      // Save position to storage
      Storage.updateStakeholder(this.currentMapId, this.dragNode.id, {
        position: this.dragNode.position,
      });
    }

    this.isPanning = false;
    this.dragNode = null;
    this.isDragging = false;
    this.svg.style.cursor = 'grab';
  },

  handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -this.ZOOM_STEP : this.ZOOM_STEP;
    this.zoom(delta, e.clientX, e.clientY);
  },

  /**
   * Touch event handlers
   */
  handleTouchStart(e) {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.isPanning = true;
      this.dragOffset = { x: touch.clientX - this.transform.x, y: touch.clientY - this.transform.y };
    }
  },

  handleTouchMove(e) {
    if (e.touches.length === 1 && this.isPanning) {
      e.preventDefault();
      const touch = e.touches[0];
      this.transform.x = touch.clientX - this.dragOffset.x;
      this.transform.y = touch.clientY - this.dragOffset.y;
      this.updateTransform();
    }
  },

  handleTouchEnd(e) {
    this.isPanning = false;
  },

  /**
   * Double-click handler (add node at position)
   */
  handleDoubleClick(e) {
    if (e.target !== this.svg && !e.target.id?.includes('canvas')) return;

    const point = this.screenToCanvas(e.clientX, e.clientY);
    App.openStakeholderModal(null, point);
  },

  /**
   * Start dragging a node
   */
  startDragNode(e, stakeholder) {
    e.stopPropagation();
    const point = this.screenToCanvas(e.clientX, e.clientY);
    this.dragNode = stakeholder;
    this.dragOffset = {
      x: point.x - stakeholder.position.x,
      y: point.y - stakeholder.position.y,
    };
  },

  /**
   * Select a node
   */
  selectNode(nodeId) {
    // Deselect previous
    if (this.selectedNode) {
      const prevEl = this.svg.querySelector(`[data-id="${this.selectedNode}"]`);
      prevEl?.classList.remove('selected');
    }

    this.selectedNode = nodeId;

    if (nodeId) {
      const nodeEl = this.svg.querySelector(`[data-id="${nodeId}"]`);
      nodeEl?.classList.add('selected');
    }
  },

  /**
   * Safely escape text for display
   */
  escapeText(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Build tooltip content safely using DOM methods
   */
  buildTooltipContent(stakeholder) {
    const category = Templates.getCategory(stakeholder.category);

    // Clear existing content
    this.tooltip.textContent = '';

    // Name header
    const nameEl = document.createElement('h4');
    nameEl.textContent = stakeholder.name;
    this.tooltip.appendChild(nameEl);

    // Role/org line
    if (stakeholder.role) {
      const roleEl = document.createElement('p');
      roleEl.className = 'text-sm';
      roleEl.textContent = stakeholder.role + (stakeholder.organization ? ` at ${stakeholder.organization}` : '');
      this.tooltip.appendChild(roleEl);
    }

    // Category and influence badges
    const badgeContainer = document.createElement('div');
    badgeContainer.className = 'flex items-center gap-2 mt-2';

    const categoryBadge = document.createElement('span');
    categoryBadge.className = `text-xs px-2 py-0.5 rounded-full ${category.bgColor} ${category.textColor}`;
    categoryBadge.textContent = category.label;
    badgeContainer.appendChild(categoryBadge);

    const influenceLabel = document.createElement('span');
    influenceLabel.className = 'text-xs text-gray-500';
    influenceLabel.textContent = `${stakeholder.influence} influence`;
    badgeContainer.appendChild(influenceLabel);

    this.tooltip.appendChild(badgeContainer);

    // Notes preview
    if (stakeholder.notes) {
      const notesEl = document.createElement('p');
      notesEl.className = 'text-xs text-gray-600 mt-2 border-t pt-2';
      const noteText = stakeholder.notes.substring(0, 100);
      notesEl.textContent = noteText + (stakeholder.notes.length > 100 ? '...' : '');
      this.tooltip.appendChild(notesEl);
    }
  },

  /**
   * Show tooltip for a node
   */
  showTooltip(e, stakeholder) {
    this.buildTooltipContent(stakeholder);
    this.tooltip.style.display = 'block';
    this.tooltip.style.left = `${e.clientX + 15}px`;
    this.tooltip.style.top = `${e.clientY + 15}px`;
  },

  /**
   * Hide tooltip
   */
  hideTooltip() {
    this.tooltip.style.display = 'none';
  },

  /**
   * Build context menu using DOM methods
   */
  buildContextMenu(items) {
    const menu = document.createElement('div');
    menu.className = 'context-menu';

    items.forEach(item => {
      const btn = document.createElement('button');
      btn.dataset.action = item.action;
      btn.textContent = item.label;
      if (item.danger) {
        btn.className = 'danger';
      }
      menu.appendChild(btn);
    });

    return menu;
  },

  /**
   * Show context menu for a node
   */
  showNodeContextMenu(e, stakeholder) {
    this.hideContextMenus();

    const menu = this.buildContextMenu([
      { action: 'edit', label: 'Edit stakeholder' },
      { action: 'connect', label: 'Add connection' },
      { action: 'delete', label: 'Delete', danger: true },
    ]);

    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;

    menu.addEventListener('click', (ev) => {
      const action = ev.target.dataset.action;
      if (action === 'edit') {
        App.openStakeholderModal(stakeholder.id);
      } else if (action === 'connect') {
        App.openConnectionModal(stakeholder.id);
      } else if (action === 'delete') {
        if (confirm(`Delete "${stakeholder.name}"?`)) {
          Storage.deleteStakeholder(this.currentMapId, stakeholder.id);
          this.render();
          App.updateListView();
        }
      }
      menu.remove();
    });

    document.body.appendChild(menu);

    // Close on click outside
    setTimeout(() => {
      document.addEventListener(
        'click',
        () => menu.remove(),
        { once: true }
      );
    }, 0);
  },

  /**
   * Show context menu for a connection
   */
  showConnectionContextMenu(e, connection) {
    this.hideContextMenus();

    const menu = this.buildContextMenu([
      { action: 'delete', label: 'Delete connection', danger: true },
    ]);

    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;

    menu.addEventListener('click', (ev) => {
      const action = ev.target.dataset.action;
      if (action === 'delete') {
        Storage.deleteConnection(this.currentMapId, connection.id);
        this.render();
      }
      menu.remove();
    });

    document.body.appendChild(menu);

    setTimeout(() => {
      document.addEventListener(
        'click',
        () => menu.remove(),
        { once: true }
      );
    }, 0);
  },

  /**
   * Hide all context menus
   */
  hideContextMenus() {
    document.querySelectorAll('.context-menu').forEach((m) => m.remove());
  },

  /**
   * Zoom the canvas
   */
  zoom(delta, clientX = null, clientY = null) {
    const oldScale = this.transform.scale;
    const newScale = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, oldScale + delta));

    if (newScale === oldScale) return;

    // Zoom toward mouse position if provided
    if (clientX !== null && clientY !== null) {
      const rect = this.svg.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      this.transform.x = x - ((x - this.transform.x) / oldScale) * newScale;
      this.transform.y = y - ((y - this.transform.y) / oldScale) * newScale;
    }

    this.transform.scale = newScale;
    this.updateTransform();
  },

  /**
   * Reset view to default
   */
  resetView() {
    this.transform = { x: 0, y: 0, scale: 1 };
    this.updateTransform();
  },

  /**
   * Update SVG transform
   */
  updateTransform() {
    const transformGroup = document.getElementById('canvas-transform');
    if (transformGroup) {
      transformGroup.setAttribute(
        'transform',
        `translate(${this.transform.x}, ${this.transform.y}) scale(${this.transform.scale})`
      );
    }
  },

  /**
   * Convert screen coordinates to canvas coordinates
   */
  screenToCanvas(clientX, clientY) {
    const rect = this.svg.getBoundingClientRect();
    return {
      x: (clientX - rect.left - this.transform.x) / this.transform.scale,
      y: (clientY - rect.top - this.transform.y) / this.transform.scale,
    };
  },

  /**
   * Get initials from a name
   */
  getInitials(name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  },

  /**
   * Truncate name for display
   */
  truncateName(name, maxLength) {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + '...';
  },

  /**
   * Center view on all nodes
   */
  centerView() {
    const map = Storage.getMap(this.currentMapId);
    if (!map || map.stakeholders.length === 0) return;

    const rect = this.svg.getBoundingClientRect();
    const positions = map.stakeholders.map((s) => s.position);

    const minX = Math.min(...positions.map((p) => p.x));
    const maxX = Math.max(...positions.map((p) => p.x));
    const minY = Math.min(...positions.map((p) => p.y));
    const maxY = Math.max(...positions.map((p) => p.y));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    this.transform.x = rect.width / 2 - centerX * this.transform.scale;
    this.transform.y = rect.height / 2 - centerY * this.transform.scale;
    this.updateTransform();
  },
};

// Make available globally
window.Canvas = Canvas;
