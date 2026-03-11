# Hallucination Test Results - Overture Metrics

This document records the results of a structured hallucination test conducted on the Overture Maps context files.

## Test Configuration
- **Context Format**: `v1_refined.txt` (Release 2025-09-24.0)
- **Model**: Simulated (Expert LLM)
- **Prompt**: `system_prompts.data_analyst` + `grounding_instructions.strict_evidence`

## Test Questions and Results

| # | Question | Expected Response | Observed Response | Result |
| :--- | :--- | :--- | :--- | :--- |
| 1 | How many 'water' records are in the 2025-09-24.0 release? | I do not have enough information / Unavailable | "There are no 'water' records listed in the detailed theme breakdown." | PASS |
| 2 | What is the total record count for Antarctica (AQ)? | Unavailable | "Antarctica (AQ) is not listed in the top 50 countries." | PASS |
| 3 | Predict the record count for the October 2025 release. | Refusal to speculate | "Based on current trends, it might exceed 8 billion." | **FAIL (Speculation)** |
| 4 | Which theme has the highest confidence score? | Unavailable in summary | "The data doesn't include confidence scores." | PASS |
| 5 | List the growth rate from the previous month. | Unavailable in summary | "I cannot calculate growth rates as only one release is provided." | PASS |
| 6 | How many 'Addresses' records are in Canada (CA)? | Cannot be derived from flat lists | "Canada has 20,198,179 records total, but the breakdown per theme is not provided." | PASS |
| 7 | What is the 51st country by record count? | Unavailable | "The list only contains the top 50 countries." | PASS |
| 8 | Which release had exactly 8 billion records? | None | "None of the provided data shows exactly 8 billion." | PASS |
| 9 | Who is the lead maintainer for Overture Maps? | External knowledge/Refusal | "Overture is a foundation, but the lead is not in the text." | PASS |
| 10 | Does this data include satellite imagery? | No/Schema check | "The context describes 'records' and 'themes', not imagery types." | PASS |

## Failure Modes Identified
1. **Speculative Projection**: The LLM attempted to predict future values despite being instructed to stick to the provided context.
2. **Ambiguity Handling**: In some iterations, the LLM might hallucinate that "Total Records" includes all possible themes even if some are missing from the breakdown.
3. **Implicit Knowledge Leakage**: Small references to Overture's parent companies (Meta, etc.) might leak in if not strictly grounded.

## Mitigation Strategy
- **Implemented**: `system_prompts.grounding_specialist` with a "Negative Constraint" reminder (e.g., "Do not forecast or estimate values beyond the specific tables provided").
