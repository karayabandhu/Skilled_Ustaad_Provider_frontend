import React, { useState } from "react";
import {
  CreditCard,
  Landmark,
  Hash,
  Smartphone,
  Rocket,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const Input = ({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  ...props
}) => (
  <div className="space-y-1.5 group">
    <label className="min-h-[28px] flex items-end text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 leading-4">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
        <Icon size={18} />
      </div>
      <input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all shadow-sm"
        required
      />
    </div>
  </div>
);

const Step5Payment = ({ handleSubmit, data, loading }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    bankAccountNumber: data.bankAccountNumber || "",
    ifscCode: data.ifscCode || "",
    accountHolderName: data.accountHolderName || "",
    upiId: data.upiId || "",
  });

  const [isFinalAgreed, setIsFinalAgreed] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    if (
      !form.accountHolderName ||
      !form.bankAccountNumber ||
      !form.ifscCode ||
      !form.upiId
    ) {
      return alert(
        t(
          "registration_page.step5_err_missing",
          "Please fill in ALL bank and payout details.",
        ),
      );
    }

    if (!/^[a-zA-Z\s]{2,60}$/.test(form.accountHolderName.trim())) {
      return alert(
        t(
          "registration_page.step5_err_holder",
          "Account Holder Name must contain only letters and spaces.",
        ),
      );
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode)) {
      return alert(
        t(
          "registration_page.step5_err_ifsc",
          "Please enter a valid 11-character IFSC code (e.g. SBIN0001234).",
        ),
      );
    }

    if (!isFinalAgreed)
      return alert(
        t(
          "registration_page.step5_err_agree",
          "Please confirm the payment details to proceed.",
        ),
      );
    handleSubmit(form);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Decorative Card Mockup */}
      <div className="relative h-48 w-full bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2rem] p-8 text-white shadow-2xl shadow-blue-600/20 overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex justify-between items-start">
            <Landmark size={32} strokeWidth={1.5} className="opacity-80" />
            <ShieldCheck size={24} className="opacity-60" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">
              {t("registration_page.step5_holder", "Account Holder")}
            </p>
            <p className="text-xl font-black tracking-tight truncate">
              {form.accountHolderName ||
                t(
                  "registration_page.step5_holder_placeholder",
                  "Your Name Here",
                )}
            </p>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
                {t("registration_page.step5_number", "Account Number")}
              </p>
              <p className="text-sm font-mono tracking-widest">
                {form.bankAccountNumber
                  ? `**** **** ${form.bankAccountNumber.slice(-4)}`
                  : "XXXX XXXX XXXX"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
                {t("registration_page.step5_ifsc", "IFSC")}
              </p>
              <p className="text-sm font-mono tracking-widest">
                {form.ifscCode || "XXXX0000XXX"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <Input
          label={t(
            "registration_page.step5_holder_label",
            "Account Holder Name",
          )}
          icon={CreditCard}
          value={form.accountHolderName}
          placeholder={t(
            "registration_page.step5_holder_desc",
            "Exactly as in Bank account",
          )}
          onChange={(v) =>
            setForm((p) => ({
              ...p,
              accountHolderName: v.replace(/[^a-zA-Z\s]/g, ""),
            }))
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t(
              "registration_page.step5_number_label",
              "Bank Account Number",
            )}
            icon={Hash}
            value={form.bankAccountNumber}
            placeholder="3482..."
            onChange={(v) =>
              setForm((p) => ({
                ...p,
                bankAccountNumber: v.replace(/\D/g, ""),
              }))
            }
          />
          <Input
            label={t("registration_page.step5_ifsc_label", "IFSC Code")}
            icon={Landmark}
            value={form.ifscCode}
            placeholder="SBIN0001234"
            maxLength={11}
            onChange={(v) =>
              setForm((p) => ({
                ...p,
                ifscCode: v.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
              }))
            }
          />
        </div>

        <Input
          label={t("registration_page.step5_upi", "UPI ID")}
          icon={Smartphone}
          value={form.upiId}
          placeholder="yourname@okaxis"
          onChange={(v) => setForm((p) => ({ ...p, upiId: v }))}
          required={true}
        />

        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center h-6">
              <input
                type="checkbox"
                checked={isFinalAgreed}
                onChange={(e) => setIsFinalAgreed(e.target.checked)}
                className="peer hidden"
              />
              <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-700 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                <CheckCircle2
                  size={12}
                  className="text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                />
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t(
                "registration_page.step5_verify",
                "I verify these details are correct for payments.",
              )}
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !isFinalAgreed}
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
        >
          {loading
            ? t("registration_page.step5_launching", "Launching Profile...")
            : t("registration_page.step5_complete", "Complete Registration")}
        </button>
      </form>
    </div>
  );
};

export default Step5Payment;
