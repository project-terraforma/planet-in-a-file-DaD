import re
import json
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
    
    # Split by Theme Blocks
    theme_sections = re.split(r'### ', content)
    for section in theme_sections[1:]:
        lines = section.strip().split('\n')
        if not lines: continue
        
        theme_name = lines[0].strip().lower()
        if theme_name == "summary": continue
        
        theme_data = {
            'count': '0',
            'types': [],
            'datasets': [],
            'coverage': [],
            'classes': [],
            'subtypes': [],
            'distribution': []
        }
        
        # Total Count
        count_match = re.search(r'Total Records:\s*([\d,]+)', section)
        if count_match:
            theme_data['count'] = count_match.group(1).strip()
            
        # Types
        types_match = re.search(r'Types Included\n(.*?)(?:\n\n|\Z)', section, re.DOTALL)
        if types_match:
            theme_data['types'] = [t.strip('- ').strip() for t in types_match.group(1).split('\n') if t.strip()]
            
        # Top Datasets
        datasets_match = re.search(r'Top Datasets\n(.*?)(?:\n\n|\Z)', section, re.DOTALL)
        if datasets_match:
            theme_data['datasets'] = re.findall(r'- (.*?): ([\d,]+)', datasets_match.group(1))
            
        # Property Coverage
        coverage_match = re.search(r'Property Coverage\n(.*?)(?:\n\n|\Z)', section, re.DOTALL)
        if coverage_match:
            theme_data['coverage'] = re.findall(r'- (.*?): ([\d,]+) \((.*?)\)', coverage_match.group(1))
            
        # Flexible matching for Classes/Categories/Types
        class_patterns = [r'Top Class Values', r'Top Category Values']
        for p in class_patterns:
            m = re.search(rf'{p}\n(.*?)(?:\n\n|\Z)', section, re.DOTALL)
            if m:
                theme_data['classes'].extend(re.findall(r'- (.*?): ([\d,]+)', m.group(1)))
                
        # Flexible matching for Subtypes/Levels
        subtype_patterns = [r'Top Subtype Values', r'Top Address Level 1 Values', r'Top Address Level 2 Values']
        for p in subtype_patterns:
            m = re.search(rf'{p}\n(.*?)(?:\n\n|\Z)', section, re.DOTALL)
            if m:
                # For levels, we might want to distinguish them, but for a general "subtypes" column in a table, we can merge
                theme_data['subtypes'].extend(re.findall(r'- (.*?): ([\d,]+)', m.group(1)))
            
        # Change Type Distribution
        dist_match = re.search(r'Change Type Distribution\n(.*?)(?:\n\n|\Z)', section, re.DOTALL)
        if dist_match:
            theme_data['distribution'] = re.findall(r'- (.*?): ([\d,]+)', dist_match.group(1))
            
        data['themes'][theme_name] = theme_data

    # Extract Countries
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
        f"OVERTURE MAPS FOUNDATION DATA SUMMARY",
        f"RELEASE: {data['release']}",
        f"================================================================================",
        "GLOBAL STATISTICS",
        f"  - Total Records: {data['total_records']}",
        f"  - Active Themes: {len(data['themes'])}",
        "",
        "THEME BREAKDOWN"
    ]
    for theme, info in sorted(data['themes'].items()):
        lines.append(f"  - {theme.upper()}: {info['count']} records")
        if info['datasets']:
            lines.append(f"    * Top Sources: " + ", ".join([f"{d[0]} ({d[1]})" for d in info['datasets'][:2]]))
        if info['coverage']:
            lines.append(f"    * Attribute Coverage: " + ", ".join([f"{c[0]} ({c[2]})" for c in info['coverage'][:2]]))
    
    lines.append("")
    lines.append("TOP 20 COUNTRIES")
    country_list = [f"{c['name']} ({c['count']})" for c in data['countries'][:20]]
    for i in range(0, len(country_list), 4):
        lines.append("  " + ", ".join(country_list[i:i+4]))
    
    return "\n".join(lines)

def generate_v2_hierarchical(data):
    lines = [
        f"Overture Maps Tree [{data['release']}]",
        "└── Global",
        f"    ├── Records: {data['total_records']}",
        "└── Themes"
    ]
    for theme, info in sorted(data['themes'].items()):
        lines.append(f"    ├── {theme.upper()} ({info['count']})")
        if info['types']:
            lines.append(f"    │   ├── Types: {', '.join(info['types'][:3])}")
    return "\n".join(lines)

def generate_v3_tabular(data):
    lines = [
        f"# Overture Maps Release {data['release']} Tabular Summary",
        "",
        "## Themes & Key Values",
        "| Theme | Total Count | Class/Categories | Subtypes/Levels |",
        "| :--- | :--- | :--- | :--- |"
    ]
    for theme, info in sorted(data['themes'].items()):
        classes = ", ".join([c[0] for c in info['classes'][:3]])
        subtypes = ", ".join([s[0] for s in info['subtypes'][:3]])
        lines.append(f"| {theme} | {info['count']} | {classes} | {subtypes} |")
        
    lines.append("")
    lines.append("## Property Coverage Metrics")
    lines.append("| Theme | Measurement | Availability % |")
    lines.append("| :--- | :--- | :--- |")
    for theme, info in sorted(data['themes'].items()):
        for c in info['coverage'][:3]:
            lines.append(f"| {theme} | {c[0]} | {c[2]} |")
    return "\n".join(lines)

def generate_v4_compressed(data):
    theme_str = "; ".join([f"{t}:{info['count']}" for t, info in data['themes'].items()])
    return f"REF:{data['release']}|TOT:{data['total_records']}|THEMES[{theme_str}]"

def main():
    project_root = Path(__file__).resolve().parent.parent
    contexts_dir = project_root / "contexts"
    for month_dir in contexts_dir.iterdir():
        if month_dir.is_dir():
            context_file = month_dir / "context.txt"
            if context_file.exists():
                data = parse_context(context_file.read_text())
                (month_dir / "v1_refined.txt").write_text(generate_v1_refined(data))
                (month_dir / "v2_hierarchical.txt").write_text(generate_v2_hierarchical(data))
                (month_dir / "v3_tabular.txt").write_text(generate_v3_tabular(data))
                (month_dir / "v4_compressed.txt").write_text(generate_v4_compressed(data))

if __name__ == "__main__":
    main()
