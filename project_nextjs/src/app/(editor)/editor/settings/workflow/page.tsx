"use client";

import { useState, useEffect } from "react";
import { PkpTabs, PkpTabsList, PkpTabsTrigger, PkpTabsContent } from "@/components/ui/pkp-tabs";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpCheckbox } from "@/components/ui/pkp-checkbox";
import { PkpInput } from "@/components/ui/pkp-input";
import { PkpTextarea } from "@/components/ui/pkp-textarea";
import { PkpSelect } from "@/components/ui/pkp-select";
import { PkpRadio } from "@/components/ui/pkp-radio";
import { PkpTable, PkpTableHeader, PkpTableRow, PkpTableHead, PkpTableCell } from "@/components/ui/pkp-table";
import {
  DUMMY_METADATA_FIELDS,
  DUMMY_COMPONENTS,
  DUMMY_CHECKLIST,
  DUMMY_REVIEW_FORMS,
  DUMMY_LIBRARY_FILES,
  DUMMY_EMAIL_TEMPLATES,
} from "@/features/editor/settings-dummy-data";
import { USE_DUMMY } from "@/lib/dummy";
import { useJournalSettings, useMigrateLocalStorageToDatabase } from "@/features/editor/hooks/useJournalSettings";
import { useI18n } from "@/contexts/I18nContext";

