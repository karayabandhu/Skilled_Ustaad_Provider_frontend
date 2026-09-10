import React, { useState, useEffect } from "react";
import { useNavigate, Navigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import SEO from "../components/SEO";

import Step1Personal from "../components/registration/Step1Personal";
import Step2OTP from "../components/registration/Step2OTP";
import Step3ServiceDetails from "../components/registration/Step3ServiceDetails";
import Step4Identity from "../components/registration/Step4Identity";
import Step5Payment from "../components/registration/Step5Payment";
import StepIndicator from "../components/registration/StepIndicator";

import { registerProvider, saveBankDetails, getProviderProfile } from "../services/api";
import { toast } from "sonner";
import { getFriendlyErrorMessage } from "../utils/errors";
import { getIncompleteRegistrationStep } from "../utils/registration";

const Register = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from localStorage or defaults
  const [currentStep, setCurrentStep] = useState(() => {
    try {
      const saved = localStorage.getItem("provider_reg_state");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.step || 1;
      }
    } catch (e) {
      console.error("Failed to parse registration state:", e);
    }
    return 1;
  });

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem("provider_reg_state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.formData) return parsed.formData;
      }
    } catch (e) {
      console.error("Failed to parse form data state:", e);
    }
    return {
      fullName: "",
      email: "",
      phoneNumber: "",
      serviceCategory: "",
      providerSubService: "",
      subService: [],
      experience: "",
      houseNumber: "",
      colony: "",
      landmark: "",
      city: "",
      state: "",
      pinCode: "",
      latitude: "",
      longitude: "",
      languageSpoken: "",
      profilePhoto: null,
      governmentIDProof: null,
      addressProof: null,
      skillCertificate: null,
      bankAccountNumber: "",
      ifscCode: "",
      accountHolderName: "",
      upiId: ""
    };
  });

  const [loading, setLoading] = useState(false);
  const totalSteps = 4;

  // Sync URL with Step state for browser back button support
  useEffect(() => {
    const stepInUrl = parseInt(searchParams.get("step"));
    if (stepInUrl && stepInUrl !== currentStep && stepInUrl >= 1 && stepInUrl <= totalSteps) {
      setCurrentStep(stepInUrl);
    }
  }, [searchParams]);

  // Auto-sync progress from backend on mount if already authenticated
  useEffect(() => {
    const syncBackendProgress = async () => {
      try {
        const res = await getProviderProfile();
        const provider = res.data?.provider || res.provider || res;
        
        if (provider) {
          const incompleteStep = getIncompleteRegistrationStep(provider);
          if (incompleteStep) {
            setCurrentStep(incompleteStep);
            
            // Hydrate formData from backend state
            setFormData((prev) => ({
              ...prev,
              ...provider,
              // Map nested address fields to flat formData fields
              houseNumber: provider.address?.houseNumber || "",
              colony: provider.address?.colony || "",
              landmark: provider.address?.landmark || "",
            }));
          } else {
            // Already complete, save providerData, set auth state and navigate to dashboard
            localStorage.setItem("providerData", JSON.stringify(provider));
            localStorage.setItem("providerId", provider._id || provider.id || "");
            localStorage.setItem("providerPhone", provider.phoneNumber || "");
            setIsAuthenticated(true);
            navigate("/profile");
          }
        }
      } catch (err) {
        console.warn("Failed to auto-sync registration progress from server:", err);
      }
    };

    const token = localStorage.getItem("accessToken");
    if (token) {
      syncBackendProgress();
    }
  }, [navigate]);

  useEffect(() => {
    setSearchParams({ step: currentStep }, { replace: true });

    // Save to localStorage
    const state = { step: currentStep, formData };
    localStorage.setItem("provider_reg_state", JSON.stringify(state));
  }, [currentStep, formData, setSearchParams]);

  const nextStep = (data = {}) => {
    setFormData((prev) => ({ ...prev, ...data }));
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await saveBankDetails(data);
      const created = res.data;

      if (created) {
        localStorage.setItem("providerData", JSON.stringify(created));
        localStorage.setItem("providerId", created._id || created.id || "");
        localStorage.setItem("providerPhone", created.phoneNumber || "");
      }

      localStorage.removeItem("provider_reg_state"); // Clear progress on success
      setIsAuthenticated(true);
      navigate("/profile");
    } catch (err) {
      toast.error(getFriendlyErrorMessage(err, "Registration failed. Please check your information and try again."));
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    const props = { nextStep, prevStep, data: formData };
    switch (currentStep) {
      case 1: return <Step1Personal {...props} />;
      case 2: return <Step3ServiceDetails {...props} />;
      case 3: return <Step4Identity {...props} />;
      case 4: return <Step5Payment handleSubmit={handleSubmit} data={formData} loading={loading} prevStep={prevStep} />;
      default: return <Navigate to="/" replace />;
    }
  };

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
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header / Navigation */}
      <div className="relative z-20 px-6 py-8 flex justify-between items-center max-w-7xl mx-auto w-full">
        <button
          onClick={prevStep}
          className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:text-blue-600 transition-all group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800/50">
         
          <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest">Premium Partner Program</span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
        <div className={`w-full transition-all duration-700 ${currentStep === 1 ? 'max-w-5xl' : 'max-w-2xl'}`}>
          <motion.div
            layout
            className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/20 dark:border-slate-800 shadow-2xl rounded-[2.5rem] overflow-hidden"
          >
            {/* Split Layout for Step 1, Centered for others */}
            <div className={`flex flex-col lg:flex-row min-h-[600px]`}>
              {currentStep === 1 && (
                <div className="lg:w-5/12 relative hidden lg:block">
                  <img
                    src="/registration_hero.png"
                    alt="Become a Skilled Ustaad Partner"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-blue-600/40 mix-blend-overlay" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-900/20 to-transparent" />
                  <div className="absolute bottom-12 left-12 right-12 text-white">
                    <h2 className="text-4xl font-black leading-tight mb-4 tracking-tight">Your Skills, <br /> Your Pride.</h2>
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
                  </div>
                </div>
              )}

              <div className={`flex-1 p-8 md:p-12 flex flex-col ${currentStep === 1 ? 'lg:w-7/12' : 'w-full'}`}>
                <div className="mb-10 text-center">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                    {currentStep === 1 ? "Start Your Journey" : "Final Setup"}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">
                    {currentStep === 1
                      ? "Join our network of expert, support and general workers."
                      : `Step ${currentStep} of ${totalSteps}: Almost there!`
                    }
                  </p>
                </div>

                <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

                <div className="flex-1">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {renderStep()}
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