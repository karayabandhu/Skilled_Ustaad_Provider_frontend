/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

const STEP_LABELS = [
  "Owner",
  "Business",
  "Services",
  "Workers",
  "Documents",
  "Bank",
  "Review",
  "Status",
];

const BusinessStepIndicator = ({ currentStep, totalSteps = 8, onStepClick }) => {
  const { t } = useTranslation();
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="w-full max-w-3xl mx-auto mb-10 px-2">
      {/* Mobile progress label */}
      <div className="flex md:hidden justify-between items-center mb-3">
        <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          {t("business_indicator.step_label", "Step {{current}} of {{total}}", {
            current: currentStep,
            total: totalSteps,
          })}
        </span>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {STEP_LABELS[currentStep - 1] || ""}
        </span>
      </div>

      {/* Progress Line and Step Circles (Desktop) */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Background Track Line */}
        <div className="absolute top-5 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 rounded-full z-0" />

        {/* Active Progress Line */}
        <motion.div
          className="absolute top-5 left-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 -translate-y-1/2 rounded-full z-10"
          initial={{ width: "0%" }}
          animate={{
            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
          }}
          transition={{ type: "spring", stiffness: 60, damping: 20 }}
        />

        {steps.map((step) => {
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;
          const isClickable = onStepClick && step < currentStep && currentStep < 8;

          return (
            <div
              key={step}
              onClick={() => isClickable && onStepClick(step)}
              className={`relative z-20 flex flex-col items-center ${
                isClickable ? "cursor-pointer group" : ""
              }`}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.15 : 1,
                  backgroundColor: isCompleted
                    ? "#2563eb"
                    : isActive
                    ? "#ffffff"
                    : "#f1f5f9",
                  borderColor:
                    isCompleted || isActive ? "#2563eb" : "#cbd5e1",
                }}
                className={`w-9 h-9 flex items-center justify-center rounded-full border-2 shadow-sm transition-colors duration-300 ${
                  isActive
                    ? "dark:bg-slate-900 border-blue-600 ring-4 ring-blue-600/20"
                    : isCompleted
                    ? "border-blue-600"
                    : "dark:bg-slate-800 dark:border-slate-700"
                }`}
              >
                {isCompleted ? (
                  <Check size={16} className="text-white" strokeWidth={3} />
                ) : (
                  <span
                    className={`text-[11px] font-black ${
                      isActive
                        ? "text-blue-600"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {step}
                  </span>
                )}
              </motion.div>

              <span
                className={`mt-2 text-[10px] font-black uppercase tracking-tight text-center ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400 font-extrabold"
                    : isCompleted
                    ? "text-slate-700 dark:text-slate-300"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {STEP_LABELS[step - 1]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Progress Bar */}
      <div className="md:hidden w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
          animate={{
            width: `${((currentStep) / totalSteps) * 100}%`,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};

export default BusinessStepIndicator;
