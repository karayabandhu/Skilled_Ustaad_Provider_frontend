import React from "react";
import {
  User, Building2, MapPin, Users, FileText,
  CreditCard, Pencil, ChevronRight, CheckCircle2,
} from "lucide-react";

const Section = ({ icon: Icon, title, stepIndex, onEdit, children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
      <div className="flex items-center gap-2">
        <Icon size={15} className="text-blue-600" />
        <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">
          {title}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onEdit(stepIndex)}
        className="flex items-center gap-1 text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest"
      >
        <Pencil size={11} />
        Edit
      </button>
    </div>
    <div className="px-5 py-4 space-y-1.5">{children}</div>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between items-start gap-4 py-1 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">{label}</span>
    <span className="text-xs font-bold text-slate-800 dark:text-white text-right break-all">
      {value || <span className="text-slate-300 dark:text-slate-600 italic font-normal">—</span>}
    </span>
  </div>
);

const BizStepReview = ({ data, onEdit, onSubmit, loading }) => {
  const workers = data.workers || [];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex items-start gap-3">
        <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 leading-relaxed">
          Review all your details before submitting. Click <strong>Edit</strong> on any section to go back and make changes.
        </p>
      </div>

      {/* Owner Details — step 1 */}
      <Section icon={User} title="Owner Details" stepIndex={1} onEdit={onEdit}>
        <Row label="Full Name" value={data.fullName} />
        <Row label="Phone" value={data.phoneNumber} />
        <Row label="Email" value={data.email} />
      </Section>

      {/* Business Details — step 2 */}
      <Section icon={Building2} title="Business Details" stepIndex={2} onEdit={onEdit}>
        <Row label="Business Name" value={data.businessName} />
        <Row label="Business Type" value={data.businessType} />
        <Row label="Address" value={data.businessAddress} />
        <Row label="City" value={data.businessCity} />
        <Row label="State" value={data.businessState} />
        <Row label="PIN Code" value={data.businessPinCode} />
        <Row label="GST Number" value={data.gstNumber || "Not provided"} />
      </Section>

      {/* Services & Location — step 3 */}
      <Section icon={MapPin} title="Services & Location" stepIndex={3} onEdit={onEdit}>
        <Row label="Service Sector" value={data.serviceCategory} />
        <Row label="Expert Trade" value={data.providerSubService} />
        <Row
          label="Specific Tasks"
          value={Array.isArray(data.subService) && data.subService.length > 0
            ? data.subService.join(", ")
            : null}
        />
        <Row label="Experience" value={data.experience ? `${data.experience} years` : null} />
        <Row label="City" value={data.city} />
        <Row label="State" value={data.state} />
        <Row label="PIN Code" value={data.pinCode} />
        <Row label="Languages" value={data.languageSpoken} />
      </Section>

      {/* Workers — step 4 */}
      <Section icon={Users} title={`Workers (${workers.length})`} stepIndex={4} onEdit={onEdit}>
        {workers.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No workers added.</p>
        ) : (
          workers.map((w, i) => (
            <div key={i} className="py-1.5 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
              <p className="text-xs font-bold text-slate-800 dark:text-white">
                {i + 1}. {w.fullName}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {w.phoneNumber} · {w.role}
              </p>
            </div>
          ))
        )}
      </Section>

      {/* Documents — step 5 */}
      <Section icon={FileText} title="Documents" stepIndex={5} onEdit={onEdit}>
        <Row label="Profile Photo" value={data.profilePhoto ? "Uploaded ✓" : "Not uploaded"} />
        <Row label="Govt ID Proof" value={data.governmentIDProof ? "Uploaded ✓" : "Not uploaded"} />
        <Row label="Address Proof" value={data.addressProof ? "Uploaded ✓" : "Not uploaded"} />
        <Row label="Skill Certificate" value={data.skillCertificate ? "Uploaded ✓" : "Not provided (optional)"} />
      </Section>

      {/* Bank Details — step 6 */}
      <Section icon={CreditCard} title="Bank Details" stepIndex={6} onEdit={onEdit}>
        <Row label="Account Holder" value={data.accountHolderName} />
        <Row
          label="Account Number"
          value={data.bankAccountNumber
            ? `${"*".repeat(Math.max(0, data.bankAccountNumber.length - 4))}${data.bankAccountNumber.slice(-4)}`
            : null}
        />
        <Row label="IFSC Code" value={data.ifscCode} />
        <Row label="UPI ID" value={data.upiId} />
      </Section>

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
      >
        {loading ? "Submitting Application..." : "Submit Application"}
        {!loading && (
          <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
        )}
      </button>

      <p className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        Your application will be reviewed by our admin team within 24–48 hours.
      </p>
    </div>
  );
};

export default BizStepReview;
