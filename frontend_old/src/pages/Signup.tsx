import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, User, Mail, Lock, UserPlus, AlertCircle, ArrowRight } from 'lucide-react';
import cosmicBg from '@/assets/cosmic-bg.jpg';
import orionLogo from '@/assets/orion-logo.png';
import StarField from '@/components/StarField';
import OrionConstellation from '@/components/OrionConstellation';

const Signup = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            if (response.ok) {
                // Success - redirect to verification page
                navigate('/verify', { state: { email } });
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Registration failed');
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError('Connection to server failed. Please ensure backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
            <div
                className="fixed inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${cosmicBg})` }}
            />
            <div className="fixed inset-0 bg-background/70" />
            <StarField starCount={100} />
            <OrionConstellation className="opacity-40" />

            <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in">
                <div className="glass-card p-8 md:p-10">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 mb-4 overflow-hidden rounded-xl animate-pulse-glow">
                            <img src={orionLogo} alt="Orion Logo" className="w-full h-full object-cover" />
                        </div>
                        <h1 className="text-2xl font-bold gradient-text font-[Orbitron]">Create Repository</h1>
                        <p className="text-sm text-muted-foreground mt-2">Join the Orion Autonomous Network</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest pl-1">Target Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="commander_jane"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="jane@galaxy.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest pl-1">Access Phrase</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs animate-fade-in">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 p-[1px] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                        >
                            <div className="relative flex items-center justify-center gap-2 rounded-[11px] bg-[#050510] px-8 py-3 transition-all group-hover:bg-transparent">
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        <span className="text-sm font-bold tracking-wider uppercase">Initialize Account</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-xs text-slate-500">
                            Already have an artifact?{' '}
                            <Link to="/" className="text-purple-400 hover:text-purple-300 font-bold transition-colors inline-flex items-center gap-1">
                                Relink Session <ArrowRight size={12} />
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
