import React, { useState } from "react";
import { Search, Phone, Mail, MessageSquare, ChevronDown, HelpCircle, Briefcase, CreditCard, User, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";

const HelpCenter = () => {
  const { t } = useTranslation();
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [
    { id: "job", icon: Briefcase, title: t("help.cat_job", "Job Management"), color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { id: "payout", icon: CreditCard, title: t("help.cat_payout", "Payouts & Earnings"), color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { id: "profile", icon: User, title: t("help.cat_profile", "Profile & KYC"), color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    { id: "security", icon: ShieldCheck, title: t("help.cat_security", "Security & Safety"), color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20" }
  ];

  const faqs = [
    {
      categoryId: "payout",
      q: t("help.faq_q1", "How soon do I get paid after completing a job?"),
      a: t("help.faq_a1", "Settlements are processed within 24-48 hours. Once a job is marked 'Completed' and the balance is settled by the customer, our automated clearing system initiates the transfer to your primary bank account.")
    },
    {
      categoryId: "security",
      q: t("help.faq_q2", "What should I do if a customer asks for a different price?"),
      a: t("help.faq_a2", "All pricing must be finalized through the Skilled Ustaad platform. Taking payments outside the platform or changing prices without an official quote update violates our partner agreement and can lead to account suspension.")
    },
    {
      categoryId: "job",
      q: t("help.faq_q3", "I'm not receiving new job notifications. Why?"),
      a: t("help.faq_a3", "Check if you have toggled your 'Online' status to ON. Also, ensure that your profile is fully verified (KYC complete) and your location permissions are enabled on your device.")
    },
    {
      categoryId: "profile",
      q: t("help.faq_q4", "How can I update my service categories?"),
      a: t("help.faq_a4", "You can update your skills via 'Profile Settings > Service Details'. Please note that significant changes may require re-verification or additional documentation of your expertise.")
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? faq.categoryId === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": filteredFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-300 pt-16 pb-20 px-6">
      <SEO
        title={t("help.title", "Help Center")}
        description="Find answers to questions about payouts, earnings, job management, identity verification, and safety guidelines for Skilled Ustaad Partners."
        url="https://provider.skilledustaad.com/support"
        schema={faqSchema}
      />
      <div className="max-w-5xl mx-auto">

        {/* Header & Search */}
        <div className="text-center mb-24">
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white mb-10 tracking-tighter italic leading-none"
          >
            {t("help.title", "Help Center").split(" ")[0]} <span className="text-blue-600">{t("help.sync", "Support Sync")}</span>
          </motion.h1>

          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-0 bg-blue-600/10 dark:bg-blue-500/5 blur-3xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative flex items-center">
              <div className="absolute left-6 text-slate-400">
                <Search size={24} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("help.search_placeholder", "Search payout issues, KYC, job routing...")}
                className="w-full h-18 md:h-20 pl-16 pr-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-2xl focus:ring-4 focus:ring-blue-600/10 outline-none text-lg font-medium text-slate-700 dark:text-white transition-all transition-duration-300"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-28">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border ${selectedCategory === cat.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-100 dark:border-slate-800'} flex flex-col items-center gap-4 text-center cursor-pointer shadow-xl transition-all group`}
            >
              <div className={`w-14 h-14 rounded-2xl ${cat.bg} ${cat.color} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${selectedCategory === cat.id ? 'ring-4 ring-current/20' : ''}`}>
                <cat.icon size={28} />
              </div>
              <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest transition-colors ${selectedCategory === cat.id ? 'text-blue-600' : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600'}`}>
                {cat.title}
              </span>
            </motion.div>
          ))}
        </div>

        {/* FAQs */}
        <section className="mb-28">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
              <HelpCircle size={24} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">{t("help.queries", "Top Queries")}</h2>
          </div>

          <div className="space-y-4">
            {filteredFaqs.length > 0 ? filteredFaqs.map((faq, idx) => (
              <div key={idx} className="border-b border-slate-100 dark:border-slate-900 last:border-0 overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full py-8 flex items-center justify-between text-left group hover:px-2 transition-all"
                >
                  <span className="text-lg md:text-xl font-black text-slate-700 dark:text-slate-200 tracking-tight group-hover:text-blue-600 transition-colors">
                    {faq.q}
                  </span>
                  <div className={`w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all transform ${activeFaq === idx ? 'rotate-180' : ''}`}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-8 pt-2 px-2 text-slate-500 dark:text-slate-400 text-lg leading-relaxed font-medium max-w-3xl">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )) : (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No FAQs found matching your criteria.</p>
                <button 
                  onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}
                  className="mt-4 text-blue-600 font-bold hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Support Channels */}
        <section className="bg-slate-900 text-white rounded-3xl md:rounded-[4rem] p-6 sm:p-10 md:p-20 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

          <div className="text-center mb-16 relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter italic">{t("help.need_manual", "Still need Manual Sync?")}</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">{t("help.talk_team", "Talk to our expert success team 24/7")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {[
              { icon: Phone, title: t("help.call_priority", "Call Priority"), info: "+91 6239695774", label: t("help.instant_conn", "Instant Connection") },
              { icon: MessageSquare, title: t("help.chat_live", "Chat Live"), info: t("help.in_app_console", "In-App Console"), label: t("help.response_2min", "2 Min Response Time") },
              { icon: Mail, title: t("help.official_mail", "Official Mail"), info: "support@skilledustaad.com", label: t("help.legal_business", "For legal & business") }
            ].map((channel, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] flex flex-col items-center text-center group hover:border-blue-500 transition-all hover:bg-white/[0.07]">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-500 border border-blue-500/30 flex items-center justify-center mb-6 md:mb-8 shadow-inner group-hover:scale-110 transition-transform">
                  <channel.icon size={28} />
                </div>
                <h3 className="text-xl font-black mb-2 uppercase tracking-tighter italic">{channel.title}</h3>
                <p className="text-white font-black mb-1">{channel.info}</p>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{channel.label}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default HelpCenter;
