import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const SearchCard = ({
  isAuthenticated,
  providerCount = 0,
  highDemandServices = [],
  handleLogout,
}) => {
  const { t } = useTranslation();
  const [selectedLocation, setSelectedLocation] = useState("Patna");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [authState, setAuthState] = useState(isAuthenticated);
  const [isVerified, setIsVerified] = useState(true);
  const navigate = useNavigate();

  const publicCities = [
    "Patna",
    "Delhi",
    "Mumbai",
    "Kolkata",
    "Bangalore",
    "Hyderabad",
  ];

  useEffect(() => {
    const checkAuth = () => {
      const data = localStorage.getItem("providerData");
      if (data) {
        try {
          const parsed = JSON.parse(data);
          const providerObj = parsed.provider || parsed;
          if (providerObj.city) setSelectedLocation(providerObj.city);
          setAuthState(true);
          setIsVerified(providerObj.status === "Active");
        } catch (e) {
          console.error("Error parsing provider data:", e);
        }
      } else {
        setAuthState(false);
        setIsVerified(true);
        setSelectedLocation("Patna");
      }
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  useEffect(() => {
    setAuthState(isAuthenticated);
    if (isAuthenticated) {
      const data = localStorage.getItem("providerData");
      if (data) {
        try {
          const parsed = JSON.parse(data);
          const providerObj = parsed.provider || parsed;
          if (providerObj.city) setSelectedLocation(providerObj.city);
          setIsVerified(providerObj.status === "Active");
        } catch (e) {
          console.error("Error parsing provider data:", e);
        }
      }
    } else {
      setIsVerified(true);
    }
  }, [isAuthenticated]);

  const handleLocationClick = (city) => {
    setSelectedLocation(city);
    setIsDropdownOpen(false);
  };

  const handleButtonClick = () => {
    if (authState) {
      navigate("/profile");
    } else {
      navigate("/register");
    }
  };

  const citiesToDisplay = authState ? [selectedLocation] : publicCities;

  const displayProviderCount = Number(providerCount || 0).toLocaleString(
    "en-IN",
  );

  const dynamicTags =
    highDemandServices
      ?.map(
        (service) =>
          service.title ||
          service.name ||
          service.category ||
          service.subService,
      )
      .filter(Boolean)
      .slice(0, 4) || [];

  const tagsToDisplay =
    dynamicTags.length > 0
      ? dynamicTags
      : ["Cleaning", "Repair", "Electrician", "Salon"];

  return (
    <div
      // className="w-full flex items-center justify-center relative py-12 md:py-20 min-h-[85vh] bg-slate-900 overflow-hidden"
      className="w-full flex items-center justify-center relative min-h-[85vh] bg-slate-900 overflow-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Background Image */}
      <img
        src="/banner.png"
        alt="Service Provider Hero"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-slate-900/35 dark:bg-slate-900/50" />
      {/* Hero Content - Higher Stacking context */}
      {/* <div className="relative z-10 isolate flex flex-col items-center max-w-4xl w-full px-4 text-center mt-[-5vh]"> */}
      <div className="relative z-10 isolate flex flex-col items-center justify-center max-w-4xl w-full px-4 text-center">
        <div className="space-y-4 mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
            {t("search_card.title_start")}{" "}
            <span className="text-blue-400">
              {t("search_card.title_highlight")}
            </span>{" "}
            <br />
            {t("search_card.title_end")}
          </h1>
          <p className="text-sm md:text-lg text-white/80 max-w-2xl mx-auto font-medium">
            Empowering professionals across India. Grow
            your business with Skilled Ustaad.
          </p>
        </div>

        {/* Main Action Button */}
        <div className="w-full flex flex-col items-center gap-5">
          <button
            onClick={handleButtonClick}
            disabled={authState && !isVerified}
            className={`px-10 py-5 rounded-2xl font-black shadow-3xl transition-all text-base md:text-lg flex items-center gap-3 uppercase tracking-tight group ${authState && !isVerified
                ? "bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed opacity-75"
                : "bg-white text-blue-900 hover:bg-blue-50 transform hover:scale-[1.05] active:scale-95"
              }`}
          >
            {authState
              ? t("search_card.cta_dashboard")
              : t("search_card.cta_register")}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow-lg ${authState && !isVerified
                ? "bg-slate-400 text-slate-300"
                : "bg-blue-900 text-white group-hover:bg-blue-800"
              }`}>
              <ArrowRight size={20} />
            </div>
          </button>

          {authState && !isVerified && (
            <p className="text-xs font-black text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/30 px-5 py-2.5 rounded-full uppercase tracking-wider animate-pulse">
              ⚠️ {t("search_card.not_verified_warning", "You are not verified by the admin yet.")}
            </p>
          )}

          {/* Trending Tags Marquee */}
          <div className="w-full overflow-hidden mt-8 max-w-full relative">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none"></div>
            
            <motion.div
              className="flex items-center gap-4 whitespace-nowrap w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            >
              {[...tagsToDisplay, ...tagsToDisplay, ...tagsToDisplay, ...tagsToDisplay].map((tag, idx) => (
                <div
                  key={`${tag}-${idx}`}
                  className="shrink-0 px-5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
                >
                  {tag}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal icon for consistency if not imported from lucide
const ArrowRight = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export default SearchCard;
