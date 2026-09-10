import React, { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";
import { api } from "../services/api";
import { toast } from "sonner";

const ContactSupport = () => {
  const { t } = useTranslation();
  const [formStatus, setFormStatus] = useState(null); // 'sending' | 'success'

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus("sending");
    try {
      await api.post("/support/query", { ...formData, userType: "provider" });
      setFormStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setFormStatus(null), 3000);
      toast.success(t("contact.report_filed", "Report Filed!"));
    } catch (err) {
      toast.error(err.response?.data?.error || t("common.error", "Failed to send message."));
      setFormStatus(null);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: t("contact.hotline", "Expert Hotline"),
      value: "+91 6239695774",
      link: "tel:+916239695774",
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/30",
    },
    {
      icon: Mail,
      title: t("contact.email", "Email Support"),
      value: "support@skilledustaad.com",
      link: "mailto:support@skilledustaad.com",
      color: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-900/30",
    },
    {
      icon: MapPin,
      title: t("contact.location", "HQ Location"),
      value: t("contact.hq_val", "Patna, Bihar, India"),
      link: "#",
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/30",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-300 pt-32 pb-20 px-6">
      <SEO
        title={t("contact.title", "Contact Support")}
        description={t("contact.priority_desc", "Need help with your provider account, payouts, or active jobs? Our expert support team is available 24/7 to ensure your success.")}
        url="https://provider.skilledustaad.com/contact"
      />
      <div className="max-w-7xl mx-auto">

        {/* Header content */}
        <div className="max-w-3xl mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1.5 px-6 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black tracking-[0.3em] uppercase mb-8 shadow-sm">
              {t("contact.command", "Support Command")}
            </span>
            <h1 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter italic leading-none">
              {t("contact.title", "Contact Support").split(" ")[0]} <span className="text-blue-600">{t("contact.sync_node", "Expert Sync Node")}</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {t("contact.priority_desc", "Your professional journey is our priority. Whether it's a technical query, payout request, or account security, our command center is always on standby.")}
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-12 gap-16 items-start">

          {/* Left Column: Info Cards & Hours */}
          <div className="lg:col-span-5 space-y-8">
            <div className="grid gap-6">
              {contactInfo.map((info, index) => (
                <motion.a
                  key={index}
                  href={info.link}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-6 p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/5 group"
                >
                  <div className={`w-14 h-14 rounded-2xl ${info.bg} flex items-center justify-center ${info.color} group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-sm`}>
                    <info.icon size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{info.title}</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight italic">{info.value}</p>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Working Hours Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-10 rounded-[3rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden group border border-white/5"
            >
              <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-blue-600/10 rounded-full blur-[80px] group-hover:bg-blue-600/20 transition-all" />

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-500 border border-white/10 shadow-inner">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black italic tracking-tight">{t("contact.hours_title", "Active Hours")}</h3>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">{t("contact.response_time", "Service Response Time")}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-bold text-xs uppercase tracking-widest">{t("contact.weekdays", "Mon - Fri")}</span>
                  <span className="font-black text-white italic">{t("contact.weekdays_val", "24 Hours / Live")}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-bold text-xs uppercase tracking-widest text-slate-500">{t("contact.weekends", "Sat - Sun")}</span>
                  <span className="font-black text-white italic">{t("contact.weekends_val", "06:00 - 00:00 / Sync")}</span>
                </div>
              </div>

              <div className="mt-12 pt-10 border-t border-white/5">
                <a
                  href="https://wa.me/916239695774"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-4 bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl shadow-emerald-600/20 group"
                >
                  <MessageSquare size={20} className="group-hover:fill-white" />
                  {t("contact.whatsapp_sync", "Expert WhatsApp Sync")}
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7"
          >
            <div className="p-10 md:p-14 rounded-[3.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-4 bg-blue-600 rounded-[1.5rem] text-white shadow-lg shadow-blue-600/20">
                    <Sparkles size={28} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic leading-none mb-1">{t("contact.send_report", "Send Incident Report")}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{t("contact.avg_response", "Average response: 12 Minutes")}</p>
                  </div>
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">{t("contact.name", "Full Name")}</label>
                      <input
                        type="text"
                        placeholder="John Expert"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[1.8rem] py-5 px-8 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">{t("contact.email_addr", "Email Address")}</label>
                      <input
                        type="email"
                        placeholder="john@expert.in"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[1.8rem] py-5 px-8 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">{t("contact.subject", "Issue Subject")}</label>
                    <input
                      type="text"
                      placeholder={t("contact.subject_placeholder", "e.g. Payout Delay, App Bug, Safety Issue")}
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[1.8rem] py-5 px-8 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">{t("contact.detailed_report", "Detailed Report")}</label>
                    <textarea
                      rows="6"
                      placeholder={t("contact.report_placeholder", "Please describe the incident or query in detail...")}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] py-6 px-8 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-bold resize-none"
                    ></textarea>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={formStatus === "sending" || formStatus === "success"}
                    className={`w-full h-20 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 transition-all shadow-2xl
                      ${formStatus === "success"
                        ? "bg-emerald-600 text-white shadow-emerald-600/20"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"}
                    `}
                  >
                    <AnimatePresence mode="wait">
                      {formStatus === "sending" ? (
                        <motion.div
                          key="sending"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-4"
                        >
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {t("contact.processing", "Processing Node...")}
                        </motion.div>
                      ) : formStatus === "success" ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-4"
                        >
                          <CheckCircle2 size={24} />
                          {t("contact.report_filed", "Report Filed!")}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-4"
                        >
                          <Send size={20} className="fill-white" />
                          {t("contact.dispatch", "Dispatch Report")}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;
