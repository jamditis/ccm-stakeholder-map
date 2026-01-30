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
   * Clear all data (for testing/reset)
   */
  clearAll() {
    localStorage.removeItem(this.STORAGE_KEY);
  },
};

// Make available globally
window.Storage = Storage;
