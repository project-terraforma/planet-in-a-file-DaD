# Dashboards Are Dead: Planet-Fetch

## Contributors
- **Simran Kaur**
- **Aashna Shimkhada**

**Course:** CRWN 102 – Corporate Innovation  
**Partner:** Overture Maps Foundation

---

## Overview

**Planet-Fetch** is an AI-first website that provides a centralized hub for generating and accessing **LLM-readable context files** derived from the Overture Maps Foundation metrics dataset.

Instead of manually analyzing large datasets, users can generate structured context files that allow AI models such as ChatGPT or Claude to answer questions about the data accurately.

The platform processes **2.3GB+ of Overture metrics data** and converts it into structured, hierarchical summaries optimized for large language models.

---

## Key Idea

Planet-Fetch transforms complex geospatial metrics into **LLM-ready context files** that contain:

- dataset statistics  
- schema descriptions  
- theme summaries  
- aggregated metrics  
- structured ground-truth information

These context files allow AI systems to answer questions **using only verified dataset information**, improving accuracy and reducing hallucinations.

---

## Features

- Centralized **web hub for generating and accessing context files**
- Processing pipeline for **2.3GB+ Overture metrics dataset**
- Hierarchical **LLM-optimized context format**
- Modern **Next.js web interface**
- One-click generation of `context.txt`
- Structured summaries of Overture dataset themes
- Support for conversational exploration with AI models

---

## Context Validation & Testing

To ensure the reliability of the generated context files, the project includes **validation and evaluation testing**.

Testing includes:

- verifying computed dataset counts against baseline metrics
- evaluating whether LLMs can correctly answer dataset questions using **only the generated context**
- checking for discrepancies between filtered metrics and aggregated statistics

This testing ensures the generated context remains **accurate, grounded, and usable for AI-driven analysis**.

---

## Documentation

All project documentation is located in the **`docs/` folder**.

This includes:

- project setup instructions  
- dataset schema explanations  
- pipeline workflow documentation  
- Overture Maps theme descriptions  

Refer to the documentation folder for detailed instructions on running the pipeline and understanding the dataset structure.

---

## Project Structure

*(Paste project structure or schema diagram here)*

Project Structure

(Paste project structure or schema diagram here)

[ project structure placeholder ]
