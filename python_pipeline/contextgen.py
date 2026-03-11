import duckdb
from pathlib import Path

def load_template(template_path):
    with open(template_path, "r", encoding="utf-8") as f:
        return f.read()

def get_theme_list(conn):
    query = "SELECT DISTINCT theme FROM metrics_data WHERE theme IS NOT NULL"
    try:
        result = conn.execute(query).fetchall()
        return [r[0] for r in result if r[0]]
    except Exception as e:
        print(f"Error querying themes: {e}")
        return []

def get_theme_statistics(conn):
    themes = get_theme_list(conn)
    output = []
    
    for theme in themes:
        try:
            # Get one row to determine available columns
            sample = conn.execute(f"SELECT * FROM metrics_data WHERE theme='{theme}' LIMIT 1").fetchdf()
            cols = sample.columns.tolist()
        except:
            cols = []

        total_records = 0
        try:
            res = conn.execute(f"SELECT CAST(SUM(CAST(total_count AS BIGINT)) AS BIGINT) FROM metrics_data WHERE theme='{theme}' AND change_type != 'removed'").fetchone()
            total_records = res[0] if res and res[0] else 0
        except:
            pass
            
        if total_records == 0:
            continue
            
        theme_str = f"### {theme.upper()}\n\n"
        theme_str += f"Total Records: {total_records:,}\n\n"
        
        # Types Included
        try:
            types = conn.execute(f"SELECT DISTINCT type FROM metrics_data WHERE theme='{theme}' AND change_type != 'removed'").fetchall()
            type_list = [t[0] for t in types if t[0]]
            if type_list:
                theme_str += "Types Included\n"
                for t in type_list:
                    theme_str += f"- {t}\n"
                theme_str += "\n"
        except:
            pass
            
        # Top Countries
        country_col = "place_countries" if "place_countries" in cols else "country" if "country" in cols else None
        
        if country_col:
            try:
                res = conn.execute(f"SELECT {country_col}, CAST(SUM(CAST(total_count AS BIGINT)) AS BIGINT) as cnt FROM metrics_data WHERE theme='{theme}' AND change_type != 'removed' AND {country_col} IS NOT NULL GROUP BY {country_col} ORDER BY cnt DESC LIMIT 5").fetchall()
                if res:
                    theme_str += "Top Countries by Record Count\n"
                    for r in res:
                        theme_str += f"- {r[0]}: {r[1]:,}\n"
                    theme_str += "\n"
            except:
                pass
                
        # Top Datasets
        dataset_col = "datasets" if "datasets" in cols else "dataset" if "dataset" in cols else None
        if dataset_col:
            try:
                res = conn.execute(f"SELECT {dataset_col}, CAST(SUM(CAST(total_count AS BIGINT)) AS BIGINT) as cnt FROM metrics_data WHERE theme='{theme}' AND change_type != 'removed' AND {dataset_col} IS NOT NULL GROUP BY {dataset_col} ORDER BY cnt DESC LIMIT 5").fetchall()
                if res:
                    theme_str += "Top Datasets\n"
                    for r in res:
                        theme_str += f"- {r[0]}: {r[1]:,}\n"
                    theme_str += "\n"
            except:
                pass
                
        # Property Coverage
        ignore_counts = {"total_count", "id_count", "geometry_count", "bbox_count", "version_count", "sources_count"}
        count_cols = [c for c in cols if c.endswith("_count") and c not in ignore_counts]
        if count_cols:
            coverage = []
            for c in count_cols:
                try:
                    res = conn.execute(f"SELECT CAST(SUM(CAST({c} AS BIGINT)) AS BIGINT) FROM metrics_data WHERE theme='{theme}' AND change_type != 'removed'").fetchone()
                    count_val = res[0] if res and res[0] else 0
                    if count_val > 0:
                        pct = (count_val / total_records) * 100
                        coverage.append((c, count_val, pct))
                except:
                    pass
            if coverage:
                coverage.sort(key=lambda x: x[1], reverse=True)
                theme_str += "Property Coverage\n"
                for c, val, pct in coverage[:5]: # Top 5 metrics
                    theme_str += f"- {c}: {val:,} ({pct:.2f}%)\n"
                theme_str += "\n"
                
        # Top Class/Subtype/Category and Granular Fields
        cat_cols = [c for c in ["primary_category", "class", "subtype", "address_level_1", "address_level_2"] if c in cols]
        for c in cat_cols:
            try:
                res = conn.execute(f"SELECT CAST({c} AS VARCHAR), CAST(SUM(CAST(total_count AS BIGINT)) AS BIGINT) as cnt FROM metrics_data WHERE theme='{theme}' AND change_type != 'removed' AND {c} IS NOT NULL GROUP BY {c} ORDER BY cnt DESC LIMIT 5").fetchall()
                if res and len(res) > 0 and res[0][0]:
                    label = f"Top {c.replace('_', ' ').title()} Values"
                    if c == "subtype": label = "Top Subtype Values"
                    if c == "class": label = "Top Class Values"
                    if c == "primary_category": label = "Top Category Values"
                    
                    theme_str += f"{label}\n"
                    for r in res:
                        theme_str += f"- {r[0]}: {r[1]:,}\n"
                    theme_str += "\n"
            except:
                pass
                
        # Change Type Distribution
        try:
            res = conn.execute(f"SELECT change_type, CAST(SUM(CAST(total_count AS BIGINT)) AS BIGINT) as cnt FROM metrics_data WHERE theme='{theme}' AND change_type IS NOT NULL GROUP BY change_type ORDER BY cnt DESC").fetchall()
            if res:
                theme_str += "Change Type Distribution\n"
                for r in res:
                    theme_str += f"- {r[0]}: {r[1]:,}\n"
                theme_str += "\n"
        except:
            pass

        output.append(theme_str.strip())
        output.append("-" * 111)

    return "\n\n".join(output)

