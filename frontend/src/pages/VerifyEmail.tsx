import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Mail, CheckCircle2, AlertCircle, RefreshCcw } from 'lucide-react';
import cosmicBg from '@/assets/cosmic-bg.jpg';
import orionLogo from '@/assets/orion-logo.png';
import StarField from '@/components/StarField';
import OrionConstellation from '@/components/OrionConstellation';

const VerifyEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            // If accessed directly without email, redirect back to signup or login
            navigate('/signup');
        }
    }, [location, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, code }),
            });

            if (response.ok) {
                setIsSuccess(true);
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Verification failed');
            }
        } catch (err) {
            console.error('Verification error:', err);
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
                        <h1 className="text-2xl font-bold gradient-text font-[Orbitron]">Security Check</h1>
                        <p className="text-sm text-muted-foreground mt-2">Enter the verification code sent to your email</p>
                    </div>

                    {isSuccess ? (
                        <div className="text-center space-y-6 animate-fade-in">
                            <div className="flex justify-center">
                                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center animate-bounce-in">
                                    <CheckCircle2 size={40} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-white">Verification Confirmed</h2>
                                <p className="text-slate-400">Authenticating your portal access now...</p>
                            </div>
                            <div className="flex justify-center">
                                <div className="w-6 h-6 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                                    <Mail className="w-5 h-5 text-purple-400" />
                                    <div className="flex-1">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Verification Target</p>
                                        <p className="text-sm text-slate-200 font-mono">{email}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest pl-1">6-Digit Access Code</label>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        placeholder="X7Y2Z9"
                                        maxLength={6}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 text-center text-3xl font-bold tracking-[10px] focus:outline-none focus:border-purple-500/50 transition-colors font-mono"
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
                                disabled={isLoading || code.length < 6}
                                className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 p-[1px] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                <div className="relative flex items-center justify-center gap-2 rounded-[11px] bg-[#050510] px-8 py-4 transition-all group-hover:bg-transparent">
                                    {isLoading ? (
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-5 h-5" />
                                            <span className="text-sm font-bold tracking-wider uppercase">Verify & Deploy</span>
                                        </>
                                    )}
                                </div>
                            </button>

                            <div className="text-center">
                                <button type="button" className="text-xs text-slate-500 hover:text-purple-400 transition-colors inline-flex items-center gap-2">
                                    <RefreshCcw size={12} /> Resend Verification Signal
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-10 text-center">
                        <Link to="/signup" className="text-xs text-slate-500 hover:text-white transition-colors">
                            Wrong coordinates? <span className="text-purple-400 font-bold">Restart Signal</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
