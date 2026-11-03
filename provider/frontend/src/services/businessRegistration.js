/**
 * Service for Business / Shop Owner Registration
 * 
 * Handles business registration state persistence, payload preparation,
 * and communicates with backend APIs where available.
 * 
 * NOTE: Backend is currently in a separate repository without active .env.
 * Verified API contracts are reused (such as getServiceHierarchy from api.js).
 * Full backend endpoints for business registration and worker management
 * should be integrated when the backend service is configured.
 */

import { getServiceHierarchy } from "./api";

const STORAGE_KEYS = {
  STATE: "business_reg_state",
  APPLICATION: "business_reg_application",
  TYPE: "provider_type_selected",
};

export const INITIAL_BUSINESS_FORM_DATA = {
  // Step 1: Owner Details
  ownerName: "",
  email: "",
  phoneNumber: "",
  password: "",

  // Step 2: Business Details
  businessName: "",
  businessType: "Sole Proprietorship",
  shopNumber: "",
  colony: "",
  landmark: "",
  city: "",
  state: "",
  pinCode: "",
  gstNumber: "",

  // Step 3: Services & Location
  serviceCategory: "",
  providerSubService: "",
  subService: [],
  experience: "",
  languageSpoken: "",
  latitude: 22.5726,
  longitude: 88.3639,

  // Step 4: Workers (Mandatory, at least 1)
  workers: [
    {
      id: "worker-1",
      name: "",
      phone: "",
      role: "Lead Technician",
      experience: "",
      govtIdNumber: "",
    },
  ],

  // Step 5: Documents
  documents: {
    businessRegistrationProof: null,
    ownerGovtId: null,
    addressProof: null,
    businessLogoOrShopPhoto: null,
    gstCertificate: null,
    workerIdProofs: null,
  },

  // Step 6: Bank Details
  bankAccountNumber: "",
  confirmAccountNumber: "",
  ifscCode: "",
  accountHolderName: "",
  upiId: "",
};

/**
 * Load draft business registration state from localStorage
 */
export const loadBusinessRegistrationDraft = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      step: parsed.step || 1,
      formData: {
        ...INITIAL_BUSINESS_FORM_DATA,
        ...(parsed.formData || {}),
        // Ensure at least 1 worker exists
        workers:
          Array.isArray(parsed.formData?.workers) && parsed.formData.workers.length > 0
            ? parsed.formData.workers
            : INITIAL_BUSINESS_FORM_DATA.workers,
        documents: {
          ...INITIAL_BUSINESS_FORM_DATA.documents,
          ...(parsed.formData?.documents || {}),
        },
      },
    };
  } catch (err) {
    console.error("Failed to load business registration draft:", err);
    return null;
  }
};

/**
 * Save draft business registration state to localStorage
 */
export const saveBusinessRegistrationDraft = (step, formData) => {
  try {
    // Clone formData and omit non-serializable File objects from localStorage
    const serializableData = {
      ...formData,
      documents: {
        businessRegistrationProof: formData.documents?.businessRegistrationProof
          ? { name: formData.documents.businessRegistrationProof.name, size: formData.documents.businessRegistrationProof.size }
          : null,
        ownerGovtId: formData.documents?.ownerGovtId
          ? { name: formData.documents.ownerGovtId.name, size: formData.documents.ownerGovtId.size }
          : null,
        addressProof: formData.documents?.addressProof
          ? { name: formData.documents.addressProof.name, size: formData.documents.addressProof.size }
          : null,
        businessLogoOrShopPhoto: formData.documents?.businessLogoOrShopPhoto
          ? { name: formData.documents.businessLogoOrShopPhoto.name, size: formData.documents.businessLogoOrShopPhoto.size }
          : null,
        gstCertificate: formData.documents?.gstCertificate
          ? { name: formData.documents.gstCertificate.name, size: formData.documents.gstCertificate.size }
          : null,
        workerIdProofs: formData.documents?.workerIdProofs
          ? { name: formData.documents.workerIdProofs.name, size: formData.documents.workerIdProofs.size }
          : null,
      },
    };
    localStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify({ step, formData: serializableData }));
  } catch (err) {
    console.warn("Could not persist business registration draft to localStorage:", err);
  }
};

/**
 * Clear draft registration state
 */
export const clearBusinessRegistrationDraft = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.STATE);
  } catch (err) {
    console.warn("Failed to clear business draft:", err);
  }
};

/**
 * Get active business application status
 */
export const getBusinessApplication = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLICATION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read business application:", err);
    return null;
  }
};

/**
 * Save business application upon final submission
 * Status is set to 'under_review' (NOT automatically activated!)
 */
export const submitBusinessApplication = async (formData) => {
  const referenceId = `SU-BIZ-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const applicationData = {
    referenceId,
    status: "under_review", // Follows flowchart: Admin approval required
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    adminFeedback: null,
    requestedChangesStep: null,
    summary: {
      ownerName: formData.ownerName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      businessName: formData.businessName,
      businessType: formData.businessType,
      city: formData.city,
      state: formData.state,
      pinCode: formData.pinCode,
      gstNumber: formData.gstNumber || "Not Provided",
      serviceCategory: formData.serviceCategory,
      providerSubService: formData.providerSubService,
      subService: formData.subService,
      totalWorkers: formData.workers?.length || 0,
      workers: (formData.workers || []).map((w) => ({
        name: w.name,
        role: w.role,
        phone: w.phone,
        experience: w.experience,
      })),
      bankAccountNumber: formData.bankAccountNumber
        ? `•••• •••• •••• ${formData.bankAccountNumber.slice(-4)}`
        : "",
      ifscCode: formData.ifscCode,
      accountHolderName: formData.accountHolderName,
      upiId: formData.upiId,
      documentsUploaded: Object.entries(formData.documents || {})
        .filter(([, val]) => Boolean(val))
        .map(([key, val]) => ({
          type: key,
          fileName: val?.name || "Uploaded File",
        })),
    },
    // Store full form data for change-request updates
    fullData: {
      ...formData,
      password: "[PROTECTED]",
    },
  };

  localStorage.setItem(STORAGE_KEYS.APPLICATION, JSON.stringify(applicationData));
  clearBusinessRegistrationDraft();

  return applicationData;
};

/**
 * Simulator helper for testing approval workflow according to flowchart:
 * - Admin can approve application
 * - Admin can request changes
 */
export const updateBusinessApplicationStatus = (newStatus, options = {}) => {
  try {
    const app = getBusinessApplication();
    if (!app) return null;

    app.status = newStatus;
    app.reviewedAt = new Date().toISOString();
    app.adminFeedback = options.adminFeedback || null;
    app.requestedChangesStep = options.requestedChangesStep || null;

    localStorage.setItem(STORAGE_KEYS.APPLICATION, JSON.stringify(app));
    return app;
  } catch (err) {
    console.error("Failed to update business application status:", err);
    return null;
  }
};

/**
 * Reset application state completely (for testing/demo)
 */
export const resetBusinessApplication = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.APPLICATION);
    localStorage.removeItem(STORAGE_KEYS.STATE);
  } catch (err) {
    console.warn("Failed to reset business application:", err);
  }
};

export { getServiceHierarchy };

