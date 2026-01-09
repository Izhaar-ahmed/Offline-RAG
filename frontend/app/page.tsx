"use client";
import Sidebar from '@/components/Sidebar';
import FileUpload from '@/components/FileUpload';
import ChatWindow from '@/components/ChatWindow';
import { useState, useEffect } from 'react';

export default function Home() {
  const [modelStatus, setModelStatus] = useState<boolean>(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/');
        if (res.ok) {
          const data = await res.json();
          setModelStatus(data.model_loaded);
        }
      } catch (e) {
        // Silently fail to avoid intrusive error overlay
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Subtle Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-sky-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[30%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
      </div>

      {/* Sidebar */}
      <div className="z-10 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full z-10 relative lg:flex-row">

        {/* Middle Column: Upload & Status (Hidden on mobile maybe, but visible for now) */}
        <div className="lg:w-80 border-r border-white/5 bg-slate-900/50 backdrop-blur-sm p-6 flex flex-col gap-6 overflow-y-auto">
          <header>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Secure <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Workspace</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Offline Document Analysis
            </p>
          </header>

          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Upload Documents</h3>
            <FileUpload />
          </section>

          <section className="mt-auto">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
              <h4 className="text-xs font-semibold text-slate-400 mb-3">System Health</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">LLM Mode</span>
                  <span className={`font-medium ${modelStatus ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}>
                    {modelStatus ? 'Offline (Ready)' : 'Downloading...'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Vector DB</span>
                  <span className="text-blue-400">FAISS Ready</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Chat */}
        <div className="flex-1 h-full min-h-0 bg-slate-950/30">
          <ChatWindow />
        </div>

      </div>
    </main>
  );
}
