import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export default function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-slate-800/50 border border-slate-700/50';
  
  let variantClasses = '';
  switch (variant) {
    case 'circular':
      variantClasses = 'rounded-full';
      break;
    case 'text':
      variantClasses = 'rounded-md h-4';
      break;
    case 'rectangular':
    default:
      variantClasses = 'rounded-xl';
      break;
  }

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`} />
  );
}
