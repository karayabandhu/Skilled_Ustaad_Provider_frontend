import React, { useState } from "react";
import { Building2, FileText, MapPin, Hash, ChevronRight, ChevronDown } from "lucide-react";

const BUSINESS_TYPES = [
  "Sole Proprietorship",
  "Partnership Firm",
  "Private Limited Company",
  "LLP (Limited Liability Partnership)",
  "One Person Company (OPC)",
  "Hindu Undivided Family (HUF)",
  "Other",
];

const FieldInput = ({ label, value, onChange, placeholder, maxLength, icon: Icon, required = true, hint }) => (
  <div className="space-y-1.5 group">
    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
      {label}{" "}
      {!required && (
        <span className="text-slate-300 dark:text-slate-600 normal-case font-medium">(optional)</span>
      )}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
          <Icon size={18} />
        </div>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full h-12 ${Icon ? "pl-11" : "pl-4"} pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all shadow-sm`}
      />
    </div>
    {hint && <p className="text-[10px] text-slate-400 ml-1 mt-0.5">{hint}</p>}
  </div>
);

const BizStepBusinessDetails = ({ nextStep, data }) => {
  const [form, setForm] = useState({
    businessName: data.businessName || "",
    businessType: data.businessType || "",
    businessAddress: data.businessAddress || "",
    businessCity: data.businessCity || "",
    businessState: data.businessState || "",
    businessPinCode: data.businessPinCode || "",
    gstNumber: data.gstNumber || "",
  });
  const [error, setError] = useState("");

  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.businessName.trim() || form.businessName.trim().length < 2) {
      setError("Business / Shop name is required (minimum 2 characters).");
      return;
    }
    if (!form.businessType) {
      setError("Please select a business type.");
      return;
    }
    if (!form.businessAddress.trim()) {
      setError("Business address is required.");
      return;
    }
    if (!form.businessCity.trim() || !form.businessState.trim()) {
      setError("City and state are required.");
      return;
    }
    if (!/^\d{6}$/.test(form.businessPinCode)) {
      setError("PIN code must be exactly 6 digits.");
      return;
    }
    if (
      form.gstNumber &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        form.gstNumber.toUpperCase()
      )
    ) {
      setError("Please enter a valid 15-character GST number (e.g. 22AAAAA0000A1Z5).");
      return;
    }

    nextStep({ ...form, gstNumber: form.gstNumber.toUpperCase() });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50">
        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 leading-relaxed">
          Enter your registered business details. These will be verified by our admin team before activation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FieldInput
          label="Business / Shop Name"
          icon={Building2}
          value={form.businessName}
          onChange={set("businessName")}
          placeholder="e.g. Sharma Electricals"
          maxLength={100}
        />

        {/* Business Type */}
        <div className="space-y-1.5 group">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
            Business Type
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
              <FileText size={18} />
            </div>
            <select
              value={form.businessType}
              onChange={(e) => set("businessType")(e.target.value)}
              className="w-full h-12 pl-11 pr-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all shadow-sm cursor-pointer appearance-none"
            >
              <option value="" disabled className="bg-white dark:bg-slate-900">
                Select Business Type
              </option>
              {BUSINESS_TYPES.map((t) => (
                <option key={t} value={t} className="bg-white dark:bg-slate-900">
                  {t}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <ChevronDown size={18} />
            </div>
          </div>
        </div>

        <FieldInput
          label="Business Address (Street / Area)"
          icon={MapPin}
          value={form.businessAddress}
          onChange={set("businessAddress")}
          placeholder="e.g. 12, MG Road, Laxmi Nagar"
          maxLength={200}
        />

        <div className="grid grid-cols-2 gap-3">
          <FieldInput
            label="City"
            value={form.businessCity}
            onChange={set("businessCity")}
            placeholder="e.g. Patna"
            maxLength={60}
          />
          <FieldInput
            label="State"
            value={form.businessState}
            onChange={set("businessState")}
            placeholder="e.g. Bihar"
            maxLength={60}
          />
        </div>

        <FieldInput
          label="PIN Code"
          value={form.businessPinCode}
          onChange={(v) => set("businessPinCode")(v.replace(/\D/g, "").slice(0, 6))}
          placeholder="800001"
          maxLength={6}
        />

        <FieldInput
          label="GST Number"
          icon={Hash}
          value={form.gstNumber}
          onChange={(v) =>
            set("gstNumber")(v.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 15))
          }
          placeholder="22AAAAA0000A1Z5"
          maxLength={15}
          required={false}
          hint="15-character GST Identification Number. Leave blank if not registered."
        />

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2 border border-red-100 dark:border-red-900/20">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
        >
          Continue to Services
          <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </form>
    </div>
  );
};

export default BizStepBusinessDetails;
