/**
 * Main application module for CCM Stakeholder Map
 * Coordinates UI, storage, canvas, and export functionality
 */

const App = {
  // State
  currentMapId: null,
  currentView: 'canvas', // 'canvas' or 'list'
  pendingPosition: null, // For placing new stakeholder at double-click location

  /**
   * Initialize the application
   */
  init() {
    this.bindEvents();
    this.loadMaps();
    this.renderTemplateCards();

    // Check URL hash for map ID
    const hashMapId = window.location.hash.slice(1);
    if (hashMapId) {
      const map = Storage.getMap(hashMapId);
      if (map) {
        this.selectMap(hashMapId);
      }
    }
  },

  /**
   * Bind global event handlers
   */
  bindEvents() {
    // New map buttons (desktop + mobile)
    document.getElementById('new-map-btn')?.addEventListener('click', () => this.openNewMapModal());
    document.getElementById('new-map-btn-mobile')?.addEventListener('click', () => this.openNewMapModal());
    document.getElementById('welcome-new-map-btn')?.addEventListener('click', () => this.openNewMapModal());

    // Map selector (desktop + mobile)
    document.getElementById('current-map-select')?.addEventListener('change', (e) => {
      if (e.target.value) {
        this.selectMap(e.target.value);
      }
    });
    document.getElementById('current-map-select-mobile')?.addEventListener('change', (e) => {
      if (e.target.value) {
        this.selectMap(e.target.value);
      }
    });

    // View toggle
    document.getElementById('view-canvas-btn')?.addEventListener('click', () => this.setView('canvas'));
    document.getElementById('view-list-btn')?.addEventListener('click', () => this.setView('list'));

    // Add stakeholder buttons (desktop + mobile)
    document.getElementById('add-stakeholder-btn')?.addEventListener('click', () => this.openStakeholderModal());
    document.getElementById('add-stakeholder-btn-mobile')?.addEventListener('click', () => this.openStakeholderModal());
    document.getElementById('add-stakeholder-list-btn')?.addEventListener('click', () => this.openStakeholderModal());

    // Map settings
    document.getElementById('map-name-input')?.addEventListener('change', (e) => {
      if (this.currentMapId) {
        Storage.updateMap(this.currentMapId, { name: e.target.value });
        this.loadMaps();
      }
    });

    document.getElementById('map-private-toggle')?.addEventListener('change', (e) => {
      if (this.currentMapId) {
        Storage.updateMap(this.currentMapId, { isPrivate: e.target.checked });
      }
    });

    document.getElementById('delete-map-btn')?.addEventListener('click', () => this.deleteCurrentMap());

    // List view filters
    document.getElementById('filter-category')?.addEventListener('change', () => this.updateListView());
    document.getElementById('filter-influence')?.addEventListener('change', () => this.updateListView());

    // Modals
    this.bindModalEvents();

    // Export menu
    this.bindExportMenu();

    // Legend toggle (mobile)
    this.bindLegendToggle();

    // Import (desktop + mobile)
    document.getElementById('import-btn')?.addEventListener('click', () => {
      document.getElementById('import-file-input')?.click();
    });
    document.getElementById('import-btn-mobile')?.addEventListener('click', () => {
      document.getElementById('import-file-input')?.click();
    });
    document.getElementById('import-file-input')?.addEventListener('change', (e) => this.handleImport(e));
  },

  /**
   * Bind legend toggle for mobile
   */
  bindLegendToggle() {
    const legendToggleBtn = document.getElementById('legend-toggle-btn');
    const legendCloseBtn = document.getElementById('legend-close-btn');
    const legend = document.getElementById('canvas-legend');

    legendToggleBtn?.addEventListener('click', () => {
      legend?.classList.toggle('hidden');
      legend?.classList.toggle('block');
    });

    legendCloseBtn?.addEventListener('click', () => {
      legend?.classList.add('hidden');
      legend?.classList.remove('block');
    });
  },

  /**
   * Bind modal event handlers
   */
  bindModalEvents() {
    // Stakeholder modal
    const stakeholderModal = document.getElementById('stakeholder-modal');
    const stakeholderForm = document.getElementById('stakeholder-form');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const modalCloseXBtn = document.getElementById('modal-close-x-btn');
    const modalDeleteBtn = document.getElementById('modal-delete-btn');

    modalBackdrop?.addEventListener('click', () => this.closeStakeholderModal());
    modalCancelBtn?.addEventListener('click', () => this.closeStakeholderModal());
    modalCloseXBtn?.addEventListener('click', () => this.closeStakeholderModal());
    modalDeleteBtn?.addEventListener('click', () => this.deleteCurrentStakeholder());
    stakeholderForm?.addEventListener('submit', (e) => this.handleStakeholderSubmit(e));

    // New map modal
    const newMapModal = document.getElementById('new-map-modal');
    const newMapForm = document.getElementById('new-map-form');
    const newMapBackdrop = document.getElementById('new-map-backdrop');
    const newMapCancelBtn = document.getElementById('new-map-cancel-btn');
    const newMapCloseXBtn = document.getElementById('new-map-close-x-btn');

    newMapBackdrop?.addEventListener('click', () => this.closeNewMapModal());
    newMapCancelBtn?.addEventListener('click', () => this.closeNewMapModal());
    newMapCloseXBtn?.addEventListener('click', () => this.closeNewMapModal());
    newMapForm?.addEventListener('submit', (e) => this.handleNewMapSubmit(e));

    // Connection modal
    const connectionModal = document.getElementById('connection-modal');
    const connectionForm = document.getElementById('connection-form');
    const connectionBackdrop = document.getElementById('connection-backdrop');
    const connectionCancelBtn = document.getElementById('connection-cancel-btn');
    const connectionCloseXBtn = document.getElementById('connection-close-x-btn');

    connectionBackdrop?.addEventListener('click', () => this.closeConnectionModal());
    connectionCancelBtn?.addEventListener('click', () => this.closeConnectionModal());
    connectionCloseXBtn?.addEventListener('click', () => this.closeConnectionModal());
    connectionForm?.addEventListener('submit', (e) => this.handleConnectionSubmit(e));

    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeStakeholderModal();
        this.closeNewMapModal();
        this.closeConnectionModal();
        this.closeExportMenu();
      }
    });
  },

  /**
   * Bind export menu events
   */
  bindExportMenu() {
    const exportMenuBtn = document.getElementById('export-menu-btn');
    const exportMenuBtnMobile = document.getElementById('export-menu-btn-mobile');
    const exportMenu = document.getElementById('export-menu');
    const exportMenuBackdrop = document.getElementById('export-menu-backdrop');
    const exportMenuCloseBtn = document.getElementById('export-menu-close-btn');

    // Desktop export button
    exportMenuBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = exportMenuBtn.getBoundingClientRect();
      // Only position for desktop
      if (window.innerWidth >= 640) {
        const menuContent = exportMenu.querySelector('div:last-child');
        if (menuContent) {
          menuContent.style.top = `${rect.bottom + 4}px`;
          menuContent.style.right = `${window.innerWidth - rect.right}px`;
        }
      }
      exportMenu.classList.toggle('hidden');
    });

    // Mobile export button
    exportMenuBtnMobile?.addEventListener('click', (e) => {
      e.stopPropagation();
      exportMenu.classList.remove('hidden');
    });

    // Close on backdrop click (mobile)
    exportMenuBackdrop?.addEventListener('click', () => this.closeExportMenu());
    exportMenuCloseBtn?.addEventListener('click', () => this.closeExportMenu());

    // Desktop: close on document click
    document.addEventListener('click', (e) => {
      if (window.innerWidth >= 640 && !exportMenu.contains(e.target)) {
        this.closeExportMenu();
      }
    });

    document.getElementById('export-json-btn')?.addEventListener('click', () => {
      if (this.currentMapId) Export.downloadJSON(this.currentMapId);
      this.closeExportMenu();
    });

    document.getElementById('export-pdf-btn')?.addEventListener('click', () => {
      if (this.currentMapId) Export.downloadFieldGuidePDF(this.currentMapId);
      this.closeExportMenu();
    });

    document.getElementById('export-html-btn')?.addEventListener('click', () => {
      if (this.currentMapId) Export.downloadStandaloneHTML(this.currentMapId);
      this.closeExportMenu();
    });

    document.getElementById('export-md-btn')?.addEventListener('click', () => {
      if (this.currentMapId) Export.downloadMarkdown(this.currentMapId);
      this.closeExportMenu();
    });

    document.getElementById('export-all-btn')?.addEventListener('click', () => {
      Export.downloadAllMapsJSON();
      this.closeExportMenu();
    });
  },

  /**
   * Close export menu
   */
  closeExportMenu() {
    document.getElementById('export-menu')?.classList.add('hidden');
  },

  /**
   * Load maps into the selector
   */
  loadMaps() {
    const select = document.getElementById('current-map-select');
    const selectMobile = document.getElementById('current-map-select-mobile');

    const maps = Storage.getAllMaps();

    // Helper to populate a select element
    const populateSelect = (selectEl) => {
      if (!selectEl) return;

      selectEl.textContent = '';

      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Select a map...';
      selectEl.appendChild(defaultOption);

      maps.forEach(map => {
        const option = document.createElement('option');
        option.value = map.id;
        option.textContent = map.name;
        if (map.id === this.currentMapId) {
          option.selected = true;
        }
        selectEl.appendChild(option);
      });
    };

    // Populate both desktop and mobile selects
    populateSelect(select);
    populateSelect(selectMobile);

    // Update welcome state visibility
    const welcomeState = document.getElementById('welcome-state');
    const mapWorkspace = document.getElementById('map-workspace');

    if (this.currentMapId) {
      welcomeState?.classList.add('hidden');
      mapWorkspace?.classList.remove('hidden');
    } else {
      welcomeState?.classList.remove('hidden');
      mapWorkspace?.classList.add('hidden');
    }
  },

  /**
   * Render template cards on welcome screen
   */
  renderTemplateCards() {
    const container = document.getElementById('template-cards');
    if (!container) return;

    container.textContent = '';

    const sectors = Templates.getAllSectors().filter(s => s.id !== 'custom');

    sectors.forEach(sector => {
      const card = document.createElement('button');
      card.className = 'template-card';
      card.addEventListener('click', () => this.createFromTemplate(sector.id));

      const iconSpan = document.createElement('span');
      iconSpan.className = 'template-icon text-2xl';
      iconSpan.textContent = sector.icon;

      const title = document.createElement('div');
      title.className = 'font-medium text-sm mt-2';
      title.textContent = sector.name;

      const desc = document.createElement('div');
      desc.className = 'text-xs text-gray-500';
      desc.textContent = sector.description;

      card.appendChild(iconSpan);
      card.appendChild(title);
      card.appendChild(desc);

      container.appendChild(card);
    });
  },

  /**
   * Create a map from a template
   */
  createFromTemplate(sectorId) {
    const templateData = Templates.createFromTemplate(sectorId);
    const map = Storage.createMap(templateData);
    this.selectMap(map.id);
  },

  /**
   * Select and display a map
   */
  selectMap(mapId) {
    this.currentMapId = mapId;
    window.location.hash = mapId;

    const map = Storage.getMap(mapId);
    if (!map) return;

    // Update UI
    this.loadMaps();
    this.updateMapHeader(map);
    Canvas.init(mapId);
    this.updateListView();
    this.setView(this.currentView);
  },

  /**
   * Update map header with current map info
   */
  updateMapHeader(map) {
    const nameInput = document.getElementById('map-name-input');
    const sectorBadge = document.getElementById('map-sector-badge');
    const privateToggle = document.getElementById('map-private-toggle');

    if (nameInput) nameInput.value = map.name;
    if (sectorBadge) {
      const sector = Templates.getSector(map.sector);
      sectorBadge.textContent = sector.name;
    }
    if (privateToggle) privateToggle.checked = map.isPrivate || false;
  },

  /**
   * Set the current view
   */
  setView(view) {
    this.currentView = view;

    const canvasView = document.getElementById('canvas-view');
    const listView = document.getElementById('list-view');
    const canvasBtn = document.getElementById('view-canvas-btn');
    const listBtn = document.getElementById('view-list-btn');

    if (view === 'canvas') {
      canvasView?.classList.remove('hidden');
      listView?.classList.add('hidden');
      canvasBtn?.classList.add('border-blue-600', 'text-blue-600');
      canvasBtn?.classList.remove('border-transparent', 'text-gray-500');
      listBtn?.classList.remove('border-blue-600', 'text-blue-600');
      listBtn?.classList.add('border-transparent', 'text-gray-500');
    } else {
      canvasView?.classList.add('hidden');
      listView?.classList.remove('hidden');
      listBtn?.classList.add('border-blue-600', 'text-blue-600');
      listBtn?.classList.remove('border-transparent', 'text-gray-500');
      canvasBtn?.classList.remove('border-blue-600', 'text-blue-600');
      canvasBtn?.classList.add('border-transparent', 'text-gray-500');
    }
  },

  /**
   * Update list view with stakeholders
   */
  updateListView() {
    if (!this.currentMapId) return;

    const map = Storage.getMap(this.currentMapId);
    if (!map) return;

    const listContainer = document.getElementById('stakeholder-list');
    const emptyState = document.getElementById('empty-list-state');
    if (!listContainer) return;

    // Get filters
    const categoryFilter = document.getElementById('filter-category')?.value || '';
    const influenceFilter = document.getElementById('filter-influence')?.value || '';

    // Filter stakeholders
    let stakeholders = map.stakeholders;
    if (categoryFilter) {
      stakeholders = stakeholders.filter(s => s.category === categoryFilter);
    }
    if (influenceFilter) {
      stakeholders = stakeholders.filter(s => s.influence === influenceFilter);
    }

    // Clear container
    listContainer.textContent = '';

    if (stakeholders.length === 0) {
      emptyState?.classList.remove('hidden');
      return;
    }

    emptyState?.classList.add('hidden');

    // Render stakeholder cards
    stakeholders.forEach(stakeholder => {
      const card = this.createStakeholderCard(stakeholder);
      listContainer.appendChild(card);
    });
  },

  /**
   * Create a stakeholder card for list view
   */
  createStakeholderCard(stakeholder) {
    const category = Templates.getCategory(stakeholder.category);

    const card = document.createElement('div');
    card.className = 'stakeholder-card';
    card.addEventListener('click', () => this.openStakeholderModal(stakeholder.id));

    // Header row
    const header = document.createElement('div');
    header.className = 'flex items-start justify-between';

    // Left side (avatar + info)
    const leftSide = document.createElement('div');
    leftSide.className = 'flex items-start gap-3';

    // Avatar
    const avatar = document.createElement('div');
    if (stakeholder.avatar) {
      const img = document.createElement('img');
      img.src = stakeholder.avatar;
      img.alt = stakeholder.name;
      img.className = 'w-10 h-10 rounded-full object-cover';
      avatar.appendChild(img);
    } else {
      avatar.className = 'avatar-placeholder';
      avatar.textContent = stakeholder.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    }
    leftSide.appendChild(avatar);

    // Name and role
    const info = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'font-medium text-gray-900';
    name.textContent = stakeholder.name;
    info.appendChild(name);

    if (stakeholder.role || stakeholder.organization) {
      const role = document.createElement('div');
      role.className = 'text-sm text-gray-500';
      role.textContent = [stakeholder.role, stakeholder.organization].filter(Boolean).join(' at ');
      info.appendChild(role);
    }
    leftSide.appendChild(info);
    header.appendChild(leftSide);

    // Right side (badges)
    const badges = document.createElement('div');
    badges.className = 'flex items-center gap-2';

    const categoryBadge = document.createElement('span');
    categoryBadge.className = `category-badge category-${stakeholder.category}`;
    categoryBadge.textContent = category.label;
    badges.appendChild(categoryBadge);

    if (stakeholder.influence === 'high') {
      const influenceBadge = document.createElement('span');
      influenceBadge.className = 'text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800';
      influenceBadge.textContent = '★ High';
      badges.appendChild(influenceBadge);
    }
    header.appendChild(badges);

    card.appendChild(header);

    // Notes preview
    if (stakeholder.notes) {
      const notes = document.createElement('p');
      notes.className = 'mt-2 text-sm text-gray-600 line-clamp-2';
      notes.textContent = stakeholder.notes;
      card.appendChild(notes);
    }

    return card;
  },

  /**
   * Open stakeholder modal
   */
  openStakeholderModal(stakeholderId = null, position = null) {
    const modal = document.getElementById('stakeholder-modal');
    const form = document.getElementById('stakeholder-form');
    const title = document.getElementById('modal-title');
    const deleteBtn = document.getElementById('modal-delete-btn');

    if (!modal || !form) return;

    // Reset form
    form.reset();

    if (stakeholderId) {
      // Edit mode
      const map = Storage.getMap(this.currentMapId);
      const stakeholder = map?.stakeholders.find(s => s.id === stakeholderId);
      if (!stakeholder) return;

      title.textContent = 'Edit stakeholder';
      deleteBtn?.classList.remove('hidden');

      // Populate form
      document.getElementById('stakeholder-id').value = stakeholder.id;
      document.getElementById('stakeholder-name').value = stakeholder.name;
      document.getElementById('stakeholder-role').value = stakeholder.role || '';
      document.getElementById('stakeholder-org').value = stakeholder.organization || '';
      document.getElementById('stakeholder-category').value = stakeholder.category;
      document.getElementById('stakeholder-influence').value = stakeholder.influence || 'medium';
      document.getElementById('stakeholder-avatar').value = stakeholder.avatar || '';
      document.getElementById('stakeholder-notes').value = stakeholder.notes || '';
      document.getElementById('stakeholder-tips').value = stakeholder.interactionTips || '';
      document.getElementById('stakeholder-private').checked = stakeholder.isPrivate || false;
    } else {
      // Add mode
      title.textContent = 'Add stakeholder';
      deleteBtn?.classList.add('hidden');
      document.getElementById('stakeholder-id').value = '';

      // Save position for later
      this.pendingPosition = position;
    }

    modal.classList.remove('hidden');
    document.getElementById('stakeholder-name')?.focus();
  },

  /**
   * Close stakeholder modal
   */
  closeStakeholderModal() {
    document.getElementById('stakeholder-modal')?.classList.add('hidden');
    this.pendingPosition = null;
  },

  /**
   * Handle stakeholder form submission
   */
  handleStakeholderSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const stakeholderData = {
      name: formData.get('name'),
      role: formData.get('role'),
      organization: formData.get('organization'),
      category: formData.get('category'),
      influence: formData.get('influence'),
      avatar: formData.get('avatar'),
      notes: formData.get('notes'),
      interactionTips: formData.get('interactionTips'),
      isPrivate: form.querySelector('#stakeholder-private').checked,
    };

    const stakeholderId = formData.get('id');

    if (stakeholderId) {
      // Update existing
      Storage.updateStakeholder(this.currentMapId, stakeholderId, stakeholderData);
    } else {
      // Create new
      if (this.pendingPosition) {
        stakeholderData.position = this.pendingPosition;
      }
      Storage.addStakeholder(this.currentMapId, stakeholderData);
    }

    this.closeStakeholderModal();
    Canvas.render();
    this.updateListView();
  },

  /**
   * Delete current stakeholder
   */
  deleteCurrentStakeholder() {
    const stakeholderId = document.getElementById('stakeholder-id')?.value;
    if (!stakeholderId) return;

    const map = Storage.getMap(this.currentMapId);
    const stakeholder = map?.stakeholders.find(s => s.id === stakeholderId);
    if (!stakeholder) return;

    if (confirm(`Delete "${stakeholder.name}"?`)) {
      Storage.deleteStakeholder(this.currentMapId, stakeholderId);
      this.closeStakeholderModal();
      Canvas.render();
      this.updateListView();
    }
  },

  /**
   * Open new map modal
   */
  openNewMapModal() {
    const modal = document.getElementById('new-map-modal');
    const form = document.getElementById('new-map-form');
    if (!modal || !form) return;

    form.reset();
    modal.classList.remove('hidden');
    document.getElementById('new-map-name')?.focus();
  },

  /**
   * Close new map modal
   */
  closeNewMapModal() {
    document.getElementById('new-map-modal')?.classList.add('hidden');
  },

  /**
   * Handle new map form submission
   */
  handleNewMapSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const sector = formData.get('sector');
    const name = formData.get('name');
    const isPrivate = form.querySelector('#new-map-private').checked;

    let map;
    if (sector && sector !== 'custom') {
      const templateData = Templates.createFromTemplate(sector, name);
      templateData.isPrivate = isPrivate;
      map = Storage.createMap(templateData);
    } else {
      map = Storage.createMap({
        name,
        sector: 'custom',
        isPrivate,
      });
    }

    this.closeNewMapModal();
    this.selectMap(map.id);
  },

  /**
   * Delete current map
   */
  deleteCurrentMap() {
    if (!this.currentMapId) return;

    const map = Storage.getMap(this.currentMapId);
    if (!map) return;

    if (confirm(`Delete "${map.name}"? This cannot be undone.`)) {
      Storage.deleteMap(this.currentMapId);
      this.currentMapId = null;
      window.location.hash = '';
      this.loadMaps();
    }
  },

  /**
   * Open connection modal
   */
  openConnectionModal(fromStakeholderId = null) {
    const modal = document.getElementById('connection-modal');
    const form = document.getElementById('connection-form');
    if (!modal || !form) return;

    const map = Storage.getMap(this.currentMapId);
    if (!map || map.stakeholders.length < 2) {
      alert('You need at least 2 stakeholders to create a connection.');
      return;
    }

    form.reset();

    // Populate stakeholder dropdowns
    const fromSelect = document.getElementById('connection-from');
    const toSelect = document.getElementById('connection-to');

    [fromSelect, toSelect].forEach(select => {
      if (!select) return;
      select.textContent = '';

      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Select stakeholder...';
      select.appendChild(defaultOption);

      map.stakeholders.forEach(s => {
        const option = document.createElement('option');
        option.value = s.id;
        option.textContent = s.name;
        select.appendChild(option);
      });
    });

    // Pre-select "from" if provided
    if (fromStakeholderId && fromSelect) {
      fromSelect.value = fromStakeholderId;
    }

    modal.classList.remove('hidden');
  },

  /**
   * Close connection modal
   */
  closeConnectionModal() {
    document.getElementById('connection-modal')?.classList.add('hidden');
  },

  /**
   * Handle connection form submission
   */
  handleConnectionSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const from = formData.get('from');
    const to = formData.get('to');

    if (from === to) {
      alert('Cannot connect a stakeholder to themselves.');
      return;
    }

    Storage.addConnection(this.currentMapId, {
      from,
      to,
      type: formData.get('type'),
      notes: formData.get('notes'),
    });

    this.closeConnectionModal();
    Canvas.render();
  },

  /**
   * Handle file import
   */
  handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content !== 'string') return;

      const imported = Storage.importAllMaps(content);
      if (imported > 0) {
        alert(`Imported ${imported} map(s) successfully.`);
        this.loadMaps();

        // Select the first imported map if no map is currently selected
        if (!this.currentMapId) {
          const maps = Storage.getAllMaps();
          if (maps.length > 0) {
            this.selectMap(maps[maps.length - 1].id);
          }
        }
      } else {
        alert('Failed to import maps. Please check the file format.');
      }
    };
    reader.readAsText(file);

    // Reset input for re-import
    e.target.value = '';
  },
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());

// Make available globally for Canvas module callbacks
window.App = App;
