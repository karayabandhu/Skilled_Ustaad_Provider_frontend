/* eslint-disable no-unused-vars */
import React, { useRef, useState, useEffect } from "react";
import {
  useJsApiLoader,
  Autocomplete,
  GoogleMap,
  Marker,
} from "@react-google-maps/api";
import {
  ChevronRight,
  ChevronLeft,
  Briefcase,
  MapPin,
  Globe2,
  Building2,
  ChevronDown,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getServiceHierarchy } from "../../../services/api";

const GOOGLE_MAP_KEY = import.meta.env.VITE_GOOGLE_MAP_KEY;
const GOOGLE_LIBRARIES = ["places"];

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#38bdf8" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
];

const lightMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#475569" }] },
];

const DEFAULT_HIERARCHY = {
  "Home Services": {
    Cleaning: [
      "Deep Cleaning",
      "Sofa & Carpet Cleaning",
      "Kitchen Deep Clean",
    ],
    Plumbing: [
      "Tap & Shower Repair",
      "Drainage Unblocking",
      "Full Home Checkup",
      "Pipe Leakage",
    ],
    Electrical: [
      "Fan Repair/Install",
      "Switchboard Install",
      "Light Installation",
      "Internal Wiring",
    ],
    "AC & Appliance": [
      "AC Deep Cleaning",
      "AC Installation",
      "Washing Machine Repair",
      "Refrigerator Repair",
    ],
    Carpentry: [
      "Furniture Repair",
      "Lock Installation",
      "New Furniture Making",
      "Door/Window Repair",
    ],
    Painting: [
      "Full Home Painting",
      "Texture Wall",
      "Waterproofing",
      "Touch-up Painting",
    ],
  },
  "Professional Works": {
    Legal: ["Contract Drafting", "Legal Consultation", "Property Dispute"],
    "Accounting & Tax": ["ITR Filing", "GST Return", "Bookkeeping"],
    Architecture: ["Floor Planning", "3D Interior Design", "Site Supervision"],
    "Digital Marketing": ["SEO Optimization", "Social Media Management", "PPC Campaigns"],
  },
  "Digital Services": {
    "Digital Work": ["WordPress Website", "E-commerce Site", "Custom Web App"],
    "Graphic Design": ["Logo Branding", "Social Media Posts", "UI/UX Design"],
    "Content Creation": ["Blog Writing", "Technical Writing", "Copywriting"],
    "Video Editing": ["Reels & Shorts", "YouTube Video", "Corporate Video"],
  },
  "Construction & Maintenance": {
    Masonry: ["Brick Work", "Plastering", "Tile Laying"],
    Welding: ["Grill Fabrication", "Gate Repair", "Shed Installation"],
    Roofing: ["Waterproof Coating", "Tin Sheet Fix", "Tile Replacement"],
  },
  "Delivery & Moving": {
    "Packers & Movers": ["Local Home Shifting", "Intercity Moving", "Vehicle Transport"],
    "Courier & Delivery": ["Document Pickup", "Parcel Delivery", "Same-Day Express"],
  },
};

