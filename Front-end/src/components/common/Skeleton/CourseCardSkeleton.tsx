import React from 'react';

/**
 * Skeleton that mirrors the exact layout of CourseCard:
 * thumbnail → body (badge, title, desc, instructor, stats) → footer (price + button)
 */
const CourseCardSkeleton: React.FC = () => (
  <div
    className="rounded-2xl overflow-hidden flex flex-col animate-pulse"
    style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(59,130,246,0.08)' }}
  >
    {/* Thumbnail */}
    <div className="h-44 w-full" style={{ background: 'rgba(30,41,59,0.8)' }} />

    {/* Body */}
    <div className="p-5 flex-1 flex flex-col gap-3">
      {/* Badge row */}
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded-full" style={{ background: 'rgba(59,130,246,0.12)' }} />
        <div className="h-5 w-20 rounded-full" style={{ background: 'rgba(59,130,246,0.08)' }} />
      </div>
      {/* Title */}
      <div className="space-y-1.5">
        <div className="h-4 rounded" style={{ background: 'rgba(30,41,59,0.9)', width: '90%' }} />
        <div className="h-4 rounded" style={{ background: 'rgba(30,41,59,0.9)', width: '70%' }} />
      </div>
      {/* Description */}
      <div className="space-y-1.5 flex-1">
        <div className="h-3 rounded" style={{ background: 'rgba(30,41,59,0.7)', width: '100%' }} />
        <div className="h-3 rounded" style={{ background: 'rgba(30,41,59,0.7)', width: '80%' }} />
      </div>
      {/* Instructor */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full flex-shrink-0" style={{ background: 'rgba(30,41,59,0.9)' }} />
        <div className="h-3 w-24 rounded" style={{ background: 'rgba(30,41,59,0.7)' }} />
      </div>
      {/* Stats */}
      <div className="flex justify-between">
        <div className="h-3 w-20 rounded" style={{ background: 'rgba(30,41,59,0.7)' }} />
        <div className="h-3 w-16 rounded" style={{ background: 'rgba(30,41,59,0.7)' }} />
      </div>
    </div>

    {/* Footer */}
    <div className="px-5 py-4 flex items-center justify-between gap-3"
      style={{ borderTop: '1px solid rgba(59,130,246,0.08)' }}>
      <div className="h-6 w-20 rounded" style={{ background: 'rgba(30,41,59,0.9)' }} />
      <div className="h-8 w-24 rounded-lg" style={{ background: 'rgba(59,130,246,0.15)' }} />
    </div>
  </div>
);

export default CourseCardSkeleton;
