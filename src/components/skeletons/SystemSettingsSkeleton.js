'use client';

export default function SystemSettingsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 shrink-0" />
          <div className="space-y-2 flex-1 max-w-md">
            <div className="h-6 bg-slate-800 rounded-lg w-3/4" />
            <div className="h-4 bg-slate-800/60 rounded-md w-full" />
          </div>
        </div>
        <div className="h-10 bg-slate-800 rounded-xl w-36 shrink-0" />
      </div>

      {/* 2-Column Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Identity & Logo Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="h-5 bg-slate-800 rounded-md w-44 mb-2" />
          {/* Logo preview box */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-2xl bg-slate-800 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-800 rounded w-1/3" />
              <div className="h-9 bg-slate-800 rounded-xl w-36" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-3.5 bg-slate-800/60 rounded w-1/4" />
              <div className="h-10 bg-slate-800 rounded-xl w-full" />
            </div>
            <div className="space-y-2">
              <div className="h-3.5 bg-slate-800/60 rounded w-1/4" />
              <div className="h-10 bg-slate-800 rounded-xl w-full" />
            </div>
          </div>
        </div>

        {/* Support & Contact Coordinates Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="h-5 bg-slate-800 rounded-md w-48 mb-2" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3.5 bg-slate-800/60 rounded w-1/4" />
                <div className="h-10 bg-slate-800 rounded-xl w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
