# Overture Maps Context Accuracy Evaluation Plan

This document outlines the testing framework to evaluate the accuracy and reliability of different context file formats (Default, V1-V4).

## Evaluation Metrics
1. **Factuality (0-5):** Does the answer match the numerical data in the context file exactly?
2. **Completeness (0-5):** Does the answer include all relevant themes/statistics requested?
3. **Hallucination Check (Pass/Fail):** Does the answer invent any statistics not present in the file?
4. **Format Adherence (Pass/Fail):** Does the answer follow the instructions in the context file Header?

## Sample User Queries (10)

| ID | Query | Expected Data Points |
| :--- | :--- | :--- |
| Q1 | What is the total count of 'buildings' across all datasets for the 2025-01-22.0 release? | Total Records for Buildings theme |
| Q2 | Which theme has the highest percentage of 'height' property coverage? | Comparison of height property % across themes |
| Q3 | List the top 3 datasets contributing to the 'addresses' theme. | Top datasets list for Addresses |
| Q4 | For the 'divisions' theme, what is the count for the 'hamlet' class? | Class value count for divisions |
| Q5 | What is the total record count across all 6 themes combined? | Global Statistics - Total Records |
| Q6 | How many 'connector' types are included in the 'transportation' theme? | Connector record counts |
| Q7 | Which country has the most records in the 'places' theme? | Top Countries by record count (Places) |
| Q8 | What is the breakdown of 'change type distribution' for the 'base' theme? | Change type values (unchanged, added, etc.) |
| Q9 | List all available 'types' included in the 'divisions' theme. | Types list (division, area, boundary) |
| Q10 | What percentage of 'places' have categories information? | Property coverage % for categories |

## Testing Workflow
1. Run query against an LLM with the **Default** context file.
2. Repeat for **V1**, **V2**, **V3**, and **V4**.
3. Record responses in `eval/benchmark_results.md`.
4. Score each response based on the metrics above.
