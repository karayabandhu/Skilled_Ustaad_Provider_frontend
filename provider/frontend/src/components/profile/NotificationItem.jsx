import React from 'react';
import { CheckCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NotificationItem = React.memo(({ icon: Icon, title, description, time, iconColor, isRead, onRead }) => {
  const { t } = useTranslation();
  return (
  <div
    onClick={onRead}
    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all duration-300 rounded-2xl cursor-pointer group gap-4 ${!isRead ? "bg-blue-50/20 dark:bg-blue-900/10 border-l-4 border-l-blue-500" : ""}`}
  >
    <div className="flex items-start flex-1 min-w-0 overflow-hidden w-full">
      <div className={`p-3 rounded-xl ${iconColor} bg-opacity-10 mr-4 mt-1 flex-shrink-0 transition-transform group-hover:scale-110`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex items-center gap-2 min-w-0">
          <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight truncate min-w-0 block w-full">
            {title}
          </p>
          {!isRead && <span className="shrink-0 w-2 h-2 bg-blue-500 rounded-full animate-pulse mb-1"></span>}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 break-words">
          {description}
        </p>
      </div>
    </div>
    
    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-3 sm:gap-1 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-gray-50 dark:border-gray-800">
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 whitespace-nowrap">{time}</span>
      {!isRead && (
        <button
          onClick={(e) => { e.stopPropagation(); onRead(); }}
          className="text-[9px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest flex items-center gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all bg-blue-50 dark:bg-blue-900/30 sm:bg-transparent px-3 py-2 sm:p-0 rounded-xl sm:rounded-none border border-blue-100 dark:border-blue-800 sm:border-none shadow-sm sm:shadow-none"
        >
          <CheckCheck className="w-3 h-3" /> 
          <span>{t('notifications.mark_read')}</span>
        </button>
      )}
    </div>
  </div>
  );
});

export default NotificationItem;