const BusinessStep3Services = ({ nextStep, prevStep, data }) => {
  const { t } = useTranslation();
  const autocompleteRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAP_KEY || "",
    libraries: GOOGLE_LIBRARIES,
  });

  const [hierarchy, setHierarchy] = useState(DEFAULT_HIERARCHY);
  const [hierarchyLoading, setHierarchyLoading] = useState(true);

  const [serviceCategory, setServiceCategory] = useState(data.serviceCategory || "");
  const [providerSubService, setProviderSubService] = useState(data.providerSubService || "");
  const [subService, setSubService] = useState(
    Array.isArray(data.subService) ? data.subService : data.subService ? [data.subService] : []
  );
  const [experience, setExperience] = useState(data.experience || "");
  const [languageSpoken, setLanguageSpoken] = useState(data.languageSpoken || "Hindi, English");
  const [latitude, setLatitude] = useState(data.latitude || 22.5726);
  const [longitude, setLongitude] = useState(data.longitude || 88.3639);
  const [serviceArea, setServiceArea] = useState(data.colony || data.city || "");
  const [locationVerified, setLocationVerified] = useState(Boolean(data.latitude && data.longitude));
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const res = await getServiceHierarchy();
        if (res.data?.success && Object.keys(res.data.hierarchy || {}).length > 0) {
          setHierarchy((prev) => ({ ...prev, ...res.data.hierarchy }));
        }
      } catch (err) {
        // Fall back gracefully to local DEFAULT_HIERARCHY
      } finally {
        setHierarchyLoading(false);
      }
    };
    fetchHierarchy();
  }, []);

  // Update sub-service list when category changes
  const availableSubServices = serviceCategory && hierarchy[serviceCategory] ? Object.keys(hierarchy[serviceCategory]) : [];
  const availableTasks =
    serviceCategory && providerSubService && hierarchy[serviceCategory]?.[providerSubService]
      ? hierarchy[serviceCategory][providerSubService]
      : [];

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setServiceCategory(cat);
    setProviderSubService("");
    setSubService([]);
  };

  const handleSubServiceChange = (e) => {
    const sub = e.target.value;
    setProviderSubService(sub);
    setSubService([]);
  };

  const toggleTask = (task) => {
    setSubService((prev) =>
      prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]
    );
  };

  const handlePlaceChange = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place || !place.geometry) return;

    setServiceArea(place.formatted_address || "");
    setLatitude(place.geometry.location.lat());
    setLongitude(place.geometry.location.lng());
    setLocationVerified(true);
    setError("");
  };

  const handleMarkerDragEnd = (e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    setLatitude(newLat);
    setLongitude(newLng);
    setLocationVerified(true);
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError("");

    if (!serviceCategory || !providerSubService) {
      setError(t("business_reg.step3_err_category", "Please select primary service category and specialization."));
      return;
    }

    if (subService.length === 0) {
      setError(t("business_reg.step3_err_tasks", "Please select at least one service task / capability offered by your business."));
      return;
    }

    const expNum = Number(experience);
    if (!experience || isNaN(expNum) || expNum < 1 || expNum > 50) {
      setError(t("business_reg.step3_err_exp", "Please enter business establishment experience between 1 and 50 years."));
      return;
    }

    if (!languageSpoken.trim()) {
      setError(t("business_reg.step3_err_lang", "Please enter languages spoken by your business team."));
      return;
    }

    nextStep({
      serviceCategory,
      providerSubService,
      subService,
      experience: expNum,
      languageSpoken: languageSpoken.trim(),
      latitude,
      longitude,
    });
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
        <h4 className="text-xl font-black text-slate-900 dark:text-white">
          {t("business_reg.step3_title", "Services & Service Area")}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t("business_reg.step3_subtitle", "Select services offered by your business and your geographic service radius.")}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-semibold animate-in fade-in">
          <ShieldAlert size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleNext} className="space-y-5">
        {/* Service Category & Sub-Service */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div className="space-y-1.5 group">
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
              {t("business_reg.service_cat", "Primary Industry / Category")} *
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                <Briefcase size={18} />
              </div>
              <select
                value={serviceCategory}
                onChange={handleCategoryChange}
                className="w-full h-12 pl-11 pr-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all shadow-sm cursor-pointer appearance-none"
                required
              >
                <option value="">{t("business_reg.select_cat", "Select Industry Category")}</option>
                {Object.keys(hierarchy).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Sub-Service */}
          <div className="space-y-1.5 group">
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
              {t("business_reg.trade", "Specialization / Trade")} *
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                <Building2 size={18} />
              </div>
              <select
                value={providerSubService}
                onChange={handleSubServiceChange}
                disabled={!serviceCategory}
                className="w-full h-12 pl-11 pr-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all shadow-sm cursor-pointer appearance-none disabled:opacity-50"
                required
              >
                <option value="">{t("business_reg.select_trade", "Select Trade Specialization")}</option>
                {availableSubServices.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Multi-select Task Pills */}
        {availableTasks.length > 0 && (
          <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                {t("business_reg.tasks", "Offered Services & Tasks (Select all that apply)")} *
              </label>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {subService.length} {t("business_reg.selected", "Selected")}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {availableTasks.map((task) => {
                const selected = subService.includes(task);
                return (
                  <button
                    key={task}
                    type="button"
                    onClick={() => toggleTask(task)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      selected
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-[1.02]"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400"
                    }`}
                  >
                    {selected && <CheckCircle2 size={13} />}
                    <span>{task}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Experience & Languages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Years of Establishment / Experience */}
          <div className="space-y-1.5 group">
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
              {t("business_reg.experience", "Years in Operation / Experience")} *
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g. 5"
              className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all shadow-sm"
              required
            />
          </div>

          {/* Languages Spoken */}
          <div className="space-y-1.5 group">
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
              {t("business_reg.languages", "Languages Spoken by Staff")} *
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                <Globe2 size={18} />
              </div>
              <input
                type="text"
                value={languageSpoken}
                onChange={(e) => setLanguageSpoken(e.target.value)}
                placeholder="Hindi, English, Bengali"
                className="w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all shadow-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* Google Maps / Location Section */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center ml-1">
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              {t("business_reg.location_pin", "Shop / Base Location on Map")} *
            </label>
            {locationVerified && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={12} />
                {t("business_reg.location_detected", "Coordinates Detected")}
              </span>
            )}
          </div>

          {/* Autocomplete Search if Google Maps Loaded */}
          {isLoaded && GOOGLE_MAP_KEY ? (
            <div className="space-y-3">
              <Autocomplete
                onLoad={(ref) => (autocompleteRef.current = ref)}
                onPlaceChanged={handlePlaceChange}
              >
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <MapPin size={18} />
                  </div>
                  <input
                    type="text"
                    defaultValue={serviceArea}
                    placeholder="Search your shop location on Google Maps..."
                    className="w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all shadow-sm"
                  />
                </div>
              </Autocomplete>

              <div className="h-48 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={{ lat: latitude, lng: longitude }}
                  zoom={14}
                  options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                    styles:
                      typeof window !== "undefined" &&
                      document.documentElement.classList.contains("dark")
                        ? darkMapStyles
                        : lightMapStyles,
                  }}
                >
                  <Marker
                    position={{ lat: latitude, lng: longitude }}
                    draggable={true}
                    onDragEnd={handleMarkerDragEnd}
                  />
                </GoogleMap>
              </div>
            </div>
          ) : (
            /* Fallback coordinate display if Google Maps API key is not active */
            <div className="p-4 bg-blue-50/60 dark:bg-slate-800/60 border border-blue-200 dark:border-slate-700 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t("business_reg.base_area", "Primary Operating Area")}
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {data.city ? `${data.city}, ${data.state} (${data.pinCode})` : "Location verified from business address"}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full">
                Active
              </span>
            </div>
          )}
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
            <span>{t("business_reg.next_step4", "Continue to Add Workers")}</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessStep3Services;
