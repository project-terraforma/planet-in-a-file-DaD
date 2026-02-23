# Dashboards are Dead: Overture Maps Intelligence
**Dashboards are Dead** is an AI-first intelligence tool designed to convert massive, complex Overture Maps Foundation metrics into concise, LLM-readable context. Instead of staring at static charts, users generate a grounded "fact sheet" that allows AI models like ChatGPT or Claude to answer data questions with 100% accuracy.
## 🚀 Project Status: Progress Report
This project is currently in the **Implementation & Optimization** phase. Below is a breakdown of our progress against the core OKRs.
### Objective 1: Build a Grounded Context File
- [x] **Data Integration**: Successfully implemented a streaming CSV parser that aggregates 2.3GB of raw metrics across themes (buildings, places, etc.) and countries.
- [x] **LLM-Readable Output**: Developed a hierarchical text format that prioritizes "ground truth" statistics for LLMs.
- [ ] **Validation Architecture**: (In Progress) Building scripts to verify computed counts against filtered baseline metrics (<2% discrepancy target).
### Objective 2: Optimize Conversational UX
- [x] **Premium Dashboard**: Built a modern Next.js interface using Framer Motion and Lucide icons for a high-end "intelligence" feel.
- [x] **Workflow Automation**: One-click generation of `context.txt` from raw folder structures.
- [ ] **Prompt Library**: Pending development of a template library for specific query types (e.g., trend analysis, schema lookup).
### Objective 3: Evaluation & Recommendation
- [ ] **Benchmarking**: Pending token usage and hallucination rate comparisons between different context formats (YAML vs. Text).
---
## 🛠️ Still to Work On (Roadmap)
1.  **Cloud Data Migration**: Transition the 2.3GB local `metrics` folder to a production-ready database or cloud storage (e.g., Supabase or AWS S3) to enable full Vercel functionality.
2.  **Automated Accuracy Checks**: Implement a 10-question evaluation suite to verify that LLMs can answer correctly using *only* the generated context.
3.  **Interactive "Chat" Preview**: Add an in-app chat bubble where users can test the generated context immediately without leaving the dashboard.
4.  **Multi-Format Export**: Add support for JSON and YAML exports for advanced AI benchmarking.
---
## 💻 Technical Setup
### Local Development
1. Clone the repository.
2. Ensure the `metrics` folder is present in the root (Note: Ignored by Git due to size).
3. Run `npm install` and `npm run dev`.
### Deployment Note
Deployments to **Vercel** are UI-ready. However, since the 2.3GB metrics data is excluded from Git, the API processing functionality requires a connected cloud database for production use.
