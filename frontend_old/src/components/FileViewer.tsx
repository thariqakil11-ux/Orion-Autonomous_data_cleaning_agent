import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface FileViewerProps {
  fileName: string;
  content: string | object | null;
  type: string;
  onClose: () => void;
  onDownload: (fileName: string) => void;
}

const FileViewer: React.FC<FileViewerProps> = ({ 
  fileName, 
  content, 
  type, 
  onClose, 
  onDownload 
}) => {
  const renderContent = () => {
    if (!content) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Loading content...
        </div>
      );
    }

    if (type === 'html') {
      return (
        <iframe
          srcDoc={content as string}
          className="w-full h-[60vh] rounded-lg bg-background"
          title={fileName}
          sandbox="allow-same-origin"
        />
      );
    }

    if (type === 'json') {
      return (
        <pre className="p-4 rounded-lg bg-muted/50 overflow-auto max-h-[60vh] text-sm">
          <code className="text-foreground">
            {JSON.stringify(content, null, 2)}
          </code>
        </pre>
      );
    }

    // Plain text
    return (
      <pre className="p-4 rounded-lg bg-muted/50 overflow-auto max-h-[60vh] text-sm whitespace-pre-wrap">
        <code className="text-foreground">{content as string}</code>
      </pre>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-glass animate-fade-in">
      <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ExternalLink className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{fileName}</h3>
              <p className="text-xs text-muted-foreground capitalize">{type} preview</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownload(fileName)}
              className="p-2 rounded-lg btn-glass hover:text-primary transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg btn-glass hover:text-destructive transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
