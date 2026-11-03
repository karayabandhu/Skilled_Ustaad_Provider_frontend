import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import ProviderTypeSelector from "../registration/ProviderTypeSelector";
import BusinessStep4Workers from "../registration/business/BusinessStep4Workers";
import {
  saveBusinessRegistrationDraft,
  loadBusinessRegistrationDraft,
  submitBusinessApplication,
  updateBusinessApplicationStatus,
  getBusinessApplication,
  resetBusinessApplication,
} from "../../services/businessRegistration";

// Mock i18next with variable interpolation
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, fallback, options) => {
      let text = fallback || key;
      if (options && typeof options === "object") {
        Object.entries(options).forEach(([k, v]) => {
          text = text.replace(new RegExp(`{{${k}}}`, "g"), v);
        });
      }
      return text;
    },
  }),
}));

describe("Business Registration Service", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and loads draft business registration data", () => {
    const mockFormData = {
      businessName: "Super Electricians Ltd",
      city: "Mumbai",
      workers: [
        { id: "w-1", name: "Ramesh Kumar", phone: "9876543210", role: "Lead" },
      ],
    };

    saveBusinessRegistrationDraft(2, mockFormData);
    const loaded = loadBusinessRegistrationDraft();

    expect(loaded).toBeDefined();
    expect(loaded.step).toBe(2);
    expect(loaded.formData.businessName).toBe("Super Electricians Ltd");
    expect(loaded.formData.city).toBe("Mumbai");
    expect(loaded.formData.workers.length).toBe(1);
  });

  it("submits application with 'under_review' status and generates referenceId", async () => {
    const mockFormData = {
      ownerName: "Amit Sharma",
      phoneNumber: "9812345678",
      email: "amit@sharmaservices.com",
      businessName: "Sharma Services & Hardware",
      businessType: "Sole Proprietorship",
      city: "Delhi",
      state: "Delhi",
      pinCode: "110001",
      workers: [
        { id: "w-1", name: "Worker One", phone: "9811111111", role: "Technician" },
      ],
      bankAccountNumber: "123456789012",
      ifscCode: "SBIN0001234",
      accountHolderName: "Sharma Services",
      upiId: "sharma@upi",
    };

    const application = await submitBusinessApplication(mockFormData);

    expect(application).toBeDefined();
    expect(application.status).toBe("under_review"); // NEVER automatically activated
    expect(application.referenceId).toMatch(/^SU-BIZ-\d{4}-\d+$/);
    expect(application.summary.totalWorkers).toBe(1);

    const savedApp = getBusinessApplication();
    expect(savedApp.status).toBe("under_review");
    expect(savedApp.referenceId).toBe(application.referenceId);
  });

  it("simulates flowchart approval workflow: request changes vs approve", async () => {
    const mockFormData = {
      ownerName: "Rakesh",
      phoneNumber: "9999999999",
      businessName: "Rakesh Works",
      workers: [{ id: "w-1", name: "Worker", phone: "9888888888", role: "Lead" }],
    };

    await submitBusinessApplication(mockFormData);

    // Simulate Admin requesting changes
    const changesApp = updateBusinessApplicationStatus("changes_requested", {
      adminFeedback: "Please upload clearer address proof.",
      requestedChangesStep: 5,
    });
    expect(changesApp.status).toBe("changes_requested");
    expect(changesApp.requestedChangesStep).toBe(5);

    // Simulate Admin approving application
    const approvedApp = updateBusinessApplicationStatus("approved", {
      adminFeedback: "Approved by Admin",
    });
    expect(approvedApp.status).toBe("approved");

    // Reset application
    resetBusinessApplication();
    expect(getBusinessApplication()).toBeNull();
  });
});

describe("ProviderTypeSelector Component", () => {
  it("renders both Individual Provider and Business / Shop Owner options", () => {
    const onSelectType = vi.fn();
    render(<ProviderTypeSelector onSelectType={onSelectType} />);

    expect(screen.getByText("Choose Your Provider Type")).toBeDefined();
    expect(screen.getByText("Individual Provider")).toBeDefined();
    expect(screen.getByText("Business / Shop Owner")).toBeDefined();
    expect(screen.getByText("Register as Individual")).toBeDefined();
    expect(screen.getByText("Register as Business / Shop")).toBeDefined();
  });

  it("calls onSelectType with 'individual' when individual is clicked", () => {
    const onSelectType = vi.fn();
    render(<ProviderTypeSelector onSelectType={onSelectType} />);

    const indBtn = screen.getByText("Register as Individual");
    fireEvent.click(indBtn);

    expect(onSelectType).toHaveBeenCalledWith("individual");
  });

  it("calls onSelectType with 'business' when business is clicked", () => {
    const onSelectType = vi.fn();
    render(<ProviderTypeSelector onSelectType={onSelectType} />);

    const bizBtn = screen.getByText("Register as Business / Shop");
    fireEvent.click(bizBtn);

    expect(onSelectType).toHaveBeenCalledWith("business");
  });
});

describe("BusinessStep4Workers Component", () => {
  it("renders mandatory worker section with at least 1 worker", () => {
    const nextStep = vi.fn();
    const prevStep = vi.fn();

    render(
      <BusinessStep4Workers
        nextStep={nextStep}
        prevStep={prevStep}
        data={{ workers: [] }}
      />
    );

    expect(screen.getByText("Worker & Staff Details")).toBeDefined();
    expect(screen.getByText(/at least one registered staff worker/i)).toBeDefined();
    expect(screen.getByText("Worker #1")).toBeDefined();
  });

  it("allows adding additional workers", () => {
    const nextStep = vi.fn();
    const prevStep = vi.fn();

    render(
      <BusinessStep4Workers
        nextStep={nextStep}
        prevStep={prevStep}
        data={{ workers: [] }}
      />
    );

    const addButtons = screen.getAllByText("+ Add Another Worker");
    fireEvent.click(addButtons[0]);

    expect(screen.getByText("Worker #2")).toBeDefined();
  });
});
