"use client";

import { useState, useEffect } from "react";
import { PkpTabs, PkpTabsList, PkpTabsTrigger, PkpTabsContent } from "@/components/ui/pkp-tabs";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpCheckbox } from "@/components/ui/pkp-checkbox";
import { PkpInput } from "@/components/ui/pkp-input";
import { PkpTable, PkpTableHeader, PkpTableRow, PkpTableHead, PkpTableCell } from "@/components/ui/pkp-table";
import { DUMMY_USERS, DUMMY_ROLES } from "@/features/editor/settings-dummy-data";
import { USE_DUMMY } from "@/lib/dummy";
import { useJournalSettings, useMigrateLocalStorageToDatabase } from "@/features/editor/hooks/useJournalSettings";
import { useI18n } from "@/contexts/I18nContext";

export default function SettingsAccessPage() {
  const { t } = useI18n();
  // Database integration
  const accessSettings = useJournalSettings({
    section: "access",
    autoLoad: true,
  });

  // Migrate localStorage to database
  const migrateAccess = useMigrateLocalStorageToDatabase(
    "access",
    [
      "siteAccess_allowRegistrations",
      "siteAccess_requireReviewerInterests",
      "siteAccess_allowRememberMe",
      "siteAccess_sessionLifetime",
      "siteAccess_forceSSL",
    ]
  );

  useEffect(() => {
    migrateAccess.migrate();
  }, []);

  // Form states - Site Access
  const [siteAccess, setSiteAccess] = useState({
    allowRegistrations: false,
    requireReviewerInterests: false,
    allowRememberMe: true,
    sessionLifetime: "3600",
    forceSSL: false,
  });

  // Load from database
  useEffect(() => {
    if (accessSettings.settings && Object.keys(accessSettings.settings).length > 0) {
      const settings = accessSettings.settings as any;
      setSiteAccess({
        allowRegistrations: settings.siteAccess_allowRegistrations ?? siteAccess.allowRegistrations,
        requireReviewerInterests: settings.siteAccess_requireReviewerInterests ?? siteAccess.requireReviewerInterests,
        allowRememberMe: settings.siteAccess_allowRememberMe ?? siteAccess.allowRememberMe,
        sessionLifetime: settings.siteAccess_sessionLifetime ?? siteAccess.sessionLifetime,
        forceSSL: settings.siteAccess_forceSSL ?? siteAccess.forceSSL,
      });
    }
  }, [accessSettings.settings]);

  // Feedback states
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Auto-dismiss feedback
  useEffect(() => {
    if (feedback.type) {
      const timer = setTimeout(() => setFeedback({ type: null, message: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Save handler
  const handleSaveSiteAccess = async () => {
    // Validate session lifetime
    if (siteAccess.sessionLifetime && parseInt(siteAccess.sessionLifetime) < 60) {
      setFeedback({ type: "error", message: "Session lifetime must be at least 60 seconds." });
      return;
    }

    setFeedback({ type: null, message: "" });

    // Save to database
    const success = await accessSettings.saveSettings({
      siteAccess_allowRegistrations: siteAccess.allowRegistrations,
      siteAccess_requireReviewerInterests: siteAccess.requireReviewerInterests,
      siteAccess_allowRememberMe: siteAccess.allowRememberMe,
      siteAccess_sessionLifetime: siteAccess.sessionLifetime,
      siteAccess_forceSSL: siteAccess.forceSSL,
    });

    if (success) {
      setFeedback({ type: "success", message: "Site access settings saved successfully." });
    } else {
      setFeedback({
        type: "error",
        message: accessSettings.error || "Failed to save site access settings.",
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
            {t('editor.settings.settingsTitle')} • {t('editor.settings.access.title')}
          </h1>
          <p style={{
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            marginTop: "0.5rem",
            marginBottom: 0,
          }}>
            Manage users, roles, and site access options for the journal.
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
        <PkpTabs defaultValue="users">
          {/* Main Tabs */}
          <div style={{
            borderBottom: "2px solid #e5e5e5",
            background: "#ffffff",
            padding: "0",
            display: "flex",
            marginBottom: "1.5rem",
          }}>
            <PkpTabsList style={{ flex: 1, padding: "0 1.5rem" }}>
              <PkpTabsTrigger value="users">Users</PkpTabsTrigger>
              <PkpTabsTrigger value="roles">Roles</PkpTabsTrigger>
              <PkpTabsTrigger value="siteAccess">Site Access</PkpTabsTrigger>
            </PkpTabsList>
          </div>

          {/* Users Tab */}
          <PkpTabsContent value="users" style={{ padding: "1.5rem", backgroundColor: "#ffffff" }}>
            <div>
              <h2 style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1rem",
                color: "#002C40",
              }}>
                Users
              </h2>
              <p style={{
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
                marginBottom: "1rem",
              }}>
                Manage users who have access to this journal. You can add new users, edit existing users, and assign roles.
              </p>
              <div style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e5e5",
                padding: "1.5rem",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <PkpButton variant="primary">
                    Add User
                  </PkpButton>
                </div>
                <PkpTable>
                  <PkpTableHeader>
                    <PkpTableRow isHeader>
                      <PkpTableHead style={{ width: "60px" }}>ID</PkpTableHead>
                      <PkpTableHead>Name</PkpTableHead>
                      <PkpTableHead>Email</PkpTableHead>
                      <PkpTableHead>Roles</PkpTableHead>
                      <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Actions</PkpTableHead>
                    </PkpTableRow>
                  </PkpTableHeader>
                  <tbody>
                    {USE_DUMMY && DUMMY_USERS.length > 0 ? (
                      DUMMY_USERS.map((user) => (
                        <PkpTableRow key={user.id}>
                          <PkpTableCell style={{ width: "60px" }}>{user.id}</PkpTableCell>
                          <PkpTableCell>
                            <div style={{ fontWeight: 500 }}>{user.name}</div>
                          </PkpTableCell>
                          <PkpTableCell>{user.email}</PkpTableCell>
                          <PkpTableCell>
                            {Array.isArray(user.roles) ? (
                              <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                                {user.roles.map((role, idx) => (
                                  <span
                                    key={idx}
                                    style={{
                                      display: "inline-block",
                                      padding: "0.125rem 0.5rem",
                                      backgroundColor: "#f0f0f0",
                                      borderRadius: "0.125rem",
                                      fontSize: "0.75rem",
                                      color: "rgba(0, 0, 0, 0.84)",
                                    }}
                                  >
                                    {role}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.54)" }}>{user.roles}</span>
                            )}
                          </PkpTableCell>
                          <PkpTableCell style={{ width: "120px", textAlign: "center" }}>
                            <PkpButton variant="onclick" size="sm" style={{ marginRight: "0.5rem" }}>Edit</PkpButton>
                            <PkpButton variant="onclick" size="sm">Delete</PkpButton>
                          </PkpTableCell>
                        </PkpTableRow>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)", fontSize: "0.875rem" }}>
                          {USE_DUMMY ? "No users found." : "Users grid will be implemented here with add, edit, delete, and role assignment functionality."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </PkpTable>
              </div>
            </div>
          </PkpTabsContent>

          {/* Roles Tab */}
          <PkpTabsContent value="roles" style={{ padding: "1.5rem", backgroundColor: "#ffffff" }}>
            <div>
              <h2 style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1rem",
                color: "#002C40",
              }}>
                Roles
              </h2>
              <p style={{
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
                marginBottom: "1rem",
              }}>
                Configure role permissions and user groups. Roles define what actions users can perform in the journal.
              </p>
              <div style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e5e5",
                padding: "1.5rem",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <PkpButton variant="primary">
                    Add Role
                  </PkpButton>
                </div>
                <PkpTable>
                  <PkpTableHeader>
                    <PkpTableRow isHeader>
                      <PkpTableHead style={{ width: "60px" }}>ID</PkpTableHead>
                      <PkpTableHead>Role Name</PkpTableHead>
                      <PkpTableHead>Description</PkpTableHead>
                      <PkpTableHead style={{ width: "120px" }}>Users</PkpTableHead>
                      <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Actions</PkpTableHead>
                    </PkpTableRow>
                  </PkpTableHeader>
                  <tbody>
                    {USE_DUMMY && DUMMY_ROLES.length > 0 ? (
                      DUMMY_ROLES.map((role) => (
                        <PkpTableRow key={role.id}>
                          <PkpTableCell style={{ width: "60px" }}>{role.id}</PkpTableCell>
                          <PkpTableCell>
                            <div style={{ fontWeight: 500 }}>{role.name}</div>
                          </PkpTableCell>
                          <PkpTableCell>
                            <div style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.84)" }}>{role.description}</div>
                          </PkpTableCell>
                          <PkpTableCell style={{ width: "120px" }}>
                            <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{role.users}</span>
                            <span style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)", marginLeft: "0.25rem" }}>users</span>
                          </PkpTableCell>
                          <PkpTableCell style={{ width: "120px", textAlign: "center" }}>
                            <PkpButton variant="onclick" size="sm" style={{ marginRight: "0.5rem" }}>Edit</PkpButton>
                            <PkpButton variant="onclick" size="sm">Delete</PkpButton>
                          </PkpTableCell>
                        </PkpTableRow>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)", fontSize: "0.875rem" }}>
                          {USE_DUMMY ? "No roles found." : "Roles grid will be implemented here with add, edit, delete, and permission configuration functionality."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </PkpTable>
              </div>
            </div>
          </PkpTabsContent>

          {/* Site Access Tab */}
          <PkpTabsContent value="siteAccess" style={{ padding: "1.5rem", backgroundColor: "#ffffff" }}>
            <div>
              <h2 style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1rem",
                color: "#002C40",
              }}>
                Site Access Options
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

                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    marginBottom: "0.75rem",
                    color: "#002C40",
                  }}>
                    Registration Options
                  </h3>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <PkpCheckbox
                        id="allowRegistrations"
                        checked={siteAccess.allowRegistrations}
                        onChange={(e) => setSiteAccess({ ...siteAccess, allowRegistrations: e.target.checked })}
                      />
                      Allow user self-registration
                    </label>
                    <p style={{
                      fontSize: "0.75rem",
                      color: "rgba(0, 0, 0, 0.54)",
                      marginTop: "0.5rem",
                      marginBottom: 0,
                    }}>
                      When enabled, users can register accounts themselves. When disabled, only administrators can create user accounts.
                    </p>
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <PkpCheckbox
                        id="requireReviewerInterests"
                        checked={siteAccess.requireReviewerInterests}
                        onChange={(e) => setSiteAccess({ ...siteAccess, requireReviewerInterests: e.target.checked })}
                      />
                      Require reviewers to indicate their review interests
                    </label>
                  </div>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    marginBottom: "0.75rem",
                    color: "#002C40",
                  }}>
                    Login Options
                  </h3>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <PkpCheckbox
                        id="allowRememberMe"
                        checked={siteAccess.allowRememberMe}
                        onChange={(e) => setSiteAccess({ ...siteAccess, allowRememberMe: e.target.checked })}
                      />
                      Allow users to enable 'Remember Me' login option
                    </label>
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label htmlFor="sessionLifetime" style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                      color: "#002C40",
                    }}>
                      Session lifetime (in seconds)
                    </label>
                    <PkpInput
                      id="sessionLifetime"
                      type="number"
                      value={siteAccess.sessionLifetime}
                      onChange={(e) => setSiteAccess({ ...siteAccess, sessionLifetime: e.target.value })}
                      placeholder="3600"
                      style={{ width: "200px" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    marginBottom: "0.75rem",
                    color: "#002C40",
                  }}>
                    Security
                  </h3>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <PkpCheckbox
                        id="forceSSL"
                        checked={siteAccess.forceSSL}
                        onChange={(e) => setSiteAccess({ ...siteAccess, forceSSL: e.target.checked })}
                      />
                      Force SSL connections
                    </label>
                    <p style={{
                      fontSize: "0.75rem",
                      color: "rgba(0, 0, 0, 0.54)",
                      marginTop: "0.5rem",
                      marginBottom: 0,
                    }}>
                      When enabled, all connections must use HTTPS.
                    </p>
                  </div>
                </div>

                <PkpButton 
                  variant="primary" 
                  onClick={handleSaveSiteAccess}
                  disabled={accessSettings.loading}
                  loading={accessSettings.loading}
                >
                  {accessSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}
                </PkpButton>
              </div>
            </div>
          </PkpTabsContent>
        </PkpTabs>
      </div>
    </div>
  );
}

