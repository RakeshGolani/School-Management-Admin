'use client';

export default function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Title Header Skeleton */}
      <div className="space-y-2">
        <div className="h-7 bg-slate-800/80 rounded-lg w-48"></div>
        <div className="h-3.5 bg-slate-800/40 rounded-md w-96"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-1 space-y-5">
          {/* Summary Card */}
          <div className="glass-panel border border-slate-800 rounded-2xl p-6 bg-slate-900/80 flex flex-col items-center justify-center space-y-6">
            {/* Avatar Circle */}
            <div className="w-24 h-24 rounded-full bg-slate-800/80"></div>
            
            {/* Name & Email lines */}
            <div className="space-y-2.5 w-full flex flex-col items-center">
              <div className="h-4.5 bg-slate-800/80 rounded-md w-2/3"></div>
              <div className="h-3 bg-slate-800/40 rounded-md w-1/2"></div>
            </div>

            {/* Badges line */}
            <div className="flex space-x-2 pt-1">
              <div className="h-6 bg-slate-800/80 rounded-full w-20"></div>
              <div className="h-6 bg-slate-800/40 rounded-full w-24"></div>
            </div>

            {/* Details Rows */}
            <div className="w-full border-t border-slate-800/60 pt-6 mt-2 space-y-4">
              <div className="flex justify-between">
                <div className="h-3 bg-slate-800/40 rounded-md w-24"></div>
                <div className="h-3 bg-slate-800/80 rounded-md w-24"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-3 bg-slate-800/40 rounded-md w-16"></div>
                <div className="h-3 bg-slate-800/80 rounded-md w-20"></div>
              </div>
            </div>
          </div>

          {/* Trigger Card */}
          <div className="glass-panel border border-slate-800 rounded-2xl p-5 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center space-x-3.5 flex-1">
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 shrink-0"></div>
              <div className="space-y-2 flex-1">
                <div className="h-3.5 bg-slate-800/80 rounded-md w-1/3"></div>
                <div className="h-2.5 bg-slate-800/40 rounded-md w-1/2"></div>
              </div>
            </div>
            <div className="w-4 h-4 bg-slate-800/40 rounded-md"></div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-2">
          <div className="glass-panel border border-slate-800 rounded-2xl p-6 bg-slate-900/80 space-y-6">
            <div className="border-b border-slate-800/60 pb-4">
              <div className="h-4.5 bg-slate-800/80 rounded-md w-32"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-3 bg-slate-800/40 rounded-md w-16"></div>
                <div className="h-10 bg-slate-800/80 rounded-xl w-full"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-800/40 rounded-md w-24"></div>
                <div className="h-10 bg-slate-800/80 rounded-xl w-full"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-3 bg-slate-800/40 rounded-md w-36"></div>
              <div className="h-10 bg-slate-800/80 rounded-xl w-full"></div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
              <div className="h-10 bg-slate-800/40 rounded-xl w-20"></div>
              <div className="h-10 bg-slate-800/80 rounded-xl w-32"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
