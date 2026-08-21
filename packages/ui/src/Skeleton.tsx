"use client";

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = "" }: SkeletonProps) => {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-zinc-800/50 rounded transition-colors ${className}`}></div>
  );
};
