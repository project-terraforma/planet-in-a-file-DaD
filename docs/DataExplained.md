Overture Maps — Themes & Types
This document describes the six themes in the Overture Maps dataset, along with their subtypes as found in the row_counts metrics data.

### 1. Addresses
Partition: theme=addresses / type=address
Contains postal address records from around the world. Each row represents a physical address, grouped by geographic and administrative attributes such as country, address levels (region, city, street), and change type.
address_level_1 -> state/region
address_level_2 = City/county
address_level_3 = smaller zipcode/town
Key columns: country, address_level_1, address_level_2, address_level_3

### 2. Base
Partition: theme=base
Contains foundational geographic and land features. This theme has the most subtypes, covering both natural and man-made physical features of the earth.
Types:

bathymetry — underwater terrain and ocean floor depth data
infrastructure — man-made structures such as bridges, towers, and utilities
land — general land mass and terrain features
land_cover — surface cover classifications such as forest, grass, or urban areas
land_use — how land is used (e.g. residential, commercial, agricultural)
water — rivers, lakes, oceans, and other water bodies


### 3. Buildings
Partition: theme=buildings
Contains records for physical building structures and their components.
Types:

building — whole building footprints and attributes (e.g. height, class, subclass)
building_part — individual parts or sections of a building (e.g. a tower within a larger complex)

Key columns: class, subclass

### 4. Divisions
Partition: theme=divisions
Contains administrative and political boundary data at various geographic levels.
Types:

division — named administrative units such as countries, states, cities, and neighbourhoods
division_area — the geographic area/polygon associated with a division
division_boundary — the boundary lines between divisions (e.g. borders between countries or states)


### 5. Places
Partition: theme=places / type=place
Contains points of interest (POIs) — named locations that people visit or interact with, such as businesses, landmarks, and amenities.
Key columns: primary_category, subtype, place_countries

### 6. Transportation
Partition: theme=transportation
Contains the road and transport network data, including how roads connect and their associated rules and attributes.
Types:

connector — nodes where road segments meet or intersect (junctions)
segment — individual road or path stretches between connectors, with attributes such as speed limits, road surface, width, and access restrictions

Key columns: average_geometry_length_km, total_geometry_length_km, speed_limits_count, road_surface_count, access_restrictions_count

Notes on Change Types
When computing statistics for a given release, always filter out removed rows from the change_type column. Including removed rows will overcount records that no longer exist in that release.
pythondf_active = df[df['change_type'] != 'removed']
Valid change_type values:

added — new in this release
modified — changed from a previous release
unchanged — carried over with no changes
removed — deleted in this release (exclude from counts)