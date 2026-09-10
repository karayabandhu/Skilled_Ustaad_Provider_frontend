import React, { useRef, useState, useEffect } from "react";
import {
  useJsApiLoader,
  Autocomplete,
  GoogleMap,
  Marker,
} from "@react-google-maps/api";
import {
  ChevronRight,
  Briefcase,
  MapPin,
  Globe2,
  Building2,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { saveServiceDetails, getServiceHierarchy } from "../../services/api";

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
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#022c22" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#34d399" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#1e1b4b" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#312e81" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#818cf8" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#38bdf8" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0f172a" }],
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{ color: "#083344" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#06b6d4" }],
  },
];

const lightMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#475569" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#0f172a" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#2563eb" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#f0fdf4" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#166534" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#cbd5e1" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#eff6ff" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#bfdbfe" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#f1f5f9" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#e0f2fe" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#0369a1" }],
  },
];

const mapContainerStyle = {
  width: "100%",
  height: "250px",
  borderRadius: "1.5rem",
  marginTop: "1rem",
};

const Input = ({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  grid = "col-span-1",
  ...props
}) => (
  <div className={`${grid} space-y-1.5 group`}>
    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
          <Icon size={18} />
        </div>
      )}
      <input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-12 ${Icon ? "pl-11" : "pl-4"} pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all shadow-sm ${props.readOnly
          ? "cursor-not-allowed opacity-75 bg-slate-100 dark:bg-slate-800"
          : ""
          }`}
      />
    </div>
  </div>
);

const Select = ({
  label,
  icon: Icon,
  value,
  onChange,
  options = [],
  placeholder,
  grid = "col-span-1",
}) => {
  const { t } = useTranslation();
  return (
    <div className={`${grid} space-y-1.5 group`}>
      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-12 ${Icon ? "pl-11" : "pl-4"} pr-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all shadow-sm cursor-pointer appearance-none`}
        >
          <option value="" disabled className="bg-white dark:bg-slate-900">
            {placeholder}
          </option>
          {options.length > 0 ? (
            options.map((opt, idx) => (
              <option
                key={idx}
                value={opt}
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                {opt}
              </option>
            ))
          ) : (
            <option
              value=""
              disabled
              className="bg-white dark:bg-slate-900 italic opacity-50"
            >
              {t("registration_page.step3_no_options", "No options available")}
            </option>
          )}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors">
          <ChevronDown size={18} />
        </div>
      </div>
    </div>
  );
};

