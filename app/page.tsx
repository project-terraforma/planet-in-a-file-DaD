'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Database, FileText, ArrowRight, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function Home() {
  const [releases, setReleases] = useState<string[]>([]);
  const [selectedRelease, setSelectedRelease] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string>('default');
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
        body: JSON.stringify({ 
          release: selectedRelease,
          format: selectedFormat 
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      // The backend now executes the Python pipeline and returns the fully formatted text
      setGeneratedContext(result.data);
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

                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2 uppercase tracking-wide">Select Context Format</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[
                        { id: 'default', label: 'Standard' },
                        { id: 'v1', label: 'Concise (V1)' },
                        { id: 'v2', label: 'Tree (V2)' },
                        { id: 'v3', label: 'Table (V3)' },
                        { id: 'v4', label: 'Min (V4)' }
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setSelectedFormat(f.id)}
                          className={`py-3 px-2 rounded-lg border text-sm font-medium transition-all ${
                            selectedFormat === f.id
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                              : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:border-neutral-700'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
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
                    <span>Retrieve Context File</span>
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
                    <h3 className="text-xl font-medium text-white">Retrieving Data...</h3>
                    <p className="text-neutral-500">Fetching {selectedFormat} format for {selectedRelease}</p>
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
                      <span className="font-medium">Context Retrieved Successfully</span>
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

      {/* Accuracy Benchmarks Section */}
      <section className="max-w-4xl mx-auto mt-20 px-6 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Check className="w-5 h-5 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Accuracy Benchmarks</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">Factuality Score by Format</h3>
            <div className="space-y-4">
              {[
                { label: 'Standard (Default)', score: 100, color: 'bg-emerald-500' },
                { label: 'Concise (V1)', score: 85, color: 'bg-emerald-400' },
                { label: 'Table (V3)', score: 75, color: 'bg-emerald-600' },
                { label: 'Tree (V2)', score: 30, color: 'bg-yellow-500' },
                { label: 'Min (V4)', score: 15, color: 'bg-red-500' },
              ].map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-300">{item.label}</span>
                    <span className="text-neutral-500 font-mono">{item.score}% Accuracy</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.score}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full ${item.color}`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div> {/* Added missing closing div for the grid */}
        
        {/* Detailed Audit Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Comprehensive 35-Query Audit</h3>
            <span className="text-xs text-neutral-600">Release: 2025-01-22.0</span>
          </div>
          
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-950/50 border-b border-neutral-800 text-neutral-400">
                    <th className="p-4 font-medium">ID</th>
                    <th className="p-4 font-medium">Theme</th>
                    <th className="p-4 font-medium">Question Preview</th>
                    <th className="p-4 font-medium text-center">Def</th>
                    <th className="p-4 font-medium text-center">V1</th>
                    <th className="p-4 font-medium text-center">V2</th>
                    <th className="p-4 font-medium text-center">V3</th>
                    <th className="p-4 font-medium text-center">V4</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {[
                    { id: 'Q1', theme: 'Addr', q: 'Total address records?', scores: [1,1,1,1,1] },
                    { id: 'Q3', theme: 'Addr', q: 'Top 3 sources for addresses?', scores: [1,1,0,0,0] },
                    { id: 'Q4', theme: 'Addr', q: 'Postcode coverage %?', scores: [1,1,0,1,0] },
                    { id: 'Q6', theme: 'Addr', q: 'Level 1 (State) counts?', scores: [1,0,0,1,0] },
                    { id: 'Q10', theme: 'Bld', q: 'Total architectural records?', scores: [1,1,1,1,1] },
                    { id: 'Q13', theme: 'Bld', q: 'Height coverage accuracy?', scores: [1,1,0,1,0] },
                    { id: 'Q16', theme: 'Bld', q: 'Top 5 class values (house...)?', scores: [1,0,0,1,0] },
                    { id: 'Q20', theme: 'Trans', q: 'Total transport records?', scores: [1,1,1,1,1] },
                    { id: 'Q23', theme: 'Trans', q: 'Surface/Subtype coverage?', scores: [1,1,0,1,0] },
                    { id: 'Q33', theme: 'Place', q: 'Top place categories?', scores: [1,1,0,1,0] },
                    { id: 'Q40', theme: 'Base', q: 'Top class values (tree, stream)?', scores: [1,0,0,1,0] },
                    { id: 'Q43', theme: 'Div', q: 'Total division boundaries?', scores: [1,1,1,1,1] }
                  ].map((row) => (
                    <tr key={row.id} className="hover:bg-neutral-800/20 transition-colors">
                      <td className="p-4 font-mono text-neutral-500">{row.id}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[10px] uppercase">{row.theme}</span>
                      </td>
                      <td className="p-4 text-neutral-300 font-medium">{row.q}</td>
                      {row.scores.map((s, i) => (
                        <td key={i} className="p-4 text-center">
                          {s ? <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> : <div className="w-1.5 h-1.5 rounded-full bg-neutral-800 mx-auto" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-neutral-950/30 border-t border-neutral-800">
              <p className="text-[10px] text-neutral-600 italic">
                * This table shows a sample of the 35 audited queries. Full log available in eval/benchmark_results.md.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-neutral-900 text-center text-neutral-600 text-sm">
        <p>© 2026 Dashboards are Dead Initiative • Overture Maps Data Intelligence</p>
      </footer>
    </main>
  );
}
