# Exploratory Data Analysis Findings
**Dataset:** `2025-01-22.0_flattened.csv`  
**Release:** Overture Maps — January 2025

---

## 1. Dataset Overview

The flattened CSV combines all 6 Hive-partitioned themes into a single file.

- **Total rows:** 1,982,500
- **Total columns:** 93
- **Memory usage:** ~1.4 GB
- **Column dtypes:** 74 float64, 6 int64, 13 string

The large column count is a result of merging all themes together — most columns are NaN for rows that don't belong to the relevant theme.

---

## 2. Theme Distribution

Row counts per theme (before filtering):

| Theme          | Row Count |
|----------------|-----------|
| places         | 1,398,243 |
| addresses      | 575,222   |
| divisions      | 7,555     |
| buildings      | 752       |
| base           | 548       |
| transportation | 180       |

`places` and `addresses` dominate the dataset by row count. `transportation` and `base` have very few rows because their data is highly aggregated.

---

## 3. Total Record Counts by Theme & Type

Using `total_count` (the actual number of geographic records represented, not just metric rows):

| Theme          | Type              | Total Count   |
|----------------|-------------------|---------------|
| buildings      | building          | 2,619,869,003 |
| addresses      | address           | 803,918,496   |
| transportation | connector         | 369,147,513   |
| transportation | segment           | 317,614,197   |
| base           | land_cover        | 123,302,114   |
| base           | infrastructure    | 100,993,380   |
| base           | land              | 62,717,022    |
| places         | place             | 55,527,168    |
| base           | water             | 52,894,740    |
| base           | land_use          | 47,218,460    |
| divisions      | division          | 4,363,528     |
| buildings      | building_part     | 3,164,489     |
| divisions      | division_area     | 1,018,993     |
| divisions      | division_boundary | 74,449        |
| base           | bathymetry        | 60,060        |

**Key insight:** Buildings is by far the largest dataset (~2.6 billion records), followed by addresses (~804 million).

---

## 4. Change Type Distribution

| Change Type  | Count     |
|--------------|-----------|
| unchanged    | 1,401,629 |
| added        | 289,135   |
| removed      | 287,724   |
| data_changed | 4,012     |

**Important:** When computing statistics for a release, always filter out `removed` rows:
```python
df_clean = df[df['change_type'] != 'removed']
```
Including `removed` rows will overcount records that no longer exist in the release.

---

## 5. Columns Per Theme

Each theme has its own set of relevant columns. The columns below are non-null for each theme.

### Shared Columns (present across all themes)
`datasets`, `change_type`, `id_count`, `geometry_count`, `bbox_count`, `version_count`, `sources_count`, `total_count`, `theme`, `type`

### addresses
`country`, `address_level_1`, `address_level_2`, `address_level_3`, `country_count`, `postcode_count`, `street_count`, `number_count`, `unit_count`, `address_levels_count`, `postal_city_count`

### base
`average_geometry_length_km`, `total_geometry_length_km`, `average_geometry_area_km2`, `total_geometry_area_km2`, `depth_count`, `cartography_count`, `subtype`, `class`, `level_count`, `subtype_count`, `class_count`, `height_count`, `surface_count`, `names_count`, `source_tags_count`, `wikidata_count`, `elevation_count`, `is_salt_count`, `is_intermittent_count`

### buildings
`average_geometry_area_km2`, `total_geometry_area_km2`, `subtype`, `class`, `level_count`, `subtype_count`, `class_count`, `height_count`, `names_count`, `has_parts_count`, `is_underground_count`, `num_floors_count`, `num_floors_underground_count`, `min_height_count`, `min_floor_count`, `facade_color_count`, `facade_material_count`, `roof_material_count`, `roof_shape_count`, `roof_direction_count`, `roof_orientation_count`, `roof_color_count`, `roof_height_count`, `building_id_count`

### divisions
`country`, `average_geometry_length_km`, `total_geometry_length_km`, `average_geometry_area_km2`, `total_geometry_area_km2`, `country_count`, `cartography_count`, `subtype`, `class`, `subtype_count`, `class_count`, `names_count`, `wikidata_count`, `perspectives_count`, `local_type_count`, `region_count`, `hierarchies_count`, `parent_division_id_count`, `norms_count`, `population_count`, `capital_division_ids_count`, `capital_of_divisions_count`, `is_land_count`, `is_territorial_count`, `division_id_count`, `division_ids_count`, `is_disputed_count`

### places
`names_count`, `place_countries`, `primary_category`, `confidence`, `categories_count`, `confidence_count`, `websites_count`, `socials_count`, `emails_count`, `phones_count`, `brand_count`, `addresses_count`

### transportation
`average_geometry_length_km`, `total_geometry_length_km`, `subtype`, `class`, `subtype_count`, `class_count`, `names_count`, `subclass`, `connectors_count`, `routes_count`, `subclass_count`, `subclass_rules_count`, `access_restrictions_count`, `level_rules_count`, `destinations_count`, `prohibited_transitions_count`, `road_surface_count`, `road_flags_count`, `speed_limits_count`, `width_rules_count`

---

## 6. Address Level Coverage

### Countries with address level data
Only 34 countries have `address_level_1` data populated. Top countries by row count:

| Country | Rows  |
|---------|-------|
| ES      | 121,804 |
| PL      | 108,478 |
| FR      | 64,856  |
| AU      | 30,352  |
| LT      | 27,654  |
| HR      | 26,510  |
| US      | 24,672  |
| DE      | 20,362  |
| CA      | 15,730  |

Most countries (the remaining ~237) have no address level data populated at all.

### address_level_3 coverage
`address_level_3` is NaN for many countries. It appears to represent a sub-area within a city and is not consistently populated. The US does not use `address_level_3` at all.

### US address structure
In the US:
- `address_level_1` = state (e.g. `CA`, `TX`, `IA`)
- `address_level_2` = city (e.g. `Johnston`, `Idaho Springs`)
- `address_level_3` = NaN (not used)

---

## 7. US-Specific Findings

Filtering `df` to `country == 'US'` (`df_2`):

- **Total rows:** 24,749
- **Themes present:** `addresses`, `divisions`
- **Types present:** `address`, `division`, `division_area`
- **Unique states (address_level_1):** 47
- **Unique cities (address_level_2):** 9,999
- **Datasets:** 12

### US change type breakdown
| Change Type  | Count  |
|--------------|--------|
| removed      | 12,354 |
| added        | 12,349 |
| data_changed | 28     |
| unchanged    | 18     |

Notable: The US data in this release is almost entirely `added` and `removed` rows, with very few `unchanged` — suggesting significant data turnover for the US in this release.

---

## 8. Data Cleaning Notes

- Load with `low_memory=False` to avoid dtype warnings on mixed-type columns
- Always filter `change_type != 'removed'` before computing statistics
- When filtering per theme, reference the filtered dataframe (not the original) to avoid index mismatch warnings:
```python
theme_df = df[df['theme'] == theme]
theme_df = theme_df[theme_df['change_type'] != 'removed']  # use theme_df, not df
```
