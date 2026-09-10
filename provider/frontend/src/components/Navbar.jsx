import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle } from "react-icons/fa";
import { QrCode, MessageSquare, Menu, LogOut, Crown } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import AssignmentVerifyModal from "./AssignmentVerifyModal";
import { api } from "../services/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import SubscriptionModal from "./SubscriptionModal";
import { useTheme } from "next-themes";


const Navbar = ({
  isAuthenticated,
  isVerified,
  handleLogout,
  toggleSidebar,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showScanner, setShowScanner] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { theme, setTheme } = useTheme();

  // Check if we are in the profile section to show sidebar toggle
  const isInProfile = location.pathname.startsWith("/profile");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      navigate("/register");
      return;
    }
    if (!isVerified) {
      toast.warning("Account Not Verified", {
        description:
          "You are not verified by the admin yet. Profile access is restricted.",
        duration: 4000,
      });
      return;
    }
    navigate("/profile/profiledetails");
  };

  const handleQrClick = () => {
    if (!isVerified) {
      toast.warning("Account Not Verified", {
        description:
          "QR Scanner is disabled until your account is verified by the admin.",
        duration: 4000,
      });
      return;
    }
    setShowScanner(true);
  };

  const handleChatClick = () => {
    if (!isVerified) {
      toast.warning("Account Not Verified", {
        description:
          "Chat is disabled until your account is verified by the admin.",
        duration: 4000,
      });
      return;
    }
    navigate("/profile/chats");
  };

  const handleVerify = async (otp, bookingId) => {
    try {
      const res = await api.post("/booking/start-booking", { bookingId, otp });
      toast.success("Job started successfully!");
      setShowScanner(false);
      // Navigate to booking details
      const id = res.data.bookingId;
      navigate(`/profile/job/${id}`, {
        state: {
          updatedBooking: res.data.booking || res.data,
          refresh: true,
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.error || "Verification failed");
    }
  };

  return (
    <>
      <nav className="bg-white/80 dark:bg-[#070b14]/80 backdrop-blur-md shadow-sm fixed top-0 w-full z-50 border-b border-gray-100 dark:border-gray-800 px-3 sm:px-4 md:px-6">
        <div className="w-full">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex items-center relative h-12 md:h-14 w-40 md:w-52 transition-transform duration-300 group-hover:scale-105 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <img
                src="/logo-main.png"
                className="absolute top-1/2 -translate-y-1/2 mt-1 left-0 h-28 md:h-36 w-auto object-contain max-w-none dark:brightness-0 dark:invert transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 sm:gap-4 md:gap-6">
              <div className="hidden">
                <LanguageSwitcher />
              </div>

              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl border shadow-sm transition-all bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                    title={t("common.profile", "Profile Menu")}
                    aria-label="Profile Menu"
                  >
                    <FaUserCircle size={22} className="text-violet-500" />
                    <Menu size={16} className="text-gray-400" />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden"
                      >
                        <div className="py-2 flex flex-col">
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              handleProfileClick();
                            }}
                            className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors w-full text-left"
                          >
                            <FaUserCircle size={18} className="text-violet-500" />
                            {t("common.profile", "Profile")}
                          </button>

                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              handleChatClick();
                            }}
                            className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 flex items-center gap-3 text-sm font-semibold transition-colors w-full text-left ${
                              isVerified ? "text-gray-700 dark:text-gray-200" : "text-gray-400 cursor-not-allowed opacity-60"
                            }`}
                            disabled={!isVerified}
                          >
                            <MessageSquare size={18} className={isVerified ? "text-blue-500" : "text-gray-400"} />
                            Messages {!isVerified && "(Locked)"}
                          </button>

                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              handleQrClick();
                            }}
                            className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 flex items-center gap-3 text-sm font-semibold transition-colors w-full text-left ${
                              isVerified ? "text-gray-700 dark:text-gray-200" : "text-gray-400 cursor-not-allowed opacity-60"
                            }`}
                            disabled={!isVerified}
                          >
                            <QrCode size={18} className={isVerified ? "text-cyan-500" : "text-gray-400"} />
                            Verify Assignment
                          </button>

                          <div 
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="px-4 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                          >
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-3">
                              <span className="text-amber-500 w-[18px] text-center text-lg">✨</span>
                              Appearance
                            </span>
                            <div className="pointer-events-none">
                              <ThemeToggle />
                            </div>
                          </div>

                          <div className="border-t border-gray-100 dark:border-slate-800 my-1"></div>

                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              handleLogout();
                              navigate("/logout");
                            }}
                            className="px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-sm font-semibold text-red-600 dark:text-red-400 transition-colors w-full text-left"
                          >
                            <LogOut size={18} />
                            {t("common.logout", "Logout")}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <ThemeToggle />
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center gap-2 p-2.5 rounded-xl border shadow-lg transition-all bg-violet-500 text-white border-violet-400 shadow-violet-500/30 hover:bg-violet-400 hover:scale-105"
                    title={t("common.profile", "Login")}
                    aria-label="Login"
                  >
                    <FaUserCircle size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AssignmentVerifyModal
        show={showScanner}
        onVerify={handleVerify}
        onClose={() => setShowScanner(false)}
        darkMode={document.documentElement.classList.contains("dark")}
        title="Start Assignment"
        subtitle="Scan customer's QR or enter the 6-digit OTP to officially start your session"
      />
      {isAuthenticated && isInProfile && (
        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed bottom-4 left-4 md:bottom-6 md:left-6 z-[1001] p-4 md:p-5 rounded-[1.5rem] md:rounded-[1.8rem] bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-[0_15px_30px_rgba(0,0,0,0.2)] hover:scale-110 active:scale-95 transition-all group"
          aria-label="Toggle Sidebar"
        >
          <Menu size={32} />
        </button>
      )}


    </>
  );
};

export default Navbar;
