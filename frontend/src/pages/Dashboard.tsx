import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  Shield,
  BarChart3,
  Wand2,
  Database,
  LogOut,
  Star,
  Menu,
  LayoutDashboard,
  FileText,
  RefreshCcw,
  Settings,
  ChevronDown
} from 'lucide-react';
import cosmicBg from '@/assets/cosmic-bg.jpg';
import StarField from '@/components/StarField';
import OrionConstellation from '@/components/OrionConstellation';
import FileUploader from '@/components/FileUploader';
import ResultsDisplay from '@/components/ResultsDisplay';
import FileViewer from '@/components/FileViewer';
import ProcessingProgress from '@/components/ProcessingProgress';
import FeatureCard from '@/components/FeatureCard';
import HistoryView from '@/components/HistoryView';

interface OutputFile {
  name: string;
  viewable: boolean;
  type: string;
}

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'settings'>('dashboard');
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const handleReloadHistory = (analysis: any) => {
    setCleanedDataFile(analysis.cleaned_data_path);
    setBusinessSummary(null); // We might need to fetch this or handle it
    setEdaHtml(null); // We need to fetch the HTML content
    setSummaryStats(analysis.summary_json);
    setActiveTab('dashboard');

    // Fetch EDA HTML and Business Summary if needed
    if (analysis.eda_report_path) {
      fetch(`http://127.0.0.1:8000/view/${analysis.eda_report_path}`)
        .then(res => res.text())
        .then(html => setEdaHtml(html));
    }
    // We can add logic to fetch business summary too
  };
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputs, setOutputs] = useState<OutputFile[]>([]);
  const [viewingFile, setViewingFile] = useState<{
    name: string;
    content: string | object | null;
    type: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');

  // Results State
  const [cleanedDataFile, setCleanedDataFile] = useState<string | null>(null);
  const [businessSummary, setBusinessSummary] = useState<string | null>(null);
  const [edaHtml, setEdaHtml] = useState<string | null>(null);
  const [summaryStats, setSummaryStats] = useState<any>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const storedUsername = localStorage.getItem('username');

    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    setUsername(storedUsername || '');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    navigate('/');
  };

  const handleFileSelect = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setOutputs([]);
    setSummaryStats(null);
    setCleanedDataFile(null);
    setBusinessSummary(null);
    setEdaHtml(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/process`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Processing failed. Please check if the backend is running.');
      }

      const outputsResponse = await fetch(`${API_BASE_URL}/outputs`);
      if (outputsResponse.ok) {
        const outputsData = await outputsResponse.json();
        setOutputs(outputsData);

        for (const output of outputsData) {
          if (output.name.includes('cleaned_data')) {
            setCleanedDataFile(output.name);
          } else if (output.name.includes('business_summary')) {
            const res = await fetch(`${API_BASE_URL}/view/${output.name}`);
            if (res.ok) setBusinessSummary(await res.text());
          } else if (output.name.includes('eda_report')) {
            const res = await fetch(`${API_BASE_URL}/view/${output.name}?t=${Date.now()}`);
            if (res.ok) setEdaHtml(await res.text());
          } else if (output.name.includes('summary_stats.json')) {
            const res = await fetch(`${API_BASE_URL}/view/${output.name}`);
            if (res.ok) setSummaryStats(await res.json());
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDownload = useCallback((fileName: string) => {
    window.open(`${API_BASE_URL}/download/${fileName}`, '_blank');
  }, []);

  const features = [
    { icon: Wand2, title: 'AI-Powered Cleaning', description: 'Intelligent detection and handling of missing values, duplicates, and inconsistencies.' },
    { icon: Shield, title: 'Outlier Detection', description: 'Advanced statistical methods to identify and handle data outliers automatically.' },
    { icon: BarChart3, title: 'Business Insights', description: 'Generate actionable insights and recommendations from your cleaned data.' },
    { icon: Zap, title: 'Lightning Fast', description: 'Process large datasets in seconds with our optimized cleaning pipeline.' },
    { icon: Database, title: 'Multi-Format Support', description: 'Support for CSV, Excel, JSON and more data formats out of the box.' },
    { icon: Sparkles, title: 'Smart Reports', description: 'Beautiful HTML reports with detailed data quality metrics and visualizations.' },
  ];

  const isDataAvailable = cleanedDataFile || businessSummary || edaHtml || summaryStats;

  return (
    <div className="min-h-screen bg-[#05050a] text-slate-200 font-sans selection:bg-purple-500/30 overflow-x-hidden">
      {/* Background Layers */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${cosmicBg})` }}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[#05050a]/50 to-[#05050a]" />
        <StarField starCount={80} />

        {/* Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full" />
      </div>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-[#080810]/80 backdrop-blur-xl border-r border-white/5 transition-all duration-300 z-50 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Database size={18} className="text-white" />
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 font-[Orbitron]">
              ORION
            </span>
          )}
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'history', icon: FileText, label: 'History' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${activeTab === item.id ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-purple-400' : 'group-hover:text-purple-400 transition-colors'} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-8 left-0 w-full px-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 hover:text-destructive hover:bg-destructive/5 transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-20'}`}>
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-[#05050a]/60 backdrop-blur-md z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-all active:scale-95"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-semibold text-white font-[Orbitron] tracking-wide">
              {isDataAvailable ? 'Business Insights Report' : 'Data Command Center'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {summaryStats && (
              <div className="text-right hidden md:block border-r border-white/10 pr-6">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Last Analysis</p>
                <p className="text-xs text-purple-400 font-mono">{summaryStats.overview.processedOn}</p>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
                <span className="text-xs font-bold text-purple-400">{username.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-sm font-medium text-slate-300 hidden sm:block">{username}</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-12">
          {activeTab === 'dashboard' ? (
            <>
              {!isDataAvailable && !isProcessing && (
                <div className="space-y-16 animate-fade-in">
                  {/* Hero for initial state */}
                  <div className="text-center space-y-6 pt-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
                      <Star size={14} className="text-purple-400 fill-purple-400" />
                      <span className="text-sm text-slate-400 tracking-wide">Autonomous Data Cleaning Agent</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold font-[Orbitron] tracking-tight">
                      <span className="text-white">Transform Your Data</span>
                      <br />
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">With Cosmic Precision</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                      Upload your dataset and let Orion's specialized agents handle cleaning,
                      outlier correction, and high-level business analysis automatically.
                    </p>
                    <div className="pt-8">
                      <FileUploader onFileSelect={handleFileSelect} isProcessing={isProcessing} />
                    </div>
                  </div>

                  {/* Features Grid */}
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                      <FeatureCard
                        key={feature.title}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                        delay={index * 100}
                      />
                    ))}
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="py-24">
                  <ProcessingProgress isProcessing={isProcessing} />
                </div>
              )}

              {isDataAvailable && !isProcessing && (
                <ResultsDisplay
                  cleanedDataFile={cleanedDataFile}
                  businessSummary={businessSummary}
                  edaHtml={edaHtml}
                  summaryStats={summaryStats}
                  onDownload={handleDownload}
                />
              )}
            </>
          ) : activeTab === 'history' ? (
            <HistoryView
              history={history}
              onReload={handleReloadHistory}
            />
          ) : (
            <div className="text-center py-24 text-slate-500">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <h2 className="text-xl font-bold font-[Orbitron]">Settings</h2>
              <p>Configure your Orion preferences here.</p>
            </div>
          )}

          {error && (
            <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/20 animate-fade-in text-center max-w-2xl mx-auto">
              <p className="text-destructive font-medium mb-2">{error}</p>
              <p className="text-sm text-slate-500">Please ensure the backend server is reachable.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
