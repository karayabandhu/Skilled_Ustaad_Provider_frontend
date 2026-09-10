import React from "react";
import { Scale, FileCheck, AlertCircle, Zap, HelpCircle, Briefcase, Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import SEO from "../components/SEO";
import { toast } from "sonner";

const TermsOfService = () => {
  const handleDownload = () => {
    // Static download of the pre-attached legal bundle
    const bundleUrl = "/documents/Skilled_Ustaad_Expert_Agreement.pdf";
    const link = document.createElement('a');
    link.href = bundleUrl;
    link.download = "Skilled_Ustaad_Expert_Agreement.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Legal Bundle download started!");
  };

  const terms = [
    {
      icon: Briefcase,
      title: "1. Service Delivery",
      content: "Partners agree to provide services in a professional manner, maintaining punctuality and high-quality standards. Any intentional delays or low-quality work can result in account suspension and refund claims.",
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20"
    },
    {
      icon: TrendingUp,
      title: "2. Payouts & Fees",
      content: "All settlements are processed within 24-48 hours after job completion. Skilled Ustaad deducts a ₹7 platform charge and a 10% commission from every completed transaction for lead generation and platform support.",
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20"
    },
    {
      icon: Award,
      title: "3. Professional Ethics",
      content: "Partners must behave professionally with customers. Any form of harassment, unauthorized price changes, or soliciting business outside the platform is strictly prohibited and leads to a permanent ban.",
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      icon: AlertCircle,
      title: "4. Cancellation Terms",
      content: "Providers cannot cancel a booking once they have accepted it. When you accept a service request, you are strictly obligated to fulfill it. Maintaining this commitment is essential for our platform's service quality.",
      color: "text-rose-600",
      bg: "bg-rose-50 dark:bg-rose-900/20"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-300 pt-16 pb-20 px-6">
      <SEO
        title="Terms of Service"
        description="Read the rules of engagement for our professional partners. These terms govern the business relationship between experts and the Skilled Ustaad platform."
        url="https://provider.skilledustaad.com/terms"
      />
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-24">

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter italic leading-none"
          >
            Terms of <span className="text-blue-600">Engagement</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto font-medium"
          >
            Please read these rules of engagement carefully. They define the standards of professionalism that set India's top experts apart.
          </motion.p>
        </div>

        {/* Highlighted Notice */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-16 p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex gap-6 items-center shadow-lg"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 animate-pulse">
            <FileCheck size={24} />
          </div>
          <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest leading-relaxed">
            <strong>Action Node:</strong> Last updated March 2026. Continued participation in the expert network implies full acceptance of these commercial and ethical standards.
          </p>
        </motion.div>

        {/* Terms Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-28 text-left">
          {terms.map((term, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-all group shadow-xl hover:shadow-2xl hover:shadow-blue-500/5 items-start flex flex-col"
            >
              <div className={`w-14 h-14 rounded-2xl ${term.bg} ${term.color} flex items-center justify-center mb-8 transition-transform group-hover:scale-110 shadow-sm`}>
                <term.icon size={28} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight italic">{term.title}</h2>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm font-medium">
                {term.content}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Liability and Policy text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-900 text-slate-300 p-10 md:p-20 rounded-[4rem] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

          <h3 className="text-3xl font-black text-white mb-10 italic flex items-center gap-4">
            <HelpCircle size={32} className="text-blue-500" />
            Platform Limitation
          </h3>
          <div className="space-y-8 text-base md:text-lg leading-relaxed text-slate-400 font-medium">
            <p>
              Skilled Ustaad operates as a technology facilitator connecting independent service
              professionals with customer inquiries. While we provide job leads and payment
              security, the expert is an independent contractor and not an employee.
            </p>
            <p>
              Any disputes regarding on-site work quality must be resolved directly through
              our arbitration board. Skilled Ustaad's total liability for any claim is capped
              at 100% of the specific job value in question.
            </p>
            <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
              <span className="text-xs uppercase tracking-[0.3em] font-black text-slate-500 bg-white/5 py-2 px-6 rounded-full">Legal Jurisdiction: Patna, Bihar</span>
              <button
                onClick={handleDownload}
                className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-500/20 active:scale-95 group flex items-center gap-2"
              >
                Download Legal Bundle
                {/* <Zap size={14} className="group-hover:fill-white" /> */}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Contact Footer */}
        <div className="mt-28 text-center pt-20 border-t border-slate-100 dark:border-slate-900">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-8 block">Arbitration Node</span>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 italic tracking-tight underline decoration-blue-500/30 underline-offset-8">legal@skilledustaad.com</h3>
          <p className="text-slate-400 font-bold uppercase text-sm tracking-widest">Expert Network Agreement Control</p>
        </div>

      </div>
    </div>
  );
};

export default TermsOfService;
