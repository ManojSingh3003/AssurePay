import React from "react";

export const UiverseLoader = ({ message = "LOADING" }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="uiverse-loader text-[#0B0B0B] dark:text-zinc-200 transition-colors">
        <span className="uiverse-loader-text">{message}</span>
        <span className="uiverse-load"></span>
      </div>
    </div>
  );
};
