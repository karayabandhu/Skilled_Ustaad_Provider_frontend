/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Building2, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import BusinessStepIndicator from "./BusinessStepIndicator";
import BusinessStep1Owner from "./BusinessStep1Owner";
import BusinessStep2Details from "./BusinessStep2Details";
import BusinessStep3Services from "./BusinessStep3Services";
import BusinessStep4Workers from "./BusinessStep4Workers";
import BusinessStep5Documents from "./BusinessStep5Documents";
import BusinessStep6Bank from "./BusinessStep6Bank";
import BusinessStep7Review from "./BusinessStep7Review";
import BusinessStep8Status from "./BusinessStep8Status";

import {
  INITIAL_BUSINESS_FORM_DATA,
  loadBusinessRegistrationDraft,
  saveBusinessRegistrationDraft,
  getBusinessApplication,
  submitBusinessApplication,
  resetBusinessApplication,
} from "../../../services/businessRegistration";

const BusinessRegistrationWizard = ({
  onBackToSelection,
  setIsAuthenticated,
}) => {
  const { t } = useTranslation();

  // Check if an existing submitted application exists
  const existingApp = getBusinessApplication();

  const [currentStep, setCurrentStep] = useState(() => {
    if (existingApp) return 8; // If already submitted, open status screen
    const draft = loadBusinessRegistrationDraft();
    return draft?.step || 1;
  });

  const [formData, setFormData] = useState(() => {
    if (existingApp?.fullData) {
      return {
        ...INITIAL_BUSINESS_FORM_DATA,
        ...existingApp.fullData,
        documents: {
          ...INITIAL_BUSINESS_FORM_DATA.documents,
          ...(existingApp.fullData.documents || {}),
        },
      };
    }
    const draft = loadBusinessRegistrationDraft();
    return draft?.formData || INITIAL_BUSINESS_FORM_DATA;
  });

  const [application, setApplication] = useState(existingApp);
  const [loading, setLoading] = useState(false);
  const totalSteps = 8;

  // Persist draft whenever step or data changes (unless submitted and on step 8)
  useEffect(() => {
    if (currentStep < 8) {
      saveBusinessRegistrationDraft(currentStep, formData);
    }
  }, [currentStep, formData]);

  const nextStep = (stepData = {}) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        ...stepData,
        documents: {
          ...prev.documents,
          ...(stepData.documents || {}),
        },
      };
      return updated;
    });

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else if (onBackToSelection) {
      onBackToSelection();
    }
  };

  const goToStep = (stepNum) => {
    if (stepNum >= 1 && stepNum <= totalSteps) {
      setCurrentStep(stepNum);
    }
  };

  const handleSubmitApplication = async () => {
    try {
      setLoading(true);
      const app = await submitBusinessApplication(formData);
      setApplication(app);
      setCurrentStep(8);
      toast.success(t("business_reg.toast_submitted", "Application submitted successfully! Currently under review."));
    } catch (err) {
      toast.error(t("business_reg.toast_error", "Failed to submit application. Please check your data and try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleResolveChanges = (stepNumber = 5) => {
    goToStep(stepNumber);
  };

  const handleStartNewRegistration = () => {
    resetBusinessApplication();
    setFormData(INITIAL_BUSINESS_FORM_DATA);
    setApplication(null);
    setCurrentStep(1);
  };

  const renderStep = () => {
    const commonProps = {
      data: formData,
      nextStep,
      prevStep,
      goToStep,
    };

    switch (currentStep) {
      case 1:
        return (
          <BusinessStep1Owner
            {...commonProps}
            onBackToSelection={onBackToSelection}
          />
        );
      case 2:
        return <BusinessStep2Details {...commonProps} />;
      case 3:
        return <BusinessStep3Services {...commonProps} />;
      case 4:
        return <BusinessStep4Workers {...commonProps} />;
      case 5:
        return <BusinessStep5Documents {...commonProps} />;
      case 6:
        return <BusinessStep6Bank {...commonProps} />;
      case 7:
        return (
          <BusinessStep7Review
            {...commonProps}
            onSubmitApplication={handleSubmitApplication}
            loading={loading}
          />
        );
      case 8:
        return (
          <BusinessStep8Status
            application={application || getBusinessApplication()}
            onResolveChanges={handleResolveChanges}
            onStartNewRegistration={handleStartNewRegistration}
            setIsAuthenticated={setIsAuthenticated}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Top Breadcrumb & Type Badge */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {currentStep > 1 && currentStep < 8 && (
            <button
              type="button"
              onClick={prevStep}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all mr-1"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase tracking-wider rounded-full border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
            <Building2 size={13} />
            <span>Commercial Business Flow</span>
          </span>
        </div>

        {currentStep === 1 && onBackToSelection && (
          <button
            type="button"
            onClick={onBackToSelection}
            className="text-xs font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 flex items-center gap-1 transition-colors"
          >
            <span>Switch to Individual</span>
          </button>
        )}
      </div>

      {/* 8-Step Indicator */}
      <BusinessStepIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        onStepClick={goToStep}
      />

      {/* Step Content with Animated Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default BusinessRegistrationWizard;
