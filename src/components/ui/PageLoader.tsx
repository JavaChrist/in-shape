import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface PageLoaderProps {
  size?: 'small' | 'large';
  message?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({
  size = 'small',
  message = 'Chargement...'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
      <LoadingSpinner size={size} />
      <p className="text-sm text-gray-500 mt-2">{message}</p>
    </div>
  );
};

export default PageLoader; 