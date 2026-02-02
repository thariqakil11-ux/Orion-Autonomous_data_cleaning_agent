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
import cosmicBg from '../assets/cosmic-bg.jpg';
import orionLogo from '../assets/orion-logo.png';
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

  interface VisibilitySettings {
    showInsights: boolean;
    showCleanedData: boolean;
    showEDA: boolean;
  }

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [visibilitySettings, setVisibilitySettings] = useState<VisibilitySettings>({
    showInsights: true,
    showCleanedData: true,
    showEDA: true,
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) setTheme(savedTheme);

    const savedVisibility = localStorage.getItem('visibilitySettings');
    if (savedVisibility) setVisibilitySettings(JSON.parse(savedVisibility));
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleVisibility = (key: keyof VisibilitySettings) => {
    const newSettings = { ...visibilitySettings, [key]: !visibilitySettings[key] };
    setVisibilitySettings(newSettings);
    localStorage.setItem('visibilitySettings', JSON.stringify(newSettings));
  };

  const isDataAvailable = cleanedDataFile || businessSummary || edaHtml || summaryStats;

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans selection:bg-purple-500/30 overflow-x-hidden ${theme === 'light' ? 'light bg-slate-50 text-slate-900' : 'bg-[#05050a] text-slate-200'}`}>
      {/* Background Layers */}
      <div className={`fixed inset-0 pointer-events-none -z-10 transition-opacity duration-500 ${theme === 'light' ? 'opacity-0' : 'opacity-100'}`}>
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
      <aside className={`fixed left-0 top-0 h-full backdrop-blur-xl border-r transition-all duration-300 z-50 ${isSidebarOpen ? 'w-64' : 'w-20'} ${theme === 'light' ? 'bg-white/80 border-slate-200' : 'bg-[#080810]/80 border-white/5'}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
            <img src={orionLogo} alt="Orion Logo" className="w-full h-full object-cover" />
          </div>
          {isSidebarOpen && (
            <span className={`font-bold text-lg tracking-tight font-[Orbitron] ${theme === 'light' ? 'text-slate-900' : 'bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400'}`}>
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
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${activeTab === item.id ? (theme === 'light' ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20') : (theme === 'light' ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5')}`}
            >
              <item.icon size={20} className={activeTab === item.id ? (theme === 'light' ? 'text-purple-600' : 'text-purple-400') : 'group-hover:text-purple-400 transition-colors'} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-8 left-0 w-full px-4">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${theme === 'light' ? 'text-slate-500 hover:text-red-600 hover:bg-red-50' : 'text-slate-500 hover:text-destructive hover:bg-destructive/5'}`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-20'}`}>
        {/* Header */}
        <header className={`h-20 border-b flex items-center justify-between px-8 sticky top-0 backdrop-blur-md z-40 ${theme === 'light' ? 'bg-white/60 border-slate-200' : 'bg-[#05050a]/60 border-white/5'}`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg transition-all active:scale-95 ${theme === 'light' ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/5 text-slate-400'}`}
            >
              <Menu size={20} />
            </button>
            <h1 className={`text-xl font-semibold font-[Orbitron] tracking-wide ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              {isDataAvailable ? 'Business Insights Report' : 'Data Command Center'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {summaryStats && (
              <div className={`text-right hidden md:block border-r pr-6 ${theme === 'light' ? 'border-slate-200' : 'border-white/10'}`}>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Last Analysis</p>
                <p className={`text-xs font-mono ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}>{summaryStats.overview.processedOn}</p>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${theme === 'light' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30'}`}>
                <span className={`text-xs font-bold ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}>{username.charAt(0).toUpperCase()}</span>
              </div>
              <span className={`text-sm font-medium hidden sm:block ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{username}</span>
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
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4 ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
                      <Star size={14} className="text-purple-400 fill-purple-400" />
                      <span className="text-sm text-slate-400 tracking-wide">Autonomous Data Cleaning Agent</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold font-[Orbitron] tracking-tight">
                      <span className={theme === 'light' ? 'text-slate-900' : 'text-white'}>Transform Your Data</span>
                      <br />
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">With Cosmic Precision</span>
                    </h1>
                    <p className={`max-w-2xl mx-auto text-lg leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
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
                        theme={theme}
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
                <div className={theme === 'light' ? 'text-slate-900' : ''}>
                  <ResultsDisplay
                    cleanedDataFile={cleanedDataFile}
                    businessSummary={businessSummary}
                    edaHtml={edaHtml}
                    summaryStats={summaryStats}
                    onDownload={handleDownload}
                    theme={theme}
                    visibility={visibilitySettings}
                  />
                </div>
              )}
            </>
          ) : activeTab === 'history' ? (
            <HistoryView
              history={history}
              onReload={handleReloadHistory}
              theme={theme}
            />
          ) : (
            <div className={`p-8 rounded-2xl border backdrop-blur-sm animate-fade-in ${theme === 'light' ? 'bg-white border-slate-200 shadow-xl shadow-slate-200/50' : 'bg-white/5 border-white/5'}`}>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-purple-500/10 rounded-2xl">
                  <Settings className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold font-[Orbitron] ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Settings</h2>
                  <p className="text-sm text-slate-500">Manage your account and app preferences</p>
                </div>
              </div>

              <div className="space-y-12">
                <section>
                  <h3 className={`text-sm font-semibold uppercase tracking-widest mb-4 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Appearance</h3>
                  <div className={`p-6 rounded-xl border flex items-center justify-between ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${theme === 'light' ? 'bg-white text-slate-900' : 'bg-[#080810] text-purple-400 border border-purple-500/20'}`}>
                        {theme === 'dark' ? <Zap size={18} /> : <Sparkles size={18} />}
                      </div>
                      <div>
                        <p className={`font-medium ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Interface Theme</p>
                        <p className="text-sm text-slate-500">Switch between light and dark mode</p>
                      </div>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center gap-2 ${theme === 'light' ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20' : 'bg-white text-black hover:bg-slate-200'}`}
                    >
                      {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                      <RefreshCcw size={14} className={theme === 'dark' ? '' : 'rotate-180'} />
                    </button>
                  </div>
                </section>

                <section>
                  <h3 className={`text-sm font-semibold uppercase tracking-widest mb-4 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Content Preferences</h3>
                  <div className={`rounded-xl border divide-y ${theme === 'light' ? 'bg-slate-50 border-slate-200 divide-slate-200' : 'bg-white/5 border-white/5 divide-white/5'}`}>
                    {[
                      { key: 'showInsights', label: 'Business Analysis', description: 'Show risks, opportunities, and pipeline recommendations' },
                      { key: 'showCleanedData', label: 'Cleaned Data Log', description: 'Show the engineering table with missing values and outliers' },
                      { key: 'showEDA', label: 'EDA Report', description: 'Show the comprehensive Exploratory Data Analysis report' },
                    ].map((item) => (
                      <div key={item.key} className="p-6 flex items-center justify-between">
                        <div>
                          <p className={`font-medium ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{item.label}</p>
                          <p className="text-sm text-slate-500">{item.description}</p>
                        </div>
                        <button
                          onClick={() => toggleVisibility(item.key as any)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${visibilitySettings[item.key as keyof VisibilitySettings] ? 'bg-purple-500' : (theme === 'light' ? 'bg-slate-200' : 'bg-slate-800')}`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${visibilitySettings[item.key as keyof VisibilitySettings] ? 'translate-x-5' : 'translate-x-0'}`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className={`text-sm font-semibold uppercase tracking-widest mb-4 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Account Profile</h3>
                  <div className={`p-6 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full border flex items-center justify-center text-xl font-bold ${theme === 'light' ? 'bg-white border-slate-200 text-purple-600' : 'bg-purple-500/10 border-purple-500/30 text-purple-400'}`}>
                        {username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-bold text-lg ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{username}</p>
                        <p className="text-sm text-slate-500 italic">Connected to Orion Data Pipeline</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
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
