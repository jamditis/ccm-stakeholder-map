#!/usr/bin/env python3
"""
Convert CSV stakeholder data to JSON format for CCM Stakeholder Map import.

Usage:
    python csv_to_json.py input.csv output.json
    python csv_to_json.py input.csv  # outputs to input_map.json

CSV columns (header row required):
    name          - Person's name (required)
    role          - Job title
    organization  - Company/org name
    category      - One of: ally, advocate, decisionmaker, obstacle, dependency, opportunity (required)
    influence     - One of: high, medium, low (default: medium)
    notes         - Background info
    interaction_tips - How to work with them
    avatar_url    - URL to photo
    is_private    - true/false (default: false)
"""

import csv
import json
import sys
import math
from pathlib import Path


VALID_CATEGORIES = {'ally', 'advocate', 'decisionmaker', 'obstacle', 'dependency', 'opportunity'}
VALID_INFLUENCE = {'high', 'medium', 'low'}


def calculate_positions(count: int, center_x: float = 500, center_y: float = 350, radius: float = 200) -> list:
    """Calculate positions using golden angle for even distribution."""
    positions = []
    golden_angle = math.pi * (3 - math.sqrt(5))  # ~137.5 degrees

    for i in range(count):
        # Spiral outward using golden angle
        angle = i * golden_angle
        # Vary radius slightly for visual interest
        r = radius * (0.5 + 0.5 * (i / max(count - 1, 1)))
        x = center_x + r * math.cos(angle)
        y = center_y + r * math.sin(angle)
        positions.append({'x': round(x), 'y': round(y)})

    return positions


def parse_bool(value: str) -> bool:
    """Parse boolean from string."""
    return value.lower() in ('true', 'yes', '1', 'y')


def convert_csv_to_json(csv_path: str, map_name: str = None) -> dict:
    """Convert CSV file to stakeholder map JSON format."""
    stakeholders = []
    errors = []

    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)

        # Normalize column names (lowercase, strip whitespace, replace spaces with underscores)
        if reader.fieldnames:
            reader.fieldnames = [name.lower().strip().replace(' ', '_') for name in reader.fieldnames]

        for row_num, row in enumerate(reader, start=2):  # Start at 2 since row 1 is header
            # Required fields
            name = row.get('name', '').strip()
            if not name:
                errors.append(f"Row {row_num}: Missing required field 'name'")
                continue

            category = row.get('category', '').strip().lower()
            if category not in VALID_CATEGORIES:
                errors.append(f"Row {row_num}: Invalid category '{category}'. Must be one of: {', '.join(VALID_CATEGORIES)}")
                continue

            # Optional fields with defaults
            influence = row.get('influence', 'medium').strip().lower()
            if influence not in VALID_INFLUENCE:
                influence = 'medium'

            is_private = parse_bool(row.get('is_private', 'false'))

            stakeholder = {
                'name': name,
                'role': row.get('role', '').strip(),
                'organization': row.get('organization', '').strip(),
                'category': category,
                'influence': influence,
                'notes': row.get('notes', '').strip(),
                'interactionTips': row.get('interaction_tips', '').strip(),
                'avatar': row.get('avatar_url', '').strip(),
                'isPrivate': is_private,
            }

            stakeholders.append(stakeholder)

    if errors:
        print("Errors found in CSV:")
        for error in errors:
            print(f"  - {error}")
        if not stakeholders:
            raise ValueError("No valid stakeholders found in CSV")
        print(f"\nProceeding with {len(stakeholders)} valid stakeholders...")

    # Calculate positions for each stakeholder
    positions = calculate_positions(len(stakeholders))
    for stakeholder, position in zip(stakeholders, positions):
        stakeholder['position'] = position

    # Build map object
    if not map_name:
        map_name = Path(csv_path).stem.replace('_', ' ').replace('-', ' ').title()

    return {
        'name': map_name,
        'sector': 'custom',
        'isPrivate': False,
        'stakeholders': stakeholders,
        'connections': []
    }


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    csv_path = sys.argv[1]

    if len(sys.argv) >= 3:
        json_path = sys.argv[2]
    else:
        json_path = Path(csv_path).stem + '_map.json'

    if not Path(csv_path).exists():
        print(f"Error: File not found: {csv_path}")
        sys.exit(1)

    try:
        map_data = convert_csv_to_json(csv_path)

        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(map_data, f, indent=2)

        print(f"Successfully converted {len(map_data['stakeholders'])} stakeholders")
        print(f"Output saved to: {json_path}")
        print(f"\nTo import: Open the Stakeholder Map app and click 'Import', then select {json_path}")

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
