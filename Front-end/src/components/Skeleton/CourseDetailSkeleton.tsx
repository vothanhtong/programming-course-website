import React from 'react';

const CourseDetailSkeleton: React.FC = () => (
  <div className="animate-pulse">
    {/* Hero Section Skeleton */}
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-12">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2">
            {/* Breadcrumb skeleton */}
            <div className="flex items-center gap-2 mb-4">
              <div className="h-4 w-16 bg-gray-700 rounded" />
              <div className="h-4 w-1 bg-gray-700 rounded" />
              <div className="h-4 w-24 bg-gray-700 rounded" />
            </div>

            {/* Badges skeleton */}
            <div className="flex gap-2 mb-4">
              <div className="h-6 w-20 bg-gray-700 rounded-full" />
              <div className="h-6 w-20 bg-gray-700 rounded-full" />
            </div>

            {/* Title skeleton */}
            <div className="h-8 bg-gray-700 rounded mb-2" />
            <div className="h-8 bg-gray-700 rounded w-3/4 mb-4" />

            {/* Description skeleton */}
            <div className="h-4 bg-gray-700 rounded mb-2" />
            <div className="h-4 bg-gray-700 rounded w-5/6 mb-6" />

            {/* Stats skeleton */}
            <div className="flex gap-5 mb-6">
              <div className="h-4 w-32 bg-gray-700 rounded" />
              <div className="h-4 w-24 bg-gray-700 rounded" />
              <div className="h-4 w-20 bg-gray-700 rounded" />
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl p-5">
              <div className="h-10 bg-gray-200 rounded mb-4" />
              <div className="h-12 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Tabs skeleton */}
    <div className="border-b border-gray-200 bg-white">
      <div className="container">
        <div className="flex gap-0">
          <div className="h-12 w-32 bg-gray-200 rounded-t" />
          <div className="h-12 w-32 bg-gray-100 rounded-t ml-2" />
          <div className="h-12 w-32 bg-gray-100 rounded-t ml-2" />
        </div>
      </div>
    </div>

    {/* Content skeleton */}
    <div className="container py-10">
      <div className="max-w-3xl space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
      </div>
    </div>
  </div>
);

export default CourseDetailSkeleton;
