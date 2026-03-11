import sys
from pathlib import Path
import duckdb

def flatten_hive_partitioned_month(month: str, base_path: Path, out_path: Path) -> Path:
    input_path = Path(base_path) / month
    output_csv = Path(out_path) / f"{month}_flattened.csv"

    if not input_path.exists():
        raise FileNotFoundError(f"Month folder not found: {input_path}")

    out_path.mkdir(parents=True, exist_ok=True)

    csv_glob = str(input_path / "**" / "*.csv")
    
    # Check if any CSVs exist
    import glob
    if not list(input_path.glob("**/*.csv")):
        raise FileNotFoundError(f"No CSVs found in {input_path}")

    con = duckdb.connect()
    # Union by name is useful for varying schema
    query = f"""
        COPY (
            SELECT *
            FROM read_csv('{csv_glob}', hive_partitioning=true, union_by_name = true)
        )
        TO '{output_csv}'
        WITH (HEADER, DELIMITER ',');
    """
    try:
        con.execute(query)
    finally:
        con.close()
        
    return output_csv
