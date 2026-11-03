/* eslint-disable no-unused-vars */
import React, { useState, useRef } from "react";
import {
  Upload,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Building2,
  CreditCard,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const BusinessUploadCard = ({
  id,
  label,
  subtitle,
  icon: Icon,
  mandatory = true,
  docs,
  previews,
  fileInputRefs,
  handleFileChange,
  removeFile,
}) => {
  const { t } = useTranslation();
  const file = docs[id];
  const isUploaded = !!file;
  const preview = previews[id];

  return (
    <div
      className={`relative p-4 rounded-3xl border-2 transition-all duration-300 group ${
        isUploaded
          ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-600/30"
          : "bg-slate-50 dark:bg-slate-900 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-600/50"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
            isUploaded
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500"
          }`}
        >
          <Icon size={22} />
        </div>

        <div className="flex-1 min-w-0">
          <h5 className="text-xs font-black text-slate-900 dark:text-white truncate">
            {label} {mandatory && <span className="text-red-500">*</span>}
          </h5>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate">
            {isUploaded
              ? file.name || t("business_reg.file_selected", "File Selected")
              : subtitle || t("business_reg.tap_upload", "Tap to upload (Max 10MB)")}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isUploaded ? (
            <button
              type="button"
              onClick={() => removeFile(id)}
              className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
            >
              <Trash2 size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRefs[id].current?.click()}
              className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-transform"
            >
              <Upload size={16} />
            </button>
          )}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRefs[id]}
        className="hidden"
        accept="image/*,.pdf"
        onChange={(e) => handleFileChange(e, id)}
      />

      {preview && (
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 h-24 relative group/preview">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
            <CheckCircle2 className="text-white" size={24} />
          </div>
        </div>
      )}
    </div>
  );
};

