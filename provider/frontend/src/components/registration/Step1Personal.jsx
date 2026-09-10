import React, { useState } from "react";
import { User, Mail, Phone, ChevronRight, Eye, EyeOff, Lock, Check, X, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { registerProvider } from "../../services/api";

const Step1Personal = ({ nextStep, data }) => {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState(data.fullName || "");
  const [email, setEmail] = useState(data.email || "");
  const [phoneNumber, setPhoneNumber] = useState(data.phoneNumber || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const passwordRequirements = [
    { id: 1, label: t("registration_page.step1_min_char", "Minimum 8 characters"), met: password.length >= 8 },
    { id: 2, label: t("registration_page.step1_special", "At least one special symbol (!@#$%^&*)"), met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const isPasswordStrong = passwordRequirements.every(req => req.met);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !phoneNumber || phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
      setError(t("registration_page.step1_err_fields", "Please enter your full name, email, and a valid 10-digit phone number."));
      return;
    }

    if (!/^[a-zA-Z\s]{2,60}$/.test(fullName.trim())) {
      setError(t("registration_page.step1_err_fullname", "Full Name must contain only letters and spaces (2–60 characters)."));
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
      setError(t("registration_page.step1_pass_match_err", "Passwords do not match"));
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await registerProvider({ fullName, email, phoneNumber, password });
      
      const { accessToken, provider } = res.data;
      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (provider) {
        localStorage.setItem("providerData", JSON.stringify(provider));
        localStorage.setItem("providerId", provider.id || provider._id);
        localStorage.setItem("providerPhone", phoneNumber);
      }

      nextStep({ fullName, email, phoneNumber });
    } catch (error) {
      setError(error.response?.data?.error || t("registration_page.step1_err_failed", "Registration failed. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleRegister} className="space-y-6">
        <div className="space-y-2 group">
          <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
            {t("registration_page.step1_title", "Full Name (Legal)")}
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <User size={20} />
            </div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                // Strip digits and special characters in real time — letters and spaces only
                const clean = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                setFullName(clean);
              }}
              placeholder={t("registration_page.step1_placeholder", "Enter Your Full Name")}
              maxLength={60}
              className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-lg font-bold transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-2 group">
          <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
            {t("registration_page.step1_email_label", "Email Address")}
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Mail size={20} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-lg font-bold transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-2 group">
          <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
            {t("registration_page.step1_phone_label", "Active Mobile Number")}
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Phone size={20} />
            </div>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="9876543210"
              maxLength="10"
              className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-lg font-bold transition-all"
              required
            />
          </div>
        </div>

        {/* Password Section */}
        <div className="space-y-4">
          <div className="space-y-2 group">
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
              {t("registration_page.step1_password_label", "Create Strong Password")}
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-14 pl-12 pr-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-lg font-bold transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Strength Indicators */}
            <div className="mt-3 space-y-2 px-1">
              <div className="flex gap-2 mb-2">
                {[1, 2, 3, 4].map((step) => {
                  const strength = (password.length / 8) * 2 + (/[!@#$%^&*()]/.test(password) ? 2 : 0);
                  return (
                    <div 
                      key={step} 
                      className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                        strength >= step 
                          ? strength >= 4 ? 'bg-green-500' : 'bg-amber-500' 
                          : 'bg-slate-200 dark:bg-slate-800'
                      }`} 
                    />
                  );
                })}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                {passwordRequirements.map((req) => (
                  <div key={req.id} className="flex items-center gap-2">
                    {req.met ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <X size={14} className="text-slate-300 dark:text-slate-700" />
                    )}
                    <span className={`text-[10px] font-bold uppercase tracking-tight ${req.met ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
              {t("registration_page.step1_confirm_label", "Confirm Your Password")}
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-14 pl-12 pr-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-lg font-bold transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <div className="flex items-center gap-2 px-1 text-red-500 mt-1">
                <ShieldAlert size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">{t("registration_page.step1_pass_match_err", "Passwords do not match")}</span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
        >
          {isSubmitting ? t("registration_page.step1_creating", "Creating Account...") : t("registration_page.step1_continue", "Continue to Service Details")}
          <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-blue-600 dark:text-blue-400 font-black hover:underline"
          >
            {t("registration_page.step1_already", "Already a partner? Login Securely")}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Step1Personal;
