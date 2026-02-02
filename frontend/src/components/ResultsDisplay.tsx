import React from 'react';
import {
    Download,
    FileText,
    BarChart3,
    ShieldCheck,
    AlertTriangle,
    Lightbulb,
    ArrowRight,
    Database,
    CheckCircle2
} from 'lucide-react';

interface SummaryStats {
    overview: {
        processedOn: string;
        rows: number;
        columns: number;
        healthScore: number;
    };
    fixes: Array<{
        id: string;
        missing: number;
        outliers: number;
    }>;
    risks: string[];
    opportunities: string[];
    nextActions: string[];
}

interface ResultsDisplayProps {
    cleanedDataFile: string | null;
    businessSummary: string | null;
    edaHtml: string | null;
    summaryStats: SummaryStats | null;
    onDownload: (fileName: string) => void;
}

const StatusCard = ({ title, value, icon: Icon, colorClass }: { title: string; value: string | number; icon: any; colorClass: string }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:border-white/20 transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 rounded-xl ${colorClass} group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
            </div>
            <span className="text-[10px] text-slate-500 font-mono font-bold tracking-widest bg-white/5 px-2 py-0.5 rounded">LIVE</span>
        </div>
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-white mt-1 font-[Orbitron]">{value}</p>
    </div>
);

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
    cleanedDataFile,
    businessSummary,
    edaHtml,
    summaryStats,
    onDownload
}) => {
    if (!summaryStats) return null;

    return (
        <div className="w-full space-y-12 animate-fade-in">
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatusCard
                    title="Health Score"
                    value={`${summaryStats.overview.healthScore}/100`}
                    icon={ShieldCheck}
                    colorClass="bg-red-500/20 text-red-400 shadow-lg shadow-red-500/10"
                />
                <StatusCard
                    title="Total Rows"
                    value={summaryStats.overview.rows.toLocaleString()}
                    icon={Database}
                    colorClass="bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/10"
                />
                <StatusCard
                    title="Dimensions"
                    value={summaryStats.overview.columns}
                    icon={BarChart3}
                    colorClass="bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-500/10"
                />
                <StatusCard
                    title="Status"
                    value={summaryStats.overview.healthScore > 80 ? "Operational" : "Action Required"}
                    icon={AlertTriangle}
                    colorClass={summaryStats.overview.healthScore > 80 ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column Fixes Table */}
                <div className="lg:col-span-2 bg-[#080810]/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <div className="flex items-center gap-3">
                            <Database size={18} className="text-purple-400" />
                            <h2 className="text-lg font-semibold text-white font-[Orbitron]">Data Engineering Log</h2>
                        </div>
                        <span className="text-[10px] font-mono text-purple-400 bg-purple-400/10 px-2 py-1 rounded font-bold">QUALITY_METRICS_V2</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                                    <th className="px-6 py-4">Column Identifier</th>
                                    <th className="px-6 py-4 text-center">Missing Data Fixed</th>
                                    <th className="px-6 py-4 text-center">Outliers Rectified</th>
                                    <th className="px-6 py-4 text-right">Validation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {summaryStats.fixes.map((row) => (
                                    <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-slate-200 font-mono text-sm group-hover:text-purple-400 transition-colors">{row.id}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-sm font-medium ${row.missing > 0 ? 'text-blue-400' : 'text-slate-500'}`}>
                                                {row.missing.toFixed(2)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-sm font-medium ${row.outliers > 0 ? 'text-purple-400' : 'text-slate-500'}`}>
                                                {row.outliers.toFixed(2)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider">
                                                <CheckCircle2 size={12} /> Verified
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Download Footer */}
                    {cleanedDataFile && (
                        <div className="p-6 bg-white/5 border-t border-white/5 flex justify-between items-center">
                            <p className="text-xs text-slate-500">Dataset cleaned and optimized by Orion Autonomous Agent.</p>
                            <button
                                onClick={() => onDownload(cleanedDataFile)}
                                className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all active:scale-95"
                            >
                                Export Cleaned CSV <Download size={14} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Side Panels */}
                <div className="space-y-6">
                    {/* Risks Section */}
                    <section className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 shadow-lg shadow-red-500/5">
                        <div className="flex items-center gap-2 mb-4 text-red-400">
                            <AlertTriangle size={18} />
                            <h2 className="font-semibold font-[Orbitron] text-sm tracking-wider">Business Risks</h2>
                        </div>
                        <div className="space-y-4">
                            {summaryStats.risks.map((risk, idx) => (
                                <div key={idx} className="bg-[#080810]/60 p-3 rounded-xl border border-red-500/10">
                                    <p className="text-xs text-slate-300 leading-relaxed italic">"{risk.replace(/"/g, '')}"</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Opportunities Section */}
                    <section className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 shadow-lg shadow-blue-500/5">
                        <div className="flex items-center gap-2 mb-4 text-blue-400">
                            <Lightbulb size={18} />
                            <h2 className="font-semibold font-[Orbitron] text-sm tracking-wider">Strategic Opportunities</h2>
                        </div>
                        <ul className="space-y-3">
                            {summaryStats.opportunities.map((opp, idx) => (
                                <li key={idx} className="flex gap-3 text-xs text-slate-400 leading-relaxed">
                                    <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-400" />
                                    {opp}
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Next Actions Section */}
                    <section className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-6 shadow-lg shadow-purple-500/5">
                        <div className="flex items-center gap-2 mb-4 text-purple-400">
                            <ArrowRight size={18} />
                            <h2 className="font-semibold font-[Orbitron] text-sm tracking-wider">Recommended Pipeline</h2>
                        </div>
                        <div className="space-y-3">
                            {summaryStats.nextActions.map((action, idx) => (
                                <button key={idx} className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/50 hover:bg-white/10 transition-all flex items-center justify-between group">
                                    <span className="text-xs text-slate-300">{action}</span>
                                    <ArrowRight size={14} className="text-slate-500 group-hover:text-purple-400 transform group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* EDA Section - Preserved for full depth analysis */}
            {edaHtml && (
                <div id="eda-section" className="bg-[#080810]/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
                    <div className="p-8 pb-4">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <BarChart3 className="w-6 h-6 text-purple-400" />
                            <h2 className="text-2xl font-bold font-[Orbitron] tracking-tight text-white">Advanced Exploratory Analysis</h2>
                        </div>
                    </div>
                    <div className="w-full h-[800px] bg-black/40">
                        <iframe
                            srcDoc={edaHtml}
                            className="w-full h-full border-none"
                            title="EDA Report"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultsDisplay;
