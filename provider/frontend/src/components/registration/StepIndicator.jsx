import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const StepIndicator = ({ currentStep, totalSteps }) => {
  const { t } = useTranslation();
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between w-full max-w-lg mx-auto mb-12 relative px-2">
      {/* Background Line */}
      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 rounded-full z-0" />
      
      {/* Progress Line */}
      <motion.div 
        className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 rounded-full z-10"
        initial={{ width: "0%" }}
        animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />

      {steps.map((step) => {
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;

        return (
          <div key={step} className="relative z-20">
            <motion.div
              initial={false}
              animate={{
                scale: isActive ? 1.2 : 1,
                backgroundColor: isCompleted ? "#2563eb" : isActive ? "#ffffff" : "#f1f5f9",
                borderColor: isCompleted || isActive ? "#2563eb" : "#e2e8f0"
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-full border-2 shadow-sm transition-colors duration-500 bg-white ${
                isActive ? 'dark:bg-slate-900 border-blue-600' : isCompleted ? 'border-blue-600' : 'dark:bg-slate-800 dark:border-slate-700'
              }`}
            >
              {isCompleted ? (
                <Check size={18} className="text-white" strokeWidth={3} />
              ) : (
                <span className={`text-xs font-black ${isActive ? 'text-blue-600' : 'text-slate-400 dark:text-slate-500'}`}>
                  {step}
                </span>
              )}

              {/* Pulsing effect for active step */}
              {isActive && (
                <motion.div 
                  className="absolute inset-0 rounded-full bg-blue-600/20"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              )}
            </motion.div>
            
            <span className={`absolute -bottom-7 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-tighter whitespace-nowrap hidden md:block ${
              isActive ? 'text-blue-600' : 'text-slate-400 dark:text-slate-500'
            }`}>
              {t('registration_page.step', 'Step')} {step}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;