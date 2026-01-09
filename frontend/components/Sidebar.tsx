"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Document {
  id: string;
  name: string;
}

export default function Sidebar() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  const fetchDocuments = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (error) {
      // Silently fail
    }
  };

  useEffect(() => {
    fetchDocuments();
    const role = localStorage.getItem('user_role');
    setUserRole(role);

    const interval = setInterval(fetchDocuments, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAuthAction = () => {
    if (userRole) {
      // Logout
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_role');
      setUserRole(null);
      window.location.reload(); // Force refresh to update other components
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="w-16 lg:w-64 h-full border-r border-white/5 bg-slate-900/80 backdrop-blur-md flex flex-col transition-all duration-300">
      <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/10 bg-gradient-to-r from-slate-900 to-slate-900/50">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <div className="hidden lg:block ml-3">
          <h1 className="font-bold text-lg tracking-tight text-white leading-none">Offline AI<span className="text-indigo-400"> RAG</span></h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-widest mt-0.5">
            {userRole === 'admin' ? 'ADMIN CONSOLE' : 'SECURE VIEW'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-2 lg:px-4 space-y-2">
        <div className="hidden lg:block text-[10px] font-bold text-sky-500/80 uppercase tracking-widest mb-3 px-2 flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-2 animate-pulse"></span>
          Flight Data Records
        </div>

        {documents.length === 0 ? (
          <div className="hidden lg:flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
            <p className="text-sm text-slate-500">No content yet</p>
          </div>
        ) : (
          documents.map((doc) => (
            <button key={doc.id} className="w-full flex items-center p-2 rounded-lg hover:bg-slate-800/80 text-slate-400 hover:text-indigo-400 transition-all group group-hover:shadow-md">
              <span className="p-1.5 rounded-md bg-slate-800 text-slate-500 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
              <span className="hidden lg:block ml-3 text-sm font-medium truncate">{doc.name}</span>
            </button>
          ))
        )}
      </div>

      <div className="p-4 border-t border-white/5">
        <button
          className="w-full flex items-center justify-center lg:justify-start p-2 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
          onClick={handleAuthAction}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {userRole ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            )}
          </svg>
          <span className="hidden lg:block ml-3 text-sm font-medium">
            {userRole ? 'Logout' : 'Login'}
          </span>
        </button>
      </div>
    </div>
  );
}