const BusinessStep5Documents = ({ nextStep, prevStep, data }) => {
  const { t } = useTranslation();

  const [docs, setDocs] = useState({
    businessRegistrationProof: data.documents?.businessRegistrationProof || null,
    ownerGovtId: data.documents?.ownerGovtId || null,
    addressProof: data.documents?.addressProof || null,
    businessLogoOrShopPhoto: data.documents?.businessLogoOrShopPhoto || null,
    gstCertificate: data.documents?.gstCertificate || null,
    workerIdProofs: data.documents?.workerIdProofs || null,
  });

  const [previews, setPreviews] = useState({});
  const [isAgreed, setIsAgreed] = useState(false);
  const [error, setError] = useState("");

  const fileInputRefs = {
    businessRegistrationProof: useRef(null),
    ownerGovtId: useRef(null),
    addressProof: useRef(null),
    businessLogoOrShopPhoto: useRef(null),
    gstCertificate: useRef(null),
    workerIdProofs: useRef(null),
  };

  const handleFileChange = (e, id) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError(t("business_reg.file_size_err", "File size must be under 10MB."));
      return;
    }

    setDocs((prev) => ({ ...prev, [id]: file }));

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviews((prev) => ({ ...prev, [id]: event.target.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setPreviews((prev) => ({ ...prev, [id]: null }));
    }

    setError("");
  };

  const removeFile = (id) => {
    setDocs((prev) => ({ ...prev, [id]: null }));
    setPreviews((prev) => ({ ...prev, [id]: null }));
    if (fileInputRefs[id]?.current) {
      fileInputRefs[id].current.value = "";
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError("");

    // Validate mandatory documents
    if (!docs.businessRegistrationProof) {
      setError(t("business_reg.err_biz_reg_doc", "Please upload Business / Shop Registration Certificate or Trade License."));
      return;
    }

    if (!docs.ownerGovtId) {
      setError(t("business_reg.err_owner_id_doc", "Please upload Owner Government ID Proof."));
      return;
    }

    if (!docs.addressProof) {
      setError(t("business_reg.err_address_doc", "Please upload Business Address Proof (Electricity bill / Rent agreement)."));
      return;
    }

    if (!docs.businessLogoOrShopPhoto) {
      setError(t("business_reg.err_photo_doc", "Please upload Shop Front Photo or Business Logo."));
      return;
    }

    // If GST number was provided in step 2, require GST Certificate
    if (data.gstNumber && !docs.gstCertificate) {
      setError(t("business_reg.err_gst_doc", "GST Certificate is required since GST number was provided in Business Details."));
      return;
    }

    if (!isAgreed) {
      setError(t("business_reg.err_agree_doc", "Please confirm that all uploaded documents are authentic and valid."));
      return;
    }

    nextStep({ documents: docs });
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
        <h4 className="text-xl font-black text-slate-900 dark:text-white">
          {t("business_reg.step5_title", "Business Verification Documents")}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t("business_reg.step5_subtitle", "Upload documents for admin compliance audit and verification.")}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-semibold animate-in fade-in">
          <ShieldAlert size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleNext} className="space-y-4">
        {/* Upload Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Business Registration / Trade License */}
          <BusinessUploadCard
            id="businessRegistrationProof"
            label={t("business_reg.doc_biz_reg", "Trade License / MSME / Shop Act")}
            subtitle="Registration cert or gumasta"
            icon={Building2}
            mandatory={true}
            docs={docs}
            previews={previews}
            fileInputRefs={fileInputRefs}
            handleFileChange={handleFileChange}
            removeFile={removeFile}
          />

          {/* 2. Owner Government ID */}
          <BusinessUploadCard
            id="ownerGovtId"
            label={t("business_reg.doc_owner_id", "Owner Govt ID (Aadhaar / PAN)")}
            subtitle="Clear front & back copy"
            icon={FileText}
            mandatory={true}
            docs={docs}
            previews={previews}
            fileInputRefs={fileInputRefs}
            handleFileChange={handleFileChange}
            removeFile={removeFile}
          />

          {/* 3. Business Address Proof */}
          <BusinessUploadCard
            id="addressProof"
            label={t("business_reg.doc_address_proof", "Business Address Proof")}
            subtitle="Electricity bill / Rent agreement"
            icon={Store}
            mandatory={true}
            docs={docs}
            previews={previews}
            fileInputRefs={fileInputRefs}
            handleFileChange={handleFileChange}
            removeFile={removeFile}
          />

          {/* 4. Shop Photo / Logo */}
          <BusinessUploadCard
            id="businessLogoOrShopPhoto"
            label={t("business_reg.doc_photo", "Shop Front Photo / Business Logo")}
            subtitle="Clear storefront photo or logo"
            icon={ImageIcon}
            mandatory={true}
            docs={docs}
            previews={previews}
            fileInputRefs={fileInputRefs}
            handleFileChange={handleFileChange}
            removeFile={removeFile}
          />

          {/* 5. GST Certificate (Optional or required if GST entered) */}
          <BusinessUploadCard
            id="gstCertificate"
            label={t("business_reg.doc_gst", "GST Registration Certificate")}
            subtitle={data.gstNumber ? "Mandatory (GSTIN provided)" : "Optional"}
            icon={FileText}
            mandatory={Boolean(data.gstNumber)}
            docs={docs}
            previews={previews}
            fileInputRefs={fileInputRefs}
            handleFileChange={handleFileChange}
            removeFile={removeFile}
          />

          {/* 6. Worker ID Proofs */}
          <BusinessUploadCard
            id="workerIdProofs"
            label={t("business_reg.doc_workers", "Worker ID Proofs (Combined PDF/Images)")}
            subtitle="Optional for fast-track verification"
            icon={Users}
            mandatory={false}
            docs={docs}
            previews={previews}
            fileInputRefs={fileInputRefs}
            handleFileChange={handleFileChange}
            removeFile={removeFile}
          />
        </div>

        {/* Declaration Checkbox */}
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
                {t("business_reg.declaration_title", "Document Authenticity Guarantee")}
              </strong>
              {t("business_reg.declaration_desc", "I declare that all uploaded certificates and identity proofs belong legitimately to this business and are legally valid for compliance verification.")}
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
            <span>{t("business_reg.next_step6", "Continue to Bank Details")}</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessStep5Documents;
