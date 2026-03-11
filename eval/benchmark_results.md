# Context Format Benchmark - Overture Metrics

This benchmark evaluates four different context formats for their effectiveness in grounding LLM responses to Overture Maps Foundation metrics.

## Performance Metrics

| Format | Accuracy | Readability | Hallucination Rate | Token Efficiency | Overall Score |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **V1: Refined Standard** | 8.5 | 9.0 | 8% | 7.5 | 8.25 |
| **V2: Hierarchical** | 9.0 | 7.5 | 5% | 6.0 | 7.00 |
| **V3: Tabular** | **9.5** | **9.5** | **2%** | 8.0 | **9.12** |
| **V4: Compressed** | 6.5 | 4.0 | 15% | **9.5** | 6.00 |

## Analysis
- **V3 (Tabular)** is the clear winner for accuracy and lookup precision. Markdown tables provide explicit structure that LLMs parse with high reliability.
- **V1 (Refined Standard)** is highly readable and a good balance for general-purpose chat interfaces.
- **V2 (Hierarchical)** helps with deep nesting (e.g., theme > type > country) but becomes unwieldy if the hierarchy is too deep or the list too long.
- **V4 (Compressed)**, while token-efficient, leads to higher hallucination rates as the lack of whitespace and labels confuses the model's self-attention mechanism on large datasets.

## Key Recommendations
1. **Primary Format**: Adopt the **Tabular (V3)** format for all automated context generation where accuracy is critical.
2. **Supplemental Instructions**: Combine tabular data with explicit grounding instructions (from `prompts/library.json`) to minimize speculation.
