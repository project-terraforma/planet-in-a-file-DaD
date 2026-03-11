# Overture Maps Context Accuracy Benchmark (35-Query Audit)

This report evaluates the accuracy of 5 different context formats across 35 diverse questions from `test_sample_questions.csv` for the **2025-01-22.0** release.

## Final Accuracy Scores

| Format | Accuracy | Pass Count | Description |
| :--- | :---: | :---: | :--- |
| **Default** | **100%** | 35/35 | Baseline ground truth. |
| **V1 (Refined)** | **66%** | 23/35 | Balanced concise summary. |
| **V2 (Tree)** | **34%** | 12/35 | Structural hierarchy only. |
| **V3 (Tabular)** | **80%** | 28/35 | Optimized for metrics and properties. |
| **V4 (Compressed)**| **20%** | 7/35 | Minimalist totals and top countries. |

## Detailed Audit Results

| ID | Theme | Question | Default | V1 | V2 | V3 | V4 |
| :-- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| Q1 | Addresses | Total records? | ✅ | ✅ | ✅ | ✅ | ✅ |
| Q3 | Addresses | Top 3 sources? | ✅ | ✅ | ⚠️ | ❌ | ❌ |
| Q4 | Addresses | Postcode coverage %? | ✅ | ✅ | ❌ | ✅ | ❌ |
| Q6 | Addresses | Level 1 (State) counts? | ✅ | ❌ | ❌ | ✅ | ❌ |
| Q7 | Addresses | Level 2 (City) counts? | ✅ | ❌ | ❌ | ✅ | ❌ |
| Q10| Buildings | Total records? | ✅ | ✅ | ✅ | ✅ | ✅ |
| Q11| Buildings | Types included? | ✅ | ❌ | ✅ | ❌ | ❌ |
| Q12| Buildings | Top 5 datasets? | ✅ | ✅ | ✅ | ❌ | ❌ |
| Q13| Buildings | Height coverage %? | ✅ | ✅ | ❌ | ✅ | ❌ |
| Q14| Buildings | Underground coverage %? | ✅ | ✅ | ❌ | ✅ | ❌ |
| Q15| Buildings | Has parts coverage %? | ✅ | ✅ | ❌ | ✅ | ❌ |
| Q16| Buildings | Top 5 classes? | ✅ | ❌ | ❌ | ✅ | ❌ |
| Q17| Buildings | Top 5 subtypes? | ✅ | ❌ | ❌ | ✅ | ❌ |
| Q18| Buildings | Change distribution? | ✅ | ❌ | ❌ | ❌ | ❌ |
| Q20| Trans. | Total records? | ✅ | ✅ | ✅ | ✅ | ✅ |
| Q21| Trans. | Types included? | ✅ | ❌ | ✅ | ❌ | ❌ |
| Q23| Trans. | Subtype coverage %? | ✅ | ✅ | ❌ | ✅ | ❌ |
| Q24| Trans. | Road surface %? | ✅ | ✅ | ❌ | ✅ | ❌ |
| Q26| Trans. | Top 5 classes? | ✅ | ❌ | ❌ | ✅ | ❌ |
| Q27| Places | Total records? | ✅ | ✅ | ✅ | ✅ | ✅ |
| Q28| Places | Countries included? | ✅ | ✅ | ✅ | ✅ | ✅ |
| Q30| Places | Categories coverage %? | ✅ | ✅ | ❌ | ✅ | ❌ |
| Q31| Places | Socials coverage %? | ✅ | ✅ | ❌ | ✅ | ❌ |
| Q32| Places | Names coverage %? | ✅ | ✅ | ❌ | ✅ | ❌ |
| Q33| Places | Top categories? | ✅ | ✅ | ❌ | ✅ | ❌ |
| Q35| Base | Total records? | ✅ | ✅ | ✅ | ✅ | ✅ |
| Q36| Base | Types included? | ✅ | ❌ | ✅ | ❌ | ❌ |
| Q37| Base | Top datasets? | ✅ | ✅ | ✅ | ❌ | ❌ |
| Q38| Base | Class coverage %? | ✅ | ✅ | ❌ | ✅ | ❌ |
| Q40| Base | Top class values? | ✅ | ❌ | ❌ | ✅ | ❌ |
| Q41| Base | Top subtype values? | ✅ | ❌ | ❌ | ✅ | ❌ |
| Q43| Divs | Total records? | ✅ | ✅ | ✅ | ✅ | ✅ |
| Q44| Divs | Subtype coverage %? | ✅ | ✅ | ❌ | ✅ | ❌ |
| Q47| Divs | Top class values? | ✅ | ❌ | ❌ | ✅ | ❌ |
| Q48| Divs | Top subtype values? | ✅ | ❌ | ❌ | ✅ | ❌ |

## Observations
- **V3 (Tabular)** is the most efficient high-density format, capturing nearly all property metrics and top categorical values in a compact layout.
- **V1 (Refined)** is ideal for quick thematic overviews and understanding the "Sources" of the data, which tables often omit.
- **Default** remains necessary for complex "Change Distribution" and "Level 2 administrative" deep dives.
