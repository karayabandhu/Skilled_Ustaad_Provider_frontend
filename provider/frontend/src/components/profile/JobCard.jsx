import React from "react";
import { Calendar, Clock, MapPin, ChevronRight, Briefcase } from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import StatusBadge from "./StatusBadge";
import { useTranslation } from "react-i18next";

const JobCard = ({ job, onClick }) => {
  const { t } = useTranslation();
  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer"
    >
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors h-fit">
            <Briefcase className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between md:justify-start gap-2 mb-1">
              <h4 className="font-bold text-gray-900 dark:text-white capitalize group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                {job.serviceType || job.service || t("jobs.service_label")}
              </h4>
              <div className="shrink-0">
                <StatusBadge status={job.status} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-3">
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                <Calendar className="w-3.5 h-3.5 mr-2 text-blue-500" />
                {formatDate(job.date || job.createdAt, "full")}
              </div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                <Clock className="w-3.5 h-3.5 mr-2 text-blue-500" />
                {job.time || "Standard Slot"}
              </div>
              <div className="flex items-start text-[11px] text-gray-500 dark:text-gray-400 font-medium sm:col-span-2">
                <MapPin className="w-3.5 h-3.5 mr-2 text-blue-500 mt-0.5 shrink-0" />
                <span className="line-clamp-1 italic">
                  {job.houseNo && `${job.houseNo}, `}
                  {job.colony && `${job.colony}, `}
                  {job.city || job.address?.city || "Location"}
                  {job.state || job.address?.state
                    ? `, ${job.state || job.address?.state}`
                    : ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex md:flex-col justify-between items-center md:items-end border-t md:border-t-0 border-gray-50 dark:border-gray-700 pt-4 md:pt-0">
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              {t("jobs.total_amount")}
            </p>
            <p className="text-lg font-black text-blue-600 dark:text-blue-400">
              {formatCurrency(job.price || 0)}
            </p>
          </div>
          <button className="md:mt-4 p-2 bg-gray-50 dark:bg-gray-700 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
