import React, { useState } from "react";
import { User, Mail, Phone, ChevronRight, Eye, EyeOff, Lock, Check, X, ShieldAlert, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

const BusinessStep1Owner = ({ nextStep, data, onBackToSelection }) => {
  const { t } = useTranslation();

  const [ownerName, setOwnerName] = useState(data.ownerName || "");
  const [email, setEmail] = useState(data.email || "");
  const [phoneNumber, setPhoneNumber] = useState(data.phoneNumber || "");
  const [password, setPassword] = useState(data.password || "");
  const [confirmPassword, setConfirmPassword] = useState(data.password || "");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const passwordRequirements = [
    { id: 1, label: t("registration_page.step1_min_char", "Minimum 8 characters"), met: password.length >= 8 },
    { id: 2, label: t("registration_page.step1_special", "At least one special symbol (!@#$%^&*)"), met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const isPasswordStrong = passwordRequirements.every((req) => req.met);

  const handleNext = (e) => {
    e.preventDefault();
    setError("");

    if (!ownerName || !email || !phoneNumber || phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
      setError(t("registration_page.step1_err_fields", "Please enter owner full name, email, and a valid 10-digit phone number."));
      return;
    }

    if (!/^[a-zA-Z\s]{2,60}$/.test(ownerName.trim())) {
      setError(t("registration_page.step1_err_fullname", "Owner Full Name must contain only letters and spaces (2–60 characters)."));
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t("registration_page.step1_err_email", "Please enter a valid email address."));
      return;
    }

    if (!isPasswordStrong) {
      setError(t("registration_page.step1_err_strength", "Please ensure your password meets all strength requirements."));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("registration_page.step1_pass_match_err", "Passwords do not match."));
      return;
    }

    nextStep({
      ownerName: ownerName.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      password,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h4 className="text-xl font-black text-slate-900 dark:text-white">
            {t("business_reg.step1_title", "Business Owner Details")}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("business_reg.step1_subtitle", "Enter the account holder / business representative information.")}
          </p>
        </div>
        {onBackToSelection && (
          <button
            type="button"
            onClick={onBackToSelection}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            <span>{t("business_reg.change_type", "Change Type")}</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-semibold animate-in fade-in">
          <ShieldAlert size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleNext} className="space-y-5">
        {/* Owner Full Name */}
        <div className="space-y-1.5 group">
          <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
            {t("business_reg.owner_name", "Owner / Authorized Representative Name (Legal)")} *
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <User size={18} />
            </div>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => {
                const clean = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                setOwnerName(clean);
              }}
              placeholder={t("business_reg.owner_name_placeholder", "e.g. Ramesh Kumar Sharma")}
              maxLength={60}
              className="w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all shadow-sm"
              required
            />
          </div>
        </div>

        {/* Email & Phone Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email Address */}
          <div className="space-y-1.5 group">
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
              {t("business_reg.email", "Business / Owner Email")} *
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@business.com"
                className="w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all shadow-sm"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5 group">
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
              {t("business_reg.phone", "Owner Mobile Number (10 Digits)")} *
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Phone size={18} />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setPhoneNumber(clean);
                }}
                placeholder="9876543210"
                className="w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all shadow-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* Passwords */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Password */}
          <div className="space-y-1.5 group">
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
              {t("business_reg.password", "Account Password")} *
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 pl-11 pr-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all shadow-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5 group">
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
              {t("business_reg.confirm_password", "Confirm Password")} *
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 pl-11 pr-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all shadow-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Password Strength Checklist */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t("business_reg.password_req", "Password Requirements")}
          </span>
          <div className="flex flex-wrap gap-4 text-xs font-medium">
            {passwordRequirements.map((req) => (
              <div
                key={req.id}
                className={`flex items-center gap-1.5 ${
                  req.met ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {req.met ? <Check size={14} /> : <X size={14} />}
                <span>{req.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Button */}
        <button
          type="submit"
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all duration-200 mt-6"
        >
          <span>{t("business_reg.next_step2", "Continue to Business Details")}</span>
          <ChevronRight size={18} />
        </button>
      </form>
    </div>
  );
};

export default BusinessStep1Owner;

