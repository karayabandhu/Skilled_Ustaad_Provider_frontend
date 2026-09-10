import React, { useState, useEffect, useRef } from "react";
import { 
  Upload, 
  Pencil, 
  CheckCircle, 
  Bell, 
  RefreshCcw, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Star, 
  ShieldCheck,
  CreditCard,
  Target,
  TrendingUp,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getFriendlyErrorMessage } from "../utils/errors";
import { 
  getProviderProfile, 
  getProviderDashboard, 
  api, 
  updateServiceDetails, 
  getServiceHierarchy 
} from "../services/api";
import { Button } from "../components/ui/button";

/* ================= Helper Components ================= */

const DataField = ({ label, value, isUpload, isTotalEarnings, isOptional }) => {
  const { t } = useTranslation();
  return (
  <div
    className={`flex justify-between items-center py-2 border-t border-gray-100 dark:border-gray-700/50 ${isTotalEarnings ? "mt-4 pt-4 border-t-2" : ""
      }`}
  >
    <span
      className={`text-gray-500 dark:text-gray-400 ${isTotalEarnings ? "font-bold" : "font-medium"
        }`}
    >
      {label}
    </span>

    <span
      className={`text-gray-900 dark:text-white text-right ${isTotalEarnings ? "font-bold text-lg text-green-600" : ""
        } ${isUpload ? "flex items-center font-semibold" : ""}`}
    >
      {isUpload && value ? (
        <>
          <CheckCircle className="mr-1 w-4 h-4 text-green-500" />
          <a
            href={value && value.startsWith("http") ? value : (value && value.startsWith("/uploads/") ? `${BACKEND_URL}${value}` : `${BACKEND_URL}/uploads/${value}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center"
          >
            <span className="truncate max-w-[150px]">{value}</span>
          </a>
        </>
      ) : isUpload ? (
        isOptional ? (
          <span className="text-gray-400 dark:text-gray-500 italic">{t('profile.optional')}</span>
        ) : (
          <span className="text-red-500 flex items-center text-[10px] font-black uppercase">
            <Upload className="mr-1 w-3 h-3" /> {t('profile.required')}
          </span>
        )
      ) : Array.isArray(value) ? (
        <div className="flex flex-wrap justify-end gap-1.5 mt-1">
          {value.length > 0 ? (
            value.map((v, i) => (
              <span key={i} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[11px] font-bold rounded-full border border-blue-100 dark:border-blue-800">
                {v}
              </span>
            ))
          ) : (
            <span className="text-gray-400 italic text-sm">{t('profile.none_selected')}</span>
          )}
        </div>
      ) : (
        value
      )}
    </span>
  </div>
  );
};

/* ================= Upload Base ================= */

/* ================= Backend Base URL ================= */

const BACKEND_URL = (() => {
  const base = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || "http://localhost:5000/api/v1";
  
  // If it doesn't start with a protocol, assume http
  let urlStr = base;
  if (!/^https?:\/\//i.test(base)) {
    urlStr = `http://${base.replace(/^\/+/, "")}`;
  }

  try {
    const url = new URL(urlStr);
    // Return protocol + host (which includes port)
    return `${url.protocol}//${url.host}`;
  } catch (e) {
    console.warn("Failed to parse VITE_API_BASE, defaulting to localhost:5000", e);
    return "http://localhost:5000";
  }
})();

const UPLOADS_BASE = `${BACKEND_URL}/uploads`;

/* ================= Profile Image ================= */

const ProfileImage = ({ src, preview, onEdit }) => {
  const { t } = useTranslation();

  const renderImage = () => {
    if (preview) {
      return (
        <img
          src={preview}
          alt="Profile Preview"
          className="w-full h-full object-cover"
        />
      );
    }

    if (!src) return null;

    const srcStr = String(src).trim();
    let imageUrl = srcStr;

    if (!/^https?:\/\//i.test(srcStr)) {
      imageUrl = srcStr.startsWith("/uploads/")
        ? `${BACKEND_URL}${srcStr}`
        : `${BACKEND_URL}/uploads/${srcStr.replace(/^\//, "")}`;
    }

    return (
      <img
        src={imageUrl}
        alt="Profile"
        className="w-full h-full object-cover shadow-sm"
        crossOrigin="anonymous"
      />
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-40 h-40 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden border-4 border-blue-500/30 shadow-md">
        {(preview || src) ? (
          renderImage()
        ) : (
          <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">
            {t('profile.profile_photo')}
          </span>
        )}
      </div>

      <button
        className="mt-3 text-blue-600 hover:text-blue-700 font-semibold flex items-center transition-colors text-sm"
        onClick={onEdit}
        type="button"
      >
        <Pencil className="w-4 h-4 mr-1.5" />
        {t('profile.edit')} <span className="hidden sm:inline ml-1">{t('profile.profile_photo')}</span>
      </button>
    </div>
  );
};

/* ================= Utility Functions ================= */

const maskAccountNumber = (accountNumber) => {
  if (!accountNumber || accountNumber.length < 4)
    return "**********";
  return (
    "*".repeat(accountNumber.length - 4) +
    accountNumber.slice(-4)
  );
};

const displayStatus = (s, t) => {
  const key = String(s || "").trim().toLowerCase();
  if (!key) return t('profile.pending');

  const map = {
    pending: t('profile.pending'),
    active: t('profile.active'),
    suspended: t('profile.suspended'),
  };

  return map[key] || String(s);
};

/* ================= MAIN COMPONENT ================= */

const ProfileDetailsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [providerData, setProviderData] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: "", languageSpoken: "" });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [showEditProfessionalModal, setShowEditProfessionalModal] = useState(false);
  const [editProfForm, setEditProfForm] = useState({ experience: "", availability: "" });
  const [updatingProfessional, setUpdatingProfessional] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [updatingTasks, setUpdatingTasks] = useState(false);
  const profilePhotoInputRef = useRef();

  /* ================= Fetch Data From API ================= */

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getProviderProfile();
      const provider = res.data?.provider;

      if (provider) {
        setProviderData(provider);
        localStorage.setItem("providerData", JSON.stringify(provider));
      } else {
        setProviderData({});
      }
    } catch (error) {
      console.error("Profile fetch failed:", error);
      setProviderData({});
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await getProviderDashboard();
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error("Stats fetch failed:", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/provider/notifications/unread-count");
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchStats();
    fetchUnreadCount();
  }, []);

  if (providerData === null) {
    return (
      <div className="p-6 text-center text-xl font-semibold text-gray-600 dark:text-gray-400">
        {t('profile.title')}...
      </div>
    );
  }

  const data = providerData || {};

  /* ================= Profile Photo Upload (Local Only UI) ================= */

  const handleProfilePhotoEdit = () => {
    profilePhotoInputRef.current.click();
  };

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Show immediate local preview
    const previewUrl = URL.createObjectURL(file);
    setProviderData((prev) => ({
      ...prev,
      profilePhotoPreview: previewUrl,
    }));

    // 2. Upload to backend
    try {
      // Need `uploadDocuments` from api.js
      const { uploadDocuments } = await import("../services/api");
      const filesToUpload = { profilePhoto: file };
      await uploadDocuments(filesToUpload);
      
      // Fetch updated profile
      const res = await getProviderProfile();
      if (res.data?.provider) {
        setProviderData(res.data.provider);
      }
    } catch (err) {
      console.error("Failed to upload profile photo:", err);
      toast.error(getFriendlyErrorMessage(err, t('profile.saving')));
    }
  };

  /* ================= Task Update Logic ================= */

  const handleOpenTaskModal = async () => {
    try {
      setLoading(true);
      const res = await getServiceHierarchy();
      const hierarchy = res.data?.hierarchy || {};
      
      // Hierarchy is an object: { "Sector Name": { "Trade Name": ["Task 1", "Task 2"] } }
      const sectorData = hierarchy[data.serviceCategory];
      
      if (sectorData) {
        const tradeTasks = sectorData[data.providerSubService];
        if (tradeTasks && Array.isArray(tradeTasks)) {
          setAvailableTasks(tradeTasks);
          setSelectedTasks(Array.isArray(data.subService) ? [...data.subService] : (data.subService ? [data.subService] : []));
          setShowTaskModal(true);
        } else {
          toast.error(`No services found for sector: ${data.serviceCategory}`);
        }
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      toast.error("Could not load available tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = (task) => {
    setSelectedTasks(prev => {
      if (prev.includes(task)) {
        return prev.filter(t => t !== task);
      }
      if (prev.length >= 4) {
        toast.warning(t('profile.choose_tasks_desc') + " 4");
        return prev;
      }
      return [...prev, task];
    });
  };

  const handleSaveTasks = async () => {
    if (selectedTasks.length === 0) {
      toast.error("Please select at least one task.");
      return;
    }

    try {
      setUpdatingTasks(true);
      const updateData = {
        serviceCategory: data.serviceCategory,
        providerSubService: data.providerSubService || "",
        subService: selectedTasks,
        experience: Number(data.experience || 0),
        languageSpoken: data.languageSpoken,
        houseNumber: data.address?.houseNumber || "",
        colony: data.address?.colony || "",
        landmark: data.address?.landmark || "",
        city: data.city || "",
        state: data.state || "",
        pinCode: data.pinCode || "",
        latitude: data.location?.coordinates?.[1] || null,
        longitude: data.location?.coordinates?.[0] || null
      };
      
      await updateServiceDetails(updateData);
      toast.success("Tasks updated successfully!");
      setShowTaskModal(false);
      fetchProfile(); // Refresh local state
    } catch (err) {
      console.error("Failed to update tasks:", err);
      toast.error(getFriendlyErrorMessage(err, "Failed to update tasks."));
    } finally {
      setUpdatingTasks(false);
    }
  };

  const handleOpenEditModal = () => {
    setEditForm({
      fullName: data.fullName || "",
      languageSpoken: data.languageSpoken || "",
    });
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editForm.fullName.trim()) {
      toast.error("Full Name cannot be empty.");
      return;
    }

    try {
      setUpdatingProfile(true);
      const { updateProviderProfile } = await import("../services/api");

      await updateProviderProfile(editForm);
      toast.success("Profile updated successfully!");
      setShowEditProfileModal(false);
      fetchProfile();
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error(getFriendlyErrorMessage(err, "Failed to update profile."));
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleOpenProfessionalModal = () => {
    setEditProfForm({
      experience: String(data.experience || "0"),
      availability: data.availability || "Full-Time",
    });
    setShowEditProfessionalModal(true);
  };

  const handleSaveProfessionalInfo = async () => {
    const expValue = editProfForm.experience === "" ? 0 : Number(editProfForm.experience);
    if (isNaN(expValue) || expValue < 0 || expValue > 60) {
      toast.error("Please enter a valid experience (0-60 years).");
      return;
    }

    try {
      setUpdatingProfessional(true);
      const { updateProviderProfile } = await import("../services/api");

      const payload = {
        experience: expValue,
        availability: editProfForm.availability,
      };

      await updateProviderProfile(payload);
      toast.success("Professional info updated successfully!");
      setShowEditProfessionalModal(false);
      fetchProfile();
    } catch (err) {
      console.error("Failed to update professional info:", err);
      toast.error(getFriendlyErrorMessage(err, "Failed to update professional info."));
    } finally {
      setUpdatingProfessional(false);
    }
  };
  /* ================= Defaults ================= */

  const defaults = {
    fullName: "N/A",
    phoneNumber: "N/A",
    serviceCategory: "N/A",
    providerSubService: "N/A",
    subService: "N/A",
    experience: "0",
    serviceArea: "Not set",
    pinCode: "N/A",
    languageSpoken: "N/A",
    availability: "Full-Time",
    profilePhoto: "",
    governmentIDProof: "",
    addressProof: "",
    skillCertificate: "",
    status: "pending",
    bankAccountNumber: "**********",
    ifscCode: "N/A",
    accountHolderName: "N/A",
    upiId: "N/A",
    totalEarnings: "₹0",
    averageRating: "0/5",
    completedJobs: "0",
    ongoingJobs: "0",
    jobCompletionRate: "0%",
  };

  const mergedData = { ...defaults, ...data };

  /* ================= UI ================= */

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {mergedData.fullName || t('profile.title')}
        </h2>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { fetchProfile(); fetchStats(); fetchUnreadCount(); }}
            disabled={loading}
            className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <RefreshCcw
              className={`h-4 w-4 sm:mr-2 ${loading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">{t('profile.refresh')}</span>
          </Button>

          <div
            className="relative cursor-pointer hover:scale-110 transition-transform p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => navigate("/profile/chats")}
            title={t('profile.conversations')}
          >
            <MessageSquare className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </div>

          <div
            className="relative cursor-pointer hover:scale-110 transition-transform p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => navigate("/profile/notifications")}
          >
            <Bell className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* LEFT COLUMN */}
        <div className="md:col-span-2 space-y-6">

          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                {t('profile.basic_info')}
              </h2>
              <button 
                onClick={handleOpenEditModal}
                className="text-blue-600 text-[10px] sm:text-xs font-bold flex items-center hover:underline bg-blue-50 dark:bg-blue-900/30 px-2 sm:px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800 transition-colors"
                title={t('profile.edit_basic_info')}
              >
                <Pencil size={12} className="mr-1 sm:mr-1.5" /> {t('profile.edit')} <span className="hidden sm:inline ml-0.5">{t('profile.basic_info')}</span>
              </button>
            </div>

            <DataField label={t('profile.full_name')} value={mergedData.fullName} />
            <DataField label={t('profile.contact_number')} value={mergedData.phoneNumber} />

            <div className="flex justify-between items-start py-2 mt-2 pt-2">
              <span className="text-gray-500 font-medium">
                {t('profile.service_location')}
              </span>

              <p className="text-right text-gray-900 dark:text-white max-w-xs">
                {mergedData.city}, {mergedData.state} ({mergedData.pinCode})
              </p>
            </div>

            <DataField
              label={t('profile.language_spoken')}
              value={mergedData.languageSpoken}
            />
          </div>

          {/* Professional Info */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-500" />
                {t('profile.professional_info')}
              </h2>
              <button 
                onClick={handleOpenProfessionalModal}
                className="text-blue-600 text-[10px] sm:text-xs font-bold flex items-center hover:underline bg-blue-50 dark:bg-blue-900/30 px-2 sm:px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800 transition-colors"
                title={t('profile.edit_stats')}
              >
                <Pencil size={12} className="mr-1 sm:mr-1.5" /> {t('profile.edit')} <span className="hidden sm:inline ml-0.5">{t('profile.professional_info')}</span>
              </button>
            </div>

            <DataField
              label={t('profile.service_sector')}
              value={mergedData.serviceCategory}
            />

            <DataField
              label={t('profile.expert_trade')}
              value={mergedData.providerSubService}
            />

            <div className="flex justify-between items-start py-2 mt-1 pt-2">
              <div className="flex flex-col">
                <span className="text-gray-500 font-medium">{t('profile.specific_tasks')}</span>
                <button 
                  onClick={handleOpenTaskModal}
                  className="text-blue-600 text-[10px] sm:text-xs font-bold flex items-center mt-1 hover:underline bg-blue-50/50 dark:bg-blue-900/20 px-2 py-1 rounded-md"
                >
                  <Pencil size={12} className="mr-1" /> {t('profile.edit')} <span className="hidden sm:inline ml-0.5">{t('profile.specific_tasks')}</span>
                </button>
              </div>
              <div className="flex flex-wrap justify-end gap-1.5 max-w-[200px]">
                {Array.isArray(mergedData.subService) && mergedData.subService.length > 0 ? (
                  mergedData.subService.map((task, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full border border-blue-100 dark:border-blue-800">
                      {task}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 italic text-sm">{mergedData.subService || t('profile.none_selected')}</span>
                )}
              </div>
            </div>

            <DataField
              label={t('profile.experience')}
              value={mergedData.experience + " " + t('profile.years')}
            />

            <DataField
              label={t('profile.skill_certificate')}
              value={mergedData.skillCertificate}
              isUpload
              isOptional
            />

            <DataField
              label={t('profile.availability')}
              value={mergedData.availability}
            />
          </div>

          {/* Verification */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              {t('profile.verification_status')}
            </h2>

            <DataField
              label={t('profile.profile_photo')}
              value={mergedData.profilePhoto}
              isUpload
            />

            <DataField
              label={t('profile.govt_id_proof')}
              value={mergedData.governmentIDProof}
              isUpload
            />

            <DataField
              label={t('profile.address_proof')}
              value={mergedData.addressProof}
              isUpload
            />

            <DataField
              label={t('profile.background_check')}
              value={displayStatus(mergedData.status, t)}
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="md:col-span-1 space-y-6">

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 flex flex-col items-center">
            <ProfileImage
              src={mergedData.profilePhoto}
              preview={providerData?.profilePhotoPreview}
              onEdit={handleProfilePhotoEdit}
            />

            <input
              type="file"
              ref={profilePhotoInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleProfilePhotoUpload}
            />
          </div>

          {/* Financial */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              {t('profile.financial_info')}
            </h2>

            <DataField
              label={t('profile.account_holder')}
              value={mergedData.accountHolderName}
            />

            <DataField
              label={t('profile.bank_account_no')}
              value={
                mergedData.bankAccountNumber
                  ? maskAccountNumber(mergedData.bankAccountNumber)
                  : defaults.bankAccountNumber
              }
            />

            <DataField label={t('profile.ifsc_code')} value={mergedData.ifscCode} />
            <DataField label={t('profile.upi_id')} value={mergedData.upiId} isOptional />

            <DataField
              label={t('profile.total_earnings')}
              value={stats ? `₹${stats.totalEarnings?.toLocaleString() || 0}` : defaults.totalEarnings}
              isTotalEarnings
            />
          </div>

          {/* Performance */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              {t('profile.performance_metrics')}
            </h2>

            <DataField
              label={t('profile.average_rating')}
              value={stats ? `${stats.averageRating?.toFixed(1) || 0}/5` : defaults.averageRating}
            />

            <DataField
              label={t('profile.completed_jobs')}
              value={stats?.completedJobs !== undefined ? stats.completedJobs : defaults.completedJobs}
            />

            {(() => {
              const completed = Number(stats?.completedJobs || 0);
              const ongoing = Number(stats?.ongoingJobs || 0);
              const total = completed + ongoing;
              const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <DataField
                  label={t('profile.completion_rate')}
                  value={stats ? `${rate}%` : defaults.jobCompletionRate}
                />
              );
            })()}
          </div>

        </div>
      </div>

      {/* ================= TASK UPDATE MODAL ================= */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {/* <Sparkles className="w-5 h-5 text-blue-500" /> */}
                  {t('profile.manage_tasks')}
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  {t('profile.choose_tasks_desc')} {mergedData.providerSubService}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                  {selectedTasks.length}/4 {t('common.success').toLowerCase()}
                </span>
              </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-2.5">
                {availableTasks.map((task, idx) => {
                  const isSelected = selectedTasks.includes(task);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleToggleTask(task)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all duration-200 ${
                        isSelected 
                          ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" 
                          : "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-600"
                      }`}
                    >
                      <span className={`text-sm font-bold ${isSelected ? "opacity-100" : "opacity-80"}`}>{task}</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isSelected ? "bg-blue-500 scale-110 shadow-lg shadow-blue-500/20" : "border-2 border-gray-200 dark:border-gray-700"
                      }`}>
                        {isSelected && <CheckCircle className="text-white w-4 h-4" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex gap-3">
              <button 
                className="flex-1 rounded-2xl h-12 font-bold border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setShowTaskModal(false)}
                disabled={updatingTasks}
              >
                {t('profile.cancel')}
              </button>
              <button 
                className="flex-1 rounded-2xl h-12 font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-all"
                onClick={handleSaveTasks}
                disabled={updatingTasks}
              >
                {updatingTasks ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCcw className="w-4 h-4 animate-spin" /> {t('profile.saving')}
                  </span>
                ) : t('profile.save_changes')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================= EDIT BASIC INFO MODAL ================= */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-500" />
                {t('profile.edit_basic_info')}
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {t('profile.update_profile_desc')}
              </p>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">{t('profile.full_name')}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({...editForm, fullName: e.target.value.replace(/[^A-Za-z\s]/g, "")})}
                    placeholder="Enter your full name"
                    className="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none text-sm font-bold dark:text-white transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">{t('profile.language_spoken')}</label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={editForm.languageSpoken}
                    onChange={(e) => setEditForm({...editForm, languageSpoken: e.target.value})}
                    placeholder="e.g. Hindi, English"
                    className="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none text-sm font-bold dark:text-white transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 leading-relaxed italic">
                  {t('profile.security_note')}
                </p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex gap-3 shadow-inner">
              <button 
                className="flex-1 rounded-2xl h-12 font-bold border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-xs uppercase tracking-widest"
                onClick={() => setShowEditProfileModal(false)}
                disabled={updatingProfile}
              >
                {t('profile.cancel')}
              </button>
              <button 
                className="flex-1 rounded-2xl h-12 font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20 text-xs uppercase tracking-widest"
                onClick={handleSaveProfile}
                disabled={updatingProfile}
              >
                {updatingProfile ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCcw className="w-4 h-4 animate-spin" /> {t('profile.saving')}
                  </span>
                ) : t('profile.save_changes')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT PROFESSIONAL INFO MODAL ================= */}
      {showEditProfessionalModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-500" />
                {t('profile.professional_info')}
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Update your experience and availability details.
              </p>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">
                  {t('profile.experience')} ({t('profile.years')}) — max 60
                </label>
                <div className="relative">
                  <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={editProfForm.experience}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*$/.test(val) && (val === "" || Number(val) <= 60)) {
                        setEditProfForm({...editProfForm, experience: val});
                      }
                    }}
                    inputMode="numeric"
                    placeholder="e.g. 5"
                    className="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none text-sm font-bold dark:text-white transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">
                  {t('profile.availability')}
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    value={editProfForm.availability}
                    onChange={(e) => setEditProfForm({...editProfForm, availability: e.target.value})}
                    className="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none text-sm font-bold dark:text-white transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Weekends">Weekends Only</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/50">
                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 leading-relaxed italic">
                  Service Sector and Expert Trade can only be changed by contacting support.
                </p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex gap-3 shadow-inner">
              <button 
                className="flex-1 rounded-2xl h-12 font-bold border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-xs uppercase tracking-widest"
                onClick={() => setShowEditProfessionalModal(false)}
                disabled={updatingProfessional}
              >
                {t('profile.cancel')}
              </button>
              <button 
                className="flex-1 rounded-2xl h-12 font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20 text-xs uppercase tracking-widest"
                onClick={handleSaveProfessionalInfo}
                disabled={updatingProfessional}
              >
                {updatingProfessional ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCcw className="w-4 h-4 animate-spin" /> {t('profile.saving')}
                  </span>
                ) : t('profile.save_changes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDetailsPage;