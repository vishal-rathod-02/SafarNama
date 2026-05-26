import React from "react";

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white/95 rounded-2xl shadow-md border border-gray-100 flex flex-col h-full overflow-hidden">
      {/* Image / thumbnail area */}
      <div className="w-full h-32 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Top row: day / tag + small badge (e.g. distance/time) */}
        <div className="flex justify-between items-start">
          <div className="h-5 w-24 bg-gray-200/90 rounded-full animate-pulse" />
          <div className="h-4 w-14 bg-gray-200/80 rounded-md animate-pulse" />
        </div>

        {/* Title line */}
        <div className="h-5 w-3/4 bg-gray-200 rounded-md animate-pulse" />

        {/* Description / info lines */}
        <div className="space-y-2 flex-1">
          <div className="h-4 w-full bg-gray-200/90 rounded-md animate-pulse" />
          <div className="h-4 w-5/6 bg-gray-200/80 rounded-md animate-pulse" />
        </div>

        {/* Footer: extra info / CTA hint */}
        <div className="pt-3 mt-2 border-t border-gray-100 flex flex-col gap-2">
          <div className="h-4 w-1/2 bg-gray-200/90 rounded-md animate-pulse" />
          <div className="h-4 w-2/3 bg-gray-200/80 rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  );
};
