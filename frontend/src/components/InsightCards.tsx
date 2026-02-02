import React from 'react';
import { AlertTriangle, Lightbulb, ArrowRight } from 'lucide-react';

export const RiskCard = ({ risks, theme = 'dark' }: { risks: string[]; theme?: 'light' | 'dark' }) => (
    <section className={`rounded-2xl p-6 shadow-lg flex flex-col h-full ${theme === 'light' ? 'bg-red-50 border border-red-200 shadow-red-200/50' : 'bg-red-500/5 border border-red-500/20 shadow-red-500/5'}`}>
        <div className={`flex items-center gap-2 mb-4 ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`}>
            <AlertTriangle size={18} />
            <h2 className="font-semibold font-[Orbitron] text-sm tracking-wider">Business Risks</h2>
        </div>
        <div className="space-y-4 flex-grow">
            {risks.map((risk, idx) => (
                <div key={idx} className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-white border-red-100 shadow-sm shadow-red-50' : 'bg-[#080810]/60 border-red-500/10'}`}>
                    <p className={`text-xs leading-relaxed italic ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>"{risk.replace(/"/g, '')}"</p>
                </div>
            ))}
        </div>
    </section>
);

export const OpportunityCard = ({ opportunities, theme = 'dark' }: { opportunities: string[]; theme?: 'light' | 'dark' }) => (
    <section className={`rounded-2xl p-6 shadow-lg flex flex-col h-full ${theme === 'light' ? 'bg-blue-50 border border-blue-200 shadow-blue-200/50' : 'bg-blue-500/5 border border-blue-500/20 shadow-blue-500/5'}`}>
        <div className={`flex items-center gap-2 mb-4 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}>
            <Lightbulb size={18} />
            <h2 className="font-semibold font-[Orbitron] text-sm tracking-wider">Strategic Opportunities</h2>
        </div>
        <ul className="space-y-3 flex-grow">
            {opportunities.map((opp, idx) => (
                <li key={idx} className={`flex gap-3 text-xs leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    <div className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${theme === 'light' ? 'bg-blue-500' : 'bg-blue-400'}`} />
                    {opp}
                </li>
            ))}
        </ul>
    </section>
);

export const PipelineCard = ({ nextActions, theme = 'dark' }: { nextActions: string[]; theme?: 'light' | 'dark' }) => (
    <section className={`rounded-2xl p-6 shadow-lg flex flex-col h-full ${theme === 'light' ? 'bg-purple-50 border border-purple-200 shadow-purple-200/50' : 'bg-purple-500/5 border border-purple-500/20 shadow-purple-500/5'}`}>
        <div className={`flex items-center gap-2 mb-4 ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}>
            <ArrowRight size={18} />
            <h2 className="font-semibold font-[Orbitron] text-sm tracking-wider">Recommended Pipeline</h2>
        </div>
        <div className="space-y-3 flex-grow">
            {nextActions.map((action, idx) => (
                <button key={idx} className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${theme === 'light' ? 'bg-white border-purple-100 hover:border-purple-300 hover:bg-purple-50/50' : 'bg-white/5 border-white/5 hover:border-purple-500/50 hover:bg-white/10'}`}>
                    <span className={`text-xs ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{action}</span>
                    <ArrowRight size={14} className={`${theme === 'light' ? 'text-slate-400' : 'text-slate-500'} group-hover:text-purple-400 transform group-hover:translate-x-1 transition-all`} />
                </button>
            ))}
        </div>
    </section>
);
