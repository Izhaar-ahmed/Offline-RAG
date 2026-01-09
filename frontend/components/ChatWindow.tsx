"use client";
import React, { useState, useRef, useEffect } from 'react';

interface Citation {
    document_name: string;
    page_number: number;
    text_snippet: string;
    score: number;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    citations?: Citation[];
}

export default function ChatWindow() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Secure Offline RAG Agent ready. Upload documents to begin analysis.', citations: [] }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            // Create placeholder for assistant message
            setMessages(prev => [...prev, { role: 'assistant', content: '', citations: [] }]);

            const res = await fetch('http://127.0.0.1:8000/chat/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg }),
            });

            if (!res.body) throw new Error("No body");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            let buffer = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                const lines = buffer.split('\n\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer

                for (const line of lines) {
                    if (line.trim().startsWith('event: citations')) {
                        // Handle metadata event
                        // Format: "event: citations\ndata: [...]"
                        const dataLine = line.split('\n')[1]; // get data: line
                        if (dataLine && dataLine.startsWith('data: ')) {
                            const citParams = JSON.parse(dataLine.replace('data: ', ''));
                            setMessages(prev => {
                                const newMsg = [...prev];
                                newMsg[newMsg.length - 1].citations = citParams;
                                return newMsg;
                            });
                        }
                    } else if (line.trim().startsWith('data: ')) {
                        // Handle token
                        try {
                            const jsonStr = line.replace('data: ', '');
                            const eventData = JSON.parse(jsonStr);

                            if (eventData.token) {
                                setMessages(prev => {
                                    const newMsg = [...prev];
                                    const lastMsgIndex = newMsg.length - 1;
                                    const updatedMsg = { ...newMsg[lastMsgIndex] };
                                    updatedMsg.content += eventData.token;
                                    newMsg[lastMsgIndex] = updatedMsg;
                                    return newMsg;
                                });
                            } else if (eventData.answer) {
                                // Full answer fallback (refusal)
                                setMessages(prev => {
                                    const newMsg = [...prev];
                                    newMsg[newMsg.length - 1].content = eventData.answer;
                                    return newMsg;
                                });
                            }
                        } catch (e) {
                            console.error("Parse error", e);
                        }
                    }
                }
            }

        } catch (error) {
            setMessages(prev => {
                const newMsg = [...prev];
                // Remove the empty assistant placeholder if it failed instantly, or append error
                const last = newMsg[newMsg.length - 1];
                if (last.role === 'assistant' && !last.content) {
                    last.content = "Connection error. Please check backend.";
                }
                return newMsg;
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 relative">
            <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8" ref={scrollRef}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>

                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                        )}

                        <div className={`max-w-[85%] lg:max-w-[75%] rounded-2xl p-4 lg:p-6 shadow-sm border ${msg.role === 'user'
                            ? 'bg-indigo-600 text-white border-transparent rounded-br-none'
                            : 'bg-slate-900 border-slate-800 text-slate-200 rounded-bl-none shadow-lg'
                            }`}>
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                            {msg.citations && msg.citations.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-800">
                                    <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">References</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {msg.citations.map((cit, cIdx) => (
                                            <div key={cIdx} className="bg-slate-950/50 p-2 rounded border border-slate-800/60 hover:border-indigo-500/30 transition-colors cursor-pointer group">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-medium text-emerald-400 group-hover:text-emerald-300">{cit.document_name}</span>
                                                    <span className="text-[10px] text-slate-500 px-1 py-0.5 bg-slate-800 rounded">Pg {cit.page_number}</span>
                                                </div>
                                                <p className="text-xs text-slate-400 line-clamp-2 italic opacity-80">"{cit.text_snippet}"</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center ml-3 mt-1 flex-shrink-0">
                                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start animate-fade-in">
                        <div className="w-8 h-8 mr-3"></div>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none p-4 flex items-center space-x-1">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 lg:p-6 bg-slate-950 border-t border-white/5 mx-auto w-full max-w-4xl">
                <div className="relative">
                    <input
                        type="text"
                        className="w-full bg-slate-900/80 border border-slate-800 text-slate-200 text-sm rounded-full py-4 pl-6 pr-14 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium placeholder-slate-600 shadow-lg"
                        placeholder="Search documents or ask a question offline..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        disabled={loading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:shadow-none"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                <p className="text-center text-xs text-slate-600 mt-3">
                    Secure & Offline • Powered by Phi-3 Mini & FAISS
                </p>
            </div>
        </div>
    );
}
