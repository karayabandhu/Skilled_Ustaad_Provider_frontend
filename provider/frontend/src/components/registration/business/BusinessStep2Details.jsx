import React, { useState } from "react";
import { Building2, Store, MapPin, Hash, FileText, ChevronRight, ChevronLeft, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

const BUSINESS_TYPES = [
  "Sole Proprietorship",
  "Partnership Firm",
  "Private Limited / LLP",
  "Retail / Workshop / Service Center",
  "Contractor / Agency",
  "Other",
];

const BusinessStep2Details = ({ nextStep, prevStep, data }) => {
  const { t } = useTranslation();

  const [businessName, setBusinessName] = useState(data.businessName || "");
  const [businessType, setBusinessType] = useState(data.businessType || "Sole Proprietorship");
  const [shopNumber, setShopNumber] = useState(data.shopNumber || "");
  const [colony, setColony] = useState(data.colony || "");
  const [landmark, setLandmark] = useState(data.landmark || "");
  const [city, setCity] = useState(data.city || "");
  const [state, setState] = useState(data.state || "");
  const [pinCode, setPinCode] = useState(data.pinCode || "");
  const [gstNumber, setGstNumber] = useState(data.gstNumber || "");
  const [error, setError] = useState("");

  const handleNext = (e) => {
    e.preventDefault();
    setError("");

    if (!businessName.trim() || !shopNumber.trim() || !colony.trim() || !city.trim() || !state.trim() || !pinCode.trim()) {
      setError(t("business_reg.step2_err_required", "Please fill in all mandatory business details and address fields."));
      return;
    }

    if (businessName.trim().length < 2) {
      setError(t("business_reg.step2_err_name", "Business name must be at least 2 characters long."));
      return;
    }

    if (!/^\d{6}$/.test(pinCode.trim())) {
      setError(t("business_reg.step2_err_pincode", "PIN Code must be a valid 6-digit number."));
      return;
    }

    // Optional GSTIN format check if entered
    if (gstNumber.trim()) {
      const cleanGst = gstNumber.trim().toUpperCase();
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(cleanGst)) {
        setError(t("business_reg.step2_err_gst", "Invalid GSTIN format. Standard GSTIN is 15 alphanumeric characters (e.g. 22AAAAA0000A1Z5)."));
        return;
      }
    }

    nextStep({
      businessName: businessName.trim(),
      businessType,
      shopNumber: shopNumber.trim(),
      colony: colony.trim(),
      landmark: landmark.trim(),
      city: city.trim(),
      state: state.trim(),
      pinCode: pinCode.trim(),
      gstNumber: gstNumber.trim().toUpperCase(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
        <h4 className="text-xl font-black text-slate-900 dark:text-white">
          {t("business_reg.step2_title", "Business & Shop Details")}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t("business_reg.step2_subtitle", "Enter your registered business identity and operating address.")}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-semibold animate-in fade-in">
          <ShieldAlert size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleNext} className="space-y-5">
        {/* Business / Shop Name */}
        <div className="space-y-1.5 group">
          <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
            {t("business_reg.name", "Business / Shop / Agency Name")} *
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Store size={18} />
            </div>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Apex Electricals & Home Solutions"
              maxLength={100}
              className="w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all shadow-sm"
              required
            />
          </div>
        </div>

        {/* Business Type & Optional GSTIN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Business Type */}
          <div className="space-y-1.5 group">
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
              {t("business_reg.type", "Business Entity Type")} *
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Building2 size={18} />
              </div>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all shadow-sm cursor-pointer"
              >
                {BUSINESS_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* GSTIN (Optional) */}
          <div className="space-y-1.5 group">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {t("business_reg.gst", "GST Number (GSTIN)")}
              </label>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t("business_reg.optional", "Optional")}
              </span>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <FileText size={18} />
              </div>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
                className="w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold tracking-wider transition-all shadow-sm uppercase placeholder:normal-case"
              />
            </div>
          </div>
        </div>

        {/* Address Fields */}
        <div className="pt-2">
          <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-3">
            {t("business_reg.address_section", "Shop / Office Address")}
          </span>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Shop / Building Number */}
              <div className="space-y-1.5 group">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                  {t("business_reg.shop_no", "Shop / Unit / Building No.")} *
                </label>
                <input
                  type="text"
                  value={shopNumber}
                  onChange={(e) => setShopNumber(e.target.value)}
                  placeholder="e.g. Shop #12, Ground Floor"
                  className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all shadow-sm"
                  required
                />
              </div>

              {/* Area / Market / Street */}
              <div className="space-y-1.5 group">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                  {t("business_reg.area", "Market / Colony / Street")} *
                </label>
                <input
                  type="text"
                  value={colony}
                  onChange={(e) => setColony(e.target.value)}
                  placeholder="e.g. Main Market Road, Sector 14"
                  className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Landmark */}
              <div className="space-y-1.5 group">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                  {t("business_reg.landmark", "Landmark (Optional)")}
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opposite Central Bank"
                  className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all shadow-sm"
                />
              </div>

              {/* PIN Code */}
              <div className="space-y-1.5 group">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                  {t("business_reg.pincode", "PIN Code")} *
                </label>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setPinCode(clean);
                  }}
                  placeholder="e.g. 110001"
                  maxLength={6}
                  className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* City */}
              <div className="space-y-1.5 group">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                  {t("business_reg.city", "City")} *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New Delhi"
                  className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all shadow-sm"
                  required
                />
              </div>

              {/* State */}
              <div className="space-y-1.5 group">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                  {t("business_reg.state", "State")} *
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Delhi"
                  className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all shadow-sm"
                  required
                />
              </div>
            </div>
          </div>
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
            <span>{t("business_reg.next_step3", "Continue to Services & Location")}</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessStep2Details;

