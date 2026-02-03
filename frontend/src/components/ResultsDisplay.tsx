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
import orionLogo from '../assets/orion-logo.png';
import { RiskCard, OpportunityCard, PipelineCard } from './InsightCards';

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
    theme?: 'light' | 'dark';
    visibility?: {
        showInsights: boolean;
        showCleanedData: boolean;
        showEDA: boolean;
    };
}

const StatusCard = ({ title, value, icon: Icon, colorClass, theme = 'dark' }: { title: string; value: string | number; icon: any; colorClass: string; theme?: 'light' | 'dark' }) => (
    <div className={`border rounded-2xl p-6 backdrop-blur-sm transition-all group ${theme === 'light' ? 'bg-white border-slate-200 hover:border-purple-500/30 shadow-sm' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 rounded-xl ${colorClass} group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
            </div>
            <span className={`text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded ${theme === 'light' ? 'text-slate-400 bg-slate-100' : 'text-slate-500 bg-white/5'}`}>LIVE</span>
        </div>
        <h3 className={`text-sm font-medium ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{title}</h3>
        <p className={`text-2xl font-bold mt-1 font-[Orbitron] ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{value}</p>
    </div>
);

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
    cleanedDataFile,
    businessSummary,
    edaHtml,
    summaryStats,
    onDownload,
    theme = 'dark',
    visibility = { showInsights: true, showCleanedData: true, showEDA: true }
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
                    theme={theme}
                />
                <StatusCard
                    title="Total Rows"
                    value={summaryStats.overview.rows.toLocaleString()}
                    icon={Database}
                    colorClass="bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/10"
                    theme={theme}
                />
                <StatusCard
                    title="Dimensions"
                    value={summaryStats.overview.columns}
                    icon={BarChart3}
                    colorClass="bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-500/10"
                    theme={theme}
                />
                <StatusCard
                    title="Status"
                    value={summaryStats.overview.healthScore > 80 ? "Operational" : "Action Required"}
                    icon={AlertTriangle}
                    colorClass={summaryStats.overview.healthScore > 80 ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"}
                    theme={theme}
                />
            </div>

            {/* Health Score Explanation Card */}
            <div className={`border rounded-2xl p-6 backdrop-blur-md overflow-hidden relative group ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0A0A15]/60 border-white/5'}`}>
                {/* Decorative background element */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors" />

                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                                <ShieldCheck size={20} />
                            </div>
                            <h2 className={`text-lg font-bold font-[Orbitron] tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                Quality Matrix Deciphered
                            </h2>
                        </div>
                        <p className={`text-sm leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                            The <span className="text-red-400 font-bold">Health Score</span> represents the overall integrity and readiness of your dataset.
                            It is calculated by analyzing the density of missing values, the variance of outliers, and the consistency of data types across all columns.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
                        {[
                            { label: 'Critical', range: '0 - 50', color: 'text-red-500', bg: 'bg-red-500/10', desc: 'Hardware/Logic failure' },
                            { label: 'Stable', range: '51 - 80', color: 'text-orange-400', bg: 'bg-orange-400/10', desc: 'Manual review suggested' },
                            { label: 'Optimum', range: '81 - 100', color: 'text-green-400', bg: 'bg-green-400/10', desc: 'Production ready' },
                        ].map((tier) => (
                            <div key={tier.label} className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                                <div className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest mb-2 ${tier.bg} ${tier.color}`}>
                                    {tier.label}
                                </div>
                                <p className={`text-lg font-bold font-[Orbitron] ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{tier.range}</p>
                                <p className="text-[10px] text-slate-500 mt-1 font-medium">{tier.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {/* Data Engineering Log - Full Width */}
                {visibility.showCleanedData && (
                    <div className={`border rounded-2xl overflow-hidden backdrop-blur-xl ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#080810]/40 border-white/5'}`}>
                        <div className={`p-6 border-b flex justify-between items-center ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 overflow-hidden rounded-md">
                                    <img src={orionLogo} alt="Orion" className="w-full h-full object-cover" />
                                </div>
                                <h2 className={`text-lg font-semibold font-[Orbitron] ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Data Engineering Log</h2>
                            </div>
                            <span className="text-[10px] font-mono text-purple-400 bg-purple-400/10 px-2 py-1 rounded font-bold">QUALITY_METRICS_V2</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className={`text-[10px] uppercase tracking-widest font-bold ${theme === 'light' ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-slate-500'}`}>
                                        <th className="px-6 py-4">Column Identifier</th>
                                        <th className="px-6 py-4 text-center">Missing Data Fixed</th>
                                        <th className="px-6 py-4 text-center">Outliers Rectified</th>
                                        <th className="px-6 py-4 text-right">Validation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {summaryStats.fixes.map((row) => (
                                        <tr key={row.id} className={`transition-colors group ${theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-white/5'}`}>
                                            <td className="px-6 py-4">
                                                <span className={`font-mono text-sm group-hover:text-purple-400 transition-colors ${theme === 'light' ? 'text-slate-600' : 'text-slate-200'}`}>{row.id}</span>
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
                            <div className={`p-6 border-t flex justify-between items-center ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                                <p className="text-xs text-slate-500">Dataset cleaned and optimized by Orion Autonomous Agent.</p>
                                <button
                                    onClick={() => onDownload(cleanedDataFile)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${theme === 'light' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-black hover:bg-slate-200'}`}
                                >
                                    Export Cleaned CSV <Download size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Insights Row - Separate Containers Grid */}
                {visibility.showInsights && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <RiskCard risks={summaryStats.risks} theme={theme} />
                        <OpportunityCard opportunities={summaryStats.opportunities} theme={theme} />
                        <PipelineCard nextActions={summaryStats.nextActions} theme={theme} />
                    </div>
                )}
            </div>

            {/* EDA Section - Preserved for full depth analysis */}
            {visibility.showEDA && edaHtml && (
                <div id="eda-section" className={`border rounded-2xl overflow-hidden backdrop-blur-xl ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#080810]/40 border-white/5'}`}>
                    <div className="p-8 pb-4">
                        <div className={`flex items-center gap-3 border-b pb-4 ${theme === 'light' ? 'border-slate-200' : 'border-white/5'}`}>
                            <BarChart3 className="w-6 h-6 text-purple-400" />
                            <h2 className={`text-2xl font-bold font-[Orbitron] tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Advanced Exploratory Analysis</h2>
                        </div>
                    </div>
                    <div className={`w-full h-[800px] ${theme === 'light' ? 'bg-slate-50' : 'bg-black/40'}`}>
                        <iframe
                            srcDoc={edaHtml}
                            className={`w-full h-full border-none ${theme === 'light' ? 'filter invert hue-rotate-180 brightness-95 contrast-90' : ''} transition-all`}
                            title="EDA Report"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultsDisplay;
