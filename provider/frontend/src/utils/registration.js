/**
 * Helper to determine which registration step is incomplete for a provider.
 * Returns:
 * - 2: If service category details are missing (corresponds to Step 3 Service Details in frontend wizard flow)
 * - 3: If identity documents are missing (corresponds to Step 4 Identity in frontend wizard flow)
 * - 4: If bank/payment details are missing (corresponds to Step 5 Payment in frontend wizard flow)
 * - null: If all steps are completed
 * 
 * @param {Object} provider - The provider details from the backend profile API
 * @returns {number|null} The next step to complete, or null if complete
 */
export const getIncompleteRegistrationStep = (provider) => {
  if (!provider) return 1;

  // Step 2 in Register.jsx renders Step3ServiceDetails.
  // If serviceCategory is missing, they need to fill Service Details (Step 2 in Register.jsx flow).
  if (!provider.serviceCategory) {
    return 2;
  }

  // Step 3 in Register.jsx renders Step4Identity.
  // If any of the required documents are missing, they need to upload them.
  if (!provider.profilePhoto || !provider.governmentIDProof || !provider.addressProof) {
    return 3;
  }

  // Step 4 in Register.jsx renders Step5Payment.
  // If bank/payment details are missing, they need to fill Payment details.
  if (!provider.bankAccountNumber || !provider.upiId || !provider.ifscCode || !provider.accountHolderName) {
    return 4;
  }

  return null; // Registration complete
};
