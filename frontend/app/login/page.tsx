"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://127.0.0.1:8000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('user_token', data.token);
                localStorage.setItem('user_role', data.role);
                router.push('/');
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            setError('Connection failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Secure Access</h1>
                    <p className="text-slate-400 text-sm">Offline Knowledge Portal</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Username</label>
                        <input
                            type="text"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                        <input
                            type="password"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/25 mt-4"
                    >
                        Login
                    </button>

                    <p className="text-center text-xs text-slate-600 mt-4">
                        Default: admin/admin or user/user
                    </p>
                </form>
            </div>
        </div>
    );
}