const Step3ServiceDetails = ({ nextStep, data }) => {
  const { t } = useTranslation();
  const autocompleteRef = useRef(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAP_KEY,
    libraries: GOOGLE_LIBRARIES,
  });

  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark") ||
    document.body.classList.contains("dark"),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(
        document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark"),
      );
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const [hierarchy, setHierarchy] = useState({
    "Home Services": {
      Cleaning: [
        "House Cleaning",
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
      Legal: [
        "Contract Drafting",
        "Legal Consultation",
        "Property Dispute",
        "Divorce/Family Law",
      ],
      "Accounting & Tax": [
        "ITR Filing",
        "GST Return",
        "Bookkeeping",
        "Audit Support",
      ],
      Architecture: [
        "Floor Planning",
        "3D Interior Design",
        "Site Supervision",
        "Vastu Consultation",
      ],
      "Digital Marketing": [
        "SEO Optimization",
        "Social Media Management",
        "PPC Campaigns",
        "Email Marketing",
      ],
    },
    "Digital Services": {
      "Digital Work": [
        "WordPress Website",
        "E-commerce Site",
        "Custom Web App",
        "Website Maintenace",
      ],
      "Graphic Design": [
        "Logo Branding",
        "Social Media Posts",
        "UI/UX Design",
        "Print Label Design",
      ],
      "Content Creation": [
        "Blog Writing",
        "Technical Writing",
        "Creative Storytelling",
        "Copywriting",
      ],
      "Video Editing": [
        "Youtube Editing",
        "Event Video",
        "Reels/TikTok Short Edits",
        "Corporate Ad",
      ],
    },
    "Emergency service": {
      "Medical Support": [
        "Emergency Nursing",
        "Oxygen Support",
        "Vital Monitoring",
        "First Aid Provider",
      ],
      Security: [
        "Guard Services",
        "Electronic Surveillance",
        "Crisis Management",
        "Personal Protection",
      ],
      "Vehicle Recovery": [
        "Flat Tire Support",
        "Towing Service",
        "Fuel Delivery",
        "Battery Jumpstart",
      ],
    },
    "Per day Services": {
      "Daily Labor": [
        "Construction Labor",
        "Loading/Unloading",
        "Garden Maintenance",
        "Cleaning Labor",
      ],
      "Event Support": [
        "Event Coordinator",
        "Stage Setup",
        "Sound Management",
        "Host/Usher",
      ],
      "Catering Service": [
        "Server/Waiter",
        "Dishwashing",
        "Food Prep Helper",
        "Buffet Setup",
      ],
    },
    "Medical Helpers": {
      "Patient Care": [
        "Post-Surgical Care",
        "Senior Citizen Care",
        "Infant Baby Care",
        "Physiotherapy",
      ],
      Nursing: [
        "IV Infusion",
        "Wound Dressing",
        "Catheter Care",
        "Injections & Meds",
      ],
      Phlebotomy: [
        "Blood Collection",
        "Home Lab Testing",
        "Report Consultation",
        "Vital Checkups",
      ],
    },
  });
  const [hierarchyLoading, setHierarchyLoading] = useState(true);

  const [form, setForm] = useState({
    serviceCategory: data.serviceCategory || "",
    providerSubService: data.providerSubService || "",
    subService: Array.isArray(data.subService)
      ? data.subService
      : data.subService
        ? [data.subService]
        : [],
    experience: data.experience || "",
    houseNumber: data.houseNumber || "",
    colony: data.colony || "",
    landmark: data.landmark || "",
    city: data.city || "",
    state: data.state || "",
    pinCode: data.pinCode || "",
    latitude: data.latitude || 22.5726,
    longitude: data.longitude || 88.3639,
    languageSpoken: data.languageSpoken || "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationVerified, setLocationVerified] = useState(
    Boolean(data.latitude && data.longitude && data.colony),
  );

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const res = await getServiceHierarchy();
        if (res.data?.success && Object.keys(res.data.hierarchy).length > 0) {
          setHierarchy((prev) => ({ ...prev, ...res.data.hierarchy }));
        }
      } catch (err) {
        console.error("Using local service intelligence hierarchy.");
      } finally {
        setHierarchyLoading(false);
      }
    };
    fetchHierarchy();
  }, []);

  const handlePlaceChange = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place || !place.geometry) return;

    let cityValue = "";
    let stateValue = "";
    let pinValue = "";

    place.address_components?.forEach((c) => {
      if (c.types.includes("locality")) cityValue = c.long_name;
      if (c.types.includes("administrative_area_level_1"))
        stateValue = c.long_name;
      if (c.types.includes("postal_code")) pinValue = c.long_name;
    });

    setForm((prev) => ({
      ...prev,
      colony: place.formatted_address || "",
      city: cityValue,
      state: stateValue,
      pinCode: pinValue,
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
    }));

    setLocationVerified(true);
    setError("");
  };

  const handleMarkerDragEnd = (e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();

    setForm((prev) => ({ ...prev, latitude: newLat, longitude: newLng }));
    setLocationVerified(false);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat: newLat, lng: newLng } },
      (results, status) => {
        if (status === "OK" && results[0]) {
          const res = results[0];

          let city = "";
          let state = "";
          let pin = "";

          res.address_components.forEach((c) => {
            if (c.types.includes("locality")) {
              city = c.long_name;
            }

            if (!city && c.types.includes("administrative_area_level_2")) {
              city = c.long_name;
            }

            if (c.types.includes("administrative_area_level_1")) {
              state = c.long_name;
            }

            if (c.types.includes("postal_code")) {
              pin = c.long_name;
            }
          });

          setForm((prev) => ({
            ...prev,
            colony: res.formatted_address || "",
            city,
            state,
            pinCode: pin,
            latitude: newLat,
            longitude: newLng,
          }));

          if (city && state && pin) {
            setLocationVerified(true);
            setError("");
          } else {
            setLocationVerified(false);
            setError(
              "City, state or PIN code could not be detected. Please select a nearby valid location.",
            );
          }
        } else {
          setLocationVerified(false);
          setError("Unable to verify this location. Please try again.");
        }
      },
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = [
      "serviceCategory",
      "providerSubService",
      "experience",
      "houseNumber",
      "colony",
      "landmark",
      "city",
      "state",
      "pinCode",
      "languageSpoken",
    ];

    const isFieldsMissing = requiredFields.some((f) => !form[f]);
    const isSubServiceMissing =
      !form.subService || form.subService.length === 0;

    if (isFieldsMissing || isSubServiceMissing || !locationVerified) {
      setError(
        !locationVerified
          ? t(
            "registration_page.step3_err_location",
            "Please select your location from Google suggestions or verify it using the map pin.",
          )
          : t(
            "registration_page.step3_err_missing",
            "Please fill in ALL fields and select at least one specific task.",
          ),
      );
      return;
    }

    const experienceValue = Number(form.experience);

    if (
      !Number.isInteger(experienceValue) ||
      experienceValue < 1 ||
      experienceValue > 50
    ) {
      setError("Experience must be between 1 and 50 years.");
      return;
    }

    // Languages Spoken: letters, spaces, and commas only
    if (!/^[a-zA-Z\s,]+$/.test(form.languageSpoken.trim())) {
      setError(
        t(
          "registration_page.step3_err_language",
          "Languages Spoken must contain only letters (e.g. Hindi, English, Telugu).",
        ),
      );
      return;
    }

    try {
      setLoading(true);
      await saveServiceDetails(form);
      nextStep(form);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        t(
          "registration_page.step3_err_save",
          "Failed to save service details.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded)
    return (
      <div className="p-12 text-center text-slate-500">
        {t(
          "registration_page.step3_initializing_maps",
          "Initializing Maps Experience...",
        )}
      </div>
    );

  const currentCenter = { lat: form.latitude, lng: form.longitude };

  const sectors = Object.keys(hierarchy);
  const trades = form.serviceCategory
    ? Object.keys(hierarchy[form.serviceCategory] || {})
    : [];
  const tasks =
    form.serviceCategory && form.providerSubService
      ? hierarchy[form.serviceCategory][form.providerSubService] || []
      : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <style>{`
        .pac-container {
          background-color: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 1rem !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          font-family: inherit !important;
          margin-top: 4px !important;
          z-index: 99999 !important;
          padding: 6px 0 !important;
        }
        .dark .pac-container {
          background-color: #0f172a !important;
          border: 1px solid #1e293b !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5) !important;
        }
        .pac-item {
          padding: 10px 16px !important;
          font-size: 13px !important;
          color: #475569 !important;
          border-top: 1px solid #f1f5f9 !important;
          display: flex !important;
          align-items: center !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }
        .dark .pac-item {
          color: #94a3b8 !important;
          border-top: 1px solid #1e293b !important;
        }
        .pac-item:hover {
          background-color: #f8fafc !important;
        }
        .dark .pac-item:hover {
          background-color: #1e293b !important;
        }
        .pac-item-query {
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #0f172a !important;
          margin-right: 4px !important;
        }
        .dark .pac-item-query {
          color: #f1f5f9 !important;
        }
        .pac-matched {
          font-weight: 700 !important;
        }
        .pac-icon {
          margin-right: 10px !important;
          margin-top: 0 !important;
          background-image: none !important;
          width: 14px !important;
          height: 14px !important;
          display: inline-block !important;
          position: relative !important;
        }
        .pac-icon::before {
          content: '📍';
          font-size: 12px;
          position: absolute;
          top: -2px;
          left: 0;
        }
        .pac-logo::after {
          content: "" !important;
          background-image: none !important;
          padding: 0 !important;
          height: 0 !important;
          display: none !important;
        }
      `}</style>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 mb-2 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex gap-3">
            {/* <Sparkles className="text-blue-600 shrink-0" size={20} /> */}
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 leading-relaxed">
              {t(
                "registration_page.step3_desc",
                "Choose your primary profession. You can add more specializations after your profile is verified.",
              )}
            </p>
          </div>

          <Select
            label={t(
              "registration_page.step3_sector",
              "Service Sector (Level 1)",
            )}
            icon={Briefcase}
            grid="col-span-2"
            value={form.serviceCategory}
            placeholder={
              hierarchyLoading
                ? t(
                  "registration_page.step3_loading_sector",
                  "Loading sectors...",
                )
                : t(
                  "registration_page.step3_select_sector",
                  "Select Service Sector",
                )
            }
            options={sectors}
            onChange={(v) =>
              setForm((p) => ({
                ...p,
                serviceCategory: v,
                providerSubService: "",
                subService: [],
              }))
            }
          />

          <Select
            label={t("registration_page.step3_trade", "Expert Trade (Level 2)")}
            grid="col-span-1"
            value={form.providerSubService}
            placeholder={t(
              "registration_page.step3_select_trade",
              "Select Trade",
            )}
            options={trades}
            onChange={(v) =>
              setForm((p) => ({ ...p, providerSubService: v, subService: [] }))
            }
          />

          {/* SPECIFIC TASKS (MULTI-SELECT) */}
          <div className="col-span-2 space-y-3">
            <div className="flex justify-between items-end px-1">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {t("registration_page.step3_task", "Specific Task (Level 3)")}
              </label>
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${form.subService.length >= 6 ? "text-amber-500" : "text-blue-600"}`}
              >
                {form.subService.length}/6{" "}
                {t("registration_page.step3_selected", "Selected")}
              </span>
            </div>

            {tasks.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {tasks.map((task, idx) => {
                  const isSelected = form.subService.includes(task);
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!isSelected && form.subService.length >= 6}
                      onClick={() => {
                        if (isSelected) {
                          setForm((p) => ({
                            ...p,
                            subService: p.subService.filter((s) => s !== task),
                          }));
                        } else {
                          setForm((p) => ({
                            ...p,
                            subService: [...p.subService, task],
                          }));
                        }
                      }}
                      className={`px-4 py-2.5 rounded-full text-xs font-black transition-all duration-300 border-2 flex items-center gap-2 ${isSelected
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20 scale-105"
                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-blue-200"
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {task}
                      {isSelected && null}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-center">
                <p className="text-xs font-bold text-slate-400">
                  {t(
                    "registration_page.step3_select_prompt",
                    "Select a trade to see specific tasks",
                  )}
                </p>
              </div>
            )}
          </div>
          <Input
            label={t("registration_page.step3_experience", "Years Experience")}
            type="number"
            min="1"
            max="50"
            value={form.experience}
            placeholder="e.g. 5"
            grid="col-span-2"
            onChange={(v) =>
              setForm((p) => ({
                ...p,
                experience: v.replace(/\D/g, "").slice(0, 2),
              }))
            }
          />

          <div className="col-span-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            <label className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-4 block underline underline-offset-8">
              {t(
                "registration_page.step3_location_header",
                "On-Field Work Location",
              )}
            </label>
          </div>

          <Input
            label={t("registration_page.step3_house", "House/Office No.")}
            icon={Building2}
            grid="col-span-2 sm:col-span-1"
            value={form.houseNumber}
            placeholder={t(
              "registration_page.step3_house_placeholder",
              "Flat 102, Skyline Apt",
            )}
            onChange={(v) => setForm((p) => ({ ...p, houseNumber: v }))}
          />

          <div className="col-span-2 sm:col-span-1 space-y-1.5 group">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
              {t("registration_page.step3_colony", "Search Area/Colony")}
            </label>
            <Autocomplete
              onLoad={(r) => (autocompleteRef.current = r)}
              onPlaceChanged={handlePlaceChange}
            >
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <MapPin size={18} />
                </div>
                <input
                  type="text"
                  value={form.colony}
                  onChange={(e) => {
                    setForm((p) => ({
                      ...p,
                      colony: e.target.value,
                      city: "",
                      state: "",
                      pinCode: "",
                    }));
                    setLocationVerified(false);
                  }}
                  placeholder={t(
                    "registration_page.step3_colony_placeholder",
                    "Enter area name...",
                  )}
                  className="w-full h-12 pl-11 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none dark:text-white text-sm font-bold transition-all shadow-sm"
                />
              </div>
            </Autocomplete>
          </div>

          {/* MAP SECTION */}
          <div className="col-span-2">
            <div className="p-1 bg-white dark:bg-slate-900 rounded-[1.7rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={currentCenter}
                zoom={15}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                  styles: isDarkMode ? darkMapStyles : lightMapStyles,
                }}
              >
                <Marker
                  position={currentCenter}
                  draggable={true}
                  onDragEnd={handleMarkerDragEnd}
                  animation={window.google.maps.Animation.DROP}
                />
              </GoogleMap>
              <div className="p-3 text-center">
                <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  {t(
                    "registration_page.step3_drag",
                    "Drag pin for exact location",
                  )}
                </p>
              </div>
            </div>
          </div>

          <Input
            label={t("registration_page.step3_landmark", "Landmark")}
            value={form.landmark}
            placeholder={t(
              "registration_page.step3_landmark_placeholder",
              "Near Big Bazaar",
            )}
            onChange={(v) => setForm((p) => ({ ...p, landmark: v }))}
          />
          <Input
            label={t("registration_page.step3_city", "City")}
            value={form.city}
            placeholder="Select location above"
            readOnly
            onChange={() => { }}
          />
          <Input
            label={t("registration_page.step3_state", "State")}
            value={form.state}
            placeholder="Select location above"
            readOnly
            onChange={() => { }}
          />
          <Input
            label={t("registration_page.step3_pin", "PIN Code")}
            value={form.pinCode}
            placeholder="Select location above"
            maxLength="6"
            readOnly
            onChange={() => { }}
          />

          <Input
            label={t("registration_page.step3_language", "Languages Spoken")}
            icon={Globe2}
            grid="col-span-2"
            value={form.languageSpoken}
            placeholder={t(
              "registration_page.step3_language_placeholder",
              "Hindi, English, Telugu...",
            )}
            onChange={(v) =>
              // Allow only letters, spaces, and commas (language separators)
              setForm((p) => ({
                ...p,
                languageSpoken: v.replace(/[^a-zA-Z\s,]/g, ""),
              }))
            }
          />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2 border border-red-100 dark:border-red-900/20">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
        >
          {loading
            ? t("registration_page.step3_saving", "Saving...")
            : t("registration_page.step3_verify", "Verify Identity")}
          <ChevronRight
            size={22}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
      </form>
    </div>
  );
};

export default Step3ServiceDetails;
