import React, { useState } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';

/**
 * Enhanced Image component with:
 * 1. Loading state (shimmer/spinner)
 * 2. Error fallback (icon/placeholder)
 * 3. Lazy loading by default
 */
const SafeImage = ({ src, alt, className, ...props }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filter out any potential null/undefined src
  if (!src || src === "undefined" || src === "null") {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}>
        <ImageOff className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 animate-pulse">
           <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
        </div>
      )}
      
      {error ? (
        <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 w-full h-full`}>
           <ImageOff className="w-5 h-5 text-gray-400" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
          {...props}
        />
      )}
    </div>
  );
};

export default SafeImage;
