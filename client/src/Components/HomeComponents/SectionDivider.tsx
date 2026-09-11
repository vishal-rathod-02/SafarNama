import React from "react";

export const SectionDivider: React.FC = () => {
  return (
    <div className="relative w-full py-4 flex items-center justify-center overflow-hidden pointer-events-none select-none">
      <div className="w-full max-w-5xl px-4 mx-auto flex items-center justify-center">
        {/* Modern Hairline Gradient */}
        <div className="w-full h-px section-hairline relative flex items-center justify-center">
          {/* Subtle Centered Amber Waypoint Diamond */}
          <div className="w-2 h-2 rotate-45 bg-amber-500/80 dark:bg-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.6)] rounded-[1px]" />
        </div>
      </div>
    </div>
  );
};

