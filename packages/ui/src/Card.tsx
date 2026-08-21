import { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export const Card = ({ title, children, className = "" }: CardProps) => {
  return (
    <div className={`bg-white dark:bg-zinc-900/40 backdrop-blur-xl rounded-4xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_30px_rgba(0,0,0,0.4)] border border-zinc-100 dark:border-zinc-800 transition-colors ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-200 mb-6 tracking-tight">
          {title}
        </h2>
      )}
      <div>{children}</div>
    </div>
  );
};