import sys
import argparse
from pathlib import Path
from flatten import flatten_hive_partitioned_month
from clean import clean
from contextgen import generate_context

def main():
    parser = argparse.ArgumentParser(description="Run the Overture Maps Context Data Pipeline")
    parser.add_argument("--month", type=str, required=True, help="Release month (e.g., 2025-01-22.0)")
    args = parser.parse_args()
    
    month = args.month
    
    # Define paths relative to the Next.js project root
    script_dir = Path(__file__).parent
    project_root = script_dir.parents[1]
    
    # Input data from the friend's Next.js project structure
    # Based on verify_data.js, the metrics are at ../../metrics relative to scripts/
    # The actual folder in the Next.js project may be at the root or outside.
    # Let's align with the actual location of the user's data
    user_home = Path.home()
    metrics_base_path = user_home / "context_fetch" / "data" / "Metrics" / "metrics"
    flattened_out_path = user_home / "context_fetch" / "data" / "flattened"
    
    contexts_dir = project_root / "contexts" / month
    contexts_dir.mkdir(parents=True, exist_ok=True)
    
    template_path = script_dir / "context_template.txt"
    final_context_path = contexts_dir / "context.txt"

    print(f"[{month}] Step 1: Flattening...")
    # This might take time depending on data size
    try:
        flattened_csv = flatten_hive_partitioned_month(month, metrics_base_path, flattened_out_path)
        print(f"Flattened data written to {flattened_csv}")
    except Exception as e:
        print(f"Flattening failed: {e}")
        sys.exit(1)

    print(f"[{month}] Step 2: Cleaning DataFrame (in-memory)...")
    # clean.py loads everything into pandas. Note: memory intensive.
    theme_dfs = clean(flattened_csv)
    
    # In the original clean.py, it returned dfs but didn't write them out.
    # We'll just print out info.
    print(f"[{month}] Cleaning complete. Discovered {len(theme_dfs)} valid themes.")

    print(f"[{month}] Step 3: Generating Context File...")
    try:
        generate_context(month, flattened_csv, template_path, final_context_path)
        print(f"Context written to {final_context_path}")
    except Exception as e:
        print(f"Context generation failed: {e}")
        sys.exit(1)
        
    print(f"[{month}] Pipeline completed successfully!")

if __name__ == "__main__":
    main()
