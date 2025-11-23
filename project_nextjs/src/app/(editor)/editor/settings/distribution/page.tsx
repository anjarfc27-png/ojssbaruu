"use client";

import { useState, useEffect } from "react";
import { PkpTabs, PkpTabsList, PkpTabsTrigger, PkpTabsContent } from "@/components/ui/pkp-tabs";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpInput } from "@/components/ui/pkp-input";
import { PkpTextarea } from "@/components/ui/pkp-textarea";
import { PkpRadio } from "@/components/ui/pkp-radio";
import { PkpSelect } from "@/components/ui/pkp-select";
import { PkpCheckbox } from "@/components/ui/pkp-checkbox";
import { useJournalSettings, useMigrateLocalStorageToDatabase } from "@/features/editor/hooks/useJournalSettings";
import { useI18n } from "@/contexts/I18nContext";

export default function SettingsDistributionPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("license");

  // Database integration
  const distributionSettings = useJournalSettings({
    section: "distribution",
    autoLoad: true,
  });

  // Migrate localStorage to database
  const migrateDistribution = useMigrateLocalStorageToDatabase(
    "distribution",
    ["settings_distribution_license", "settings_distribution_indexing", "settings_distribution_payments"]
  );

  useEffect(() => {
    migrateDistribution.migrate();
  }, []);

  // License state
  const [distributionLicense, setDistributionLicense] = useState({
    copyrightHolderType: 'author',
    copyrightHolderOther: '',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    licenseUrlOther: '',
    copyrightYearBasis: 'issue',
    licenseTerms: '',
  });
  const [licenseFeedback, setLicenseFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Indexing state
  const [distributionIndexing, setDistributionIndexing] = useState({
    searchDescription: '',
    customHeaders: '',
    enableOai: true,
    enableRss: true,
    enableSitemap: true,
    enableGoogleScholar: false,
    enablePubMed: false,
    enableDoaj: false,
    customIndexingServices: '',
  });
  const [indexingFeedback, setIndexingFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Payments state
  const [distributionPayments, setDistributionPayments] = useState({
    paymentsEnabled: false,
    currency: '',
    paymentPluginName: '',
    paymentGatewayUrl: '',
    paymentInstructions: '',
  });
  const [paymentsFeedback, setPaymentsFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load saved data from database
  useEffect(() => {
    if (distributionSettings.settings && Object.keys(distributionSettings.settings).length > 0) {
      const settings = distributionSettings.settings as any;
      if (settings.license) {
        try {
          const licenseData = typeof settings.license === 'string' ? JSON.parse(settings.license) : settings.license;
          setDistributionLicense(licenseData);
        } catch {
          // If parsing fails, use defaults
        }
      }
      if (settings.indexing) {
        try {
          const indexingData = typeof settings.indexing === 'string' ? JSON.parse(settings.indexing) : settings.indexing;
          setDistributionIndexing(indexingData);
        } catch {
          // If parsing fails, use defaults
        }
      }
      if (settings.payments) {
        try {
          const paymentsData = typeof settings.payments === 'string' ? JSON.parse(settings.payments) : settings.payments;
          setDistributionPayments(paymentsData);
        } catch {
          // If parsing fails, use defaults
        }
      }
    }
  }, [distributionSettings.settings]);

  // Auto-dismiss feedback messages
  useEffect(() => {
    if (licenseFeedback) {
      const timer = setTimeout(() => setLicenseFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [licenseFeedback]);

  useEffect(() => {
    if (indexingFeedback) {
      const timer = setTimeout(() => setIndexingFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [indexingFeedback]);

  useEffect(() => {
    if (paymentsFeedback) {
      const timer = setTimeout(() => setPaymentsFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [paymentsFeedback]);

  // Save handlers
  const handleSaveLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!distributionLicense.copyrightHolderType) {
      setLicenseFeedback({ type: 'error', message: 'Copyright holder is required.' });
      return;
    }
    
    if (distributionLicense.copyrightHolderType === 'other' && !distributionLicense.copyrightHolderOther.trim()) {
      setLicenseFeedback({ type: 'error', message: 'Copyright holder name is required when "Other" is selected.' });
      return;
    }
    
    if (!distributionLicense.licenseUrl) {
      setLicenseFeedback({ type: 'error', message: 'License is required.' });
      return;
    }
    
    if (distributionLicense.licenseUrl === 'other' && !distributionLicense.licenseUrlOther.trim()) {
      setLicenseFeedback({ type: 'error', message: 'License URL is required when "Other" is selected.' });
      return;
    }
    
    if (distributionLicense.licenseUrl === 'other') {
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(distributionLicense.licenseUrlOther)) {
        setLicenseFeedback({ type: 'error', message: 'Please enter a valid URL for the license.' });
        return;
      }
    }

    setLicenseFeedback(null);
    const success = await distributionSettings.saveSettings({
      license: JSON.stringify(distributionLicense),
    });

    if (success) {
      setLicenseFeedback({ type: 'success', message: 'License settings saved successfully.' });
    } else {
      setLicenseFeedback({ type: 'error', message: distributionSettings.error || 'Failed to save license settings.' });
    }
  };

  const handleSaveIndexing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIndexingFeedback(null);
    const success = await distributionSettings.saveSettings({
      indexing: JSON.stringify(distributionIndexing),
    });

    if (success) {
      setIndexingFeedback({ type: 'success', message: 'Search indexing settings saved successfully.' });
    } else {
      setIndexingFeedback({ type: 'error', message: distributionSettings.error || 'Failed to save search indexing settings.' });
    }
  };

  const handleSavePayments = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (distributionPayments.paymentsEnabled) {
      if (!distributionPayments.currency) {
        setPaymentsFeedback({ type: 'error', message: 'Currency is required when payments are enabled.' });
        return;
      }
      if (!distributionPayments.paymentPluginName) {
        setPaymentsFeedback({ type: 'error', message: 'Payment method is required when payments are enabled.' });
        return;
      }
      if (!distributionPayments.paymentGatewayUrl.trim()) {
        setPaymentsFeedback({ type: 'error', message: 'Payment Gateway URL is required when payments are enabled.' });
        return;
      }
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(distributionPayments.paymentGatewayUrl)) {
        setPaymentsFeedback({ type: 'error', message: 'Please enter a valid URL for the payment gateway.' });
        return;
      }
    }

    setPaymentsFeedback(null);
    const success = await distributionSettings.saveSettings({
      payments: JSON.stringify(distributionPayments),
    });

    if (success) {
      setPaymentsFeedback({ type: 'success', message: 'Payment settings saved successfully.' });
    } else {
      setPaymentsFeedback({ type: 'error', message: distributionSettings.error || 'Failed to save payment settings.' });
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
            {t('editor.settings.settingsTitle')} • {t('editor.settings.distribution.title')}
          </h1>
          <p style={{
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            marginTop: "0.5rem",
            marginBottom: 0,
          }}>
            Configure how users access, discover, and use your journal content.
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
        <PkpTabs defaultValue="license" value={activeTab} onValueChange={setActiveTab}>
          {/* Main Tabs */}
          <div style={{
            borderBottom: "2px solid #e5e5e5",
            background: "#ffffff",
            padding: "0",
            display: "flex",
            marginBottom: "1.5rem",
          }}>
            <PkpTabsList style={{ flex: 1, padding: "0 1.5rem" }}>
              <PkpTabsTrigger value="license">License</PkpTabsTrigger>
              <PkpTabsTrigger value="indexing">Search Indexing</PkpTabsTrigger>
              <PkpTabsTrigger value="payments">Payments</PkpTabsTrigger>
            </PkpTabsList>
          </div>

          {/* License Tab Content */}
          <PkpTabsContent value="license" style={{
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
              License
            </h2>
            {licenseFeedback && (
              <div style={{
                padding: "0.75rem 1rem",
                marginBottom: "1rem",
                borderRadius: "4px",
                backgroundColor: licenseFeedback.type === 'success' ? '#d4edda' : '#f8d7da',
                color: licenseFeedback.type === 'success' ? '#155724' : '#721c24',
                border: `1px solid ${licenseFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                fontSize: "0.875rem",
              }}>
                {licenseFeedback.message}
              </div>
            )}
            <p style={{
              fontSize: "0.875rem",
              color: "rgba(0, 0, 0, 0.54)",
              marginBottom: "1.5rem",
            }}>
              Configure copyright and permissions on a journal level. You will also be able to enter copyright and permissions information on an article and issue level when you publish articles and issues.
            </p>

            <form onSubmit={handleSaveLicense}>
              <div style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e5e5",
                padding: "1.5rem",
              }}>
              {/* Copyright Holder Type */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                  color: "#002C40",
                }}>
                  Copyright Holder
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <PkpRadio
                    id="copyrightHolderType-author"
                    name="copyrightHolderType"
                    value="author"
                    label="Author"
                    checked={distributionLicense.copyrightHolderType === 'author'}
                    onChange={() => setDistributionLicense({ ...distributionLicense, copyrightHolderType: 'author' })}
                  />
                  <PkpRadio
                    id="copyrightHolderType-context"
                    name="copyrightHolderType"
                    value="context"
                    label="Journal"
                    checked={distributionLicense.copyrightHolderType === 'context'}
                    onChange={() => setDistributionLicense({ ...distributionLicense, copyrightHolderType: 'context' })}
                  />
                  <PkpRadio
                    id="copyrightHolderType-other"
                    name="copyrightHolderType"
                    value="other"
                    label="Other"
                    checked={distributionLicense.copyrightHolderType === 'other'}
                    onChange={() => setDistributionLicense({ ...distributionLicense, copyrightHolderType: 'other' })}
                  />
                </div>
                <p style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}>
                  Select who holds the copyright for published works.
                </p>
              </div>

              {/* Copyright Holder Other */}
              {distributionLicense.copyrightHolderType === 'other' && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <label htmlFor="copyrightHolderOther" style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    color: "#002C40",
                  }}>
                    Copyright Holder (Other) <span style={{ color: "#dc3545" }}>*</span>
                  </label>
                  <PkpInput
                    id="copyrightHolderOther"
                    placeholder="Enter copyright holder name"
                    style={{ width: "100%" }}
                    value={distributionLicense.copyrightHolderOther}
                    onChange={(e) => setDistributionLicense({ ...distributionLicense, copyrightHolderOther: e.target.value })}
                    required
                  />
                <p style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}>
                    Enter the copyright holder name if you selected "Other".
                  </p>
                </div>
              )}

              {/* License URL */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                  color: "#002C40",
                }}>
                  License
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <PkpRadio
                    id="licenseUrl-cc-by"
                    name="licenseUrl"
                    value="https://creativecommons.org/licenses/by/4.0/"
                    label="CC-BY 4.0"
                    checked={distributionLicense.licenseUrl === 'https://creativecommons.org/licenses/by/4.0/'}
                    onChange={() => setDistributionLicense({ ...distributionLicense, licenseUrl: 'https://creativecommons.org/licenses/by/4.0/' })}
                  />
                  <PkpRadio
                    id="licenseUrl-cc-by-nc"
                    name="licenseUrl"
                    value="https://creativecommons.org/licenses/by-nc/4.0/"
                    label="CC-BY-NC 4.0"
                    checked={distributionLicense.licenseUrl === 'https://creativecommons.org/licenses/by-nc/4.0/'}
                    onChange={() => setDistributionLicense({ ...distributionLicense, licenseUrl: 'https://creativecommons.org/licenses/by-nc/4.0/' })}
                  />
                  <PkpRadio
                    id="licenseUrl-cc-by-nc-nd"
                    name="licenseUrl"
                    value="https://creativecommons.org/licenses/by-nc-nd/4.0/"
                    label="CC-BY-NC-ND 4.0"
                    checked={distributionLicense.licenseUrl === 'https://creativecommons.org/licenses/by-nc-nd/4.0/'}
                    onChange={() => setDistributionLicense({ ...distributionLicense, licenseUrl: 'https://creativecommons.org/licenses/by-nc-nd/4.0/' })}
                  />
                  <PkpRadio
                    id="licenseUrl-cc-by-nc-sa"
                    name="licenseUrl"
                    value="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                    label="CC-BY-NC-SA 4.0"
                    checked={distributionLicense.licenseUrl === 'https://creativecommons.org/licenses/by-nc-sa/4.0/'}
                    onChange={() => setDistributionLicense({ ...distributionLicense, licenseUrl: 'https://creativecommons.org/licenses/by-nc-sa/4.0/' })}
                  />
                  <PkpRadio
                    id="licenseUrl-cc-by-nd"
                    name="licenseUrl"
                    value="https://creativecommons.org/licenses/by-nd/4.0/"
                    label="CC-BY-ND 4.0"
                    checked={distributionLicense.licenseUrl === 'https://creativecommons.org/licenses/by-nd/4.0/'}
                    onChange={() => setDistributionLicense({ ...distributionLicense, licenseUrl: 'https://creativecommons.org/licenses/by-nd/4.0/' })}
                  />
                  <PkpRadio
                    id="licenseUrl-cc-by-sa"
                    name="licenseUrl"
                    value="https://creativecommons.org/licenses/by-sa/4.0/"
                    label="CC-BY-SA 4.0"
                    checked={distributionLicense.licenseUrl === 'https://creativecommons.org/licenses/by-sa/4.0/'}
                    onChange={() => setDistributionLicense({ ...distributionLicense, licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' })}
                  />
                  <PkpRadio
                    id="licenseUrl-other"
                    name="licenseUrl"
                    value="other"
                    label="Other"
                    checked={distributionLicense.licenseUrl === 'other'}
                    onChange={() => setDistributionLicense({ ...distributionLicense, licenseUrl: 'other' })}
                  />
                </div>
                <p style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}>
                  Select a license that determines usage rights for published works.
                </p>
              </div>

              {/* License URL Other */}
              {distributionLicense.licenseUrl === 'other' && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <label htmlFor="licenseUrlOther" style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    color: "#002C40",
                  }}>
                    License URL (Other) <span style={{ color: "#dc3545" }}>*</span>
                  </label>
                  <PkpInput
                    id="licenseUrlOther"
                    type="url"
                    placeholder="https://example.com/license"
                    style={{ width: "100%" }}
                    value={distributionLicense.licenseUrlOther}
                    onChange={(e) => setDistributionLicense({ ...distributionLicense, licenseUrlOther: e.target.value })}
                    required
                  />
                </div>
              )}

              {/* Copyright Year Basis */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                  color: "#002C40",
                }}>
                  Copyright Year Basis
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <PkpRadio
                    id="copyrightYearBasis-issue"
                    name="copyrightYearBasis"
                    value="issue"
                    label="Issue Publication Date"
                    checked={distributionLicense.copyrightYearBasis === 'issue'}
                    onChange={() => setDistributionLicense({ ...distributionLicense, copyrightYearBasis: 'issue' })}
                  />
                  <PkpRadio
                    id="copyrightYearBasis-submission"
                    name="copyrightYearBasis"
                    value="submission"
                    label="Submission Date"
                    checked={distributionLicense.copyrightYearBasis === 'submission'}
                    onChange={() => setDistributionLicense({ ...distributionLicense, copyrightYearBasis: 'submission' })}
                  />
                </div>
                <p style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}>
                  Select the date basis for the copyright year.
                </p>
              </div>

              {/* License Terms */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="licenseTerms" style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "#002C40",
                }}>
                  License Terms
                </label>
                <PkpTextarea
                  id="licenseTerms"
                  rows={8}
                  placeholder="Enter license terms and conditions"
                  style={{ width: "100%" }}
                  value={distributionLicense.licenseTerms}
                  onChange={(e) => setDistributionLicense({ ...distributionLicense, licenseTerms: e.target.value })}
                />
                <p style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}>
                  Additional license terms and conditions that will be displayed with published works.
                </p>
              </div>

              <PkpButton variant="primary" type="submit" disabled={distributionSettings.loading} loading={distributionSettings.loading}>
                {distributionSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}
              </PkpButton>
            </div>
            </form>
          </PkpTabsContent>

          {/* Indexing Tab Content */}
          <PkpTabsContent value="indexing" style={{
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
              Search Engine Indexing
            </h2>
            {indexingFeedback && (
              <div style={{
                padding: "0.75rem 1rem",
                marginBottom: "1rem",
                borderRadius: "4px",
                backgroundColor: indexingFeedback.type === 'success' ? '#d4edda' : '#f8d7da',
                color: indexingFeedback.type === 'success' ? '#155724' : '#721c24',
                border: `1px solid ${indexingFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                fontSize: "0.875rem",
              }}>
                {indexingFeedback.message}
              </div>
            )}
            <p style={{
              fontSize: "0.875rem",
              color: "rgba(0, 0, 0, 0.54)",
              marginBottom: "1.5rem",
            }}>
              Information here helps search engines and open indexes discover your content.
            </p>

            <form onSubmit={handleSaveIndexing}>
              <div style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e5e5",
                padding: "1.5rem",
              }}>
              {/* Search Description */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="searchDescription" style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "#002C40",
                }}>
                  Search Description
                </label>
                <PkpTextarea
                  id="searchDescription"
                  rows={5}
                  placeholder="Enter a description for search engines"
                  style={{ width: "100%" }}
                  value={distributionIndexing.searchDescription}
                  onChange={(e) => setDistributionIndexing({ ...distributionIndexing, searchDescription: e.target.value })}
                />
                <p style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}>
                  A description of your journal that search engines will index. This should be a concise summary of your journal's scope and content.
                </p>
              </div>

              {/* Custom Headers */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="customHeaders" style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "#002C40",
                }}>
                  Custom Headers
                </label>
                <PkpTextarea
                  id="customHeaders"
                  rows={5}
                  placeholder="Enter custom HTML headers (e.g., meta tags)"
                  style={{ width: "100%", fontFamily: "monospace", fontSize: "0.8125rem" }}
                  value={distributionIndexing.customHeaders}
                  onChange={(e) => setDistributionIndexing({ ...distributionIndexing, customHeaders: e.target.value })}
                />
                <p style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}>
                  Custom HTML headers to include in the head section of your journal pages. This can include meta tags, verification codes, and other custom headers.
                </p>
              </div>

              {/* OAI-PMH Settings */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                  color: "#002C40",
                }}>
                  OAI-PMH (Open Archives Initiative Protocol for Metadata Harvesting)
                </h3>
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <PkpCheckbox
                      id="enableOai"
                      checked={distributionIndexing.enableOai}
                      onChange={(e) => setDistributionIndexing({ ...distributionIndexing, enableOai: e.target.checked })}
                    />
                    <label htmlFor="enableOai" style={{ fontSize: "0.875rem", cursor: "pointer" }}>Enable OAI-PMH</label>
                  </div>
                  <p style={{
                    fontSize: "0.75rem",
                    color: "rgba(0, 0, 0, 0.54)",
                    marginTop: "0.5rem",
                    marginBottom: 0,
                  }}>
                    When enabled, your journal metadata will be discoverable through the OAI-PMH protocol. We encourage you to leave this enabled unless you are not using OJS to publish your content or otherwise do not want your metadata discoverable through the OAI protocol.
                  </p>
                </div>
              </div>

              {/* RSS Feed Settings */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                  color: "#002C40",
                }}>
                  RSS Feeds
                </h3>
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <PkpCheckbox
                      id="enableRss"
                      checked={distributionIndexing.enableRss}
                      onChange={(e) => setDistributionIndexing({ ...distributionIndexing, enableRss: e.target.checked })}
                    />
                    <label htmlFor="enableRss" style={{ fontSize: "0.875rem", cursor: "pointer" }}>Enable RSS feeds</label>
                  </div>
                  <p style={{
                    fontSize: "0.75rem",
                    color: "rgba(0, 0, 0, 0.54)",
                    marginTop: "0.5rem",
                    marginBottom: 0,
                  }}>
                    When enabled, RSS feeds will be available for your journal content.
                  </p>
                </div>
              </div>

              {/* Sitemap Settings */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                  color: "#002C40",
                }}>
                  Sitemap
                </h3>
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <PkpCheckbox
                      id="enableSitemap"
                      checked={distributionIndexing.enableSitemap}
                      onChange={(e) => setDistributionIndexing({ ...distributionIndexing, enableSitemap: e.target.checked })}
                    />
                    <label htmlFor="enableSitemap" style={{ fontSize: "0.875rem", cursor: "pointer" }}>Enable sitemap</label>
                  </div>
                  <p style={{
                    fontSize: "0.75rem",
                    color: "rgba(0, 0, 0, 0.54)",
                    marginTop: "0.5rem",
                    marginBottom: 0,
                  }}>
                    When enabled, a sitemap will be generated for search engines.
                  </p>
                </div>
              </div>

              {/* Search Engine Indexing Services */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h3 style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                  color: "#002C40",
                }}>
                  Search Engine Indexing Services
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <PkpCheckbox
                      id="enableGoogleScholar"
                      checked={distributionIndexing.enableGoogleScholar}
                      onChange={(e) => setDistributionIndexing({ ...distributionIndexing, enableGoogleScholar: e.target.checked })}
                    />
                    <label htmlFor="enableGoogleScholar" style={{ fontSize: "0.875rem", cursor: "pointer" }}>Enable Google Scholar</label>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <PkpCheckbox
                      id="enablePubMed"
                      checked={distributionIndexing.enablePubMed}
                      onChange={(e) => setDistributionIndexing({ ...distributionIndexing, enablePubMed: e.target.checked })}
                    />
                    <label htmlFor="enablePubMed" style={{ fontSize: "0.875rem", cursor: "pointer" }}>Enable PubMed</label>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <PkpCheckbox
                      id="enableDoaj"
                      checked={distributionIndexing.enableDoaj}
                      onChange={(e) => setDistributionIndexing({ ...distributionIndexing, enableDoaj: e.target.checked })}
                    />
                    <label htmlFor="enableDoaj" style={{ fontSize: "0.875rem", cursor: "pointer" }}>Enable DOAJ</label>
                  </div>
                </div>
              </div>

              {/* Custom Indexing Services */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="customIndexingServices" style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "#002C40",
                }}>
                  Custom Indexing Services
                </label>
                <PkpTextarea
                  id="customIndexingServices"
                  rows={5}
                  placeholder="Enter custom indexing services information"
                  style={{ width: "100%" }}
                  value={distributionIndexing.customIndexingServices}
                  onChange={(e) => setDistributionIndexing({ ...distributionIndexing, customIndexingServices: e.target.value })}
                />
                <p style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}>
                  Enter information about custom indexing services for your journal.
                </p>
              </div>

              <PkpButton variant="primary" type="submit" disabled={distributionSettings.loading} loading={distributionSettings.loading}>
                {distributionSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}
              </PkpButton>
            </div>
            </form>
          </PkpTabsContent>

          {/* Payments Tab Content */}
          <PkpTabsContent value="payments" style={{
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
              Payments
            </h2>
            {paymentsFeedback && (
              <div style={{
                padding: "0.75rem 1rem",
                marginBottom: "1rem",
                borderRadius: "4px",
                backgroundColor: paymentsFeedback.type === 'success' ? '#d4edda' : '#f8d7da',
                color: paymentsFeedback.type === 'success' ? '#155724' : '#721c24',
                border: `1px solid ${paymentsFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                fontSize: "0.875rem",
              }}>
                {paymentsFeedback.message}
              </div>
            )}
            <p style={{
              fontSize: "0.875rem",
              color: "rgba(0, 0, 0, 0.54)",
              marginBottom: "1.5rem",
            }}>
              Enable payments and select a payment method and currency if you are using subscriptions or author payment charges in your journal.
            </p>

            <form onSubmit={handleSavePayments}>
              <div style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e5e5",
                padding: "1.5rem",
              }}>
              {/* Enable Payments */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <PkpCheckbox
                    id="paymentsEnabled"
                    checked={distributionPayments.paymentsEnabled}
                    onChange={(e) => setDistributionPayments({ ...distributionPayments, paymentsEnabled: e.target.checked })}
                  />
                  <label htmlFor="paymentsEnabled" style={{ fontSize: "0.875rem", cursor: "pointer" }}>Enable payments</label>
                </div>
                <p style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}>
                  When enabled, payment functionality will be available for subscriptions and author payment charges.
                </p>
              </div>

              {/* Currency */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="currency" style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "#002C40",
                }}>
                  Currency
                </label>
                <PkpSelect 
                  id="currency" 
                  style={{ width: "100%" }}
                  value={distributionPayments.currency}
                  onChange={(e) => setDistributionPayments({ ...distributionPayments, currency: e.target.value })}
                >
                  <option value="">Select currency</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="IDR">IDR - Indonesian Rupiah</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CNY">CNY - Chinese Yuan</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="CHF">CHF - Swiss Franc</option>
                  <option value="SGD">SGD - Singapore Dollar</option>
                </PkpSelect>
                <p style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}>
                  Select the currency for all payments in this journal.
                </p>
              </div>

              {/* Payment Method */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="paymentPluginName" style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "#002C40",
                }}>
                  Payment Method
                </label>
                <PkpSelect 
                  id="paymentPluginName" 
                  style={{ width: "100%" }}
                  value={distributionPayments.paymentPluginName}
                  onChange={(e) => setDistributionPayments({ ...distributionPayments, paymentPluginName: e.target.value })}
                >
                  <option value="">Select payment method</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Manual">Manual Payment</option>
                </PkpSelect>
                <p style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}>
                  Select the payment method plugin to use for processing payments.
                </p>
              </div>

              {/* Payment Gateway URL */}
              {distributionPayments.paymentsEnabled && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <label htmlFor="paymentGatewayUrl" style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    color: "#002C40",
                  }}>
                    Payment Gateway URL <span style={{ color: "#dc3545" }}>*</span>
                  </label>
                  <PkpInput
                    id="paymentGatewayUrl"
                    type="url"
                    placeholder="https://payment-gateway.example.com"
                    style={{ width: "100%" }}
                    value={distributionPayments.paymentGatewayUrl}
                    onChange={(e) => setDistributionPayments({ ...distributionPayments, paymentGatewayUrl: e.target.value })}
                    required
                  />
                  <p style={{
                    fontSize: "0.75rem",
                    color: "rgba(0, 0, 0, 0.54)",
                    marginTop: "0.5rem",
                    marginBottom: 0,
                  }}>
                    Enter the payment gateway URL for processing payments.
                  </p>
                </div>
              )}

              {/* Payment Instructions */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="paymentInstructions" style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "#002C40",
                }}>
                  Payment Instructions
                </label>
                <PkpTextarea
                  id="paymentInstructions"
                  rows={5}
                  placeholder="Enter payment instructions for users"
                  style={{ width: "100%" }}
                  value={distributionPayments.paymentInstructions}
                  onChange={(e) => setDistributionPayments({ ...distributionPayments, paymentInstructions: e.target.value })}
                />
                <p style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.54)",
                  marginTop: "0.5rem",
                  marginBottom: 0,
                }}>
                  Enter instructions that will be displayed to users regarding payment procedures.
                </p>
              </div>

              <PkpButton variant="primary" type="submit" disabled={distributionSettings.loading} loading={distributionSettings.loading}>
                {distributionSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}
              </PkpButton>
            </div>
            </form>
          </PkpTabsContent>
        </PkpTabs>
      </div>
    </div>
  );
}
