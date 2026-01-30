/**
 * Storage module for CCM Stakeholder Map
 * Handles localStorage persistence and JSON import/export
 */

const Storage = {
  STORAGE_KEY: 'ccm-stakeholder-maps',

  /**
   * Generate a UUID v4
   */
  generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },

  /**
   * Get all maps from localStorage
   */
  getAllMaps() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load maps from localStorage:', e);
      return [];
    }
  },

  /**
   * Save all maps to localStorage
   */
  saveAllMaps(maps) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(maps));
      return true;
    } catch (e) {
      console.error('Failed to save maps to localStorage:', e);
      return false;
    }
  },

  /**
   * Get a single map by ID
   */
  getMap(mapId) {
    const maps = this.getAllMaps();
    return maps.find((m) => m.id === mapId) || null;
  },

  /**
   * Create a new map
   */
  createMap(mapData) {
    const maps = this.getAllMaps();
    const now = new Date().toISOString();

    const newMap = {
      id: this.generateId(),
      name: mapData.name || 'Untitled map',
      sector: mapData.sector || 'custom',
      isPrivate: mapData.isPrivate || false,
      created: now,
      updated: now,
      stakeholders: mapData.stakeholders || [],
      connections: mapData.connections || [],
    };

    maps.push(newMap);
    this.saveAllMaps(maps);

    return newMap;
  },

  /**
   * Update an existing map
   */
  updateMap(mapId, updates) {
    const maps = this.getAllMaps();
    const index = maps.findIndex((m) => m.id === mapId);

    if (index === -1) {
      return null;
    }

    maps[index] = {
      ...maps[index],
      ...updates,
      updated: new Date().toISOString(),
    };

    this.saveAllMaps(maps);
    return maps[index];
  },

  /**
   * Delete a map
   */
  deleteMap(mapId) {
    const maps = this.getAllMaps();
    const filtered = maps.filter((m) => m.id !== mapId);

    if (filtered.length === maps.length) {
      return false;
    }

    this.saveAllMaps(filtered);
    return true;
  },

  /**
   * Add a stakeholder to a map
   */
  addStakeholder(mapId, stakeholderData) {
    const map = this.getMap(mapId);
    if (!map) return null;

    const stakeholder = {
      id: this.generateId(),
      name: stakeholderData.name,
      role: stakeholderData.role || '',
      organization: stakeholderData.organization || '',
      category: stakeholderData.category,
      influence: stakeholderData.influence || 'medium',
      notes: stakeholderData.notes || '',
      interactionTips: stakeholderData.interactionTips || '',
      avatar: stakeholderData.avatar || '',
      isPrivate: stakeholderData.isPrivate || false,
      position: stakeholderData.position || this.getDefaultPosition(map.stakeholders.length),
    };

    map.stakeholders.push(stakeholder);
    this.updateMap(mapId, { stakeholders: map.stakeholders });

    return stakeholder;
  },

  /**
   * Get default position for a new node (spiral layout)
   */
  getDefaultPosition(index) {
    const centerX = 400;
    const centerY = 300;
    const radius = 100 + index * 30;
    const angle = (index * 137.5 * Math.PI) / 180; // Golden angle

    return {
      x: Math.round(centerX + radius * Math.cos(angle)),
      y: Math.round(centerY + radius * Math.sin(angle)),
    };
  },

  /**
   * Update a stakeholder
   */
  updateStakeholder(mapId, stakeholderId, updates) {
    const map = this.getMap(mapId);
    if (!map) return null;

    const index = map.stakeholders.findIndex((s) => s.id === stakeholderId);
    if (index === -1) return null;

    map.stakeholders[index] = {
      ...map.stakeholders[index],
      ...updates,
    };

    this.updateMap(mapId, { stakeholders: map.stakeholders });
    return map.stakeholders[index];
  },

  /**
   * Delete a stakeholder (also removes related connections)
   */
  deleteStakeholder(mapId, stakeholderId) {
    const map = this.getMap(mapId);
    if (!map) return false;

    map.stakeholders = map.stakeholders.filter((s) => s.id !== stakeholderId);
    map.connections = map.connections.filter(
      (c) => c.from !== stakeholderId && c.to !== stakeholderId
    );

    this.updateMap(mapId, {
      stakeholders: map.stakeholders,
      connections: map.connections,
    });

    return true;
  },

  /**
   * Add a connection between stakeholders
   */
  addConnection(mapId, connectionData) {
    const map = this.getMap(mapId);
    if (!map) return null;

    // Check if connection already exists
    const exists = map.connections.some(
      (c) => c.from === connectionData.from && c.to === connectionData.to
    );
    if (exists) return null;

    const connection = {
      id: this.generateId(),
      from: connectionData.from,
      to: connectionData.to,
      type: connectionData.type || 'works-with',
      notes: connectionData.notes || '',
    };

    map.connections.push(connection);
    this.updateMap(mapId, { connections: map.connections });

    return connection;
  },

  /**
   * Delete a connection
   */
  deleteConnection(mapId, connectionId) {
    const map = this.getMap(mapId);
    if (!map) return false;

    map.connections = map.connections.filter((c) => c.id !== connectionId);
    this.updateMap(mapId, { connections: map.connections });

    return true;
  },

  /**
   * Export a single map as JSON
   */
  exportMap(mapId) {
    const map = this.getMap(mapId);
    if (!map) return null;

    return JSON.stringify(map, null, 2);
  },

  /**
   * Export a map with private data stripped for sharing
   */
  exportMapPublic(mapId) {
    const map = this.getMap(mapId);
    if (!map) return null;

    const publicMap = {
      ...map,
      stakeholders: map.stakeholders.map((s) => ({
        ...s,
        notes: s.isPrivate ? '' : s.notes,
        interactionTips: s.isPrivate ? '' : s.interactionTips,
      })),
    };

    return JSON.stringify(publicMap, null, 2);
  },

  /**
   * Export all maps as JSON
   */
  exportAllMaps() {
    const maps = this.getAllMaps();
    return JSON.stringify(
      {
        version: '1.0',
        exported: new Date().toISOString(),
        maps,
      },
      null,
      2
    );
  },

  /**
   * Import a single map from JSON
   */
  importMap(jsonString) {
    try {
      const mapData = JSON.parse(jsonString);

      // Validate required fields
      if (!mapData.name || !Array.isArray(mapData.stakeholders)) {
        throw new Error('Invalid map format');
      }

      // Generate new IDs to avoid conflicts
      const idMap = {};
      const newStakeholders = mapData.stakeholders.map((s) => {
        const newId = this.generateId();
        idMap[s.id] = newId;
        return { ...s, id: newId };
      });

      const newConnections = (mapData.connections || []).map((c) => ({
        ...c,
        id: this.generateId(),
        from: idMap[c.from] || c.from,
        to: idMap[c.to] || c.to,
      }));

      return this.createMap({
        name: mapData.name + ' (imported)',
        sector: mapData.sector,
        isPrivate: mapData.isPrivate,
        stakeholders: newStakeholders,
        connections: newConnections,
      });
    } catch (e) {
      console.error('Failed to import map:', e);
      return null;
    }
  },

  /**
   * Import multiple maps from JSON (bulk export format)
   */
  importAllMaps(jsonString) {
    try {
      const data = JSON.parse(jsonString);

      if (!data.maps || !Array.isArray(data.maps)) {
        // Try importing as single map
        return this.importMap(jsonString) ? 1 : 0;
      }

      let imported = 0;
      for (const mapData of data.maps) {
        if (this.importMap(JSON.stringify(mapData))) {
          imported++;
        }
      }

      return imported;
    } catch (e) {
      console.error('Failed to import maps:', e);
      return 0;
    }
  },

  /**
   * Get storage usage info
   */
  getStorageInfo() {
    const data = localStorage.getItem(this.STORAGE_KEY) || '';
    const maps = this.getAllMaps();
    const totalStakeholders = maps.reduce((sum, m) => sum + m.stakeholders.length, 0);
    const totalConnections = maps.reduce((sum, m) => sum + m.connections.length, 0);

    return {
      mapCount: maps.length,
      stakeholderCount: totalStakeholders,
      connectionCount: totalConnections,
      bytesUsed: new Blob([data]).size,
    };
  },

  /**
   * Parse CSV string into array of objects
   */
  parseCSV(csvString) {
    const lines = csvString.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) return [];

    // Parse header row
    const headers = this.parseCSVLine(lines[0]).map(h =>
      h.toLowerCase().trim().replace(/\s+/g, '_')
    );

    // Parse data rows
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length === 0 || values.every(v => !v.trim())) continue;

      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || '';
      });
      rows.push(row);
    }
    return rows;
  },

  /**
   * Parse a single CSV line handling quoted values
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          current += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          result.push(current);
          current = '';
        } else {
          current += char;
        }
      }
    }
    result.push(current);
    return result;
  },

  /**
   * Calculate positions for stakeholders using golden angle
   */
  calculatePositions(count, centerX = 500, centerY = 350, radius = 200) {
    const positions = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < count; i++) {
      const angle = i * goldenAngle;
      const r = radius * (0.5 + 0.5 * (i / Math.max(count - 1, 1)));
      positions.push({
        x: Math.round(centerX + r * Math.cos(angle)),
        y: Math.round(centerY + r * Math.sin(angle))
      });
    }
    return positions;
  },

  /**
   * Import stakeholders from CSV string
   */
  importCSV(csvString, mapName = 'Imported Map') {
    const VALID_CATEGORIES = ['ally', 'advocate', 'decisionmaker', 'obstacle', 'dependency', 'opportunity'];
    const VALID_INFLUENCE = ['high', 'medium', 'low'];

    try {
      const rows = this.parseCSV(csvString);
      if (rows.length === 0) {
        return { success: false, error: 'No data found in CSV' };
      }

      const stakeholders = [];
      const errors = [];

      rows.forEach((row, index) => {
        const rowNum = index + 2; // Account for header row

        // Required: name
        const name = row.name?.trim();
        if (!name) {
          errors.push(`Row ${rowNum}: Missing required field 'name'`);
          return;
        }

        // Required: category
        const category = row.category?.toLowerCase().trim();
        if (!category || !VALID_CATEGORIES.includes(category)) {
          errors.push(`Row ${rowNum}: Invalid category '${category}'. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
          return;
        }

        // Optional: influence (default: medium)
        let influence = row.influence?.toLowerCase().trim() || 'medium';
        if (!VALID_INFLUENCE.includes(influence)) {
          influence = 'medium';
        }

        // Optional: isPrivate (default: false)
        const isPrivate = ['true', 'yes', '1', 'y'].includes(
          (row.is_private || row.isprivate || '').toLowerCase().trim()
        );

        stakeholders.push({
          name,
          role: row.role?.trim() || '',
          organization: row.organization?.trim() || '',
          category,
          influence,
          notes: row.notes?.trim() || '',
          interactionTips: (row.interaction_tips || row.interactiontips || '').trim(),
          avatar: (row.avatar_url || row.avatar || '').trim(),
          isPrivate
        });
      });

      if (stakeholders.length === 0) {
        return {
          success: false,
          error: 'No valid stakeholders found',
          errors
        };
      }

      // Add positions
      const positions = this.calculatePositions(stakeholders.length);
      stakeholders.forEach((s, i) => {
        s.position = positions[i];
      });

      // Create the map
      const mapData = {
        name: mapName,
        sector: 'custom',
        isPrivate: false,
        stakeholders,
        connections: []
      };

      const newMap = this.importMap(JSON.stringify(mapData));

      if (newMap) {
        return {
          success: true,
          mapId: newMap.id,
          stakeholderCount: stakeholders.length,
          errors: errors.length > 0 ? errors : null
        };
      } else {
        return { success: false, error: 'Failed to create map' };
      }
    } catch (e) {
      console.error('CSV import error:', e);
      return { success: false, error: e.message };
    }
  },

  /**
   * Clear all data (for testing/reset)
   */
  clearAll() {
    localStorage.removeItem(this.STORAGE_KEY);
  },
};

// Make available globally
window.Storage = Storage;
