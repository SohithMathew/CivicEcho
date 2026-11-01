import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  subtext?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Loading CivicEcho intelligence...',
  subtext = 'Querying municipal database & sensor feeds'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[280px]">
      <div className="relative mb-4">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-700">{message}</p>
      {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
    </div>
  );
};

export default Loading;
