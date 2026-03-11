# Overture Maps — Themes & Types

This document describes the **six themes** in the Overture Maps dataset and their associated **types**, based on the `row_counts` metrics data.

---

## 1. Addresses

**Partition**  
`theme=addresses`  
`type=address`

Contains **postal address records** from around the world.  
Each row represents a **physical address** grouped by geographic and administrative attributes.

### Address Hierarchy

| Column | Description |
|------|------|
| `address_level_1` | State / region |
| `address_level_2` | City / county |
| `address_level_3` | Local area (zipcode, town, etc.) |

### Key Columns

- `country`
- `address_level_1`
- `address_level_2`
- `address_level_3`

---

## 2. Base

**Partition**  
`theme=base`

Contains **foundational geographic and land features**, including both natural and human-made structures.

### Types

| Type | Description |
|------|------|
| `bathymetry` | Underwater terrain and ocean depth |
| `infrastructure` | Bridges, towers, utilities, and other built structures |
| `land` | General landmass and terrain |
| `land_cover` | Surface cover classification (forest, grassland, urban, etc.) |
| `land_use` | Land usage categories (residential, agricultural, commercial) |
| `water` | Rivers, lakes, oceans, and other water bodies |
