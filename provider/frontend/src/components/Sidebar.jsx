import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Briefcase, IndianRupee, Bell, User, Gavel, Hammer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PWAInstallButton from "./PWAInstallButton";
import { useNotificationBadge } from "../hooks/useNotificationBadge";
import { Crown } from "lucide-react";
import { isSubscriptionActive } from "../utils/subscriptionUtils";
import SubscriptionModal from "./SubscriptionModal";

const Sidebar = ({ onClose }) => {
  const { t } = useTranslation();
  const [providerData, setProviderData] = React.useState(
    JSON.parse(localStorage.getItem("providerData") || "{}")
  );
  const navigate = useNavigate();
  const { unreadCount } = useNotificationBadge(true); // Always true within profile session
  const [showSubModal, setShowSubModal] = React.useState(false);
  const hasActiveSub = isSubscriptionActive();
  const location = useLocation();
  const isJobsActive = location.pathname.startsWith('/profile/jobs') || location.pathname.startsWith('/profile/job/');

  React.useEffect(() => {
    const handleStorageChange = () => {
      setProviderData(JSON.parse(localStorage.getItem("providerData") || "{}"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("providerData"); 
    localStorage.removeItem("accessToken"); 
    localStorage.removeItem("providerId"); 
    localStorage.removeItem("providerPhone"); 
    navigate("/"); 
    window.location.reload(); 
  };

  const linkClasses = ({ isActive }) =>
    `flex items-center px-4 py-2 rounded-xl mb-2 font-bold transition-all duration-200 uppercase text-xs tracking-widest ${
      isActive
        ? "bg-blue-600 text-white shadow-lg scale-[1.02]"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
    }`;

  const handleLinkClick = () => {
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  return (
    <>
      <div className="w-64 md:w-56 h-full bg-white dark:bg-gray-950 border-r border-slate-100 dark:border-gray-800 shadow-xl lg:shadow-none p-6 flex flex-col">
        <nav className="flex-1">
          <button
            onClick={() => setShowSubModal(true)}
            className={`w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all ${
              hasActiveSub
                ? "bg-blue-900/20 text-blue-600 dark:text-blue-300 border border-blue-400/40 hover:bg-blue-400/30"
                : "bg-gradient-to-r from-blue-600 to-black text-white border border-blue-500 shadow-blue-500/20 hover:scale-[1.02]"
            }`}
            title={hasActiveSub ? "Subscription Active" : "Subscribe Now"}
          >
            <Crown size={18} className={hasActiveSub ? "text-blue-500 dark:text-blue-300" : "text-white"} />
            <span>
              {hasActiveSub ? "Subscribed" : "Subscribe (₹99)"}
            </span>
          </button>

          <NavLink to="/profile" end className={linkClasses} onClick={handleLinkClick}>
            <LayoutDashboard className="w-5 h-5 mr-3" /> {t('sidebar.dashboard')}
          </NavLink>
          <NavLink 
            to="/profile/jobs" 
            className={() => linkClasses({ isActive: isJobsActive })} 
            onClick={handleLinkClick}
          >
            <Briefcase className="w-5 h-5 mr-3" /> {t('sidebar.jobs')}
          </NavLink>
          <NavLink to="/profile/earnings" className={linkClasses} onClick={handleLinkClick}>
            <IndianRupee className="w-5 h-5 mr-3" /> {t('sidebar.earnings')}
          </NavLink>
          {(providerData?.serviceCategory === "Bidding Services" || 
            providerData?.serviceCategory === "Biding Services" ||
            providerData?.serviceCategory === "Digital Services" ||
            providerData?.serviceCategory === "Digital Works" ||
            providerData?.serviceCategory === "Web Development") && (
            <>
              <NavLink to="/profile/marketplace" className={linkClasses} onClick={handleLinkClick}>
                <Gavel className="w-5 h-5 mr-3" /> {t('sidebar.marketplace')}
              </NavLink>
              <NavLink to="/profile/my-bids" className={linkClasses} onClick={handleLinkClick}>
                <Hammer className="w-5 h-5 mr-3" /> {t('sidebar.my_bids')}
              </NavLink>
            </>
          )}
          <NavLink 
            to="/profile/notifications" 
            className={(props) => `${linkClasses(props)} relative flex items-center justify-between group`} 
            onClick={handleLinkClick}
          >
            <div className="flex items-center">
              <Bell className="w-5 h-5 mr-3" /> {t('sidebar.notifications')}
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold h-5 min-w-[20px] flex items-center justify-center px-1 rounded-full border-2 border-white dark:border-gray-950 ml-2 shadow-sm group-hover:scale-110 transition-transform">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
          
          <div className="my-6 border-t border-slate-100 dark:border-gray-800" />
          
          <NavLink to="/profile/profiledetails" className={linkClasses} onClick={handleLinkClick}>
            <User className="w-5 h-5 mr-3" /> {t('sidebar.profile')}
          </NavLink>

          <PWAInstallButton />

          <button
            onClick={handleLogout}
            className="w-full mt-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all text-xs uppercase tracking-widest border border-red-100 dark:border-red-900/30 flex items-center justify-center gap-2 group"
          >
            {t('sidebar.logout')}
          </button>
        </nav>
      </div>

      <SubscriptionModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
      />
    </>
  );
};

export default Sidebar;