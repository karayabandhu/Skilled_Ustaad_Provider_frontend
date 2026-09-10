import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";
import {
  ArrowLeft,
  Phone,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Star,
  RotateCcw,
  Eye,
  EyeOff,
  Lock,
  KeyRound,
  ChevronLeft,
  Mail,
} from "lucide-react";
import {
  loginProvider,
  forgotPasswordProvider,
  resetPasswordProvider,
  getProviderProfile,
} from "../services/api";
import { getIncompleteRegistrationStep } from "../utils/registration";
import { getFriendlyErrorMessage } from "../utils/errors";

const normalizePhone = (input) => {
  if (!input) return "";
  const digits = String(input).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(-10);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(-10);
  if (digits.length === 10) return digits;
  return digits;
};

const Login = ({ setIsAuthenticated }) => {
  const { t } = useTranslation();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password States
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Pass
  const [email, setEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const isSessionExpired =
    new URLSearchParams(location.search).get("session") === "expired";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const sanitized = normalizePhone(phone);

    if (!sanitized || sanitized.length !== 10) {
      setError(
        t(
          "login_page.err_phone",
          "Please enter a valid 10-digit phone number.",
        ),
      );
      return;
    }

    if (!password) {
      setError(t("login_page.err_pass", "Please enter your password."));
      return;
    }

    try {
      setLoading(true);
      const res = await loginProvider({ phoneNumber: sanitized, password });

      const { accessToken, provider } = res.data;
      if (accessToken) localStorage.setItem("accessToken", accessToken);

      if (provider) {
        localStorage.setItem("providerData", JSON.stringify(provider));
        localStorage.setItem("providerId", provider._id || provider.id || "");
        localStorage.setItem("providerPhone", sanitized);
      }

      setIsAuthenticated(true);

      let navigateTo = "/";
      try {
        const profileRes = await getProviderProfile();
        const fullProvider = profileRes.data?.provider || profileRes.provider || profileRes;

        if (fullProvider) {
          // Update localStorage with the freshest data so isVerified in App.jsx syncs
          localStorage.setItem("providerData", JSON.stringify(fullProvider));
          window.dispatchEvent(new Event("storage")); // trigger cross-tab sync

          const incompleteStep = getIncompleteRegistrationStep(fullProvider);
          if (incompleteStep) {
            navigate(`/register?step=${incompleteStep}`, { replace: true });
            return;
          }

          // If not verified, stay on landing page
          if (fullProvider.status !== "Active") {
            navigateTo = "/";
          } else {
            navigateTo = "/profile";
          }
        }
      } catch (profileErr) {
        console.warn("Failed to fetch full provider profile during login check:", profileErr);
      }

      navigate(navigateTo);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          t("login_page.err_invalid", "Invalid phone number or password."),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError(
        t(
          "login_page.err_reg_email",
          "Enter your registered email address.",
        ),
      );
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await forgotPasswordProvider({ email: email.toLowerCase() });
      setSuccess(t("login_page.success_otp", "OTP sent to your email!"));
      setForgotStep(2);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          t("login_page.err_otp_send", "Failed to send OTP."),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (resetOtp.length !== 4) {
      setError(t("login_page.err_otp_len", "Enter the 4-digit OTP."));
      return;
    }
    if (newPassword.length < 8) {
      setError(
        t("login_page.err_pass_len", "Password must be at least 8 characters."),
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("login_page.err_pass_match", "Passwords do not match."));
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await resetPasswordProvider({
        email: email.toLowerCase(),
        otp: resetOtp,
        newPassword,
      });
      setSuccess(t("login_page.success_reset", "Password reset successful!"));
      setTimeout(() => {
        setIsForgotPassword(false);
        setForgotStep(1);
        setPassword("");
        setSuccess(
          t("login_page.now_login", "Now login with your new password."),
        );
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          t("login_page.err_reset_fail", "Reset failed."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-white dark:bg-slate-950 font-sans overflow-hidden">
      <SEO
        title="Partner Login"
        description="Access your Skilled Ustaad Provider dashboard to view bookings, track earnings, and message clients."
        keywords="partner login, skilled ustaad sign in, provider portal login, expert login"
        url="https://provider.skilledustaad.com/login"
      />
      {/* Left Side: Visual Experience */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-blue-600">
        <img
          src="/login_hero.png"
          alt="Skilled Ustaad Partners"
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-900/40 to-transparent" />

        <div className="relative z-10 p-16 flex flex-col justify-between text-white w-full">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-5xl font-black leading-tight">
                {t("login_page.grow_future", "Grow Your Future with Pride.")}
              </h2>
              <div className="space-y-2">
                <p className="text-blue-100 text-lg font-medium opacity-90">
                  {t(
                    "login_page.desc",
                    "Join 50,000+ Skilled, Semi-Skilled, and Unskilled partners earning more with Skilled Ustaad.",
                  )}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
                    Skilled
                  </span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
                    Semi-Skilled
                  </span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
                    Unskilled
                  </span>
                </div>
              </div>
            </motion.div>

            <div className="flex gap-4">
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-xs font-bold text-blue-200 uppercase tracking-widest">
                  {t("login_page.rating_tag", "4.9/5 Service Rating")}
                </p>
              </div>
            </div>
          </div>

          <p className="text-blue-300 text-sm font-medium">
            &copy; 2026 Skilled Ustaad Technologies. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side: Authentication Flow */}
      {/* <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 relative overflow-y-auto"> */}
      <div className="w-full lg:w-1/2 flex items-start justify-center pt-20 pb-10 p-8 md:p-16 relative overflow-y-auto">
        <button
          onClick={() => {
            if (isForgotPassword) {
              if (forgotStep === 1) setIsForgotPassword(false);
              else setForgotStep(1);
            } else {
              navigate(-1);
            }
          }}
          className="absolute top-8 left-8 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-800 transition-all border border-slate-100 dark:border-slate-800 shadow-sm group"
        >
          {isForgotPassword ? (
            <ChevronLeft size={20} />
          ) : (
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
          )}
        </button>

        <div className="w-full max-w-sm mt-8">
          {/* <div className="w-full max-w-sm relative pt-20"> */}
          {/* <div className="mb-10 lg:hidden flex justify-center">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20">
              {isForgotPassword ? <KeyRound className="text-white" size={28} /> : <ShieldCheck className="text-white" size={28} />}
            </div>
          </div> */}
          {/* <div className="text-center md:text-left mb-4"> */}
<div className="text-center mb-4">            {" "}
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight mt-0">
              {isForgotPassword
                ? t("login_page.forgot_pass", "Reset Password")
                : t("login_page.title", "Partner Login")}
            </h3>
         <p className="text-slate-500 dark:text-slate-400 font-medium whitespace-pre-wrap mt-4">
            {/* <p className="text-slate-500 dark:text-slate-400 font-medium whitespace-pre-wrap"> */}
              {isForgotPassword
                ? t(
                    "login_page.forgot_desc",
                    "Recover your account securely via phone verification.",
                  )
                : t(
                    "login_page.sec_desc",
                    "Login to your dashboard to view new jobs and manage your earnings.",
                  )}
            </p>
          </div>
          {isSessionExpired && !isForgotPassword && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 flex items-center gap-4 text-blue-600 dark:text-blue-400 text-xs font-bold shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center flex-shrink-0 text-blue-600 shadow-sm border border-blue-100 dark:border-slate-800">
                <RotateCcw size={18} />
              </div>
              <div>
                <p className="uppercase tracking-widest text-[10px] mb-0.5">
                  {t("login_page.session_sync", "Session Sync Required")}
                </p>
                <p className="opacity-70 font-medium">
                  {t(
                    "login_page.session_desc",
                    "Your credentials have expired for security. Please re-authenticate your dashboard node.",
                  )}
                </p>
              </div>
            </motion.div>
          )}
          <AnimatePresence mode="wait">
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm font-bold"
              >
                <CheckCircle2 size={18} />
                {success}
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-bold"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          {!isForgotPassword ? (
<form onSubmit={handleLogin} className="space-y-6 mt-8">              <div className="space-y-2 group">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                  {t("login_page.phone", "Phone Number")}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Phone size={20} />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="9876543210"
                    className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-lg font-bold transition-all shadow-sm group-hover:bg-white dark:group-hover:bg-slate-800"
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t("login_page.password", "Password")}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError("");
                      setSuccess("");
                    }}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    {t("login_page.forgot_btn", "Forgot?")}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-14 pl-12 pr-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-lg font-bold transition-all shadow-sm group-hover:bg-white dark:group-hover:bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                {loading
                  ? t("login_page.authenticating", "Authenticating...")
                  : t("login_page.login_btn", "Login to Dashboard")}
                <ChevronRight
                  size={22}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {forgotStep === 1 ? (
                <div className="space-y-6">
                  <div className="space-y-2 group">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 uppercase tracking-wider">
                      {t("login_page.reg_email", "Registered Email Address")}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail size={20} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@mail.com"
                        className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-lg font-bold transition-all"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleRequestOtp}
                    disabled={loading || !email}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-2xl font-black text-lg shadow-xl transition-all flex items-center justify-center"
                  >
                    {loading
                      ? t("login_page.sending_otp", "Sending OTP...")
                      : t("login_page.verify_continue", "Verify & Continue")}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2 group text-center">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {t("login_page.otp_label", "4-Digit OTP")}
                    </label>
                    <input
                      type="text"
                      value={resetOtp}
                      onChange={(e) =>
                        setResetOtp(e.target.value.replace(/\D/g, ""))
                      }
                      maxLength={4}
                      className="w-full h-16 text-center text-3xl font-black tracking-[0.8em] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white"
                      placeholder="0000"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <Lock size={20} />
                      </div>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t(
                          "login_page.new_pass",
                          "New Password (8+ chars)",
                        )}
                        className="w-full h-14 pl-12 pr-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white font-bold transition-all shadow-sm group-hover:bg-white dark:group-hover:bg-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <Lock size={20} />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t(
                          "login_page.confirm_pass",
                          "Confirm New Password",
                        )}
                        className="w-full h-14 pl-12 pr-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white font-bold transition-all shadow-sm group-hover:bg-white dark:group-hover:bg-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleResetPassword}
                    disabled={
                      loading || resetOtp.length < 4 || newPassword.length < 8
                    }
                    className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-2xl font-black text-lg shadow-xl transition-all flex items-center justify-center"
                  >
                    {loading
                      ? t("login_page.updating", "Updating...")
                      : t("login_page.set_pass", "Set New Password")}
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="mt-8">
            <p className="text-center text-slate-500 dark:text-slate-400 font-medium">
              {t("login_page.no_account", "Don't have an account?")}{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-blue-600 dark:text-blue-400 font-black hover:underline underline-offset-4"
              >
                {t("login_page.partner_with_us", "Partner with us")}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
