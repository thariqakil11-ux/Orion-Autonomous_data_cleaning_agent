import React, { useEffect, useState } from 'react';
import { Sparkles, Database, Wand2, BarChart3, CheckCircle2 } from 'lucide-react';

interface ProcessingProgressProps {
  isProcessing: boolean;
}

const stages = [
  { icon: Database, label: 'Analyzing Data Structure', duration: 2000 },
  { icon: Wand2, label: 'Cleaning Missing Values', duration: 3000 },
  { icon: BarChart3, label: 'Handling Outliers', duration: 2500 },
  { icon: Sparkles, label: 'Generating Insights', duration: 2000 },
  { icon: CheckCircle2, label: 'Finalizing Reports', duration: 1500 },
];

const ProcessingProgress: React.FC<ProcessingProgressProps> = ({ isProcessing }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isProcessing) {
      setCurrentStage(0);
      setProgress(0);
      return;
    }

    const totalDuration = stages.reduce((acc, s) => acc + s.duration, 0);
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += 100;
      const overallProgress = (elapsed / totalDuration) * 100;
      setProgress(Math.min(overallProgress, 95));

      // Update current stage
      let accumulated = 0;
      for (let i = 0; i < stages.length; i++) {
        accumulated += stages[i].duration;
        if (elapsed < accumulated) {
          setCurrentStage(i);
          break;
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isProcessing]);

  if (!isProcessing) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 animate-fade-in">
      <div className="glass-card p-6">
        {/* Progress bar */}
        <div className="progress-cosmic mb-6">
          <div
            className="progress-cosmic-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stages */}
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = index === currentStage;
            const isComplete = index < currentStage;

            return (
              <div
                key={index}
                className={`
                  flex items-center gap-3 p-3 rounded-lg transition-all duration-300
                  ${isActive ? 'bg-primary/10 border border-primary/30' : ''}
                  ${isComplete ? 'opacity-50' : ''}
                `}
              >
                <div className={`
                  p-2 rounded-lg transition-colors duration-300
                  ${isActive ? 'bg-primary/20 text-primary animate-pulse' : ''}
                  ${isComplete ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'}
                `}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`
                  font-medium transition-colors duration-300
                  ${isActive ? 'text-foreground' : 'text-muted-foreground'}
                `}>
                  {stage.label}
                </span>
                {isComplete && (
                  <CheckCircle2 className="w-4 h-4 text-accent ml-auto" />
                )}
                {isActive && (
                  <div className="ml-auto flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProcessingProgress;
