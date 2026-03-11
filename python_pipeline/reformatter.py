import re
from pathlib import Path

def parse_context(content):
    data = {
        'release': '',
        'total_records': '',
        'themes': {},
        'countries': []
    }
    
    # Extract Release Month
    match = re.search(r'DATA RELEASE MONTH:\s*(.*)', content)
    if match:
        data['release'] = match.group(1).strip()
    
    # Extract Global Total Records
    match = re.search(r'SECTION 4 — GLOBAL STATISTICS.*?Total Records:\s*([\d,]+)', content, re.DOTALL)
    if match:
        data['total_records'] = match.group(1).strip()
    
    # Extract Theme Breakdown
    theme_matches = re.findall(r'### (\w+)\s+Total Records:\s*([\d,]+)', content)
    for theme, count in theme_matches:
        data['themes'][theme.lower()] = {
            'count': count.strip(),
            'types': []
        }
    
    # Extract Types per Theme
    sections = re.split(r'### (\w+)', content)
    for i in range(1, len(sections), 2):
        theme_name = sections[i].lower()
        theme_content = sections[i+1]
        types_match = re.search(r'Types Included\n(.*?)\n\n', theme_content, re.DOTALL)
        if types_match:
            types = [t.strip('- ').strip() for t in types_match.group(1).split('\n') if t.strip()]
            if theme_name in data['themes']:
                data['themes'][theme_name]['types'] = types

    # Extract Countries from Section 4 specifically
    section_4_match = re.search(r'SECTION 4 .*? GLOBAL STATISTICS(.*?)(?:SECTION 5|$)', content, re.DOTALL | re.IGNORECASE)
    if section_4_match:
        section_4_content = section_4_match.group(1)
        country_section_match = re.search(r'Top Countries Overall\n(.*?)(?:\n\n-|$)', section_4_content, re.DOTALL)
        if country_section_match:
            country_matches = re.findall(r'-\s+([A-Z]{2}):\s*([\d,]+)', country_section_match.group(1))
            for country, count in country_matches:
                data['countries'].append({'name': country, 'count': count})
                
    return data

def generate_v1_refined(data):
    lines = [
        f"OVERTURE MAPS FOUNDATION DATA CONTEXT",
        f"RELEASE: {data['release']}",
        f"GENERATED: 2026-03-11",
        "",
        "================================================================================",
        "GLOBAL STATISTICS",
        f"  - Total Records: {data['total_records']}",
        f"  - Themes Count: {len(data['themes'])}",
        "",
        "DETAILED THEME BREAKDOWN"
    ]
    for theme, info in sorted(data['themes'].items()):
        lines.append(f"  - {theme.capitalize()}: {info['count']} records")
    
    lines.append("")
    lines.append("TOP 50 COUNTRIES BY RECORD COUNT")
    for c in data['countries']:
        lines.append(f"  - {c['name']}: {c['count']}")
    
    lines.append("")
    lines.append("================================================================================")
    lines.append("INSTRUCTIONS FOR LLM:")
    lines.append("You are an expert data analyst specializing in Overture Maps. The statistics above represent the GROUND TRUTH.")
    lines.append("1. Referral: Use these numbers for any 'how many' or 'top' questions.")
    lines.append("2. Strictness: If a theme or country is not listed, state it is unavailable in this summary.")
    lines.append("3. Accuracy: Do not hallucinate growth rates or future projections unless explicitly derived from this data.")
    
    return "\n".join(lines)

def generate_v2_hierarchical(data):
    lines = [
        f"Overture Maps Context [{data['release']}]",
        "└── Global Summary",
        f"    ├── Total Records: {data['total_records']}",
        f"    └── Active Themes: {len(data['themes'])}",
        "└── Theme Hierarchy"
    ]
    
    for theme, info in sorted(data['themes'].items()):
        lines.append(f"    ├── {theme.upper()} ({info['count']})")
        for t in info['types']:
            lines.append(f"    │   └── {t}")
            
    lines.append("└── Top Countries")
    for c in data['countries'][:15]: # Show top 15 in tree for brevity
        lines.append(f"    ├── {c['name']}: {c['count']}")
        
    return "\n".join(lines)

def generate_v3_tabular(data):
    lines = [
        f"# Overture Maps Release {data['release']} Summary",
        "",
        "## Core Metrics",
        "| Metric | Value |",
        "| :--- | :--- |",
        f"| Total Records | {data['total_records']} |",
        f"| Number of Themes | {len(data['themes'])} |",
        "",
        "## Theme Breakdown",
        "| Theme | Record Count |",
        "| :--- | :---: |"
    ]
    for theme, info in sorted(data['themes'].items()):
        lines.append(f"| {theme} | {info['count']} |")
        
    lines.append("")
    lines.append("## Top Country Distribution")
    lines.append("| Rank | Country | Records |")
    lines.append("| :---: | :--- | :---: |")
    for i, c in enumerate(data['countries'], 1):
        lines.append(f"| {i} | {c['name']} | {c['count']} |")
        
    return "\n".join(lines)

def generate_v4_compressed(data):
    theme_str = "; ".join([f"{t}:{info['count']}" for t, info in data['themes'].items()])
    country_str = ",".join([f"{c['name']}:{c['count']}" for c in data['countries'][:20]])
    return f"REF:{data['release']}|TOT:{data['total_records']}|THEMES[{theme_str}]|TOP20_GEO[{country_str}]"

def main():
    project_root = Path(__file__).resolve().parent.parent
    contexts_dir = project_root / "contexts"
    
    for month_dir in contexts_dir.iterdir():
        if month_dir.is_dir():
            context_file = month_dir / "context.txt"
            if context_file.exists():
                print(f"Processing formats for {month_dir.name}...")
                content = context_file.read_text()
                data = parse_context(content)
                
                (month_dir / "v1_refined.txt").write_text(generate_v1_refined(data))
                (month_dir / "v2_hierarchical.txt").write_text(generate_v2_hierarchical(data))
                (month_dir / "v3_tabular.txt").write_text(generate_v3_tabular(data))
                (month_dir / "v4_compressed.txt").write_text(generate_v4_compressed(data))

if __name__ == "__main__":
    main()
