import React from 'react';

const StatCardSkeleton: React.FC = () => (
  <div className="bg-gradient-to-br from-slate-700 to-slate-600 rounded-lg p-6 shadow-lg animate-pulse">
    {/* Icon skeleton */}
    <div className="w-12 h-12 bg-slate-500 rounded-full mb-2" />
    
    {/* Title skeleton */}
    <div className="h-3 bg-slate-500 rounded w-2/3 mb-3" />
    
    {/* Value skeleton */}
    <div className="h-8 bg-slate-500 rounded w-1/2" />
  </div>
);

export default StatCardSkeleton;
