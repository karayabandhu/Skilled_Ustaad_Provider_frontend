import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, Target, Award, Heart, Shield, Zap, CheckCircle2, Globe, TrendingUp, Handshake, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";
import { getGlobalStats } from "../services/api";

const About = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [dynamicStats, setDynamicStats] = React.useState({
    providers: "50,000",
    users: "182,000",
    rating: "4.9/5"
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getGlobalStats();
        const data = res.data;
        if (data?.stats) {
          setDynamicStats({
            providers: data.stats.providers.toLocaleString(),
            users: data.stats.users.toLocaleString(),
            rating: `${data.stats.rating}/5`
          });
        }
      } catch (err) {
        console.error("Stats fetch error:", err);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { number: `${dynamicStats.providers}+`, label: t("about.verified_experts", "Verified Experts"), icon: Users, color: "text-blue-600" },
    { number: `${dynamicStats.users}+`, label: t("about.happy_users", "Happy Users"), icon: Heart, color: "text-rose-600" },
    { number: "1+", label: t("about.pin_codes", "Pin Codes Active"), icon: MapPin, color: "text-purple-600" },
    { number: dynamicStats.rating, label: t("about.rating_label", "Professional Rating"), icon: Award, color: "text-indigo-600" },
  ];

  const values = [
    {
      title: t("about.grow_biz", "Grow Your Business"),
      description: t("about.grow_biz_desc", "We help you find more jobs and earn more money. Work whenever you want, on your own terms."),
      icon: TrendingUp,
    },
    {
      title: t("about.safe_pay", "Safe & Fast Payments"),
      description: t("about.safe_pay_desc", "Get your money directly in your bank account with no hidden fees or confusion."),
      icon: Shield,
    },
    {
      title: t("about.find_work", "Find Work Nearby"),
      description: t("about.find_work_desc", "Get alerts for new jobs in your area as soon as customers ask for them."),
      icon: Zap,
    },
    {
      title: t("about.community", "Helpful Community"),
      description: t("about.community_desc", "Join thousands of other skilled workers and grow together as a team."),
      icon: Handshake,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Skilled Ustaad",
    "url": "https://provider.skilledustaad.com/about",
    "description": "We help skilled workers across India find more jobs and earn more money."
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-gray-950 font-sans transition-colors duration-300 pt-8">
      <SEO
        title={t("about.title", "About Us")}
        description={t("about.sub_desc", "We help skilled workers across India find more jobs and earn more money. We connect you with customers who need your help.")}
        url="https://provider.skilledustaad.com/about"
        schema={aboutSchema}
      />

      {/* Hero Section */}
      <section className="relative pt-10 pb-20 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1.5 px-6 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black tracking-[0.3em] uppercase mb-8 shadow-sm">
              {t("about.our_mission", "Our Mission")}
            </span>
            <h1 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-none">
              {t("about.partner_in_success", "Your Partner in Success.")}
            </h1>
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
              {t("about.sub_desc", "We help skilled workers across India find more jobs and earn more money. We connect you with customers who need your help, making it easy for you to grow your business with trust and respect.")}
            </p>
          </motion.div>
        </div>

        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/30 dark:bg-indigo-900/10 rounded-full blur-[120px] -z-10 -translate-x-1/2 translate-y-1/2" />
      </section>

      {/* Stats Section */}
      <section className="py-24 border-y border-slate-100 dark:border-slate-900 bg-white/50 dark:bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16"
          >
            {stats.map((stat, index) => (
              <motion.div key={index} variants={itemVariants} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 rounded-3xl bg-white dark:bg-slate-900 shadow-xl border border-slate-50 dark:border-slate-800 flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-indigo-500/10 group-hover:border-blue-200 dark:group-hover:border-blue-900">
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter italic">
                  {stat.number}
                </div>
                <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none px-4">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Values - The Expert Promise */}
      <section className="py-28 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">{t("about.our_promise", "Our Promise to You")}</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">{t("about.promise_sub", "We are here to support every worker who wants to do great work.")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/5 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-8 group-hover:rotate-6 transition-transform shadow-sm">
                <v.icon size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 leading-tight">{v.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm font-medium">{v.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Future of Work Section */}
      <section className="py-28 px-6 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-black mb-10 leading-[1.1] tracking-tighter">
                {t("about.better_way", "A Better Way to Work").split("Work")[0]}<br /><span className="text-blue-500 italic decoration-blue-500/30 underline-offset-8">Work</span>
              </h2>
              <div className="space-y-8">
                <p className="text-lg text-slate-400 leading-relaxed italic border-l-4 border-blue-500 pl-8 bg-white/5 py-4 rounded-r-2xl">
                  {t("about.mission_quote", "\"Our mission is to help workers and customers find each other easily, making sure every job is done with trust and quality.\"")}
                </p>
                <p className="text-lg text-slate-300 leading-relaxed font-medium">
                  {t("about.hard_working_people", "At Skilled Ustaad, we believe that hard-working people are the heart of our country. Whether you are an electrician, a beautician, or any other skilled worker, you deserve a platform that respects your hard work.")}
                </p>
                <p className="text-lg text-slate-300 leading-relaxed font-medium">
                  {t("about.building_place", "We are building a place where your skills are valued and you are your own boss. Join us and let's build a better future together.")}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3.5rem] p-10 md:p-16 text-white shadow-2xl relative z-10 overflow-hidden">
                <div className="absolute top-8 right-8 text-blue-500/20">
                  <Award size={140} strokeWidth={1} />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-500 mb-8">{t("about.big_dream", "Our Big Dream")}</h3>
                <p className="text-2xl md:text-3xl font-black leading-tight mb-12 italic tracking-tight">
                  {t("about.dream_quote", "\"To be the most trusted place in India where workers can find jobs and build a successful life for themselves and their families.\"")}
                </p>
                <div className="pt-10 border-t border-white/10 flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                    <Heart size={28} fill="currentColor" />
                  </div>
                  <div>
                    <p className="font-black text-xl uppercase tracking-tighter">{t("about.honest_work", "Honest Work")}</p>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{t("about.supporting_worker", "Supporting Every Worker")}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


    </main>
  );
};

export default About;
