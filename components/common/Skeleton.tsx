import React from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={`bg-black/10 animate-pulse rounded-md ${className}`}></div>
  );
};

export default Skeleton;