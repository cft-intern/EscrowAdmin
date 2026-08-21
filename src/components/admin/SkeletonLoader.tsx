import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-muted rounded"></div>
        <div className="h-8 w-8 bg-muted rounded-full"></div>
      </div>
      <div className="h-8 w-32 bg-muted rounded"></div>
      <div className="h-3 w-40 bg-muted rounded"></div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 6,
}) => {
  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm animate-pulse">
      <div className="border-b bg-muted/40 px-6 py-4 flex justify-between">
        <div className="h-4 w-32 bg-muted rounded"></div>
        <div className="h-4 w-24 bg-muted rounded"></div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center space-x-4 px-6 py-4">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="h-4 bg-muted rounded flex-1"
                style={{ width: `${Math.floor(Math.random() * 40 + 60)}%` }}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
