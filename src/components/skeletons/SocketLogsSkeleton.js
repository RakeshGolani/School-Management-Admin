'use client';

export default function SocketLogsSkeleton() {
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

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-3.5 bg-slate-800 rounded w-2/3" />
              <div className="h-7 bg-slate-800 rounded-lg w-1/2" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-800 shrink-0" />
          </div>
        ))}
      </div>

      {/* Broadcast Dispatcher Card */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="h-5 bg-slate-800 rounded-md w-48 mb-2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3.5 bg-slate-800/60 rounded w-1/4" />
            <div className="h-10 bg-slate-800 rounded-xl w-full" />
          </div>
          <div className="space-y-2">
            <div className="h-3.5 bg-slate-800/60 rounded w-1/4" />
            <div className="h-10 bg-slate-800 rounded-xl w-full" />
          </div>
        </div>
        <div className="h-24 bg-slate-800 rounded-xl w-full" />
        <div className="flex justify-end">
          <div className="h-10 bg-slate-800 rounded-xl w-36" />
        </div>
      </div>

      {/* Live Terminal Log Stream Window */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-slate-800" />
            <div className="w-3 h-3 rounded-full bg-slate-800" />
            <div className="w-3 h-3 rounded-full bg-slate-800" />
            <div className="h-4 bg-slate-800 rounded w-36 ml-2" />
          </div>
          <div className="h-6 bg-slate-800 rounded-full w-20" />
        </div>
        <div className="space-y-2 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-4 bg-slate-900 rounded w-3/4" />
          ))}
        </div>
      </div>
    </div>
  );
}
