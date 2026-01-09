"use client";
import React, { useState, useRef, useEffect } from 'react';

export default function FileUpload() {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        const storedToken = localStorage.getItem('user_token');
        setIsAdmin(role === 'admin');
        setToken(storedToken);
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
        if (!isAdmin) return;
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const uploadFile = async (file: File) => {
        if (!isAdmin || !token) return;
        setUploading(true);
        setStatus(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Append token as query param
            const res = await fetch(`http://127.0.0.1:8000/upload?user_token=${token}`, {
                method: 'POST',
                body: formData,
            });
            if (res.ok) {
                setStatus(`Success`);
                setTimeout(() => setStatus(null), 3000);
            } else {
                setStatus('Upload failed: ' + res.statusText);
            }
        } catch (error) {
            console.error(error);
            setStatus('Connection Failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (isAdmin && e.dataTransfer.files && e.dataTransfer.files[0]) {
            uploadFile(e.dataTransfer.files[0]);
        }
    };

    if (!isAdmin) {
        return (
            <div className="rounded-xl border border-slate-700 p-8 flex flex-col items-center justify-center text-center bg-slate-900/20 opacity-60 cursor-not-allowed">
                <div className="p-3 rounded-full bg-slate-800 mb-3">
                    <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-slate-400">Read Only Mode</p>
                <p className="text-xs text-slate-600 mt-1">Admin access required to upload</p>
            </div>
        )
    }

    return (
        <div
            className={`relative group cursor-pointer transition-all duration-300 rounded-xl border border-dashed p-8 flex flex-col items-center justify-center text-center
        ${isDragging
                    ? 'border-indigo-400 bg-indigo-400/10'
                    : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/50 bg-slate-800/20'
                }
      `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => e.target.files && uploadFile(e.target.files[0])}
                accept=".pdf,.docx,.txt"
            />

            <div className={`p-3 rounded-full bg-slate-800 mb-3 transition-transform group-hover:scale-110 ${uploading ? 'animate-pulse' : ''}`}>
                {uploading ? (
                    <svg className="w-6 h-6 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                )}
            </div>

            <p className="text-sm font-medium text-slate-300 group-hover:text-indigo-300 transition-colors">
                {uploading ? 'Uploading...' : 'Click to Upload'}
            </p>
            <p className="text-xs text-slate-500 mt-1">or drag & drop PDF</p>

            {status && (
                <span className="absolute inset-x-0 bottom-2 text-xs font-bold text-green-400">
                    {status}
                </span>
            )}
        </div>
    );
}
