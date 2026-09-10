import React, { useState, useRef } from "react";
import { Upload, CheckCircle2, FileText, Image as ImageIcon, CreditCard, Award, ChevronRight, AlertCircle, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { uploadDocuments } from "../../services/api";

const UploadCard = ({ id, label, icon: Icon, mandatory = true, docs, previews, fileInputRefs, handleFileChange, removeFile }) => {
  const { t } = useTranslation();
  const isUploaded = !!docs[id];
  const preview = previews[id];

  return (
    <div className={`relative p-4 rounded-3xl border-2 transition-all duration-300 group ${
      isUploaded 
        ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-600/30' 
        : 'bg-slate-50 dark:bg-slate-900 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-600/50'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
          isUploaded ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500'
        }`}>
          <Icon size={24} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
            {label} {mandatory && <span className="text-red-500">*</span>}
          </h4>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            {isUploaded ? t("registration_page.step4_file_selected", "File Selected") : t("registration_page.step4_tap_upload", "Tap to Upload")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isUploaded ? (
            <button 
              type="button"
              onClick={() => removeFile(id)}
              className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
            >
              <Trash2 size={16} />
            </button>
          ) : (
            <button 
              type="button"
              onClick={() => fileInputRefs[id].current?.click()}
              className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 hover:scale-110 transition-transform"
            >
              <Upload size={18} />
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

const Step4Identity = ({ nextStep, data }) => {
  const { t } = useTranslation();
  const [docs, setDocs] = useState({
    profilePhoto: data.profilePhoto || null,
    governmentIDProof: data.governmentIDProof || null,
    addressProof: data.addressProof || null,
    skillCertificate: data.skillCertificate || null,
  });

  const [previews, setPreviews] = useState({
    profilePhoto: null,
    governmentIDProof: null,
    addressProof: null,
    skillCertificate: null,
  });

  const [isAgreed, setIsAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRefs = {
    profilePhoto: useRef(null),
    governmentIDProof: useRef(null),
    addressProof: useRef(null),
    skillCertificate: useRef(null),
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setDocs((prev) => ({ ...prev, [field]: file }));
      setPreviews((prev) => ({ ...prev, [field]: URL.createObjectURL(file) }));
      setError("");
    }
  };

  const removeFile = (field) => {
    setDocs(prev => ({ ...prev, [field]: null }));
    setPreviews(prev => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!docs.profilePhoto || !docs.governmentIDProof || !docs.addressProof) {
      setError(t("registration_page.step4_err_required", "Please upload required documents (Profile, ID, and Address Proof). Skill certificate is optional."));
      return;
    }
    if (!isAgreed) {
      setError(t("registration_page.step4_err_auth", "Please confirm the authenticity of your documents."));
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("Documents being uploaded:", Object.keys(docs).filter(k => !!docs[k]));
      await uploadDocuments(docs);
      
      console.log("Documents uploaded successfully");
      nextStep(docs);
    } catch (err) {
      console.error("Upload failed in Step4:", err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      setError(serverMsg || t("registration_page.step4_err_failed", "File upload failed. Please ensure files are under 20MB and try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UploadCard 
          id="profilePhoto" label={t("profile.profile_photo", "Profile Photo")} icon={ImageIcon} 
          docs={docs} previews={previews} fileInputRefs={fileInputRefs} 
          handleFileChange={handleFileChange} removeFile={removeFile} 
        />
        <UploadCard 
          id="governmentIDProof" label={t("profile.govt_id_proof", "Govt ID Proof")} icon={CreditCard} 
          docs={docs} previews={previews} fileInputRefs={fileInputRefs} 
          handleFileChange={handleFileChange} removeFile={removeFile} 
        />
        <UploadCard 
          id="addressProof" label={t("profile.address_proof", "Address Proof")} icon={FileText} 
          docs={docs} previews={previews} fileInputRefs={fileInputRefs} 
          handleFileChange={handleFileChange} removeFile={removeFile} 
        />
        <UploadCard 
          id="skillCertificate" label={t("profile.skill_certificate", "Skill Certificate")} icon={Award} mandatory={false} 
          docs={docs} previews={previews} fileInputRefs={fileInputRefs} 
          handleFileChange={handleFileChange} removeFile={removeFile} 
        />
      </div>

      <div className="p-5 rounded-[2rem] bg-blue-50/30 dark:bg-slate-900/50 border border-blue-100 dark:border-blue-900/10">
        <label className="flex items-start gap-4 cursor-pointer group">
          <div className="relative flex items-center h-6">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="peer hidden"
            />
            <div className="w-6 h-6 rounded-lg border-2 border-slate-300 dark:border-slate-700 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
              <CheckCircle2 size={14} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
          </div>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
            {t("registration_page.step4_declaration", "I hereby declare that all provided documents are authentic and I agree to Skilled Ustaad's Partner Terms & Privacy Policy.")}
          </p>
        </label>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2 border border-red-100 dark:border-red-900/20">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <button
        type="submit"
        onClick={handleSubmit}
        disabled={loading}
        className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
      >
        {loading ? t("registration_page.step4_uploading", "Uploading Vault...") : t("registration_page.step4_setup_payouts", "Setup Payouts")}
        <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default Step4Identity;