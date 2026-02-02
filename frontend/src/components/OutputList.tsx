import React from 'react';
import { FileText, Download, Eye, FileJson, FileCode, File } from 'lucide-react';

interface OutputFile {
  name: string;
  viewable: boolean;
  type: string;
}

interface OutputListProps {
  outputs: OutputFile[];
  onView: (fileName: string) => void;
  onDownload: (fileName: string) => void;
}

const OutputList: React.FC<OutputListProps> = ({ outputs, onView, onDownload }) => {
  const getFileIcon = (type: string, name: string) => {
    if (name.endsWith('.json')) return FileJson;
    if (name.endsWith('.html')) return FileCode;
    if (name.endsWith('.txt')) return FileText;
    return File;
  };

  if (outputs.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold gradient-text">Processing Complete</h2>
        <p className="text-muted-foreground mt-1">Your cleaned data and insights are ready</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {outputs.map((output, index) => {
          const IconComponent = getFileIcon(output.type, output.name);
          
          return (
            <div
              key={output.name}
              className="glass-card p-4 animate-scale-in group hover:border-primary/30 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{output.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{output.type} file</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {output.viewable && (
                    <button
                      onClick={() => onView(output.name)}
                      className="p-2 rounded-lg btn-glass hover:text-secondary transition-colors"
                      title="View file"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDownload(output.name)}
                    className="p-2 rounded-lg btn-glass hover:text-primary transition-colors"
                    title="Download file"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OutputList;
