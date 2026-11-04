import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`skeleton-shimmer rounded-md ${className}`} />
  );
};

export const SkeletonChat: React.FC = () => {
  return (
    <div className="flex items-start gap-3 sm:gap-4 animate-fade-in w-full max-w-2xl">
      <div className="w-9 h-9 rounded-xl skeleton-shimmer shrink-0" />
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl rounded-tl-xs shadow-xs space-y-2.5 flex-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
    </div>
  );
};

export const SkeletonOptionCard: React.FC = () => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between gap-4">
      <div className="flex items-center gap-3.5 flex-1">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="w-6 h-6 rounded-full shrink-0" />
    </div>
  );
};

export const SkeletonRecommendationCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <Skeleton className="h-3.5 w-4/6" />
      </div>
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
        <Skeleton className="h-3 w-1/2 mb-3" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
};

export const SkeletonStatCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-3">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3.5 w-32" />
    </div>
  );
};

export const SkeletonTableRow: React.FC = () => {
  return (
    <tr className="border-b border-slate-100 dark:border-slate-800">
      <td className="py-3.5 px-4"><Skeleton className="h-4 w-16" /></td>
      <td className="py-3.5 px-4"><Skeleton className="h-4 w-48" /></td>
      <td className="py-3.5 px-4"><Skeleton className="h-4 w-24 rounded-full" /></td>
      <td className="py-3.5 px-4"><Skeleton className="h-4 w-20" /></td>
      <td className="py-3.5 px-4"><Skeleton className="h-6 w-12 rounded-md ml-auto" /></td>
    </tr>
  );
};

