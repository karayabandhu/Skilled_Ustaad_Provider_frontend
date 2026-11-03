/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  CreditCard,
  Landmark,
  Hash,
  Smartphone,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  Building2,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const BankInput = ({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  ...props
}) => (
  <div className="space-y-1.5 group">
    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
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

const BusinessStep6Bank = ({ nextStep, prevStep, data }) => {
  const { t } = useTranslation();

  const [bankAccountNumber, setBankAccountNumber] = useState(data.bankAccountNumber || "");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState(data.confirmAccountNumber || data.bankAccountNumber || "");
  const [ifscCode, setIfscCode] = useState(data.ifscCode || "");
  const [accountHolderName, setAccountHolderName] = useState(data.accountHolderName || data.businessName || "");
  const [upiId, setUpiId] = useState(data.upiId || "");
  const [isAgreed, setIsAgreed] = useState(false);
  const [error, setError] = useState("");

  const handleNext = (e) => {
    e.preventDefault();
    setError("");

    if (!bankAccountNumber.trim() || !confirmAccountNumber.trim() || !ifscCode.trim() || !accountHolderName.trim() || !upiId.trim()) {
      setError(t("business_reg.err_bank_missing", "Please fill in all bank and settlement details."));
      return;
    }

    if (!/^\d{9,18}$/.test(bankAccountNumber.trim())) {
      setError(t("business_reg.err_acc_num", "Bank account number must be between 9 and 18 digits."));
      return;
    }

    if (bankAccountNumber.trim() !== confirmAccountNumber.trim()) {
      setError(t("business_reg.err_acc_match", "Bank account numbers do not match."));
      return;
    }

    const cleanIfsc = ifscCode.trim().toUpperCase();
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
      setError(t("business_reg.err_ifsc", "Please enter a valid 11-character IFSC code (e.g. SBIN0001234)."));
      return;
    }

    if (!/^[a-zA-Z\s]{2,60}$/.test(accountHolderName.trim())) {
      setError(t("business_reg.err_holder_name", "Account holder name must contain only letters and spaces (2–60 chars)."));
      return;
    }

    if (!/^[\w.-]+@[\w.-]+$/.test(upiId.trim())) {
      setError(t("business_reg.err_upi", "Please enter a valid UPI ID (e.g. business@okaxis or 9876543210@upi)."));
      return;
    }

    if (!isAgreed) {
      setError(t("business_reg.err_agree_bank", "Please confirm that you authorize settlements to this business account."));
      return;
    }

    nextStep({
      bankAccountNumber: bankAccountNumber.trim(),
      confirmAccountNumber: confirmAccountNumber.trim(),
      ifscCode: cleanIfsc,
      accountHolderName: accountHolderName.trim(),
      upiId: upiId.trim(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
        <h4 className="text-xl font-black text-slate-900 dark:text-white">
          {t("business_reg.step6_title", "Settlement & Bank Details")}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t("business_reg.step6_subtitle", "All booking earnings and commercial disbursements will be transferred here.")}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-semibold animate-in fade-in">
          <ShieldAlert size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Decorative Card Mockup */}
      <div className="relative h-44 w-full bg-gradient-to-br from-indigo-700 via-indigo-800 to-blue-900 rounded-3xl p-6 text-white shadow-xl shadow-indigo-600/20 overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-7 bg-amber-400/90 rounded-md border border-amber-300 shadow-sm flex items-center justify-center">
              <div className="w-5 h-4 border-t border-b border-black/20" />
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase opacity-80">
              Commercial Account
            </span>
          </div>
          <span className="text-xs font-black tracking-widest text-indigo-200 uppercase">
            Skilled Ustaad Settlement
          </span>
        </div>

        <div className="space-y-1 relative z-10">
          <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest">
            Account Number
          </span>
          <p className="font-mono text-lg md:text-xl font-black tracking-widest">
            {bankAccountNumber
              ? `•••• •••• •••• ${bankAccountNumber.slice(-4)}`
              : "•••• •••• •••• ••••"}
          </p>
        </div>

        <div className="flex justify-between items-end relative z-10">
          <div>
            <span className="text-[8px] font-bold text-indigo-300 uppercase tracking-widest block">
              Account Holder
            </span>
            <span className="text-xs font-black uppercase tracking-wider truncate max-w-[180px] block">
              {accountHolderName || data.businessName || "Business / Owner Name"}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-bold text-indigo-300 uppercase tracking-widest block">
              IFSC Code
            </span>
            <span className="font-mono text-xs font-black uppercase tracking-wider">
              {ifscCode || "XXXX0000000"}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleNext} className="space-y-4">
        {/* Account Holder Name */}
        <BankInput
          label={t("business_reg.acc_holder", "Account Holder Name (as in bank passbook)")}
          icon={Building2}
          value={accountHolderName}
          onChange={setAccountHolderName}
          placeholder="e.g. Apex Electricals or Ramesh Sharma"
        />

        {/* Account Number & Confirm */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BankInput
            label={t("business_reg.acc_number", "Bank Account Number")}
            icon={Hash}
            type="password"
            value={bankAccountNumber}
            onChange={(val) => setBankAccountNumber(val.replace(/\D/g, ""))}
            placeholder="Enter account number"
            maxLength={18}
          />

          <BankInput
            label={t("business_reg.confirm_acc", "Confirm Bank Account Number")}
            icon={Hash}
            type="text"
            value={confirmAccountNumber}
            onChange={(val) => setConfirmAccountNumber(val.replace(/\D/g, ""))}
            placeholder="Re-enter account number"
            maxLength={18}
          />
        </div>

        {/* IFSC & UPI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BankInput
            label={t("business_reg.ifsc", "Bank IFSC Code (11 Characters)")}
            icon={Landmark}
            value={ifscCode}
            onChange={(val) => setIfscCode(val.toUpperCase())}
            placeholder="e.g. SBIN0001234"
            maxLength={11}
          />

          <BankInput
            label={t("business_reg.upi", "Business UPI ID (for instant settlement)")}
            icon={Smartphone}
            value={upiId}
            onChange={setUpiId}
            placeholder="e.g. shopname@upi"
          />
        </div>

        {/* Agreement Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer group">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              <strong className="text-slate-900 dark:text-white font-bold block mb-0.5">
                {t("business_reg.settlement_auth_title", "Payout Authorization")}
              </strong>
              {t("business_reg.settlement_auth_desc", "I authorize Skilled Ustaad to disburse customer booking payouts and aggregate worker service settlements directly to this bank account.")}
            </div>
          </label>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="button"
            onClick={prevStep}
            className="flex-1 h-14 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <ChevronLeft size={18} />
            <span>{t("business_reg.back", "Back")}</span>
          </button>

          <button
            type="submit"
            className="flex-[2] h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all duration-200"
          >
            <span>{t("business_reg.next_step7", "Review Details")}</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessStep6Bank;
