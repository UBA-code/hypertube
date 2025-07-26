import React from "react";

const DashboardLoadingSkeleton: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar Skeleton */}
      <div className="w-64 bg-gray-800 p-4 hidden md:block">
        <div className="animate-pulse flex flex-col space-y-8">
          <div className="h-12 bg-gray-700 rounded"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Search Bar Skeleton */}
        <div className="animate-pulse mb-8">
          <div className="h-12 bg-gray-800 rounded-lg"></div>
        </div>

        {/* Section Headers */}
        <div className="space-y-12">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="animate-pulse mb-6">
                <div className="h-8 w-64 bg-gray-800 rounded"></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="animate-pulse">
                    <div className="aspect-[2/3] bg-gray-800 rounded-lg mb-2"></div>
                    <div className="h-4 bg-gray-800 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardLoadingSkeleton;
