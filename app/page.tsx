'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Database, FileText, ArrowRight, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function Home() {
  const [releases, setReleases] = useState<string[]>([]);
  const [selectedRelease, setSelectedRelease] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContext, setGeneratedContext] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'processing' | 'result'>('select');

  useEffect(() => {
    fetch('/api/releases')
      .then(res => res.json())
      .then(data => {
        if (data.releases) {
          setReleases(data.releases);
          if (data.releases.length > 0) setSelectedRelease(data.releases[0]);
        }
      })
      .catch(err => setError('Failed to load releases'));
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setStep('processing');

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ release: selectedRelease }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      // Format the data into a readable string for the LLM context file
      const summary = result.data;
      const contextString = `
OVERTURE MAPS FOUNDATION DATA CONTEXT
RELEASE: ${selectedRelease}
GENERATED: ${new Date().toISOString()}

================================================================================
global_statistics:
  - total_records: ${summary.totalRecords.toLocaleString()}
  - themes_count: ${Object.keys(summary.themeCounts).length}
  
detailed_theme_breakdown:
${Object.entries(summary.themeCounts).map(([theme, count]) => `  - ${theme}: ${Number(count).toLocaleString()}`).join('\n')}

top_50_countries_by_record_count:
${Object.entries(summary.countryCounts).map(([country, count]) => `  - ${country}: ${Number(count).toLocaleString()}`).join('\n')}

================================================================================
INSTRUCTIONS FOR LLM:
You are analyzing Overture Maps data. The statistics above represent the ground truth for this release.
When answering questions about "how many" or "which country has the most", refer *strictly* to these numbers.
Do not hallucinate data that is not present in this context.
`;

      setGeneratedContext(contextString);
      setStep('result');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setStep('select');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedContext) return;
    const blob = new Blob([generatedContext], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'context.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-emerald-500/30">

      {/* Hero Section */}
      <section className="relative h-[40vh] flex flex-col items-center justify-center border-b border-neutral-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/10 to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10 p-6"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Terminal className="w-6 h-6 text-emerald-500" />
            <span className="text-emerald-500 text-sm font-mono tracking-widest uppercase">Overture Maps Intelligence</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500">
            Dashboards are Dead.
          </h1>
          <p className="max-w-2xl mx-auto text-neutral-400 text-lg md:text-xl">
            Stop staring at static charts. Start a conversation with your data. <br />
            Generate LLM-ready context files from raw Overture Maps metrics instantly.
          </p>
        </motion.div>
      </section>

      {/* Main Interface */}
      <section className="max-w-4xl mx-auto -mt-10 px-6 relative z-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-1 border-b border-neutral-800 flex items-center gap-2 px-4 bg-neutral-900/50">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
            <div className="ml-auto text-xs text-neutral-600 font-mono">context_generator_v1.0</div>
          </div>

          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              {step === 'select' && (
                <motion.div
                  key="select"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2 uppercase tracking-wide">Select Release Version</label>
                    <div className="relative">
                      <select
                        value={selectedRelease}
                        onChange={(e) => setSelectedRelease(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-4 px-4 text-white appearance-none focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                        disabled={loading}
                      >
                        {releases.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Database className="w-5 h-5 text-neutral-500" />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                      <AlertCircle className="w-5 h-5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={loading || !selectedRelease}
                    className="group w-full bg-white text-black font-medium py-4 rounded-lg flex items-center justify-center gap-3 hover:bg-neutral-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                    <span>Generate Context File</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              )}

              {step === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 space-y-6"
                >
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-neutral-800 border-t-emerald-500 rounded-full animate-spin" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-medium text-white">Ingesting Data...</h3>
                    <p className="text-neutral-500">Parsing CSVs across {selectedRelease}</p>
                  </div>
                </motion.div>
              )}

              {step === 'result' && generatedContext && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 h-full"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">Context Generated Successfully</span>
                    </div>
                    <button
                      onClick={() => setStep('select')}
                      className="text-sm text-neutral-500 hover:text-white transition-colors"
                    >
                      Process Another Release
                    </button>
                  </div>

                  <div className="relative group">
                    <pre className="w-full h-96 bg-neutral-950 border border-neutral-800 rounded-lg p-6 overflow-auto font-mono text-sm text-neutral-300 leading-relaxed shadow-inner">
                      {generatedContext}
                    </pre>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={handleDownload}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-md border border-emerald-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Download context.txt
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(generatedContext)}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-3 py-1.5 rounded-md border border-neutral-700 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Copy to Clipboard
                      </button>
                    </div>
                  </div>

                  <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 flex items-start gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-full">
                      <Database className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">Ready for LLM Ingestion</h4>
                      <p className="text-sm text-neutral-500 mt-1">
                        Copy the text above and paste it into ChatGPT, Claude, or any LLM to ask questions about this dataset.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      <footer className="mt-20 py-8 border-t border-neutral-900 text-center text-neutral-600 text-sm">
        <p>Built for the Dashboards are Dead initiative.</p>
      </footer>
    </main>
  );
}
