import React from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  ArrowUpRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  const strings = {
    copyright: `© ${new Date().getFullYear()} Skilled Ustaad. ${t('footer.copyright')}`,
    platform_title: t('footer.platform'),
    quick_links_title: t('footer.resources'),
    contact_us_title: t('footer.support'),
    about: t('footer.about'),
    contact: t('footer.help'),
    privacy: t('footer.privacy'),
    terms: t('footer.terms'),
  };

  const SocialIcon = ({ icon: Icon, href, color }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-900 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg ${color} border border-gray-100 dark:border-slate-800 hover:border-blue-500/30`}
    >
      <Icon size={18} />
    </a>
  );

  return (
    <footer className="bg-white border-t border-gray-100 dark:bg-slate-950 dark:border-slate-900 pt-16 pb-10 transition-colors duration-300 relative z-10">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 md:gap-16 mb-16">

          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 md:space-y-8">
            <Link to="/" className="inline-block transform transition-transform hover:scale-105">
              <img
                src="/logo-main.png"
                alt="Skilled Ustaad"
                className="h-28 md:h-40 w-auto object-contain transition-all duration-300 dark:brightness-0 dark:invert"
              />
            </Link>
            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm font-medium">
              {t('footer.desc')}
            </p>
            <div className="flex justify-center lg:justify-start gap-4">
              <SocialIcon icon={Facebook} href="https://www.facebook.com/share/1aMzEZF1uz/" color="text-blue-600" />
              <SocialIcon icon={Instagram} href="https://www.instagram.com/skilledustaadofficial/" color="text-rose-500" />
              <SocialIcon icon={Twitter} href="https://x.com/skilledustaad" color="text-sky-400" />
            </div>
          </div>

          {/* Links Group (Paired on Mobile) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-8 md:gap-16 lg:contents">
            {/* Links Column */}
            <div className="lg:col-span-2 flex flex-col items-center lg:items-start text-center lg:text-left">
              <h3 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-[0.2em] mb-6 md:mb-8">
                {strings.platform_title}
              </h3>
              <ul className="space-y-4">
                {[
                  { label: t('footer.dashboard'), path: "/profile" },
                  { label: t('footer.my_jobs'), path: "/profile/jobs" },
                  { label: t('footer.earnings'), path: "/profile/earnings" },
                  { label: t('footer.messages'), path: "/profile/chats" },
                  { label: t('footer.settings'), path: "/profile/profiledetails" },
                ].map((link) => (
                  <li key={link.path} className="flex justify-center lg:justify-start">
                    <Link
                      to={link.path}
                      className="text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-[12px] md:text-sm flex items-center justify-center lg:justify-start gap-1 group transition-colors"
                    >
                      {link.label}
                      <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-y-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Column */}
            <div className="lg:col-span-2 flex flex-col items-center lg:items-start text-center lg:text-left">
              <h3 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-[0.2em] mb-6 md:mb-8">
                {strings.quick_links_title}
              </h3>
              <ul className="space-y-4">
                {[
                  { label: t('footer.about'), path: "/about" },
                  { label: t('footer.help'), path: "/support" },
                  { label: t('footer.privacy'), path: "/privacy" },
                  { label: t('footer.terms'), path: "/terms" },
                ].map((link) => (
                  <li key={link.path} className="flex justify-center lg:justify-start">
                    <Link
                      to={link.path}
                      className="text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-[12px] md:text-sm transition-colors font-medium text-center lg:text-left"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Support Column */}
          <div className="sm:col-span-2 lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left w-full mt-8 lg:mt-0">
            <h3 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-[0.2em] mb-6 md:mb-8">
              {strings.contact_us_title}
            </h3>
            <div className="flex flex-col sm:flex-row sm:justify-center lg:justify-start lg:flex-col items-center lg:items-start gap-8 lg:gap-6 w-full px-2 lg:px-0">
              <a
                href="https://www.google.com/maps?q=Patna,+Bihar,+India"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col lg:flex-row items-center lg:items-start gap-2 lg:gap-4 group w-full sm:w-1/3 lg:w-full hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-blue-50 dark:bg-blue-900/20 flex-shrink-0 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110 border border-blue-100/50 dark:border-blue-800/20">
                  <MapPin size={16} className="md:w-5 md:h-5" />
                </div>
                <div className="text-center lg:text-left overflow-hidden">
                  <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{t('footer.location')}</p>
                  <p className="text-[9px] md:text-sm font-semibold text-gray-600 dark:text-slate-300 truncate lg:whitespace-normal lg:overflow-visible">Patna, Bihar, India</p>
                </div>
              </a>

              <a
                href="tel:+916239695774"
                className="flex flex-col lg:flex-row items-center lg:items-start gap-2 lg:gap-4 group w-full sm:w-1/3 lg:w-full hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex-shrink-0 flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110 border border-indigo-100/50 dark:border-indigo-800/20">
                  <Phone size={16} className="md:w-5 md:h-5" />
                </div>
                <div className="text-center lg:text-left overflow-hidden">
                  <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{t('footer.hotline')}</p>
                  <p className="text-[9px] md:text-sm font-semibold text-gray-600 dark:text-slate-300 truncate lg:overflow-visible">+91 6239695774</p>
                </div>
              </a>

              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=info@skilledustaad.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col lg:flex-row items-center lg:items-start gap-2 lg:gap-4 group w-full sm:w-1/3 lg:w-full hover:opacity-80 transition-opacity cursor-pointer relative z-20"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-purple-50 dark:bg-purple-900/20 flex-shrink-0 flex items-center justify-center text-purple-600 transition-transform group-hover:scale-110 border border-purple-100/50 dark:border-purple-800/20 shadow-sm">
                  <Mail size={16} className="md:w-5 md:h-5" />
                </div>
                <div className="text-center lg:text-left overflow-hidden">
                  <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{t('footer.email')}</p>
                  <p className="text-[9px] md:text-sm font-semibold text-gray-600 dark:text-slate-300 truncate lg:overflow-visible">info@skilledustaad.com</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-gray-100 dark:border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest text-center md:text-left leading-relaxed">
            {strings.copyright}
          </p>
          {/* <div className="flex items-center gap-8">
            <Link to="/privacy" className="text-xs text-slate-400 hover:text-blue-600 transition-colors uppercase font-bold tracking-tighter">{t('footer.privacy')}</Link>
            <Link to="/terms" className="text-xs text-slate-400 hover:text-blue-600 transition-colors uppercase font-bold tracking-tighter">{t('footer.terms_short')}</Link>
            <Link to="/legal" className="text-xs text-slate-400 hover:text-blue-600 transition-colors uppercase font-bold tracking-tighter">{t('footer.policy_short')}</Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
}