export default function SettingsWorkflowPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("submission");
  const [activeSubTab, setActiveSubTab] = useState("disableSubmissions");
  const [activeReviewSubTab, setActiveReviewSubTab] = useState("reviewSetup");
  const [activeEmailSubTab, setActiveEmailSubTab] = useState("emailsSetup");

  // Database integration - Load settings from database
  const reviewSetupSettings = useJournalSettings({
    section: "workflow",
    autoLoad: true,
  });

  const reviewerGuidanceSettings = useJournalSettings({
    section: "workflow",
    autoLoad: true,
  });

  const authorGuidelinesSettings = useJournalSettings({
    section: "workflow",
    autoLoad: true,
  });

  const emailSetupSettings = useJournalSettings({
    section: "workflow",
    autoLoad: true,
  });

  // Migrate localStorage to database (one-time)
  const migrateReviewSetup = useMigrateLocalStorageToDatabase(
    "workflow",
    [
      "reviewSetup_defaultReviewMode",
      "reviewSetup_restrictReviewerFileAccess",
      "reviewSetup_reviewerAccessKeysEnabled",
      "reviewSetup_numWeeksPerResponse",
      "reviewSetup_numWeeksPerReview",
      "reviewSetup_numDaysBeforeInviteReminder",
      "reviewSetup_numDaysBeforeSubmitReminder",
    ]
  );

  const migrateReviewerGuidance = useMigrateLocalStorageToDatabase(
    "workflow",
    [
      "reviewerGuidance_reviewGuidelines",
      "reviewerGuidance_competingInterests",
      "reviewerGuidance_showEnsuringLink",
    ]
  );

  const migrateAuthorGuidelines = useMigrateLocalStorageToDatabase(
    "workflow",
    ["authorGuidelines"]
  );

  const migrateEmailSetup = useMigrateLocalStorageToDatabase(
    "workflow",
    ["emailSetup_emailSignature", "emailSetup_envelopeSender"]
  );

  // Run migration on mount
  useEffect(() => {
    migrateReviewSetup.migrate();
    migrateReviewerGuidance.migrate();
    migrateAuthorGuidelines.migrate();
    migrateEmailSetup.migrate();
  }, []);

  // Form states - Review Setup (with defaults from database)
  const [reviewSetup, setReviewSetup] = useState({
    defaultReviewMode: "doubleAnonymous",
    restrictReviewerFileAccess: false,
    reviewerAccessKeysEnabled: false,
    numWeeksPerResponse: "2",
    numWeeksPerReview: "4",
    numDaysBeforeInviteReminder: "3",
    numDaysBeforeSubmitReminder: "7",
  });

  // Form states - Reviewer Guidance
  const [reviewerGuidance, setReviewerGuidance] = useState({
    reviewGuidelines: "",
    competingInterests: "",
    showEnsuringLink: false,
  });

  // Form states - Author Guidelines
  const [authorGuidelines, setAuthorGuidelines] = useState("");

  // Form states - Email Setup
  const [emailSetup, setEmailSetup] = useState({
    emailSignature: "",
    envelopeSender: "",
  });

  // Sync form states with database settings when loaded
  useEffect(() => {
    if (reviewSetupSettings.settings && Object.keys(reviewSetupSettings.settings).length > 0) {
      const settings = reviewSetupSettings.settings as any;
      setReviewSetup({
        defaultReviewMode: settings.review_defaultReviewMode ?? reviewSetup.defaultReviewMode,
        restrictReviewerFileAccess: settings.review_restrictReviewerFileAccess ?? reviewSetup.restrictReviewerFileAccess,
        reviewerAccessKeysEnabled: settings.review_reviewerAccessKeysEnabled ?? reviewSetup.reviewerAccessKeysEnabled,
        numWeeksPerResponse: settings.review_numWeeksPerResponse ?? reviewSetup.numWeeksPerResponse,
        numWeeksPerReview: settings.review_numWeeksPerReview ?? reviewSetup.numWeeksPerReview,
        numDaysBeforeInviteReminder: settings.review_numDaysBeforeInviteReminder ?? reviewSetup.numDaysBeforeInviteReminder,
        numDaysBeforeSubmitReminder: settings.review_numDaysBeforeSubmitReminder ?? reviewSetup.numDaysBeforeSubmitReminder,
      });
    }
  }, [reviewSetupSettings.settings]);

  useEffect(() => {
    if (reviewerGuidanceSettings.settings && Object.keys(reviewerGuidanceSettings.settings).length > 0) {
      const settings = reviewerGuidanceSettings.settings as any;
      setReviewerGuidance({
        reviewGuidelines: settings.reviewerGuidance_reviewGuidelines ?? reviewerGuidance.reviewGuidelines,
        competingInterests: settings.reviewerGuidance_competingInterests ?? reviewerGuidance.competingInterests,
        showEnsuringLink: settings.reviewerGuidance_showEnsuringLink ?? reviewerGuidance.showEnsuringLink,
      });
    }
  }, [reviewerGuidanceSettings.settings]);

  useEffect(() => {
    if (authorGuidelinesSettings.settings && Object.keys(authorGuidelinesSettings.settings).length > 0) {
      const settings = authorGuidelinesSettings.settings as any;
      setAuthorGuidelines(settings.authorGuidelines ?? "");
    }
  }, [authorGuidelinesSettings.settings]);

  useEffect(() => {
    if (emailSetupSettings.settings && Object.keys(emailSetupSettings.settings).length > 0) {
      const settings = emailSetupSettings.settings as any;
      setEmailSetup({
        emailSignature: settings.emailSetup_emailSignature ?? emailSetup.emailSignature,
        envelopeSender: settings.emailSetup_envelopeSender ?? emailSetup.envelopeSender,
      });
    }
  }, [emailSetupSettings.settings]);

  // Feedback states
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Save handlers
  const handleSaveReviewSetup = async () => {
    // Validate
    if (!reviewSetup.numWeeksPerResponse || parseInt(reviewSetup.numWeeksPerResponse) < 1) {
      setFeedback({ type: "error", message: "Review response time must be at least 1 week." });
      return;
    }
    if (!reviewSetup.numWeeksPerReview || parseInt(reviewSetup.numWeeksPerReview) < 1) {
      setFeedback({ type: "error", message: "Review completion time must be at least 1 week." });
      return;
    }

    setFeedback({ type: null, message: "" });

    // Save to database
    const success = await reviewSetupSettings.saveSettings({
      review_defaultReviewMode: reviewSetup.defaultReviewMode,
      review_restrictReviewerFileAccess: reviewSetup.restrictReviewerFileAccess,
      review_reviewerAccessKeysEnabled: reviewSetup.reviewerAccessKeysEnabled,
      review_numWeeksPerResponse: reviewSetup.numWeeksPerResponse,
      review_numWeeksPerReview: reviewSetup.numWeeksPerReview,
      review_numDaysBeforeInviteReminder: reviewSetup.numDaysBeforeInviteReminder,
      review_numDaysBeforeSubmitReminder: reviewSetup.numDaysBeforeSubmitReminder,
    });

    if (success) {
      setFeedback({ type: "success", message: "Review setup settings saved successfully." });
      setTimeout(() => setFeedback({ type: null, message: "" }), 3000);
    } else {
      setFeedback({
        type: "error",
        message: reviewSetupSettings.error || "Failed to save review setup settings.",
      });
    }
  };

  const handleSaveReviewerGuidance = async () => {
    setFeedback({ type: null, message: "" });

    // Save to database
    const success = await reviewerGuidanceSettings.saveSettings({
      reviewerGuidance_reviewGuidelines: reviewerGuidance.reviewGuidelines,
      reviewerGuidance_competingInterests: reviewerGuidance.competingInterests,
      reviewerGuidance_showEnsuringLink: reviewerGuidance.showEnsuringLink,
    });

    if (success) {
      setFeedback({ type: "success", message: "Reviewer guidance settings saved successfully." });
      setTimeout(() => setFeedback({ type: null, message: "" }), 3000);
    } else {
      setFeedback({
        type: "error",
        message: reviewerGuidanceSettings.error || "Failed to save reviewer guidance settings.",
      });
    }
  };

  const handleSaveAuthorGuidelines = async () => {
    setFeedback({ type: null, message: "" });

    // Save to database
    const success = await authorGuidelinesSettings.saveSettings({
      authorGuidelines: authorGuidelines,
    });

    if (success) {
      setFeedback({ type: "success", message: "Author guidelines saved successfully." });
      setTimeout(() => setFeedback({ type: null, message: "" }), 3000);
    } else {
      setFeedback({
        type: "error",
        message: authorGuidelinesSettings.error || "Failed to save author guidelines.",
      });
    }
  };

  const handleSaveEmailSetup = async () => {
    // Validate email if provided
    if (emailSetup.envelopeSender && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailSetup.envelopeSender)) {
      setFeedback({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    setFeedback({ type: null, message: "" });

    // Save to database
    const success = await emailSetupSettings.saveSettings({
      emailSetup_emailSignature: emailSetup.emailSignature,
      emailSetup_envelopeSender: emailSetup.envelopeSender,
    });

    if (success) {
      setFeedback({ type: "success", message: "Email setup settings saved successfully." });
      setTimeout(() => setFeedback({ type: null, message: "" }), 3000);
    } else {
      setFeedback({
        type: "error",
        message: emailSetupSettings.error || "Failed to save email setup settings.",
      });
    }
  };

  return (
    <div style={{
      width: "100%",
      maxWidth: "100%",
      minHeight: "100%",
      backgroundColor: "#eaedee",
      padding: 0,
      margin: 0,
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
    }}>
      {/* Page Header - OJS 3.3 Style with Safe Area */}
      <div style={{
        backgroundColor: "#ffffff",
        borderBottom: "2px solid #e5e5e5",
        padding: "1.5rem 0",
      }}>
        <div style={{
          padding: "0 1.5rem",
        }}>
          <h1 style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            margin: 0,
            padding: "0.5rem 0",
            lineHeight: "2.25rem",
            color: "#002C40",
          }}>
            {t('editor.settings.settingsTitle')} • {t('editor.settings.workflow.title')}
          </h1>
          <p style={{
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            marginTop: "0.5rem",
            marginBottom: 0,
          }}>
            Configure all aspects of the editorial workflow, including file management, submission guidelines, peer review, and email notifications.
          </p>
        </div>
      </div>

      {/* Content - OJS 3.3 Style with Safe Area */}
      <div style={{
        padding: "0 1.5rem",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
      }}>
        <PkpTabs defaultValue="submission" value={activeTab} onValueChange={setActiveTab}>
          {/* Main Tabs */}
          <div style={{
            borderBottom: "2px solid #e5e5e5",
            background: "#ffffff",
            padding: "0",
            display: "flex",
            marginBottom: "1.5rem",
          }}>
            <PkpTabsList style={{ flex: 1, padding: "0 1.5rem" }}>
              <PkpTabsTrigger value="submission">{t('editor.settings.workflow.submission')}</PkpTabsTrigger>
              <PkpTabsTrigger value="review">{t('editor.settings.workflow.review')}</PkpTabsTrigger>
              <PkpTabsTrigger value="library">{t('editor.settings.workflow.library')}</PkpTabsTrigger>
              <PkpTabsTrigger value="emails">{t('editor.settings.workflow.emails')}</PkpTabsTrigger>
            </PkpTabsList>
          </div>

          {/* Submission Tab */}
          <PkpTabsContent value="submission" style={{ padding: "0", backgroundColor: "#ffffff" }}>
            <div style={{ display: "flex", gap: 0, minHeight: "500px" }}>
              {/* Side Tabs */}
              <div style={{
                width: "20rem",
                flexShrink: 0,
                borderRight: "1px solid #e5e5e5",
                backgroundColor: "#f8f9fa",
                padding: "1rem 0",
              }}>
                <button
                  onClick={() => setActiveSubTab("disableSubmissions")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activeSubTab === "disableSubmissions" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activeSubTab === "disableSubmissions" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeSubTab === "disableSubmissions" ? 600 : 400,
                  }}
                >
                  Disable Submissions
                </button>
                <button
                  onClick={() => setActiveSubTab("metadata")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activeSubTab === "metadata" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activeSubTab === "metadata" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeSubTab === "metadata" ? 600 : 400,
                  }}
                >
                  Metadata
                </button>
                <button
                  onClick={() => setActiveSubTab("components")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activeSubTab === "components" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activeSubTab === "components" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeSubTab === "components" ? 600 : 400,
                  }}
                >
                  Components
                </button>
                <button
                  onClick={() => setActiveSubTab("submissionChecklist")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activeSubTab === "submissionChecklist" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activeSubTab === "submissionChecklist" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeSubTab === "submissionChecklist" ? 600 : 400,
                  }}
                >
                  Submission Checklist
                </button>
                <button
                  onClick={() => setActiveSubTab("authorGuidelines")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activeSubTab === "authorGuidelines" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activeSubTab === "authorGuidelines" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeSubTab === "authorGuidelines" ? 600 : 400,
                  }}
                >
                  Author Guidelines
                </button>
              </div>

              {/* Content Area */}
              <div style={{ flex: 1, padding: "1.5rem", backgroundColor: "#ffffff" }}>
                  {/* Disable Submissions */}
                  {activeSubTab === "disableSubmissions" && (
                    <div>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <h2 style={{
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        marginBottom: "1rem",
                        color: "#002C40",
                      }}>
                        Disable Submissions
                      </h2>
                      <div style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e5e5",
                        padding: "1.5rem",
                      }}>
                        <PkpCheckbox
                          id="disableSubmissions"
                          label="Disable submissions to this journal"
                        />
                        <p style={{
                          fontSize: "0.875rem",
                          color: "rgba(0, 0, 0, 0.54)",
                          marginTop: "0.75rem",
                          marginBottom: 0,
                        }}>
                          When enabled, authors will not be able to submit new manuscripts to this journal. Existing submissions will continue through the editorial workflow.
                        </p>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Metadata */}
                  {activeSubTab === "metadata" && (
                    <div>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <h2 style={{
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        marginBottom: "1rem",
                        color: "#002C40",
                      }}>
                        Metadata
                      </h2>
                      <div style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e5e5",
                        padding: "1.5rem",
                      }}>
                        <p style={{
                          fontSize: "0.875rem",
                          color: "rgba(0, 0, 0, 0.54)",
                          marginBottom: "1.5rem",
                        }}>
                          Configure which metadata fields are available and whether authors can add them during submission.
                        </p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                          <PkpButton variant="primary">
                            Add Metadata Field
                          </PkpButton>
                        </div>
                        <PkpTable>
                          <PkpTableHeader>
                            <PkpTableRow isHeader>
                              <PkpTableHead>Metadata Field</PkpTableHead>
                              <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Required</PkpTableHead>
                              <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Author Editable</PkpTableHead>
                              <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Actions</PkpTableHead>
                            </PkpTableRow>
                          </PkpTableHeader>
                          <tbody>
                            {USE_DUMMY && DUMMY_METADATA_FIELDS.length > 0 ? (
                              DUMMY_METADATA_FIELDS.map((field) => (
                                <PkpTableRow key={field.id}>
                                  <PkpTableCell>
                                    <div style={{ fontWeight: 500 }}>{field.field}</div>
                                    {field.description && (
                                      <div style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)", marginTop: "0.25rem" }}>
                                        {field.description}
                                      </div>
                                    )}
                                  </PkpTableCell>
                                  <PkpTableCell style={{ width: "120px", textAlign: "center" }}>
                                    <PkpCheckbox checked={field.required} readOnly />
                                  </PkpTableCell>
                                  <PkpTableCell style={{ width: "120px", textAlign: "center" }}>
                                    <PkpCheckbox checked={field.authorEditable} readOnly />
                                  </PkpTableCell>
                                  <PkpTableCell style={{ width: "120px", textAlign: "center" }}>
                                    <PkpButton variant="onclick" size="sm" style={{ marginRight: "0.5rem" }}>{t('common.edit')}</PkpButton>
                                    <PkpButton variant="onclick" size="sm">{t('common.delete')}</PkpButton>
                                  </PkpTableCell>
                                </PkpTableRow>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)", fontSize: "0.875rem" }}>
                                  {USE_DUMMY ? "No metadata fields found." : "Metadata fields grid will be implemented here with add, edit, delete, and configuration functionality."}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </PkpTable>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Components */}
                  {activeSubTab === "components" && (
                    <div>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <h2 style={{
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        marginBottom: "1rem",
                        color: "#002C40",
                      }}>
                        Components (File Types)
                      </h2>
                      <div style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e5e5",
                        padding: "1.5rem",
                      }}>
                        <p style={{
                          fontSize: "0.875rem",
                          color: "rgba(0, 0, 0, 0.54)",
                          marginBottom: "1.5rem",
                        }}>
                          Components are types of files that can be included with a submission. Configure which file types authors can upload.
                        </p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                          <PkpButton variant="primary">
                            Add Component
                          </PkpButton>
                        </div>
                        <PkpTable>
                          <PkpTableHeader>
                            <PkpTableRow isHeader>
                              <PkpTableHead style={{ width: "60px" }}>ID</PkpTableHead>
                              <PkpTableHead>Component Name</PkpTableHead>
                              <PkpTableHead>Designation</PkpTableHead>
                              <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Required</PkpTableHead>
                              <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Actions</PkpTableHead>
                            </PkpTableRow>
                          </PkpTableHeader>
                          <tbody>
                            {USE_DUMMY && DUMMY_COMPONENTS.length > 0 ? (
                              DUMMY_COMPONENTS.map((component) => (
                                <PkpTableRow key={component.id}>
                                  <PkpTableCell style={{ width: "60px" }}>{component.id}</PkpTableCell>
                                  <PkpTableCell>
                                    <div style={{ fontWeight: 500 }}>{component.name}</div>
                                    {component.description && (
                                      <div style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)", marginTop: "0.25rem" }}>
                                        {component.description}
                                      </div>
                                    )}
                                  </PkpTableCell>
                                  <PkpTableCell>{component.designation}</PkpTableCell>
                                  <PkpTableCell style={{ width: "120px", textAlign: "center" }}>
                                    <PkpCheckbox checked={component.required} readOnly />
                                  </PkpTableCell>
                                  <PkpTableCell style={{ width: "120px", textAlign: "center" }}>
                                    <PkpButton variant="onclick" size="sm" style={{ marginRight: "0.5rem" }}>{t('common.edit')}</PkpButton>
                                    <PkpButton variant="onclick" size="sm">{t('common.delete')}</PkpButton>
                                  </PkpTableCell>
                                </PkpTableRow>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)", fontSize: "0.875rem" }}>
                                  {USE_DUMMY ? "No components found." : "Components grid will be implemented here with add, edit, delete functionality."}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </PkpTable>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Submission Checklist */}
                  {activeSubTab === "submissionChecklist" && (
                    <div>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <h2 style={{
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        marginBottom: "1rem",
                        color: "#002C40",
                      }}>
                        Submission Checklist
                      </h2>
                      <div style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e5e5",
                        padding: "1.5rem",
                      }}>
                        <p style={{
                          fontSize: "0.875rem",
                          color: "rgba(0, 0, 0, 0.54)",
                          marginBottom: "1.5rem",
                        }}>
                          Provide authors with a checklist of tasks they should complete before submitting their manuscript.
                        </p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                          <PkpButton variant="primary">
                            Add Checklist Item
                          </PkpButton>
                        </div>
                        <PkpTable>
                          <PkpTableHeader>
                            <PkpTableRow isHeader>
                              <PkpTableHead style={{ width: "60px" }}>Order</PkpTableHead>
                              <PkpTableHead>Checklist Item</PkpTableHead>
                              <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Actions</PkpTableHead>
                            </PkpTableRow>
                          </PkpTableHeader>
                          <tbody>
                            {USE_DUMMY && DUMMY_CHECKLIST.length > 0 ? (
                              DUMMY_CHECKLIST.map((item) => (
                                <PkpTableRow key={item.id}>
                                  <PkpTableCell style={{ width: "60px" }}>{item.order}</PkpTableCell>
                                  <PkpTableCell>
                                    <div style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.84)" }}>{item.content}</div>
                                  </PkpTableCell>
                                  <PkpTableCell style={{ width: "120px", textAlign: "center" }}>
                                    <PkpButton variant="onclick" size="sm" style={{ marginRight: "0.5rem" }}>{t('common.edit')}</PkpButton>
                                    <PkpButton variant="onclick" size="sm">{t('common.delete')}</PkpButton>
                                  </PkpTableCell>
                                </PkpTableRow>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={3} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)", fontSize: "0.875rem" }}>
                                  {USE_DUMMY ? "No checklist items found." : "Submission checklist grid will be implemented here with add, edit, delete, and reorder functionality."}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </PkpTable>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Author Guidelines */}
                  {activeSubTab === "authorGuidelines" && (
                    <div>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <h2 style={{
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        marginBottom: "1rem",
                        color: "#002C40",
                      }}>
                        Author Guidelines
                      </h2>
                      <div style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e5e5",
                        padding: "1.5rem",
                      }}>
                        {/* Feedback Message */}
                        {feedback.type && (
                          <div style={{
                            padding: "0.75rem 1rem",
                            marginBottom: "1.5rem",
                            borderRadius: "4px",
                            backgroundColor: feedback.type === "success" ? "#d4edda" : "#f8d7da",
                            color: feedback.type === "success" ? "#155724" : "#721c24",
                            border: `1px solid ${feedback.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
                            fontSize: "0.875rem",
                          }}>
                            {feedback.message}
                          </div>
                        )}

                        <label style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          marginBottom: "0.5rem",
                          color: "#002C40",
                        }}>
                          Author Guidelines
                        </label>
                        <PkpTextarea
                          rows={10}
                          value={authorGuidelines}
                          onChange={(e) => setAuthorGuidelines(e.target.value)}
                          placeholder="Enter author guidelines that will be shown to authors when they make a submission..."
                          style={{
                            width: "100%",
                            minHeight: "200px",
                          }}
                        />
                        <p style={{
                          fontSize: "0.75rem",
                          color: "rgba(0, 0, 0, 0.54)",
                          marginTop: "0.5rem",
                          marginBottom: "1rem",
                        }}>
                          These guidelines will be displayed to authors during the submission process.
                        </p>
                        <PkpButton 
                          variant="primary" 
                          onClick={handleSaveAuthorGuidelines}
                          disabled={authorGuidelinesSettings.loading}
                          loading={authorGuidelinesSettings.loading}
                        >
                          {authorGuidelinesSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}
                        </PkpButton>
                      </div>
                    </div>
                  </div>
                  )}
                </div>
              </div>
          </PkpTabsContent>

          {/* Review Tab */}
          <PkpTabsContent value="review" style={{ padding: "0", backgroundColor: "#ffffff" }}>
            <div style={{ display: "flex", gap: 0, minHeight: "500px" }}>
              {/* Side Tabs */}
              <div style={{
                width: "20rem",
                flexShrink: 0,
                borderRight: "1px solid #e5e5e5",
                backgroundColor: "#f8f9fa",
                padding: "1rem 0",
              }}>
                <button
                  onClick={() => setActiveReviewSubTab("reviewSetup")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activeReviewSubTab === "reviewSetup" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activeReviewSubTab === "reviewSetup" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeReviewSubTab === "reviewSetup" ? 600 : 400,
                  }}
                >
                  Setup
                </button>
                <button
                  onClick={() => setActiveReviewSubTab("reviewerGuidance")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activeReviewSubTab === "reviewerGuidance" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activeReviewSubTab === "reviewerGuidance" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeReviewSubTab === "reviewerGuidance" ? 600 : 400,
                  }}
                >
                  Reviewer Guidance
                </button>
                <button
                  onClick={() => setActiveReviewSubTab("reviewForms")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activeReviewSubTab === "reviewForms" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activeReviewSubTab === "reviewForms" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeReviewSubTab === "reviewForms" ? 600 : 400,
                  }}
                >
                  Review Forms
                </button>
              </div>

              {/* Content Area */}
              <div style={{ flex: 1, padding: "1.5rem", backgroundColor: "#ffffff" }}>
                {/* Review Setup */}
                {activeReviewSubTab === "reviewSetup" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Review Setup
                    </h2>
                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e5e5",
                      padding: "1.5rem",
                    }}>
                      {/* Feedback Message */}
                      {feedback.type && (
                        <div style={{
                          padding: "0.75rem 1rem",
                          marginBottom: "1.5rem",
                          borderRadius: "4px",
                          backgroundColor: feedback.type === "success" ? "#d4edda" : "#f8d7da",
                          color: feedback.type === "success" ? "#155724" : "#721c24",
                          border: `1px solid ${feedback.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
                          fontSize: "0.875rem",
                        }}>
                          {feedback.message}
                        </div>
                      )}

                      {/* Review Mode */}
                      <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          marginBottom: "0.75rem",
                          color: "#002C40",
                        }}>
                          Default Review Mode
                        </label>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          <PkpRadio
                            id="reviewMode-doubleAnonymous"
                            name="defaultReviewMode"
                            value="doubleAnonymous"
                            checked={reviewSetup.defaultReviewMode === "doubleAnonymous"}
                            onChange={(e) => setReviewSetup({ ...reviewSetup, defaultReviewMode: "doubleAnonymous" })}
                            label="Double Anonymous"
                          />
                          <PkpRadio
                            id="reviewMode-anonymous"
                            name="defaultReviewMode"
                            value="anonymous"
                            checked={reviewSetup.defaultReviewMode === "anonymous"}
                            onChange={(e) => setReviewSetup({ ...reviewSetup, defaultReviewMode: "anonymous" })}
                            label="Anonymous"
                          />
                          <PkpRadio
                            id="reviewMode-open"
                            name="defaultReviewMode"
                            value="open"
                            checked={reviewSetup.defaultReviewMode === "open"}
                            onChange={(e) => setReviewSetup({ ...reviewSetup, defaultReviewMode: "open" })}
                            label="Open"
                          />
                        </div>
                        <p style={{
                          fontSize: "0.75rem",
                          color: "rgba(0, 0, 0, 0.54)",
                          marginTop: "0.5rem",
                          marginBottom: 0,
                        }}>
                          Choose the default review mode. This can be changed on a per-submission and per-review basis by an editor.
                        </p>
                      </div>

                      {/* Restrict Reviewer File Access */}
                      <div style={{ marginBottom: "1.5rem" }}>
                        <PkpCheckbox
                          id="restrictReviewerFileAccess"
                          checked={reviewSetup.restrictReviewerFileAccess}
                          onChange={(e) => setReviewSetup({ ...reviewSetup, restrictReviewerFileAccess: e.target.checked })}
                          label="Restrict reviewer file access to assigned submissions only"
                        />
                        <p style={{
                          fontSize: "0.75rem",
                          color: "rgba(0, 0, 0, 0.54)",
                          marginTop: "0.5rem",
                          marginBottom: 0,
                        }}>
                          When enabled, reviewers can only access files for submissions they have been assigned to review.
                        </p>
                      </div>

                      {/* One-Click Reviewer Access */}
                      <div style={{ marginBottom: "1.5rem" }}>
                        <PkpCheckbox
                          id="reviewerAccessKeysEnabled"
                          checked={reviewSetup.reviewerAccessKeysEnabled}
                          onChange={(e) => setReviewSetup({ ...reviewSetup, reviewerAccessKeysEnabled: e.target.checked })}
                          label="Enable one-click reviewer access"
                        />
                        <p style={{
                          fontSize: "0.75rem",
                          color: "rgba(0, 0, 0, 0.54)",
                          marginTop: "0.5rem",
                          marginBottom: 0,
                        }}>
                          When enabled, email invitations to reviewers will contain a special URL that takes invited reviewers directly to the Review page for the submission without requiring them to log in. For security reasons, with this option, editors are not able to modify email addresses or add CCs or BCCs prior to sending invitations to reviewers.
                        </p>
                      </div>

                      {/* Default Review Response Time */}
                      <div style={{ marginBottom: "1.5rem" }}>
                        <label htmlFor="numWeeksPerResponse" style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          marginBottom: "0.5rem",
                          color: "#002C40",
                        }}>
                          Default Review Response Time (Weeks)
                        </label>
                        <PkpInput
                          id="numWeeksPerResponse"
                          type="number"
                          value={reviewSetup.numWeeksPerResponse}
                          onChange={(e) => setReviewSetup({ ...reviewSetup, numWeeksPerResponse: e.target.value })}
                          placeholder="2"
                          style={{ width: "200px" }}
                        />
                        <p style={{
                          fontSize: "0.75rem",
                          color: "rgba(0, 0, 0, 0.54)",
                          marginTop: "0.5rem",
                          marginBottom: 0,
                        }}>
                          Number of weeks reviewers have to respond to review invitations.
                        </p>
                      </div>

                      {/* Default Review Completion Time */}
                      <div style={{ marginBottom: "1.5rem" }}>
                        <label htmlFor="numWeeksPerReview" style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          marginBottom: "0.5rem",
                          color: "#002C40",
                        }}>
                          Default Review Completion Time (Weeks)
                        </label>
                        <PkpInput
                          id="numWeeksPerReview"
                          type="number"
                          value={reviewSetup.numWeeksPerReview}
                          onChange={(e) => setReviewSetup({ ...reviewSetup, numWeeksPerReview: e.target.value })}
                          placeholder="4"
                          style={{ width: "200px" }}
                        />
                        <p style={{
                          fontSize: "0.75rem",
                          color: "rgba(0, 0, 0, 0.54)",
                          marginTop: "0.5rem",
                          marginBottom: 0,
                        }}>
                          Number of weeks reviewers have to complete their reviews.
                        </p>
                      </div>

                      {/* Review Reminders */}
                      <div style={{ marginBottom: "1.5rem" }}>
                        <h3 style={{
                          fontSize: "1rem",
                          fontWeight: 600,
                          marginBottom: "0.75rem",
                          color: "#002C40",
                        }}>
                          Review Reminders
                        </h3>
                        <div style={{ marginBottom: "1rem" }}>
                          <label htmlFor="numDaysBeforeInviteReminder" style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            marginBottom: "0.5rem",
                            color: "#002C40",
                          }}>
                            Days Before Sending Reminder for Review Invitation Response
                          </label>
                          <PkpInput
                            id="numDaysBeforeInviteReminder"
                            type="number"
                            value={reviewSetup.numDaysBeforeInviteReminder}
                            onChange={(e) => setReviewSetup({ ...reviewSetup, numDaysBeforeInviteReminder: e.target.value })}
                            placeholder="3"
                            style={{ width: "200px" }}
                          />
                        </div>
                        <div style={{ marginBottom: "1rem" }}>
                          <label htmlFor="numDaysBeforeSubmitReminder" style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            marginBottom: "0.5rem",
                            color: "#002C40",
                          }}>
                            Days Before Sending Reminder for Review Submission
                          </label>
                          <PkpInput
                            id="numDaysBeforeSubmitReminder"
                            type="number"
                            value={reviewSetup.numDaysBeforeSubmitReminder}
                            onChange={(e) => setReviewSetup({ ...reviewSetup, numDaysBeforeSubmitReminder: e.target.value })}
                            placeholder="7"
                            style={{ width: "200px" }}
                          />
                        </div>
                      </div>

                      <PkpButton 
                        variant="primary" 
                        onClick={handleSaveReviewSetup}
                        disabled={reviewSetupSettings.loading}
                        loading={reviewSetupSettings.loading}
                      >
                        {reviewSetupSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}
                      </PkpButton>
                    </div>
                  </div>
                )}

                {/* Reviewer Guidance */}
                {activeReviewSubTab === "reviewerGuidance" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Reviewer Guidance
                    </h2>
                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e5e5",
                      padding: "1.5rem",
                    }}>
                      {/* Feedback Message */}
                      {feedback.type && (
                        <div style={{
                          padding: "0.75rem 1rem",
                          marginBottom: "1.5rem",
                          borderRadius: "4px",
                          backgroundColor: feedback.type === "success" ? "#d4edda" : "#f8d7da",
                          color: feedback.type === "success" ? "#155724" : "#721c24",
                          border: `1px solid ${feedback.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
                          fontSize: "0.875rem",
                        }}>
                          {feedback.message}
                        </div>
                      )}

                      <p style={{
                        fontSize: "0.875rem",
                        color: "rgba(0, 0, 0, 0.54)",
                        marginBottom: "1.5rem",
                      }}>
                        Provide reviewers with criteria for judging a submission's suitability for publication in the journal, which may include instructions for preparing an effective and helpful review.
                      </p>

                      {/* Review Guidelines */}
                      <div style={{ marginBottom: "1.5rem" }}>
                        <label htmlFor="reviewGuidelines" style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          marginBottom: "0.5rem",
                          color: "#002C40",
                        }}>
                          Review Guidelines
                        </label>
                        <PkpTextarea
                          id="reviewGuidelines"
                          rows={10}
                          value={reviewerGuidance.reviewGuidelines}
                          onChange={(e) => setReviewerGuidance({ ...reviewerGuidance, reviewGuidelines: e.target.value })}
                          placeholder="Enter review guidelines for reviewers..."
                          style={{ width: "100%" }}
                        />
                        <p style={{
                          fontSize: "0.75rem",
                          color: "rgba(0, 0, 0, 0.54)",
                          marginTop: "0.5rem",
                          marginBottom: 0,
                        }}>
                          Guidelines that will be displayed to reviewers when they prepare their reviews.
                        </p>
                      </div>

                      {/* Competing Interests */}
                      <div style={{ marginBottom: "1.5rem" }}>
                        <label htmlFor="competingInterests" style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          marginBottom: "0.5rem",
                          color: "#002C40",
                        }}>
                          Competing Interests
                        </label>
                        <PkpTextarea
                          id="competingInterests"
                          rows={8}
                          value={reviewerGuidance.competingInterests}
                          onChange={(e) => setReviewerGuidance({ ...reviewerGuidance, competingInterests: e.target.value })}
                          placeholder="Enter competing interests statement..."
                          style={{ width: "100%" }}
                        />
                        <p style={{
                          fontSize: "0.75rem",
                          color: "rgba(0, 0, 0, 0.54)",
                          marginTop: "0.5rem",
                          marginBottom: 0,
                        }}>
                          Statement about competing interests that will be displayed to reviewers.
                        </p>
                      </div>

                      {/* Show Ensuring Link */}
                      <div style={{ marginBottom: "1.5rem" }}>
                        <PkpCheckbox
                          id="showEnsuringLink"
                          checked={reviewerGuidance.showEnsuringLink}
                          onChange={(e) => setReviewerGuidance({ ...reviewerGuidance, showEnsuringLink: e.target.checked })}
                          label="Show link to the anonymous review process documentation"
                        />
                      </div>

                      <PkpButton 
                        variant="primary" 
                        onClick={handleSaveReviewerGuidance}
                        disabled={reviewerGuidanceSettings.loading}
                        loading={reviewerGuidanceSettings.loading}
                      >
                        {reviewerGuidanceSettings.loading ? "Saving..." : "Save"}
                      </PkpButton>
                    </div>
                  </div>
                )}

                {/* Review Forms */}
                {activeReviewSubTab === "reviewForms" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Review Forms
                    </h2>
                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e5e5",
                      padding: "1.5rem",
                    }}>
                      <p style={{
                        fontSize: "0.875rem",
                        color: "rgba(0, 0, 0, 0.54)",
                        marginBottom: "1rem",
                      }}>
                        If you would like to request specific information from reviewers, you can build forms here. An editor will be able to select a form when assigning a reviewer, and the reviewer will be asked to complete that form when they are submitting their review.
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <PkpButton variant="primary">
                          Add Review Form
                        </PkpButton>
                      </div>
                      <PkpTable>
                        <PkpTableHeader>
                          <PkpTableRow isHeader>
                            <PkpTableHead style={{ width: "60px" }}>ID</PkpTableHead>
                            <PkpTableHead>Review Form</PkpTableHead>
                            <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Active</PkpTableHead>
                            <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Actions</PkpTableHead>
                          </PkpTableRow>
                        </PkpTableHeader>
                        <tbody>
                          {USE_DUMMY && DUMMY_REVIEW_FORMS.length > 0 ? (
                            DUMMY_REVIEW_FORMS.map((form) => (
                              <PkpTableRow key={form.id}>
                                <PkpTableCell style={{ width: "60px" }}>{form.id}</PkpTableCell>
                                <PkpTableCell>
                                  <div style={{ fontWeight: 500 }}>{form.title}</div>
                                  {form.description && (
                                    <div style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)", marginTop: "0.25rem" }}>
                                      {form.description}
                                    </div>
                                  )}
                                </PkpTableCell>
                                <PkpTableCell style={{ width: "120px", textAlign: "center" }}>
                                  <PkpCheckbox checked={form.active} readOnly />
                                </PkpTableCell>
                                <PkpTableCell style={{ width: "120px", textAlign: "center" }}>
                                  <PkpButton variant="onclick" size="sm" style={{ marginRight: "0.5rem" }}>Edit</PkpButton>
                                  <PkpButton variant="onclick" size="sm">Delete</PkpButton>
                                </PkpTableCell>
                              </PkpTableRow>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)", fontSize: "0.875rem" }}>
                                {USE_DUMMY ? "No review forms found." : "Review forms grid will be implemented here with add, edit, delete, and activate/deactivate functionality."}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </PkpTable>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </PkpTabsContent>

          {/* Library Tab */}
          <PkpTabsContent value="library" style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e5e5",
            padding: "1.5rem",
            boxShadow: "none",
            borderRadius: 0,
          }}>
            <h2 style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              marginBottom: "1rem",
              color: "#002C40",
            }}>
              Library Files
            </h2>
            <p style={{
              fontSize: "0.875rem",
              color: "rgba(0, 0, 0, 0.54)",
              marginBottom: "1.5rem",
            }}>
              The Library provides a file repository for storing and quickly sharing common files, such as writing guidelines, author contracts and release forms, and marketing materials. Items that are stored in the Library can be quickly retrieved and added into a Submission Library to be shared with authors or assistants.
            </p>
            <div style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e5e5",
              padding: "1.5rem",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <PkpButton variant="primary">
                  Upload Library File
                </PkpButton>
              </div>
              <PkpTable>
                <PkpTableHeader>
                  <PkpTableRow isHeader>
                    <PkpTableHead>File Name</PkpTableHead>
                    <PkpTableHead style={{ width: "150px" }}>File Type</PkpTableHead>
                    <PkpTableHead style={{ width: "120px" }}>Date Uploaded</PkpTableHead>
                    <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Actions</PkpTableHead>
                  </PkpTableRow>
                </PkpTableHeader>
                <tbody>
                  {USE_DUMMY && DUMMY_LIBRARY_FILES.length > 0 ? (
                    DUMMY_LIBRARY_FILES.map((file) => (
                      <PkpTableRow key={file.id}>
                        <PkpTableCell>
                          <div style={{ fontWeight: 500 }}>{file.fileName}</div>
                        </PkpTableCell>
                        <PkpTableCell style={{ width: "150px" }}>{file.fileType}</PkpTableCell>
                        <PkpTableCell style={{ width: "120px" }}>
                          <div style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.84)" }}>{file.dateUploaded}</div>
                          <div style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)", marginTop: "0.25rem" }}>{file.size}</div>
                        </PkpTableCell>
                        <PkpTableCell style={{ width: "120px", textAlign: "center" }}>
                          <PkpButton variant="onclick" size="sm" style={{ marginRight: "0.5rem" }}>Edit</PkpButton>
                          <PkpButton variant="onclick" size="sm">Delete</PkpButton>
                        </PkpTableCell>
                      </PkpTableRow>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)", fontSize: "0.875rem" }}>
                        {USE_DUMMY ? "No library files found." : "Library files grid will be implemented here with upload, edit, delete, and download functionality."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </PkpTable>
            </div>
          </PkpTabsContent>

          {/* Emails Tab */}
          <PkpTabsContent value="emails" style={{ padding: "0", backgroundColor: "#ffffff" }}>
            <div style={{ display: "flex", gap: 0, minHeight: "500px" }}>
              {/* Side Tabs */}
              <div style={{
                width: "20rem",
                flexShrink: 0,
                borderRight: "1px solid #e5e5e5",
                backgroundColor: "#f8f9fa",
                padding: "1rem 0",
              }}>
                <button
                  onClick={() => setActiveEmailSubTab("emailsSetup")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activeEmailSubTab === "emailsSetup" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activeEmailSubTab === "emailsSetup" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeEmailSubTab === "emailsSetup" ? 600 : 400,
                  }}
                >
                  Setup
                </button>
                <button
                  onClick={() => setActiveEmailSubTab("emailTemplates")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activeEmailSubTab === "emailTemplates" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activeEmailSubTab === "emailTemplates" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeEmailSubTab === "emailTemplates" ? 600 : 400,
                  }}
                >
                  Email Templates
                </button>
              </div>

              {/* Content Area */}
              <div style={{ flex: 1, padding: "1.5rem", backgroundColor: "#ffffff" }}>
                {/* Emails Setup */}
                {activeEmailSubTab === "emailsSetup" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Email Setup
                    </h2>
                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e5e5",
                      padding: "1.5rem",
                    }}>
                      {/* Feedback Message */}
                      {feedback.type && (
                        <div style={{
                          padding: "0.75rem 1rem",
                          marginBottom: "1.5rem",
                          borderRadius: "4px",
                          backgroundColor: feedback.type === "success" ? "#d4edda" : "#f8d7da",
                          color: feedback.type === "success" ? "#155724" : "#721c24",
                          border: `1px solid ${feedback.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
                          fontSize: "0.875rem",
                        }}>
                          {feedback.message}
                        </div>
                      )}

                      <p style={{
                        fontSize: "0.875rem",
                        color: "rgba(0, 0, 0, 0.54)",
                        marginBottom: "1.5rem",
                      }}>
                        OJS sends a number of emails during various stages of the editorial workflow as well as other actions such as registration and submission acknowledgement. The settings in this section allow you to edit the signature attached to each email as well as change the default messages sent for each type of email.
                      </p>

                      {/* Email Signature */}
                      <div style={{ marginBottom: "1.5rem" }}>
                        <label htmlFor="emailSignature" style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          marginBottom: "0.5rem",
                          color: "#002C40",
                        }}>
                          Email Signature
                        </label>
                        <PkpTextarea
                          id="emailSignature"
                          rows={8}
                          value={emailSetup.emailSignature}
                          onChange={(e) => setEmailSetup({ ...emailSetup, emailSignature: e.target.value })}
                          placeholder="Enter email signature that will be attached to all emails sent from the journal..."
                          style={{ width: "100%" }}
                        />
                        <p style={{
                          fontSize: "0.75rem",
                          color: "rgba(0, 0, 0, 0.54)",
                          marginTop: "0.5rem",
                          marginBottom: 0,
                        }}>
                          The email signature that will be attached to all emails sent from the journal. You can use the following variables: {"{"}$contextName{"}"} will be replaced with the journal name.
                        </p>
                      </div>

                      {/* Email Bounce Address */}
                      <div style={{ marginBottom: "1.5rem" }}>
                        <label htmlFor="envelopeSender" style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          marginBottom: "0.5rem",
                          color: "#002C40",
                        }}>
                          Email Bounce Address
                        </label>
                        <PkpInput
                          id="envelopeSender"
                          type="email"
                          value={emailSetup.envelopeSender}
                          onChange={(e) => setEmailSetup({ ...emailSetup, envelopeSender: e.target.value })}
                          placeholder="noreply@journal.example"
                          style={{ width: "100%" }}
                        />
                        <p style={{
                          fontSize: "0.75rem",
                          color: "rgba(0, 0, 0, 0.54)",
                          marginTop: "0.5rem",
                          marginBottom: 0,
                        }}>
                          Email address to use as the envelope sender (return path) for bounced emails.
                        </p>
                      </div>

                      <PkpButton 
                        variant="primary" 
                        onClick={handleSaveEmailSetup}
                        disabled={emailSetupSettings.loading}
                        loading={emailSetupSettings.loading}
                      >
                        {emailSetupSettings.loading ? "Saving..." : "Save"}
                      </PkpButton>
                    </div>
                  </div>
                )}

                {/* Email Templates */}
                {activeEmailSubTab === "emailTemplates" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Email Templates
                    </h2>
                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e5e5",
                      padding: "1.5rem",
                    }}>
                      <p style={{
                        fontSize: "0.875rem",
                        color: "rgba(0, 0, 0, 0.54)",
                        marginBottom: "1.5rem",
                      }}>
                        You can view a description of each email and edit the email by clicking the dropdown arrow on the right. Click Filters to filter templates by sender, recipient, workflow stage, and whether the template is enabled.
                      </p>
                      <div style={{ marginBottom: "1rem" }}>
                        <PkpInput
                          type="search"
                          placeholder="Filter by sender, recipient, workflow stage..."
                          style={{ width: "100%", maxWidth: "400px" }}
                        />
                      </div>
                      <PkpTable>
                        <PkpTableHeader>
                          <PkpTableRow isHeader>
                            <PkpTableHead>Email Template</PkpTableHead>
                            <PkpTableHead>Description</PkpTableHead>
                            <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Enabled</PkpTableHead>
                            <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Actions</PkpTableHead>
                          </PkpTableRow>
                        </PkpTableHeader>
                        <tbody>
                          {USE_DUMMY && DUMMY_EMAIL_TEMPLATES.length > 0 ? (
                            DUMMY_EMAIL_TEMPLATES.map((template) => (
                              <PkpTableRow key={template.id}>
                                <PkpTableCell>
                                  <div style={{ fontWeight: 500 }}>{template.name}</div>
                                  <div style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)", marginTop: "0.25rem" }}>
                                    Stage: {template.stage} • To: {template.recipient}
                                  </div>
                                </PkpTableCell>
                                <PkpTableCell>
                                  <div style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.84)" }}>{template.description}</div>
                                </PkpTableCell>
                                <PkpTableCell style={{ width: "120px", textAlign: "center" }}>
                                  <PkpCheckbox checked={template.enabled} readOnly />
                                </PkpTableCell>
                                <PkpTableCell style={{ width: "120px", textAlign: "center" }}>
                                  <PkpButton variant="onclick" size="sm" style={{ marginRight: "0.5rem" }}>Edit</PkpButton>
                                  <PkpButton variant="onclick" size="sm">Preview</PkpButton>
                                </PkpTableCell>
                              </PkpTableRow>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)", fontSize: "0.875rem" }}>
                                {USE_DUMMY ? "No email templates found." : "Email templates list will be implemented here with edit, preview, and enable/disable functionality."}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </PkpTable>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </PkpTabsContent>
        </PkpTabs>
      </div>
    </div>
  );
}
