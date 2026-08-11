'use client';

export default function SchoolDetailsSkeleton() {
  return (
    <div className="space-y-6 pb-16 animate-pulse">
      {/* Top Navigation & Action Button Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-5 bg-slate-800/60 rounded-xl w-52"></div>
        <div className="h-9 bg-slate-800/60 rounded-xl w-36"></div>
      </div>

      {/* Hero Profile Header Skeleton */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6 w-full">
            {/* Logo Avatar Placeholder */}
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-slate-800/80 border-2 border-slate-700/60 shrink-0 shadow-xl"></div>
            
            {/* School Main Titles Placeholder */}
            <div className="text-center md:text-left space-y-3 w-full max-w-lg">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <div className="h-8 bg-slate-800/80 rounded-xl w-64"></div>
                <div className="h-6 bg-slate-800/60 rounded-full w-24"></div>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <div className="h-6 bg-slate-800/60 rounded-xl w-32"></div>
                <div className="h-6 bg-slate-800/60 rounded-xl w-44"></div>
                <div className="h-6 bg-slate-800/60 rounded-xl w-36"></div>
              </div>
            </div>
          </div>

          {/* Quick Access Status Switcher Box */}
          <div className="w-44 h-16 bg-slate-950/60 rounded-2xl border border-slate-800/80 shrink-0 p-3 flex flex-col justify-between">
            <div className="h-3 bg-slate-800/60 rounded w-28 mx-auto"></div>
            <div className="h-6 bg-slate-800/80 rounded-xl w-full"></div>
          </div>
        </div>
      </div>

      {/* Metrics Summary Strip Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-slate-800/80 bg-slate-900/50 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800/60 shrink-0"></div>
            <div className="space-y-2 w-full">
              <div className="h-3 bg-slate-800/60 rounded w-20"></div>
              <div className="h-6 bg-slate-800/80 rounded-lg w-12"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs Header Skeleton */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-slate-900/60 border border-slate-800/60 rounded-xl w-36 shrink-0"></div>
        ))}
      </div>

      {/* Overview Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <div className="h-5 bg-slate-800/80 rounded-lg w-40"></div>
            <div className="h-4 bg-slate-800/60 rounded-md w-16"></div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid grid-cols-3 gap-3">
                <div className="h-4 bg-slate-800/40 rounded col-span-1"></div>
                <div className="h-4 bg-slate-800/75 rounded col-span-2"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Card */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 space-y-5">
          <div className="flex items-center border-b border-slate-800/60 pb-3">
            <div className="h-5 bg-slate-800/80 rounded-lg w-44"></div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid grid-cols-3 gap-3">
                <div className="h-4 bg-slate-800/40 rounded col-span-1"></div>
                <div className="h-4 bg-slate-800/75 rounded col-span-2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Academic Sessions Table Skeleton */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
          <div className="h-5 bg-slate-800/80 rounded-lg w-52"></div>
          <div className="h-5 bg-slate-800/60 rounded-lg w-32"></div>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 overflow-hidden p-4 space-y-3">
          <div className="h-6 bg-slate-800/60 rounded-lg w-full"></div>
          <div className="h-8 bg-slate-800/30 rounded-lg w-full"></div>
          <div className="h-8 bg-slate-800/30 rounded-lg w-full"></div>
          <div className="h-8 bg-slate-800/30 rounded-lg w-full"></div>
        </div>
      </div>
    </div>
  );
}