def get_global_statistics(conn):
    output = []
    
    # 1. Total records
    try:
        res = conn.execute(f"SELECT CAST(SUM(CAST(total_count AS BIGINT)) AS BIGINT) FROM metrics_data WHERE change_type != 'removed'").fetchone()
        total = res[0] if res and res[0] else 0
        output.append(("Total Records", f"{total:,}"))
    except:
        pass

    # 2. Total themes
    themes = get_theme_list(conn)
    if themes:
        output.append(("Total Themes", str(len(themes))))

    # 3. Total unique types
    try:
        res = conn.execute(f"SELECT COUNT(DISTINCT type) FROM metrics_data WHERE change_type != 'removed'").fetchone()
        if res and res[0]:
            output.append(("Total Unique Types Across Themes", str(res[0])))
    except:
        pass

    # 4. Largest themes by size
    try:
        res = conn.execute(f"SELECT theme, CAST(SUM(CAST(total_count AS BIGINT)) AS BIGINT) as cnt FROM metrics_data WHERE change_type != 'removed' AND theme IS NOT NULL GROUP BY theme ORDER BY cnt DESC").fetchall()
        if res:
            output.append(("", ""))
            output.append(("Largest Themes by Record Count", ""))
            for r in res:
                output.append((f"- {r[0]}", f"{r[1]:,}"))
    except:
        pass

    # 5. Top countries overall
    try:
        # Check available columns
        sample = conn.execute(f"SELECT * FROM metrics_data LIMIT 1").fetchdf()
        cols = sample.columns.tolist()
        country_col = "place_countries" if "place_countries" in cols else "country" if "country" in cols else None
        
        if country_col:
            res = conn.execute(f"SELECT {country_col}, CAST(SUM(CAST(total_count AS BIGINT)) AS BIGINT) as cnt FROM metrics_data WHERE change_type != 'removed' AND {country_col} IS NOT NULL GROUP BY {country_col} ORDER BY cnt DESC LIMIT 5").fetchall()
            if res:
                output.append(("", ""))
                output.append(("Top Countries Overall", ""))
                for r in res:
                    output.append((f"- {r[0]}", f"{r[1]:,}"))
    except:
        pass

    formatted = []
    for k, v in output:
        if k == "" and v == "":
            formatted.append("")
        elif v == "":
            formatted.append(f"{k}")
        else:
            if k.startswith("-"):
                formatted.append(f"{k}: {v}")
            else:
                formatted.append(f"{k}: {v}")

    return "\n".join(formatted)

def fill_template(template, month, theme_count, theme_list, theme_statistics, global_statistics):
    return template.format(
        month=month,
        theme_count=theme_count,
        theme_list=theme_list,
        theme_statistics=theme_statistics,
        global_statistics=global_statistics,
        example_value="[VALUE]"
    )

def generate_context(month, metrics_path, template_path, output_path):
    print(f"[{month}] Creating in-memory table from CSV...")
    conn = duckdb.connect()
    
    # Create a table from the CSV instead of reading it for every single query
    conn.execute(f"CREATE TABLE metrics_data AS SELECT * FROM read_csv('{metrics_path}', header=true, all_varchar=true)")
    print(f"[{month}] In-memory table created successfully. Generating context...")
    
    template = load_template(template_path)

    themes = get_theme_list(conn)
    theme_statistics = get_theme_statistics(conn)
    global_statistics = get_global_statistics(conn)

    context_text = fill_template(
        template=template,
        month=month,
        theme_count=len(themes),
        theme_list="\n".join([f"- {t}" for t in themes]),
        theme_statistics=theme_statistics,
        global_statistics=global_statistics,
    )

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(context_text)

    conn.close()
    return context_text
