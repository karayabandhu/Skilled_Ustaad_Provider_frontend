import React, { useState } from "react";
import { User, Phone, Briefcase, Plus, Trash2, ChevronRight, Users, AlertCircle, ChevronDown } from "lucide-react";

const WORKER_ROLES = [
  "Electrician", "Plumber", "Carpenter", "Painter", "Cleaner",
  "AC Technician", "Helper / Assistant", "Supervisor", "Driver",
  "Security Guard", "Other",
];

const EMPTY_WORKER = { fullName: "", phoneNumber: "", role: "" };

const WorkerCard = ({ worker, index, onChange, onRemove, canRemove, error }) => (
  <div className="p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-black text-white">{index + 1}</span>
        </div>
        <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
          Worker {index + 1}
        </span>
      </div>
      {canRemove && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>

    {/* Full Name */}
    <div className="space-y-1 group">
      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
        Full Name
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
          <User size={15} />
        </div>
        <input
          type="text"
          value={worker.fullName}
          onChange={(e) => onChange(index, "fullName", e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
          placeholder="Worker's full name"
          maxLength={60}
          className="w-full h-11 pl-9 pr-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all"
        />
      </div>
    </div>

    {/* Phone */}
    <div className="space-y-1 group">
      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
        Phone Number
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
          <Phone size={15} />
        </div>
        <input
          type="tel"
          value={worker.phoneNumber}
          onChange={(e) => onChange(index, "phoneNumber", e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="10-digit mobile number"
          maxLength={10}
          className="w-full h-11 pl-9 pr-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all"
        />
      </div>
    </div>

    {/* Role */}
    <div className="space-y-1 group">
      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
        Role / Skill
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
          <Briefcase size={15} />
        </div>
        <select
          value={worker.role}
          onChange={(e) => onChange(index, "role", e.target.value)}
          className="w-full h-11 pl-9 pr-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all cursor-pointer appearance-none"
        >
          <option value="" disabled className="bg-white dark:bg-slate-900">Select role</option>
          {WORKER_ROLES.map((r) => (
            <option key={r} value={r} className="bg-white dark:bg-slate-900">{r}</option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <ChevronDown size={15} />
        </div>
      </div>
    </div>

    {error && (
      <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold">
        <AlertCircle size={12} />
        {error}
      </div>
    )}
  </div>
);

const BizStepWorkers = ({ nextStep, data }) => {
  const [workers, setWorkers] = useState(
    data.workers && data.workers.length > 0 ? data.workers : [{ ...EMPTY_WORKER }]
  );
  const [cardErrors, setCardErrors] = useState({});
  const [formError, setFormError] = useState("");

  const handleChange = (index, field, value) => {
    setWorkers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setCardErrors((prev) => ({ ...prev, [index]: "" }));
    setFormError("");
  };

  const handleAdd = () => {
    if (workers.length >= 20) {
      setFormError("You can add a maximum of 20 workers.");
      return;
    }
    setWorkers((prev) => [...prev, { ...EMPTY_WORKER }]);
  };

  const handleRemove = (index) => {
    setWorkers((prev) => prev.filter((_, i) => i !== index));
    setCardErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const validate = () => {
    const newErrors = {};
    let valid = true;
    const seenPhones = new Set();

    workers.forEach((w, i) => {
      if (!w.fullName.trim() || w.fullName.trim().length < 2) {
        newErrors[i] = "Full name is required (min 2 characters).";
        valid = false;
      } else if (!/^[a-zA-Z\s]{2,60}$/.test(w.fullName.trim())) {
        newErrors[i] = "Name must contain only letters and spaces.";
        valid = false;
      } else if (w.phoneNumber.length !== 10) {
        newErrors[i] = "A valid 10-digit phone number is required.";
        valid = false;
      } else if (seenPhones.has(w.phoneNumber)) {
        newErrors[i] = "Duplicate phone number — each worker must have a unique number.";
        valid = false;
      } else if (!w.role) {
        newErrors[i] = "Please select a role for this worker.";
        valid = false;
      } else {
        seenPhones.add(w.phoneNumber);
      }
    });

    setCardErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) {
      setFormError("Please fix the errors above before continuing.");
      return;
    }
    nextStep({ workers });
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-blue-600" />
          <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">
            Team Members
          </span>
        </div>
        <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-800">
          {workers.length} / 20
        </span>
      </div>

      <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/50">
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 leading-relaxed">
          At least one worker is required. Each worker must have a unique phone number.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3 max-h-[48vh] overflow-y-auto pr-1">
          {workers.map((worker, index) => (
            <WorkerCard
              key={index}
              worker={worker}
              index={index}
              onChange={handleChange}
              onRemove={handleRemove}
              canRemove={workers.length > 1}
              error={cardErrors[index]}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={workers.length >= 20}
          className="w-full h-11 border-2 border-dashed border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-2xl font-black text-sm hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={18} />
          Add Another Worker
        </button>

        {formError && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2 border border-red-100 dark:border-red-900/20">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
            {formError}
          </div>
        )}

        <button
          type="submit"
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
        >
          Continue to Documents
          <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </form>
    </div>
  );
};

export default BizStepWorkers;
