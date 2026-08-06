'use client';

export default function StudentDetailsSkeleton() {
  return (
    <div className="space-y-6 pb-12 animate-pulse">
      {/* Top Navigation skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-6 bg-slate-800/60 rounded-xl w-32"></div>
        <div className="flex space-x-3">
          <div className="h-9 bg-slate-800/60 rounded-xl w-24"></div>
          <div className="h-9 bg-slate-800/60 rounded-xl w-24"></div>
          <div className="h-9 bg-slate-800/60 rounded-xl w-24"></div>
        </div>
      </div>

      {/* Main Profile Header Card skeleton */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pb-8 border-b border-slate-800/60">
          <div className="w-28 h-28 rounded-3xl bg-slate-800 shrink-0"></div>
          <div className="flex-1 space-y-3 w-full text-center md:text-left">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
              <div className="h-8 bg-slate-800 rounded-lg w-56"></div>
              <div className="h-6 bg-slate-800/80 rounded-full w-20"></div>
            </div>
            <div className="h-4 bg-slate-800/60 rounded w-40 mx-auto md:mx-0"></div>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
              <div className="h-6 bg-slate-800/50 rounded-lg w-24"></div>
              <div className="h-6 bg-slate-800/50 rounded-lg w-20"></div>
            </div>
          </div>
        </div>

        {/* Grid Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Block: Academic & Personal Info */}
          <div className="space-y-6">
            <div className="h-5 bg-slate-800 rounded-lg w-48 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 bg-slate-800/30 border border-slate-800/50 rounded-2xl space-y-2">
                  <div className="h-3 bg-slate-800/40 rounded w-20"></div>
                  <div className="h-5 bg-slate-800/75 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Block: Transport & NFC Info */}
          <div className="space-y-6">
            <div className="h-5 bg-slate-800 rounded-lg w-48 mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 bg-slate-800/30 border border-slate-800/50 rounded-2xl space-y-2">
                  <div className="h-3 bg-slate-800/40 rounded w-20"></div>
                  <div className="h-5 bg-slate-800/75 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
