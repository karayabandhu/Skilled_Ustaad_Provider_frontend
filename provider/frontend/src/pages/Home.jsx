import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  Heart,
  Star,
  Users,
  ChevronDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import SearchCard from "../components/SearchCard";
import SEO from "../components/SEO";
import {
  BACKEND_ROOT,
  getGlobalStats,
} from "../services/api";
import { Gavel } from "lucide-react";
import SafeImage from "../components/common/SafeImage";

const Home = ({
  topProviders,
  highDemandServices,
  isAuthenticated,
  setIsAuthenticated,
  handleLogout,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.21, 0.45, 0.32, 0.9],
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
  };

  const [isExpanded, setIsExpanded] = useState(false);


  const [providerCount, setProviderCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getGlobalStats();

        const count =
          res?.data?.providerCount ||
          res?.data?.totalProviders ||
          res?.data?.providers ||
          res?.data?.totalProviderCount ||
          0;

        setProviderCount(Number(count) || 0);
      } catch (err) {
        console.warn("Home stats fetch failed:", err);
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      title: t("home.features.instant_payouts.title"),
      desc: t("home.features.instant_payouts.desc"),
    },
    {
      title: t("home.features.verified_leads.title"),
      desc: t("home.features.verified_leads.desc"),
    },
    {
      title: t("home.features.expert_control.title"),
      desc: t("home.features.expert_control.desc"),
    },
    {
      title: t("home.features.business_dashboard.title"),
      desc: t("home.features.business_dashboard.desc"),
    },
  ];

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Skilled Ustaad",
    "url": "https://provider.skilledustaad.com/",
    "logo": "https://provider.skilledustaad.com/logo-main.png",
    "description": "India's most trusted partner network of electricians, plumbers, painters, cleaners, and other service professionals."
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 dark:bg-gray-950 selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-500">
      <SEO
        title="Join as Service Partner"
        description="Grow your service business with Skilled Ustaad. Join India's most trusted partner network of electricians, plumbers, painters, cleaners, and other service professionals. Register today and get verified leads."
        keywords="skilled ustaad partner, local service jobs, freelance handyman, professional service provider portal, manage bookings, plumber jobs near me, electrician registration"
        url="https://provider.skilledustaad.com/"
        schema={organizationSchema}
      />
      {/* Search and Hero Sections */}
      <SearchCard
        isAuthenticated={isAuthenticated}
        providerCount={providerCount}
        highDemandServices={highDemandServices}
        handleLogout={handleLogout}
      />
      <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">
        {/* ================= WHY GROW WITH US SECTION ================= */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="mt-16 md:mt-24 overflow-hidden relative group mx-1 md:mx-0"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 rounded-[2rem] md:rounded-[3rem] opacity-95 transition-transform duration-700 pointer-events-none shadow-2xl shadow-indigo-500/20" />

          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

          <div className="relative p-8 md:p-16 text-white">
            <div className="max-w-4xl">
              <h2 className="text-2xl md:text-5xl font-black mb-10 md:mb-16 tracking-tight leading-tight uppercase italic">
                {t("home.why_grow_title")}{" "}
                <span className="text-indigo-200 underline decoration-indigo-400/30 underline-offset-8">
                  {t("home.why_grow_subtitle")}
                </span>
              </h2>

              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 md:gap-y-10">
                {features.map((item, idx) => (
                  <motion.li
                    key={item.title}
                    variants={cardVariants}
                    className={`flex items-start gap-4 md:gap-6 group/item ${!isExpanded && idx >= 2 ? "hidden md:flex" : "flex"}`}
                  >
                    <div className="p-2 rounded-xl bg-white/10 group-hover/item:bg-white/20 transition-all mt-1 border border-white/10 shadow-lg shrink-0">
                      <CheckCircle size={20} className="text-indigo-200" />
                    </div>
                    <div>
                      <p className="font-extrabold text-lg md:text-xl mb-1 md:mb-2 uppercase tracking-tight italic">
                        {item.title}
                      </p>
                      <p className="text-white/70 text-sm md:text-base leading-relaxed font-medium">
                        {item.desc}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ul>

              {/* Read More Button for Mobile */}
              <div className="mt-10 md:hidden">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  {isExpanded ? "Show Less" : "Read More Features"}
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={16} />
                  </motion.div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ================= HIGH DEMAND CATEGORIES SECTION ================= */}
        <section className="mt-28">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white mb-6 tracking-tight italic">
              {t("home.high_demand.title")}{" "}
              <span className="text-indigo-600">
                {t("home.high_demand.subtitle")}
              </span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">
              {t("home.high_demand.tagline")}
            </p>
          </div>

          <div
            className={`w-full flex flex-row overflow-x-auto snap-x snap-mandatory no-scrollbar ${highDemandServices.length < 3 ? "md:flex md:justify-center" : "md:grid md:grid-cols-2 lg:grid-cols-3"} gap-8 md:gap-10 pb-10 px-4 touch-pan-x`}
          >
            {highDemandServices.map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{
                  y: -15,
                  x: -5,
                  scale: 1.02,
                }}
                animate={{
                  x: [0, -4, 0],
                  y: [0, 3, 0],
                  transition: {
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: idx * 0.7,
                  },
                }}
                className="shrink-0 snap-center w-[85vw] md:w-auto bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 overflow-hidden border border-slate-100 dark:border-slate-800 group"
              >
                <div className="h-64 md:h-72 overflow-hidden relative">
                  <div className="absolute inset-0 bg-indigo-900/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
                  <SafeImage
                    src={
                      service.img?.startsWith("http")
                        ? service.img
                        : `${BACKEND_ROOT}/uploads/${service.img}`
                    }
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute bottom-4 left-4 z-20">
                    <span className="px-4 py-1.5 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                      {t("home.high_demand.hot_lead")}
                    </span>
                  </div>
                </div>
                <div className="p-8 text-center bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors text-center leading-tight italic uppercase tracking-tighter">
                    {service.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </section>



        {/* ================= HOW IT WORKS SECTION ================= */}
        <section className="mt-32 py-24 bg-white dark:bg-slate-900 rounded-[3rem] md:rounded-[4rem] px-4 md:px-10 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-indigo-500/5 items-center justify-center flex flex-col overflow-hidden w-full relative">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white mb-4 tracking-tighter italic">
              {t("home.expert_journey.title")}{" "}
              <span className="text-indigo-600">
                {t("home.expert_journey.subtitle")}
              </span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">
              {t("home.expert_journey.tagline")}
            </p>
          </div>

          <div className="w-full flex flex-row overflow-x-auto snap-x snap-mandatory justify-start lg:justify-between items-center gap-10 md:gap-24 no-scrollbar pb-10 px-4 lg:px-0 touch-pan-x overflow-y-hidden">
            {[
              {
                icon: ShieldCheck,
                title: t("home.expert_journey.steps.register"),
                img: "/expert-journey/register.png",
              },
              {
                icon: Users,
                title: t("home.expert_journey.steps.leads"),
                img: "/expert-journey/leads.png",
              },
              {
                icon: Heart,
                title: t("home.expert_journey.steps.deliver"),
                img: "/expert-journey/deliver.png",
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="relative flex flex-col items-center shrink-0 snap-center"
              >
                <motion.div
                  initial={{ rotate: -5, scale: 0.9 }}
                  whileInView={{ rotate: 0, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-slate-50 dark:bg-slate-950 border-4 border-indigo-600/5 p-10 w-60 h-60 md:w-64 md:h-64 rounded-full flex flex-col justify-center items-center shadow-xl relative z-10 transition-all duration-500 hover:border-indigo-600 group"
                >
                  <img
                    src={step.img}
                    alt=""
                    loading="lazy"
                    className={`w-16 md:w-20 mb-6 grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110 ${
                      step.img.includes("leads")
                        ? "dark:invert dark:brightness-0 dark:contrast-200 dark:drop-shadow-[0_0_14px_rgba(255,255,255,0.45)]"
                        : ""
                    }`}
                  />
                  <h3 className="text-sm md:text-base font-black text-slate-800 dark:text-white tracking-widest uppercase italic text-center leading-tight">
                    {step.title}
                  </h3>
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-black shadow-lg shadow-indigo-600/30">
                    {idx + 1}
                  </div>
                </motion.div>
                {idx < 2 && (
                  <div className="hidden lg:block absolute top-1/2 left-[100%] w-24 h-px border-t-2 border-indigo-200 border-dashed z-0 transform -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ================= POPULAR SERVICES SECTION ================= */}
        <section className="mt-28 mb-32">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div className="text-left">
              <p className="text-indigo-600 font-black uppercase tracking-widest text-[11px] mb-2">
                {t("home.popular_providers.tagline")}
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
                {t("home.popular_providers.title")}
              </h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm md:text-base leading-relaxed text-left">
              {t("home.popular_providers.desc")}
            </p>
          </div>

          <div
            className={`flex flex-row overflow-x-auto md:grid ${topProviders.length < 3 ? "md:flex md:justify-center" : "md:grid-cols-3"} gap-8 md:gap-12 no-scrollbar pb-10 px-4 touch-pan-x`}
          >
            {topProviders.slice(0, 6).map((provider, idx) => (
              <motion.div
                key={provider.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{
                  y: -10,
                  x: 5,
                  shadow: "0 25px 50px -12px rgba(99, 102, 241, 0.25)",
                }}
                animate={{
                  x: [0, 3, 0],
                  y: [0, -2, 0],
                  transition: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: idx * 0.5,
                  },
                }}
                className="shrink-0 w-72 md:w-auto bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 p-6 flex items-center gap-6 group transition-all duration-300"
              >
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-indigo-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity" />
                  <SafeImage
                    src={
                      provider.img?.startsWith("http")
                        ? provider.img
                        : `${BACKEND_ROOT}/uploads/${provider.img}`
                    }
                    alt={provider.name}
                    className="w-24 h-24 object-cover rounded-2xl shadow-md transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-lg font-black text-slate-800 dark:text-slate-100 hover:text-indigo-600 transition-colors block mb-1">
                    {provider.name}
                  </span>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => {
                        const rating = Number(provider.rating || 0);

                        return (
                          <Star
                            key={s}
                            size={10}
                            className={
                              s <= Math.round(rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            }
                          />
                        );
                      })}

                      <span className="text-[10px] font-bold text-slate-400 ml-1">
                        (
                        {Number.isFinite(Number(provider.rating))
                          ? Number(provider.rating).toFixed(1)
                          : "0.0"}
                        )
                      </span>
                    </div>
                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1">
                      {provider.category}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
