/**
 * Templates module for CCM Stakeholder Map
 * Pre-built templates for common CCM sectors
 */

const Templates = {
  /**
   * Sector template definitions
   */
  sectors: {
    custom: {
      id: 'custom',
      name: 'Custom',
      description: 'Start with a blank canvas',
      icon: '📋',
      color: 'gray',
      suggestedCategories: ['ally', 'advocate', 'decisionmaker', 'obstacle', 'dependency', 'opportunity'],
      exampleStakeholders: [],
    },

    'collaborative-reporting': {
      id: 'collaborative-reporting',
      name: 'Collaborative reporting',
      description: 'Partners, funders, newsroom contacts',
      icon: '📰',
      color: 'blue',
      suggestedCategories: ['ally', 'advocate', 'decisionmaker', 'dependency'],
      exampleStakeholders: [
        {
          name: 'Partner newsroom editor',
          role: 'Managing Editor',
          category: 'ally',
          influence: 'high',
          notes: 'Key contact for story pitches and coordination',
        },
        {
          name: 'Foundation program officer',
          role: 'Program Officer',
          category: 'decisionmaker',
          influence: 'high',
          notes: 'Manages grant funding decisions',
        },
        {
          name: 'Data journalist',
          role: 'Data Reporter',
          category: 'dependency',
          influence: 'medium',
          notes: 'Provides data analysis for collaborative projects',
        },
      ],
    },

    training: {
      id: 'training',
      name: 'Training & workshops',
      description: 'Venue contacts, speakers, participant orgs',
      icon: '🎓',
      color: 'green',
      suggestedCategories: ['ally', 'advocate', 'dependency', 'opportunity'],
      exampleStakeholders: [
        {
          name: 'Venue coordinator',
          role: 'Events Manager',
          category: 'dependency',
          influence: 'medium',
          notes: 'Books training spaces, manages AV setup',
        },
        {
          name: 'Expert trainer',
          role: 'Workshop Facilitator',
          category: 'ally',
          influence: 'medium',
          notes: 'Subject matter expert for specialized workshops',
        },
        {
          name: 'Partner organization lead',
          role: 'Executive Director',
          category: 'advocate',
          influence: 'high',
          notes: 'Sends staff to training, promotes programs',
        },
      ],
    },

    research: {
      id: 'research',
      name: 'Research',
      description: 'Academic partners, data sources, peer reviewers',
      icon: '🔬',
      color: 'purple',
      suggestedCategories: ['ally', 'decisionmaker', 'dependency', 'opportunity'],
      exampleStakeholders: [
        {
          name: 'Academic co-investigator',
          role: 'Professor',
          category: 'ally',
          influence: 'high',
          notes: 'Co-leads research projects, provides methodology expertise',
        },
        {
          name: 'IRB administrator',
          role: 'Research Compliance',
          category: 'decisionmaker',
          influence: 'medium',
          notes: 'Approves research protocols involving human subjects',
        },
        {
          name: 'Data provider contact',
          role: 'Research Analyst',
          category: 'dependency',
          influence: 'medium',
          notes: 'Provides access to proprietary datasets',
        },
      ],
    },

    membership: {
      id: 'membership',
      name: 'Membership & community',
      description: 'Member orgs, sponsors, community leaders',
      icon: '🤝',
      color: 'orange',
      suggestedCategories: ['ally', 'advocate', 'decisionmaker', 'opportunity'],
      exampleStakeholders: [
        {
          name: 'Member organization director',
          role: 'Executive Director',
          category: 'ally',
          influence: 'high',
          notes: 'Active member, attends events, provides feedback',
        },
        {
          name: 'Corporate sponsor contact',
          role: 'Community Relations Manager',
          category: 'advocate',
          influence: 'high',
          notes: 'Champions partnership internally at sponsor org',
        },
        {
          name: 'Community leader',
          role: 'Community Organizer',
          category: 'opportunity',
          influence: 'medium',
          notes: 'Potential future member, active in local journalism circles',
        },
      ],
    },
  },

  /**
   * Get all sector templates
   */
  getAllSectors() {
    return Object.values(this.sectors);
  },

  /**
   * Get a specific sector template
   */
  getSector(sectorId) {
    return this.sectors[sectorId] || this.sectors.custom;
  },

  /**
   * Create a new map with template stakeholders
   */
  createFromTemplate(sectorId, mapName) {
    const sector = this.getSector(sectorId);

    return {
      name: mapName || `${sector.name} map`,
      sector: sectorId,
      stakeholders: sector.exampleStakeholders.map((s, index) => ({
        ...s,
        id: Storage.generateId(),
        organization: '',
        interactionTips: '',
        avatar: '',
        isPrivate: false,
        position: Storage.getDefaultPosition(index),
      })),
      connections: [],
    };
  },

  /**
   * Get category display info - refined palette
   */
  categoryInfo: {
    ally: {
      label: 'Ally',
      description: 'People who support your work',
      color: '#2d9d5d',
      bgColor: 'bg-ally-light',
      textColor: 'text-ally-dark',
    },
    advocate: {
      label: 'Advocate',
      description: 'People who actively vouch for you',
      color: '#4a7fc7',
      bgColor: 'bg-advocate-light',
      textColor: 'text-advocate-dark',
    },
    decisionmaker: {
      label: 'Decision maker',
      description: 'People whose choices directly impact your work',
      color: '#8b5fc7',
      bgColor: 'bg-decisionmaker-light',
      textColor: 'text-decisionmaker-dark',
    },
    obstacle: {
      label: 'Obstacle',
      description: 'People who make work harder',
      color: '#cf5858',
      bgColor: 'bg-obstacle-light',
      textColor: 'text-obstacle-dark',
    },
    dependency: {
      label: 'Dependency',
      description: 'People/teams you rely on',
      color: '#d4874c',
      bgColor: 'bg-dependency-light',
      textColor: 'text-dependency-dark',
    },
    opportunity: {
      label: 'Opportunity',
      description: 'Relationships worth developing',
      color: '#c4a82e',
      bgColor: 'bg-opportunity-light',
      textColor: 'text-opportunity-dark',
    },
  },

  /**
   * Get category info by id
   */
  getCategory(categoryId) {
    return this.categoryInfo[categoryId] || {
      label: categoryId,
      description: '',
      color: '#6b7280',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
    };
  },

  /**
   * Get all categories
   */
  getAllCategories() {
    return Object.entries(this.categoryInfo).map(([id, info]) => ({
      id,
      ...info,
    }));
  },

  /**
   * Connection type definitions
   */
  connectionTypes: {
    'works-with': {
      label: 'Works with',
      description: 'General working relationship',
      style: 'solid',
      color: '#9ca3af',
    },
    'reports-to': {
      label: 'Reports to',
      description: 'Hierarchical reporting relationship',
      style: 'solid',
      color: '#8b5fc7',
    },
    influences: {
      label: 'Influences',
      description: 'Has influence over decisions',
      style: 'dashed',
      color: '#4a7fc7',
    },
    blocks: {
      label: 'Blocks',
      description: 'Can block or impede progress',
      style: 'dashed',
      color: '#ef4444',
    },
    supports: {
      label: 'Supports',
      description: 'Actively supports work',
      style: 'solid',
      color: '#22c55e',
    },
    'depends-on': {
      label: 'Depends on',
      description: 'Work depends on this person',
      style: 'dashed',
      color: '#f97316',
    },
  },

  /**
   * Get connection type info
   */
  getConnectionType(typeId) {
    return this.connectionTypes[typeId] || this.connectionTypes['works-with'];
  },
};

// Make available globally
window.Templates = Templates;
