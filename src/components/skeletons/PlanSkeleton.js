'use client';

export default function PlanSkeleton() {
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
        <div className="w-36 h-10 bg-slate-800 rounded-xl" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="h-3.5 bg-slate-800 rounded w-1/2" />
            <div className="h-6 bg-slate-800 rounded-lg w-2/3" />
          </div>
        ))}
      </div>

      {/* 3 Pricing Tier Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 shrink-0" />
                <div className="h-6 bg-slate-800 rounded-full w-24" />
              </div>
              <div className="space-y-2">
                <div className="h-6 bg-slate-800 rounded-md w-2/3" />
                <div className="h-4 bg-slate-800/60 rounded-md w-full" />
              </div>
              <div className="h-8 bg-slate-800 rounded-lg w-1/2" />
              <div className="border-t border-slate-800/80 pt-4 space-y-2.5">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="flex items-center space-x-2.5">
                    <div className="w-4 h-4 rounded-full bg-slate-800 shrink-0" />
                    <div className="h-3.5 bg-slate-800/70 rounded flex-1" />
                  </div>
                ))}
              </div>
            </div>
            <div className="h-10 bg-slate-800 rounded-xl w-full" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="space-y-2">
            <div className="h-5 bg-slate-800 rounded-md w-48" />
            <div className="h-3.5 bg-slate-800/60 rounded-md w-64" />
          </div>
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-3.5 border-b border-slate-800/40 last:border-0">
              <div className="flex items-center space-x-3.5 flex-1">
                <div className="w-10 h-10 rounded-xl bg-slate-800 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-slate-800 rounded w-1/3" />
                  <div className="h-3 bg-slate-800/60 rounded w-1/2" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 bg-slate-800 rounded-full w-20" />
                <div className="w-8 h-8 bg-slate-800 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
