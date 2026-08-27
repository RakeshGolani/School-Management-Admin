'use client';

export default function DashboardSkeleton() {
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
        <div className="w-36 h-10 bg-slate-800 rounded-xl shrink-0" />
      </div>

      {/* Metrics Row Skeleton (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="space-y-2.5 flex-1">
              <div className="h-3.5 bg-slate-800 rounded w-1/2" />
              <div className="h-8 bg-slate-800 rounded-lg w-1/3" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 shrink-0" />
          </div>
        ))}
      </div>

      {/* Main Content / Table Skeleton */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="space-y-2">
            <div className="h-5 bg-slate-800 rounded-md w-44" />
            <div className="h-3.5 bg-slate-800/60 rounded-md w-64" />
          </div>
          <div className="h-9 bg-slate-800 rounded-xl w-28" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-800/40 last:border-0">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-10 h-10 rounded-xl bg-slate-800 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-slate-800 rounded w-1/3" />
                  <div className="h-3 bg-slate-800/60 rounded w-1/4" />
                </div>
              </div>
              <div className="h-6 bg-slate-800 rounded-full w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
