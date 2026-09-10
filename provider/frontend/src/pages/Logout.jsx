import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Home, LogIn } from "lucide-react";
import SEO from "../components/SEO";

const Logout = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 md:p-8 relative overflow-hidden">
      <SEO title="Logout" description="You have been securely logged out of your Skilled Ustaad Provider portal session." />
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 translate-y-1/2" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-10 md:p-14 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-blue-600" />

        <div className="mb-8 flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="w-24 h-24 bg-green-50 dark:bg-green-950/30 rounded-full flex items-center justify-center border-4 border-green-100 dark:border-green-900/50"
          >
            <CheckCircle2 size={48} className="text-green-500" />
          </motion.div>
        </div>

        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
          {t("logout_page.title", "Logout Successful")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 leading-relaxed">
          {t("logout_page.desc", "You've been securely signed out. Thank you for being part of Skilled Ustaad.")}
        </p>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/login")}
            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
          >
            <LogIn size={22} className="group-hover:translate-x-1 transition-transform" />
            {t("logout_page.sign_in", "Sign Back In")}
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full h-14 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-800 flex items-center justify-center gap-3"
          >
            <Home size={20} />
            {t("logout_page.return_home", "Return to Home")}
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 px-4">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">
            {t("logout_page.premium_portal", "Premium Service Partners Portal")}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Logout;
