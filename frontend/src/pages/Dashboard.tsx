import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap, Shield, BarChart3, Wand2, Database, LogOut, Star } from 'lucide-react';
import cosmicBg from '@/assets/cosmic-bg.jpg';
import StarField from '@/components/StarField';
import OrionConstellation from '@/components/OrionConstellation';
import FileUploader from '@/components/FileUploader';
import OutputList from '@/components/OutputList';
import FileViewer from '@/components/FileViewer';
import ProcessingProgress from '@/components/ProcessingProgress';
import FeatureCard from '@/components/FeatureCard';

interface OutputFile {
  name: string;
  viewable: boolean;
  type: string;
}

// API Configuration - Change this to your backend URL
const API_BASE_URL = 'http://127.0.0.1:8000';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputs, setOutputs] = useState<OutputFile[]>([]);
  const [viewingFile, setViewingFile] = useState<{
    name: string;
    content: string | object | null;
    type: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    // Check authentication
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

      // Fetch the outputs list
      const outputsResponse = await fetch(`${API_BASE_URL}/outputs`);
      if (outputsResponse.ok) {
        const outputsData = await outputsResponse.json();
        setOutputs(outputsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleView = useCallback(async (fileName: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/view/${fileName}`);
      if (!response.ok) throw new Error('Failed to load file');

      const contentType = response.headers.get('content-type') || '';
      let content: string | object;
      let type = 'text';

      if (contentType.includes('application/json')) {
        content = await response.json();
        type = 'json';
      } else if (contentType.includes('text/html')) {
        content = await response.text();
        type = 'html';
      } else {
        content = await response.text();
        type = 'text';
      }

      setViewingFile({ name: fileName, content, type });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to view file');
    }
  }, []);

  const handleDownload = useCallback((fileName: string) => {
    window.open(`${API_BASE_URL}/download/${fileName}`, '_blank');
  }, []);

  const features = [
    {
      icon: Wand2,
      title: 'AI-Powered Cleaning',
      description: 'Intelligent detection and handling of missing values, duplicates, and inconsistencies.'
    },
    {
      icon: Shield,
      title: 'Outlier Detection',
      description: 'Advanced statistical methods to identify and handle data outliers automatically.'
    },
    {
      icon: BarChart3,
      title: 'Business Insights',
      description: 'Generate actionable insights and recommendations from your cleaned data.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process large datasets in seconds with our optimized cleaning pipeline.'
    },
    {
      icon: Database,
      title: 'Multi-Format Support',
      description: 'Support for CSV, Excel, JSON and more data formats out of the box.'
    },
    {
      icon: Sparkles,
      title: 'Smart Reports',
      description: 'Beautiful HTML reports with detailed data quality metrics and visualizations.'
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background layers */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${cosmicBg})` }}
      />
      <div className="fixed inset-0 bg-background/70" />
      <StarField starCount={100} />
      <OrionConstellation className="opacity-40" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-glass">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20 animate-pulse-glow">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl font-bold gradient-text font-[Orbitron]">Orion</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                Welcome, <span className="text-foreground font-medium">{username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="btn-glass flex items-center gap-2 text-sm hover:border-destructive/50 hover:text-destructive transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-16 md:py-24 relative">
          <div className="container mx-auto px-4 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-fade-in">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-sm text-muted-foreground">Autonomous Data Cleaning Agent</span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in font-[Orbitron]" style={{ animationDelay: '100ms' }}>
              <span className="text-foreground">Transform Your Data</span>
              <br />
              <span className="gradient-text text-glow">With Cosmic Precision</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: '200ms' }}>
              Harness the power of AI to clean, analyze, and unlock insights from your data.
              Let our autonomous agents handle the complexity while you focus on what matters.
            </p>

            {/* File Uploader */}
            <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
              <FileUploader onFileSelect={handleFileSelect} isProcessing={isProcessing} />
            </div>

            {/* Processing Progress */}
            <ProcessingProgress isProcessing={isProcessing} />

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 glass-card border-destructive/50 max-w-2xl mx-auto animate-fade-in">
                <p className="text-destructive">{error}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Make sure your backend server is running at {API_BASE_URL}
                </p>
              </div>
            )}

            {/* Output List */}
            <OutputList
              outputs={outputs}
              onView={handleView}
              onDownload={handleDownload}
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4 font-[Orbitron]">
                Stellar Features
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Everything you need to transform messy data into clean, actionable insights
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
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
        </section>

        {/* How It Works */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4 font-[Orbitron]">
                How It Works
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Three simple steps to clean, analyze, and export your data
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
              {[
                { step: '01', title: 'Upload', desc: 'Drop your data file' },
                { step: '02', title: 'Process', desc: 'AI cleans & analyzes' },
                { step: '03', title: 'Download', desc: 'Get clean data + insights' },
              ].map((item, index) => (
                <div key={item.step} className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                  <div className="glass-card p-6 text-center min-w-[200px] hover:border-primary/30 transition-all duration-300 group">
                    <div className="text-4xl font-bold gradient-text mb-2 font-[Orbitron] group-hover:text-glow transition-all">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block text-primary text-2xl">→</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border/50 backdrop-blur-glass">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              Built with <span className="text-primary">✦</span> by Orion • Autonomous Data Cleaning Agent
            </p>
          </div>
        </footer>
      </div>

      {/* File Viewer Modal */}
      {viewingFile && (
        <FileViewer
          fileName={viewingFile.name}
          content={viewingFile.content}
          type={viewingFile.type}
          onClose={() => setViewingFile(null)}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
};

export default Dashboard;
