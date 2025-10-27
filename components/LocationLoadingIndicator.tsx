import React from 'react';

interface LocationLoadingIndicatorProps {
  isLocationLoading: boolean;
  isLocationReady: boolean;
  className?: string;
}

const LocationLoadingIndicator: React.FC<LocationLoadingIndicatorProps> = ({
  isLocationLoading,
  isLocationReady,
  className = ""
}) => {
  if (!isLocationLoading && isLocationReady) {
    return null; // Don't show anything when location is ready
  }

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">
          {isLocationLoading ? "Loading location..." : "Setting up location..."}
        </span>
      </div>
    </div>
  );
};

export default LocationLoadingIndicator;
