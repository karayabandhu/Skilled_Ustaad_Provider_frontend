import React, { useState, useMemo, useRef, useEffect } from "react";
import { format, isSameDay, parseISO, startOfDay, addDays, subDays, eachDayOfInterval } from "date-fns";
import JobCard from "./JobCard";
import { 
  Briefcase, 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronRight, 
  Activity, 
  Zap, 
  ChevronLeft, 
  Ticket, 
  MapPin, 
  Star,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { formatCurrency } from "../../utils/formatters";
import StatusBadge from "./StatusBadge";

const JobCalendar = ({ bookings, onJobClick }) => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateStripRef = useRef(null);

  // Memoize bookings for each date to improve performance
  const bookingsByDate = useMemo(() => {
    const map = {};
    bookings.forEach(job => {
      const rawDate = job.bookingDate || job.date || job.createdAt;
      if (!rawDate) return;
      
      try {
        const dateKey = format(parseISO(rawDate.toString()), 'yyyy-MM-dd');
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(job);
      } catch (e) {
        console.warn("Invalid date for job:", job._id, rawDate);
      }
    });
    return map;
  }, [bookings]);

  // Generate date strip (past 14 days and next 60 days to give a "movie booking" range)
  const dateStrip = useMemo(() => {
    const start = subDays(new Date(), 14);
    const end = addDays(new Date(), 60);
    return eachDayOfInterval({ start, end });
  }, []);

  const getBookingsForSelectedDate = () => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return bookingsByDate[dateKey] || [];
  };

  const selectedDateBookings = getBookingsForSelectedDate();

  // Scroll to selected date on initial mount
  useEffect(() => {
    const activeBtn = dateStripRef.current?.querySelector('[data-active="true"]');
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, []);

  return (
    <div className="space-y-6 md:space-y-10 w-full mx-auto py-8 md:py-12 px-4 md:px-6 bg-slate-50/50 dark:bg-[#0a0f1d] rounded-t-[2rem] md:rounded-t-[3rem] shadow-2xl relative overflow-hidden transition-colors duration-500">
      {/* Dynamic Background Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />
      {/* 🎬 HEADER: DATE SELECTOR (MOVIE STYLE) */}
      <div className="relative group">
        <div className="flex items-end justify-between mb-8 px-4">
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
              {format(selectedDate, "MMMM yyyy")}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('calendar.select_date')}</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
             <button 
               onClick={() => {
                 dateStripRef.current.scrollBy({ left: -200, behavior: 'smooth' });
               }}
               className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 hover:scale-110 active:scale-95 transition-all text-gray-400 hover:text-blue-600"
             >
               <ChevronLeft size={20} />
             </button>
             <button 
               onClick={() => {
                 dateStripRef.current.scrollBy({ left: 200, behavior: 'smooth' });
               }}
               className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 hover:scale-110 active:scale-95 transition-all text-gray-400 hover:text-blue-600"
             >
               <ChevronRight size={20} />
             </button>
          </div>
        </div>

        {/* HORIZONTAL DATE STRIP */}
        <div 
          ref={dateStripRef}
          className="flex gap-3 md:gap-4 overflow-x-auto pt-6 md:pt-10 pb-6 md:pb-8 px-4 md:px-8 no-scrollbar scroll-smooth relative"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {dateStrip.map((date, idx) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            const isPast = date < startOfDay(new Date());
            const hasJobs = !!bookingsByDate[format(date, 'yyyy-MM-dd')];
            const jobCount = bookingsByDate[format(date, 'yyyy-MM-dd')]?.length || 0;

            return (
              <button
                key={idx}
                data-active={isSelected}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "flex-shrink-0 w-20 flex flex-col items-center justify-center rounded-3xl transition-all duration-300 border-2 relative select-none",
                  isSelected 
                    ? "bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-500/40 py-8 z-10 -mt-2" 
                    : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-200 dark:hover:border-blue-900/50 py-6"
                )}
              >
                {isToday && !isSelected && (
                  <span className="absolute -top-2 px-2 py-0.5 bg-blue-500 text-white text-[8px] font-black uppercase rounded-full tracking-tighter">Today</span>
                )}
                
                <span className={cn("text-[10px] font-black uppercase tracking-widest mb-1", isSelected ? "text-white/70" : "text-gray-400")}>
                  {format(date, "EEE")}
                </span>
                <span className="text-2xl font-black">{format(date, "d")}</span>
                
                {hasJobs && (
                  <div className={cn(
                    "mt-3 flex gap-0.5",
                    isSelected ? "bg-white/20 px-2 py-1 rounded-full" : "bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full"
                  )}>
                    {[...Array(Math.min(jobCount, 3))].map((_, i) => (
                      <div key={i} className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-white" : "bg-blue-600")} />
                    ))}
                    {jobCount > 3 && <span className={cn("text-[8px] font-bold ml-1", isSelected ? "text-white" : "text-blue-600")}>+</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 🎞️ CONTENT: ASSIGNMENT TICKETS (MOVIE STYLE) */}
      <div className="space-y-8 px-4">
        <div className="flex items-center justify-between">
           <h3 className="text-lg md:text-xl font-black text-gray-800 dark:text-gray-200 uppercase tracking-tight flex items-center gap-2 md:gap-3">
             <Ticket className="text-blue-500 w-5 h-5 md:w-6 md:h-6" />
             {selectedDateBookings.length > 0 ? t('calendar.now_showing') : t('calendar.no_shows')}
           </h3>
           <div className="text-xs font-black text-gray-400 uppercase tracking-widest">
             {format(selectedDate, "EEE, d MMM")}
           </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDate.toISOString()}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6"
          >
            {selectedDateBookings.length > 0 ? (
              selectedDateBookings.map((job) => (
                <MovieTicketCard key={job._id} job={job} onClick={() => onJobClick(job)} />
              ))
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-[2rem] md:rounded-[3rem] p-10 md:p-24 text-center border-2 md:border-4 border-dashed border-gray-100 dark:border-gray-700 shadow-2xl shadow-black/5">
                {/* <div className="p-6 md:p-8 bg-gray-50 dark:bg-gray-700 rounded-[2rem] md:rounded-[2.5rem] w-fit mx-auto mb-4 md:mb-6 transform hover:rotate-12 transition-transform">
                  <Activity className="w-12 h-12 md:w-16 md:h-16 text-gray-300" strokeWidth={1} />
                </div> */}
                <h4 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">{t('calendar.box_office_closed')}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto font-medium">
                  {t('calendar.movie_break')}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// 🎫 THE TICKET CARD COMPONENT
const MovieTicketCard = ({ job, onClick }) => {
  const { t } = useTranslation();
  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="group relative cursor-pointer w-full"
    >
      {/* TICKET BODY - Flex-col on mobile, flex-row on md+ */}
      <div className="flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700 hover:border-blue-500/50 transition-all duration-500">
        
        {/* LEFT/TOP SECTION: TIME & CATEGORY */}
        <div className="w-full md:w-[160px] bg-blue-600 p-5 md:p-8 flex flex-row md:flex-col items-center justify-between md:justify-center text-white relative">
           {/* Perforation Line (Optimized for both orientations) */}
           <div className="absolute right-0 bottom-0 md:right-[-10px] md:top-0 md:bottom-0 flex flex-row md:flex-col justify-around w-full h-[10px] md:w-[20px] md:h-full pointer-events-none">
             {[...Array(12)].map((_, i) => (
                <div key={i} className="w-3 h-3 md:w-5 md:h-5 bg-white dark:bg-[#0a0f1d] rounded-full -mb-1.5 md:mb-0" />
             ))}
           </div>

           <div className="flex items-center md:flex-col gap-3 md:gap-0">
             <Clock className="w-6 h-6 md:w-8 md:h-8 mb-0 md:mb-4 text-white/50" />
             <div className="flex flex-col md:items-center">
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/70 mb-0 md:mb-1">{t('calendar.starting_at')}</p>
                <h4 className="text-xl md:text-2xl font-black">{job.time}</h4>
             </div>
           </div>
           
           <div className="px-3 py-1 bg-white/20 rounded-full text-[8px] font-black uppercase tracking-widest mt-0 md:mt-4 whitespace-nowrap">
             {job.bookingStatus || job.status || 'Active'}
           </div>
        </div>

        {/* RIGHT/BOTTOM SECTION: DETAILS */}
        <div className="flex-grow p-5 md:p-8">
           <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <div className="w-full sm:w-auto">
                <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter group-hover:text-blue-600 transition-colors line-clamp-2">
                  {job.serviceType || 'Service Premium'}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-900/40 rounded-lg shrink-0">
                    <Briefcase size={12} className="text-blue-600" />
                  </div>
                  <p className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest truncate">
                    ID: #{(job._id || job.id || '').toString().slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-gray-700/50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0 sm:mb-1">{t('calendar.total_fee')}</p>
                <h4 className="text-xl md:text-2xl font-black text-blue-600 dark:text-blue-400">{formatCurrency(job.price || 0)}</h4>
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 items-end">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl shrink-0">
                   <MapPin size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                 </div>
                 <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                      {job.city || job.address?.city || 'City Location'}{job.state ? `, ${job.state}` : ''}
                    </p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest line-clamp-1">
                      {typeof job.address === 'string' ? job.address : (job.address?.colony || job.address?.houseNo || 'Premium Address')}
                    </p>
                 </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 bg-gray-50/50 dark:bg-gray-800/30 p-4 sm:p-0 rounded-2xl sm:bg-transparent">
                 <div className="flex flex-col items-start sm:items-end min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                       <User size={12} className="text-blue-600 shrink-0" />
                       <p className="text-xs md:text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter truncate max-w-[120px]">
                         {job.userId?.fullName || job.userName || 'Premium Client'}
                       </p>
                    </div>
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('calendar.verified_customer')}</p>
                 </div>
                 <div className="ml-2 w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white dark:bg-gray-700 group-hover:bg-blue-600 group-hover:text-white shadow-sm transition-all flex items-center justify-center shrink-0">
                    <ChevronRight size={20} className="md:w-6 md:h-6" />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default JobCalendar;
