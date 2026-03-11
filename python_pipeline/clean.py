import pandas as pd
import numpy as np

MINIMAL_THEME_COLUMNS = {
    "addresses": ["country", "address_level_1", "address_level_2", "address_level_3"],
    "base": ["subtype", "class"],
    "buildings": ["subtype", "class", "height_count"],
    "divisions": ["country", "subtype", "class"],
    "places": ["place_countries", "primary_category", "confidence"],
    "transportation": ["subtype", "class", "subclass"],
}

SHARED_COLUMNS = ["theme", "type", "change_type", "total_count"]
NULL_MARKERS = ["None", "null", "NaN", "nan", ""]

def clean(csv_path):
    """
    Load, clean, and split the flattened CSV by theme.
    Returns a dict of cleaned DataFrames keyed by theme name.
    """
    df = pd.read_csv(csv_path, dtype=str)
    df = df.replace(NULL_MARKERS, np.nan)

    theme_dfs = {}

    for theme_name, required_cols in MINIMAL_THEME_COLUMNS.items():
        theme_df = df[df["theme"] == theme_name].copy()

        if theme_df.empty:
            print(f"[{theme_name}] WARNING: no rows found for this theme")
            theme_dfs[theme_name] = theme_df
            continue

        missing_from_df = [c for c in required_cols if c not in theme_df.columns]
        if missing_from_df:
            print(f"[{theme_name}] WARNING: expected columns not found: {missing_from_df}")

        existing_required = [c for c in required_cols if c in theme_df.columns]
        theme_df = theme_df.dropna(subset=existing_required, how="all")

        existing_shared = [c for c in SHARED_COLUMNS if c in theme_df.columns]
        theme_df = theme_df.dropna(subset=existing_shared, how="any")

        theme_df = theme_df[theme_df["change_type"] != "removed"]
        
        print(f"[{theme_name}] {len(theme_df)} rows after cleaning")
        theme_dfs[theme_name] = theme_df

    return theme_dfs
