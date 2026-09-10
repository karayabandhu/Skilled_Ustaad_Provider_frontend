import React from "react";
import { Shield, Lock, Eye, FileText, Bell, Globe, CheckCircle2, Database, Share2, Fingerprint } from "lucide-react";
import { motion } from "framer-motion";
import SEO from "../components/SEO";

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: Eye,
      title: "Data We Collect",
      content: "As a professional partner, we collect business-critical information including your bank details for payouts, government IDs for verification, real-time location for job matching, and profile media to showcase your expertise to customers.",
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      icon: Lock,
      title: "Professional Security",
      content: "Your financial information and identity documents are encrypted using bank-grade protocols. We use multi-factor authentication and specialized fraud detection systems to ensure your earnings and account remain secure.",
      color: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-900/20"
    },
    {
      icon: Database,
      title: "How We Use Your Info",
      content: "Data is used to calculate earnings, verify professional credentials, optimize your job routing, and facilitate communication with customers. We also use performance metrics to help you improve your service ratings.",
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20"
    },
    {
      icon: Share2,
      title: "Data Transparency",
      content: "We only share necessary business info with customers (name, rating, photo) to facilitate the service. We do not sell your personal data to third-party advertisers. Your business data belongs to you.",
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-300 pt-16 pb-20 px-6">
      <SEO
        title="Privacy Policy"
        description="Learn how Skilled Ustaad protects our partners' data. Our partner privacy policy outlines our commitment to your business security and data rights."
        url="https://provider.skilledustaad.com/privacy"
      />
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-20">

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-none"
          >
            Privacy <span className="text-blue-600 italic">Protocol</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto font-medium"
          >
            Last Updated: March 2026. Built with the security of India's top professionals in mind. Our commitment to your data is absolute.
          </motion.p>
        </div>

        {/* Content Sections */}
        <div className="grid gap-8 mb-20">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-8 items-start hover:shadow-2xl hover:shadow-blue-500/5 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl ${section.bg} ${section.color} flex flex-shrink-0 items-center justify-center transition-transform group-hover:rotate-12 group-hover:scale-110 shadow-sm`}>
                <section.icon size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{section.title}</h2>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg font-medium">
                  {section.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detailed Compliance Block */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="prose prose-lg dark:prose-invert max-w-none bg-slate-900 text-white p-10 md:p-20 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

          <div className="flex items-center gap-4 mb-12 text-blue-500">
            <Fingerprint size={32} />
            <h3 className="m-0 text-3xl font-black uppercase tracking-widest italic">Digital Integrity</h3>
          </div>

          <div className="space-y-10 text-slate-300 font-medium">
            <p className="text-xl leading-relaxed">
              Skilled Ustaad operates as a "Privacy-First" infrastructure. For our partners,
              this means that while we facilitate millions of service requests, we maintain
              strict architectural silos to ensure your personal and financial history is
              never exposed beyond its functional requirement.
            </p>

            <div className="grid md:grid-cols-2 gap-8 pt-6">
              {[
                "End-to-end encrypted payout tunnels",
                "ISO-grade data storage protocols",
                "Zero third-party analytics sharing",
                "Real-time data breach monitoring"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 group hover:border-blue-500 transition-colors">
                  <CheckCircle2 size={24} className="text-blue-500 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-sm tracking-wide uppercase">{item}</span>
                </div>
              ))}
            </div>

            <p className="pt-10 text-xs text-slate-500 font-bold uppercase tracking-[0.2em] max-w-2xl">
              By partnering with Skilled Ustaad, you acknowledge these protocols.
              We evolve our security stack continuously to meet the digital demands
              of modern professional work.
            </p>
          </div>
        </motion.div>

        {/* Contact Footer */}
        <div className="mt-28 text-center border-t border-slate-100 dark:border-slate-900 pt-20">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.5em] mb-8 block">Security Node</span>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 italic tracking-tight underline decoration-blue-500/30 underline-offset-8">compliance@skilledustaad.com</h3>
          <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Expert Protection Command Center</p>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
