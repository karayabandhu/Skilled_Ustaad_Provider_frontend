import React, { useState } from "react";
import { Users, UserPlus, Trash2, Phone, User, Briefcase, Award, ShieldAlert, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const DEFAULT_WORKER = {
  id: "worker-1",
  name: "",
  phone: "",
  role: "Lead Technician",
  experience: "2",
  govtIdNumber: "",
};

const WORKER_ROLES = [
  "Lead Technician",
  "Senior Specialist",
  "Junior Technician",
  "Assistant / Helper",
  "Apprentice",
  "Supervisor",
];

const BusinessStep4Workers = ({ nextStep, prevStep, data }) => {
  const { t } = useTranslation();

  const [workers, setWorkers] = useState(() => {
    if (Array.isArray(data.workers) && data.workers.length > 0) {
      return data.workers;
    }
    return [{ ...DEFAULT_WORKER, id: `worker-${Date.now()}` }];
  });

  const [error, setError] = useState("");

  const addWorker = () => {
    const newWorker = {
      id: `worker-${Date.now()}-${workers.length + 1}`,
      name: "",
      phone: "",
      role: "Junior Technician",
      experience: "1",
      govtIdNumber: "",
    };
    setWorkers((prev) => [...prev, newWorker]);
  };

  const removeWorker = (id) => {
    if (workers.length <= 1) {
      setError(t("business_reg.min_worker_err", "At least one worker is mandatory for business registration."));
      return;
    }
    setWorkers((prev) => prev.filter((w) => w.id !== id));
    setError("");
  };

  const updateWorker = (id, field, value) => {
    setWorkers((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError("");

    if (workers.length === 0) {
      setError(t("business_reg.no_workers_err", "Worker details are mandatory. Please add at least 1 worker."));
      return;
    }

    const seenPhones = new Set();

    for (let i = 0; i < workers.length; i++) {
      const w = workers[i];
      const workerNum = i + 1;

      if (!w.name.trim() || !w.phone.trim() || !w.role.trim()) {
        setError(t("business_reg.worker_fields_err", "Please fill in Name, Phone, and Role for Worker #{{num}}.", { num: workerNum }));
        return;
      }

      if (!/^[a-zA-Z\s]{2,50}$/.test(w.name.trim())) {
        setError(t("business_reg.worker_name_err", "Worker #{{num}} name must contain only letters and spaces (2-50 chars).", { num: workerNum }));
        return;
      }

      if (!/^\d{10}$/.test(w.phone.trim())) {
        setError(t("business_reg.worker_phone_err", "Worker #{{num}} must have a valid 10-digit mobile number.", { num: workerNum }));
        return;
      }

      if (seenPhones.has(w.phone.trim())) {
        setError(t("business_reg.worker_dup_phone", "Duplicate phone number '{{phone}}' detected for Worker #{{num}}.", { phone: w.phone, num: workerNum }));
        return;
      }
      seenPhones.add(w.phone.trim());
    }

    nextStep({ workers });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div>
          <h4 className="text-xl font-black text-slate-900 dark:text-white">
            {t("business_reg.step4_title", "Worker & Staff Details")}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("business_reg.step4_subtitle", "Worker details are mandatory. Add technicians who will fulfill customer jobs.")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-black rounded-full border border-indigo-200 dark:border-indigo-800">
            {workers.length} {workers.length === 1 ? t("business_reg.worker", "Worker") : t("business_reg.workers", "Workers")}
          </span>
          <button
            type="button"
            onClick={addWorker}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <UserPlus size={14} />
            <span>{t("business_reg.add_worker", "Add Worker")}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-semibold animate-in fade-in">
          <ShieldAlert size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Mandatory Notice */}
      <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex items-start gap-3">
        <Users size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
          <strong className="font-bold">{t("business_reg.mandatory_note_title", "Mandatory Requirement:")}</strong>{" "}
          {t("business_reg.mandatory_note_desc", "Business registration requires at least one registered staff worker. You can add more workers or update their profiles at any time.")}
        </div>
      </div>

      <form onSubmit={handleNext} className="space-y-6">
        {/* Workers List */}
        <div className="space-y-4">
          {workers.map((worker, index) => (
            <div
              key={worker.id}
              className="p-5 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 relative transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                    {index + 1}
                  </div>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                    {t("business_reg.worker_label", "Worker #{{num}}", { num: index + 1 })}
                  </span>
                  {index === 0 && (
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
                      Primary
                    </span>
                  )}
                </div>

                {workers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWorker(worker.id)}
                    className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
                    title={t("business_reg.remove_worker", "Remove Worker")}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* Worker Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Worker Name */}
                <div className="space-y-1.5 group">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                    {t("business_reg.worker_fullname", "Worker Full Name")} *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      value={worker.name}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                        updateWorker(worker.id, "name", clean);
                      }}
                      placeholder="e.g. Sunil Verma"
                      maxLength={50}
                      className="w-full h-11 pl-10 pr-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-xs font-bold transition-all shadow-sm"
                      required
                    />
                  </div>
                </div>

                {/* Worker Phone */}
                <div className="space-y-1.5 group">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                    {t("business_reg.worker_phone", "Worker Mobile Number (10 Digits)")} *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                      <Phone size={16} />
                    </div>
                    <input
                      type="tel"
                      value={worker.phone}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, "").slice(0, 10);
                        updateWorker(worker.id, "phone", clean);
                      }}
                      placeholder="9812345678"
                      className="w-full h-11 pl-10 pr-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-xs font-bold transition-all shadow-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Role */}
                <div className="space-y-1 group">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                    {t("business_reg.role", "Designation / Role")} *
                  </label>
                  <select
                    value={worker.role}
                    onChange={(e) => updateWorker(worker.id, "role", e.target.value)}
                    className="w-full h-10 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    {WORKER_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Experience in years */}
                <div className="space-y-1 group">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                    {t("business_reg.worker_exp", "Experience (Years)")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={worker.experience}
                    onChange={(e) => updateWorker(worker.id, "experience", e.target.value)}
                    placeholder="e.g. 3"
                    className="w-full h-10 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-xs font-bold transition-all shadow-sm"
                  />
                </div>

                {/* Govt ID / Aadhaar */}
                <div className="space-y-1 group">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                    {t("business_reg.govt_id_num", "Govt ID / Aadhaar")}
                  </label>
                  <input
                    type="text"
                    value={worker.govtIdNumber}
                    onChange={(e) => updateWorker(worker.id, "govtIdNumber", e.target.value)}
                    placeholder="XXXX-XXXX-XXXX"
                    maxLength={20}
                    className="w-full h-10 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-xs font-bold transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Another Worker Button */}
        <button
          type="button"
          onClick={addWorker}
          className="w-full py-3.5 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center gap-2 transition-all group"
        >
          <UserPlus size={16} className="group-hover:scale-110 transition-transform" />
          <span>{t("business_reg.add_another_worker", "+ Add Another Worker")}</span>
        </button>

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
            <span>{t("business_reg.next_step5", "Continue to Upload Documents")}</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessStep4Workers;

