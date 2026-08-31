'use client';

export default function BillingSettingsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 shrink-0" />
          <div className="space-y-2 flex-1 max-w-md">
            <div className="h-6 bg-slate-800 rounded-lg w-3/4" />
            <div className="h-4 bg-slate-800/60 rounded-md w-full" />
          </div>
        </div>
        <div className="h-10 bg-slate-800 rounded-xl w-48 shrink-0" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-3 bg-slate-800 rounded w-24" />
              <div className="h-7 bg-slate-800 rounded-lg w-20" />
              <div className="h-2.5 bg-slate-800/60 rounded w-28" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-800/70 shrink-0" />
          </div>
        ))}
      </div>

      {/* Main 12-Col Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: 3 Cards (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {[1, 2, 3].map((cardIdx) => (
            <div key={cardIdx} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-4 bg-slate-800 rounded w-44" />
                    <div className="h-3 bg-slate-800/60 rounded w-64" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-10 bg-slate-800/70 rounded-xl" />
                <div className="h-10 bg-slate-800/70 rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Simulator Box (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="h-5 bg-slate-800 rounded w-40" />
              <div className="h-6 bg-slate-800 rounded-full w-16" />
            </div>
            <div className="space-y-4">
              <div className="h-10 bg-slate-800/60 rounded-xl w-full" />
              <div className="h-10 bg-slate-800/60 rounded-xl w-full" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-12 bg-slate-800/60 rounded-xl" />
                <div className="h-12 bg-slate-800/60 rounded-xl" />
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="flex justify-between">
                  <div className="h-3.5 bg-slate-800 rounded w-32" />
                  <div className="h-3.5 bg-slate-800 rounded w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
