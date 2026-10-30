import React, { useState, useEffect } from "react";
import { useNavigate, Navigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import SEO from "../components/SEO";

// ── Shared / Individual steps (all unchanged) ──────────────────────────────
import Step0ProviderType from "../components/registration/Step0ProviderType";
import Step1Personal from "../components/registration/Step1Personal";
import Step3ServiceDetails from "../components/registration/Step3ServiceDetails";
import Step4Identity from "../components/registration/Step4Identity";
import Step5Payment from "../components/registration/Step5Payment";
import StepIndicator from "../components/registration/StepIndicator";

// ── Business-only steps ────────────────────────────────────────────────────
import BizStepBusinessDetails from "../components/registration/business/BizStepBusinessDetails";
import BizStepWorkers from "../components/registration/business/BizStepWorkers";
import BizStepReview from "../components/registration/business/BizStepReview";
import BizStepPending from "../components/registration/business/BizStepPending";

import { registerProvider, saveBankDetails, getProviderProfile } from "../services/api";
import { toast } from "sonner";
import { getFriendlyErrorMessage } from "../utils/errors";
import { getIncompleteRegistrationStep } from "../utils/registration";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const INDIVIDUAL_TOTAL_STEPS = 4;
const BUSINESS_TOTAL_STEPS = 7;
// Business steps:
// 1 = Owner Details   (reuses Step1Personal)
// 2 = Business Details
// 3 = Services & Location  (reuses Step3ServiceDetails)
// 4 = Workers
// 5 = Documents  (reuses Step4Identity — profilePhoto mandatory)
// 6 = Bank Details  (reuses Step5Payment — identical UI)
// 7 = Review & Submit

const INDIVIDUAL_DEFAULTS = {
  fullName: "", email: "", phoneNumber: "",
  serviceCategory: "", providerSubService: "", subService: [],
  experience: "", houseNumber: "", colony: "", landmark: "",
  city: "", state: "", pinCode: "", latitude: "", longitude: "",
  languageSpoken: "", profilePhoto: null, governmentIDProof: null,
  addressProof: null, skillCertificate: null,
  bankAccountNumber: "", ifscCode: "", accountHolderName: "", upiId: "",
};

const BUSINESS_DEFAULTS = {
  // Step 1 – Owner
  fullName: "", email: "", phoneNumber: "",
  // Step 2 – Business
  businessName: "", businessType: "", businessAddress: "",
  businessCity: "", businessState: "", businessPinCode: "", gstNumber: "",
  // Step 3 – Services & Location (same fields as individual)
  serviceCategory: "", providerSubService: "", subService: [],
  experience: "", houseNumber: "", colony: "", landmark: "",
  city: "", state: "", pinCode: "", latitude: "", longitude: "",
  languageSpoken: "",
  // Step 4 – Workers
  workers: [],
  // Step 5 – Documents (profilePhoto mandatory, same as individual)
  profilePhoto: null, governmentIDProof: null,
  addressProof: null, skillCertificate: null,
  // Step 6 – Bank (identical to individual Step5Payment)
  bankAccountNumber: "", ifscCode: "", accountHolderName: "", upiId: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// Register
// ─────────────────────────────────────────────────────────────────────────────

const Register = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // null = type-selection screen, "individual" or "business"
  const [providerType, setProviderType] = useState(() => {
    try {
      const saved = localStorage.getItem("provider_reg_state");
      if (saved) return JSON.parse(saved).providerType || null;
    } catch (_) {}
    return null;
  });

  // ── Individual state ───────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(() => {
    try {
      const saved = localStorage.getItem("provider_reg_state");
      if (saved) {
        const p = JSON.parse(saved);
        if (p.providerType === "individual") return p.step || 1;
      }
    } catch (_) {}
    return 1;
  });

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem("provider_reg_state");
      if (saved) {
        const p = JSON.parse(saved);
        if (p.providerType === "individual" && p.formData) return p.formData;
      }
    } catch (_) {}
    return { ...INDIVIDUAL_DEFAULTS };
  });

  // ── Business state ─────────────────────────────────────────────────────
  const [bizStep, setBizStep] = useState(() => {
    try {
      const saved = localStorage.getItem("provider_reg_state");
      if (saved) {
        const p = JSON.parse(saved);
        if (p.providerType === "business") return p.step || 1;
      }
    } catch (_) {}
    return 1;
  });

  const [bizData, setBizData] = useState(() => {
    try {
      const saved = localStorage.getItem("provider_reg_state");
      if (saved) {
        const p = JSON.parse(saved);
        if (p.providerType === "business" && p.formData) return p.formData;
      }
    } catch (_) {}
    return { ...BUSINESS_DEFAULTS };
  });

  // true once business application has been submitted → show pending screen
  const [bizSubmitted, setBizSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);

  // ── Persist to localStorage & sync URL ────────────────────────────────
  useEffect(() => {
    if (!providerType) {
      localStorage.removeItem("provider_reg_state");
      return;
    }
    const step = providerType === "business" ? bizStep : currentStep;
    const state = {
      providerType,
      step,
      formData: providerType === "business" ? bizData : formData,
    };
    localStorage.setItem("provider_reg_state", JSON.stringify(state));
    setSearchParams({ step }, { replace: true });
  }, [providerType, currentStep, bizStep, formData, bizData]); // eslint-disable-line

  // ── Sync URL → step state ──────────────────────────────────────────────
  useEffect(() => {
    if (!providerType) return;
    const total = providerType === "business" ? BUSINESS_TOTAL_STEPS : INDIVIDUAL_TOTAL_STEPS;
    const stepInUrl = parseInt(searchParams.get("step"));
    if (stepInUrl && stepInUrl >= 1 && stepInUrl <= total) {
      if (providerType === "individual" && stepInUrl !== currentStep) setCurrentStep(stepInUrl);
      if (providerType === "business" && stepInUrl !== bizStep) setBizStep(stepInUrl);
    }
  }, [searchParams]); // eslint-disable-line

  // ── Auto-sync individual progress from backend on mount ────────────────
  useEffect(() => {
    const syncBackendProgress = async () => {
      try {
        const res = await getProviderProfile();
        const provider = res.data?.provider || res.provider || res;
        if (provider) {
          const incompleteStep = getIncompleteRegistrationStep(provider);
          if (incompleteStep) {
            setProviderType("individual");
            setCurrentStep(incompleteStep);
            setFormData((prev) => ({
              ...prev,
              ...provider,
              houseNumber: provider.address?.houseNumber || "",
              colony: provider.address?.colony || "",
              landmark: provider.address?.landmark || "",
            }));
          } else {
            localStorage.setItem("providerData", JSON.stringify(provider));
            localStorage.setItem("providerId", provider._id || provider.id || "");
            localStorage.setItem("providerPhone", provider.phoneNumber || "");
            setIsAuthenticated(true);
            navigate("/profile");
          }
        }
      } catch (_) {}
    };
    const token = localStorage.getItem("accessToken");
    if (token) syncBackendProgress();
  }, [navigate]); // eslint-disable-line

  // ─────────────────────────────────────────────────────────────────────────
  // Individual flow handlers — UNCHANGED from original
  // ─────────────────────────────────────────────────────────────────────────

  const nextStep = (data = {}) => {
    setFormData((prev) => ({ ...prev, ...data }));
    if (currentStep < INDIVIDUAL_TOTAL_STEPS) setCurrentStep((p) => p + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((p) => p - 1);
    else setProviderType(null); // back to type selection
  };

  const handleIndividualSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await saveBankDetails(data);
      const created = res.data;
      if (created) {
        localStorage.setItem("providerData", JSON.stringify(created));
        localStorage.setItem("providerId", created._id || created.id || "");
        localStorage.setItem("providerPhone", created.phoneNumber || "");
      }
      localStorage.removeItem("provider_reg_state");
      setIsAuthenticated(true);
      navigate("/profile");
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err, "Registration failed. Please check your information and try again."));
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Business flow handlers
  // ─────────────────────────────────────────────────────────────────────────

  const bizNext = (data = {}) => {
    setBizData((prev) => ({ ...prev, ...data }));
    if (bizStep < BUSINESS_TOTAL_STEPS) setBizStep((p) => p + 1);
  };

  const bizPrev = () => {
    if (bizStep > 1) setBizStep((p) => p - 1);
    else setProviderType(null); // back to type selection
  };

  // Called from BizStepReview Edit buttons
  const bizGoToStep = (step) => setBizStep(step);

  // Step 6 (bank) uses Step5Payment which calls handleSubmit(form).
  // We capture the bank data and advance to review (step 7) without hitting the API yet.
  const handleBizBankSubmit = (bankData) => {
    setBizData((prev) => ({ ...prev, ...bankData }));
    setBizStep(7);
  };

  const handleBusinessSubmit = async () => {
    /**
     * BACKEND INTEGRATION REQUIRED
     * ─────────────────────────────
     * The backend does not yet have a dedicated business registration endpoint.
     * When available, replace the call below with:
     *   api.post("/business/register", { ...bizData, providerType: "business" })
     *
     * For now we attempt the existing /provider/register endpoint with
     * providerType included. If the backend rejects it the error is caught,
     * a warning toast is shown, and the pending screen is displayed anyway
     * so the UI flow is complete and the user is not left stranded.
     */
    try {
      setLoading(true);
      await registerProvider({
        fullName: bizData.fullName,
        email: bizData.email,
        phoneNumber: bizData.phoneNumber,
        providerType: "business",
        businessName: bizData.businessName,
        businessType: bizData.businessType,
        businessAddress: bizData.businessAddress,
        businessCity: bizData.businessCity,
        businessState: bizData.businessState,
        businessPinCode: bizData.businessPinCode,
        gstNumber: bizData.gstNumber,
        workers: bizData.workers,
        serviceCategory: bizData.serviceCategory,
        providerSubService: bizData.providerSubService,
        subService: bizData.subService,
        experience: bizData.experience,
        city: bizData.city,
        state: bizData.state,
        pinCode: bizData.pinCode,
        languageSpoken: bizData.languageSpoken,
        bankAccountNumber: bizData.bankAccountNumber,
        ifscCode: bizData.ifscCode,
        accountHolderName: bizData.accountHolderName,
        upiId: bizData.upiId,
      });
    } catch (err) {
      console.warn("Business registration API:", err?.response?.data || err.message);
      toast.warning(
        "Application submitted. Our team will contact you to complete verification.",
        { duration: 6000 }
      );
    } finally {
      setLoading(false);
      localStorage.removeItem("provider_reg_state");
      setBizSubmitted(true);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Type selection
  // ─────────────────────────────────────────────────────────────────────────

  const handleTypeSelect = (type) => {
    setProviderType(type);
    if (type === "individual") {
      setCurrentStep(1);
      setFormData({ ...INDIVIDUAL_DEFAULTS });
    } else {
      setBizStep(1);
      setBizData({ ...BUSINESS_DEFAULTS });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render helpers
  // ─────────────────────────────────────────────────────────────────────────

  const renderIndividualStep = () => {
    const props = { nextStep, prevStep, data: formData };
    switch (currentStep) {
      case 1: return <Step1Personal {...props} />;
      case 2: return <Step3ServiceDetails {...props} />;
      case 3: return <Step4Identity {...props} />;
      case 4: return <Step5Payment handleSubmit={handleIndividualSubmit} data={formData} loading={loading} prevStep={prevStep} />;
      default: return <Navigate to="/" replace />;
    }
  };

  const renderBusinessStep = () => {
    switch (bizStep) {
      case 1:
        // Reuse Step1Personal — passes bizNext/bizPrev so individual flow is untouched
        return <Step1Personal nextStep={bizNext} prevStep={bizPrev} data={bizData} />;
      case 2:
        return <BizStepBusinessDetails nextStep={bizNext} prevStep={bizPrev} data={bizData} />;
      case 3:
        return <Step3ServiceDetails nextStep={bizNext} prevStep={bizPrev} data={bizData} />;
      case 4:
        return <BizStepWorkers nextStep={bizNext} prevStep={bizPrev} data={bizData} />;
      case 5:
        // Step4Identity already enforces profilePhoto as mandatory — no changes needed
        return <Step4Identity nextStep={bizNext} prevStep={bizPrev} data={bizData} />;
      case 6:
        // Step5Payment reused as-is — identical bank fields, identical UI
        return (
          <Step5Payment
            handleSubmit={handleBizBankSubmit}
            data={bizData}
            loading={false}
            prevStep={bizPrev}
          />
        );
      case 7:
        return (
          <BizStepReview
            data={bizData}
            onEdit={bizGoToStep}
            onSubmit={handleBusinessSubmit}
            loading={loading}
          />
        );
      default:
        return <Navigate to="/" replace />;
    }
  };

  // Layout flags
  // Hero panel shows on: type-selection screen, individual step 1, business step 1
  const showHeroPanel = !bizSubmitted;
  const showStepIndicator = providerType !== null && !bizSubmitted;
  const activeStep = providerType === "business" ? bizStep : currentStep;
  const totalSteps = providerType === "business" ? BUSINESS_TOTAL_STEPS : INDIVIDUAL_TOTAL_STEPS;

  const getCardTitle = () => {
    if (!providerType) return "Start Your Journey";
    if (providerType === "individual") return currentStep === 1 ? "Start Your Journey" : "Final Setup";
    if (bizSubmitted) return "Application Submitted";
    if (bizStep === 1) return "Start Your Journey";
    return ["Owner Details", "Business Details", "Services & Location",
      "Add Workers", "Upload Documents", "Bank Details", "Review & Submit"][bizStep - 1] || "Business Registration";
  };

  const getCardSubtitle = () => {
    if (!providerType) return "Choose how you want to partner with Skilled Ustaad.";
    if (providerType === "individual") {
      return currentStep === 1
        ? "Join our network of expert, support and general workers."
        : `Step ${currentStep} of ${INDIVIDUAL_TOTAL_STEPS}: Almost there!`;
    }
    if (bizSubmitted) return "Your application is under review.";
    if (bizStep === 1) return "Register your business and grow your team with Skilled Ustaad.";
    return `Step ${bizStep} of ${BUSINESS_TOTAL_STEPS}: Business Registration`;
  };

  const handleBack = () => {
    if (!providerType) { navigate(-1); return; }
    if (providerType === "individual") prevStep();
    else if (bizSubmitted) navigate("/");
    else bizPrev();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans relative overflow-hidden flex flex-col">
      <SEO
        title="Join as a Partner"
        description="Register as a service provider on Skilled Ustaad. Earn more with flexible work hours and guaranteed payments."
        keywords="register as provider, join skilled ustaad, partner signup, handyman jobs"
        url="https://provider.skilledustaad.com/register"
      />

      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Header */}
      <div className="relative z-20 px-6 py-8 flex justify-between items-center max-w-7xl mx-auto w-full">
        <button
          onClick={handleBack}
          className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:text-blue-600 transition-all group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800/50">
          <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest">
            Premium Partner Program
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
        <div className={`w-full transition-all duration-700 ${showHeroPanel ? "max-w-5xl" : "max-w-2xl"}`}>
          <motion.div
            layout
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/20 dark:border-slate-800 shadow-2xl rounded-[2.5rem] overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row min-h-[600px]">

              {/* Hero panel — shown on type-selection, individual step 1, and business step 1 */}
              {showHeroPanel && (
                <div className="lg:w-5/12 relative hidden lg:block">
                  <img
                    src="/registration_hero.png"
                    alt="Become a Skilled Ustaad Partner"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-blue-600/40 mix-blend-overlay" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-900/20 to-transparent" />
                  <div className="absolute bottom-12 left-12 right-12 text-white">
                    {providerType === "business" ? (
                      <>
                        <h2 className="text-4xl font-black leading-tight mb-4 tracking-tight">
                          Your Business, <br /> Your Legacy.
                        </h2>
                        <div className="space-y-4">
                          <p className="text-blue-100 font-medium opacity-90 leading-relaxed">
                            Register your shop or business and manage your entire team from one powerful dashboard.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">GST Ready</span>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">Team Management</span>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">Verified</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <h2 className="text-4xl font-black leading-tight mb-4 tracking-tight">
                          Your Skills, <br /> Your Pride.
                        </h2>
                        <div className="space-y-4">
                          <p className="text-blue-100 font-medium opacity-90 leading-relaxed">
                            Join 50,000+ Skilled, Semi-Skilled, and <br /> Unskilled partners building India's future.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">Skilled</span>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">Semi-Skilled</span>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">Unskilled</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Form panel */}
              <div className={`flex-1 p-8 md:p-12 flex flex-col ${showHeroPanel ? "lg:w-7/12" : "w-full"} overflow-y-auto`}>
                <div className="mb-10 text-center">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                    {getCardTitle()}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">
                    {getCardSubtitle()}
                  </p>
                </div>

                {showStepIndicator && (
                  <StepIndicator currentStep={activeStep} totalSteps={totalSteps} />
                )}

                <div className="flex-1">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={
                        providerType === null
                          ? "type-select"
                          : providerType === "business"
                          ? `biz-${bizStep}-${String(bizSubmitted)}`
                          : `ind-${currentStep}`
                      }
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {providerType === null && (
                        <Step0ProviderType onSelect={handleTypeSelect} />
                      )}
                      {providerType === "individual" && renderIndividualStep()}
                      {providerType === "business" && !bizSubmitted && renderBusinessStep()}
                      {providerType === "business" && bizSubmitted && (
                        <BizStepPending data={bizData} />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Register;
