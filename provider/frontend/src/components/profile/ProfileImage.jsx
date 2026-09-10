import React from 'react';
import { User, Pencil } from 'lucide-react';

/* ================= Backend Base URL for Images ================= */
const BACKEND_URL = (() => {
  const base = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || "http://localhost:5000/api/v1";
  let urlStr = base;
  if (!/^https?:\/\//i.test(base)) {
    urlStr = `http://${base.replace(/^\/+/, "")}`;
  }
  try {
    const url = new URL(urlStr);
    return `${url.protocol}//${url.host}`;
  } catch (e) {
    return "http://localhost:5000";
  }
})();

const ProfileImage = ({ src, preview, onEdit }) => {
  const renderImage = () => {
    if (preview) {
      return (
        <img
          src={preview}
          alt="Profile Preview"
          className="w-full h-full object-cover"
        />
      );
    }

    if (!src) return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
        <User className="w-12 h-12 text-gray-400" />
      </div>
    );

    const srcStr = String(src).trim();
    let imageUrl = srcStr;

    if (!/^https?:\/\//i.test(srcStr)) {
      imageUrl = srcStr.startsWith("/uploads/")
        ? `${BACKEND_URL}${srcStr}`
        : `${BACKEND_URL}/uploads/${srcStr.replace(/^\//, "")}`;
    }

    return (
      <img
        src={imageUrl}
        alt="Profile"
        className="w-full h-full object-cover shadow-sm"
        crossOrigin="anonymous"
      />
    );
  };

  return (
    <div className="relative group">
      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-50 dark:border-blue-900/30 shadow-md">
        {renderImage()}
      </div>
      {onEdit && (
        <button
          onClick={onEdit}
          className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 text-blue-600 hover:text-blue-700 transition-all opacity-0 group-hover:opacity-100"
          title="Change Photo"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default ProfileImage;
