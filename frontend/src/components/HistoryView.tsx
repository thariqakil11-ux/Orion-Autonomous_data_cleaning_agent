import React from 'react';
import { Clock, Database, ShieldCheck, ArrowRight, FileText } from 'lucide-react';

interface HistoryViewProps {
    history: any[];
    onReload: (analysis: any) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onReload }) => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col space-y-2">
                <h2 className="text-3xl font-bold font-[Orbitron] text-white tracking-tight">Analysis History</h2>
                <p className="text-slate-400">View and restore your previous data cleaning sessions.</p>
            </div>

            {history.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center space-y-4">
                    <div className="inline-flex p-4 rounded-full bg-slate-800/50 mb-2">
                        <Clock className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white font-[Orbitron]">No History Yet</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">Start by uploading a dataset to see your analysis history here.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {history.map((item) => (
                        <div
                            key={item.id}
                            className="bg-[#080810]/40 border border-white/5 rounded-2xl p-6 backdrop-blur-xl hover:border-purple-500/30 transition-all group"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                                        <Database size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors font-mono">{item.filename}</h3>
                                        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={14} /> {new Date(item.timestamp).toLocaleString()}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <FileText size={14} /> {item.rows.toLocaleString()} Rows
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Health Score</p>
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck size={16} className={item.health_score > 80 ? "text-green-400" : "text-orange-400"} />
                                            <span className="text-xl font-bold text-white font-[Orbitron]">{item.health_score}/100</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => onReload(item)}
                                        className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all active:scale-95 group/btn"
                                    >
                                        Restore Workspace <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryView;
