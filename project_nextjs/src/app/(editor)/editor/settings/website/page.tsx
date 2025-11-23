"use client";

import { useState, useEffect } from "react";
import { PkpTabs, PkpTabsList, PkpTabsTrigger, PkpTabsContent } from "@/components/ui/pkp-tabs";
import { PkpButton } from "@/components/ui/pkp-button";
import { PkpInput } from "@/components/ui/pkp-input";
import { PkpTextarea } from "@/components/ui/pkp-textarea";
import { PkpCheckbox } from "@/components/ui/pkp-checkbox";
import { PkpSelect } from "@/components/ui/pkp-select";
import { PkpTable, PkpTableHeader, PkpTableRow, PkpTableHead, PkpTableCell } from "@/components/ui/pkp-table";
import { DUMMY_NAVIGATION_MENUS, DUMMY_NAVIGATION_MENU_ITEMS, DUMMY_PLUGINS } from "@/features/editor/settings-dummy-data";
import { USE_DUMMY } from "@/lib/dummy";
import { useJournalSettings, useMigrateLocalStorageToDatabase } from "@/features/editor/hooks/useJournalSettings";
import { locales, localeNames } from "@/lib/i18n/config";
import { getLocaleInfo } from "@/lib/locales";

export default function WebsiteSettingsPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("appearance");
  const [activeAppearanceSubTab, setActiveAppearanceSubTab] = useState("theme");
  const [activeSetupSubTab, setActiveSetupSubTab] = useState("information");
  const [activePluginsSubTab, setActivePluginsSubTab] = useState("installedPlugins");

  // Database integration
  const websiteSettings = useJournalSettings({
    section: "website",
    autoLoad: true,
  });

  // Migrate localStorage to database
  const migrateWebsite = useMigrateLocalStorageToDatabase(
    "website",
    [
      "settings_website_appearance_theme",
      "settings_website_appearance_setup",
      "settings_website_appearance_advanced",
      "settings_website_setup_information",
      "settings_website_setup_languages",
      "settings_website_setup_announcements",
      "settings_website_setup_lists",
      "settings_website_setup_privacy",
      "settings_website_setup_datetime",
      "settings_website_setup_archiving",
    ]
  );

  useEffect(() => {
    migrateWebsite.migrate();
  }, []);

  // Appearance - Theme state
  const [appearanceTheme, setAppearanceTheme] = useState({ activeTheme: 'default' });
  const [appearanceThemeFeedback, setAppearanceThemeFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Appearance - Setup state
  const [appearanceSetup, setAppearanceSetup] = useState({ pageFooter: '' });
  const [appearanceSetupFeedback, setAppearanceSetupFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Appearance - Advanced state
  const [appearanceAdvanced, setAppearanceAdvanced] = useState({ customCss: '' });
  const [appearanceAdvancedFeedback, setAppearanceAdvancedFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Setup - Information state
  const [setupInformation, setSetupInformation] = useState({ 
    journalTitle: '', 
    journalDescription: '', 
    aboutJournal: '' 
  });
  const [setupInformationFeedback, setSetupInformationFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Setup - Languages state
  // Structure: { primaryLocale: string, languages: { [localeCode]: { ui: boolean, forms: boolean, submissions: boolean } } }
  const [setupLanguages, setSetupLanguages] = useState<{
    primaryLocale: string;
    languages: Record<string, { ui: boolean; forms: boolean; submissions: boolean }>;
  }>({
    primaryLocale: 'en',
    languages: {
      'en': { ui: true, forms: true, submissions: true },
    }
  });
  const [setupLanguagesFeedback, setSetupLanguagesFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Setup - Announcements state
  const [setupAnnouncements, setSetupAnnouncements] = useState({ enableAnnouncements: false });
  const [setupAnnouncementsFeedback, setSetupAnnouncementsFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Setup - Lists state
  const [setupLists, setSetupLists] = useState({ itemsPerPage: 25 });
  const [setupListsFeedback, setSetupListsFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Setup - Privacy state
  const [setupPrivacy, setSetupPrivacy] = useState({ privacyStatement: '' });
  const [setupPrivacyFeedback, setSetupPrivacyFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Setup - Date/Time state
  const [setupDateTime, setSetupDateTime] = useState({ timeZone: 'UTC', dateFormat: 'Y-m-d' });
  const [setupDateTimeFeedback, setSetupDateTimeFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Setup - Archiving state
  const [setupArchiving, setSetupArchiving] = useState({ 
    enableLockss: false, 
    lockssUrl: '', 
    enableClockss: false, 
    clockssUrl: '' 
  });
  const [setupArchivingFeedback, setSetupArchivingFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load saved data from database
  useEffect(() => {
    if (websiteSettings.settings && Object.keys(websiteSettings.settings).length > 0) {
      const settings = websiteSettings.settings as any;
      
      if (settings.appearance_theme) {
        try {
          const themeData = typeof settings.appearance_theme === 'string' ? JSON.parse(settings.appearance_theme) : settings.appearance_theme;
          setAppearanceTheme(themeData);
        } catch {
          // If parsing fails, use defaults
        }
      }
      if (settings.appearance_setup) {
        try {
          const setupData = typeof settings.appearance_setup === 'string' ? JSON.parse(settings.appearance_setup) : settings.appearance_setup;
          setAppearanceSetup(setupData);
        } catch {}
      }
      if (settings.appearance_advanced) {
        try {
          const advancedData = typeof settings.appearance_advanced === 'string' ? JSON.parse(settings.appearance_advanced) : settings.appearance_advanced;
          setAppearanceAdvanced(advancedData);
        } catch {}
      }
      if (settings.setup_information) {
        try {
          const infoData = typeof settings.setup_information === 'string' ? JSON.parse(settings.setup_information) : settings.setup_information;
          setSetupInformation(infoData);
        } catch {}
      }
      if (settings.setup_languages) {
        try {
          const langData = typeof settings.setup_languages === 'string' ? JSON.parse(settings.setup_languages) : settings.setup_languages;
          // Migrate old format to new format if needed
          if (langData.supportedLocales && !langData.languages) {
            const languages: Record<string, { ui: boolean; forms: boolean; submissions: boolean }> = {};
            langData.supportedLocales.forEach((loc: string) => {
              languages[loc] = { ui: true, forms: true, submissions: true };
            });
            setSetupLanguages({ primaryLocale: langData.primaryLocale || 'en', languages });
          } else {
            setSetupLanguages(langData);
          }
        } catch {}
      }
      if (settings.setup_announcements) {
        try {
          const annData = typeof settings.setup_announcements === 'string' ? JSON.parse(settings.setup_announcements) : settings.setup_announcements;
          setSetupAnnouncements(annData);
        } catch {}
      }
      if (settings.setup_lists) {
        try {
          const listsData = typeof settings.setup_lists === 'string' ? JSON.parse(settings.setup_lists) : settings.setup_lists;
          setSetupLists(listsData);
        } catch {}
      }
      if (settings.setup_privacy) {
        try {
          const privacyData = typeof settings.setup_privacy === 'string' ? JSON.parse(settings.setup_privacy) : settings.setup_privacy;
          setSetupPrivacy(privacyData);
        } catch {}
      }
      if (settings.setup_datetime) {
        try {
          const dtData = typeof settings.setup_datetime === 'string' ? JSON.parse(settings.setup_datetime) : settings.setup_datetime;
          setSetupDateTime(dtData);
        } catch {}
      }
      if (settings.setup_archiving) {
        try {
          const archData = typeof settings.setup_archiving === 'string' ? JSON.parse(settings.setup_archiving) : settings.setup_archiving;
          setSetupArchiving(archData);
        } catch {}
      }
    }
  }, [websiteSettings.settings]);

  // Auto-dismiss feedback messages
  useEffect(() => {
    if (appearanceThemeFeedback) {
      const timer = setTimeout(() => setAppearanceThemeFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [appearanceThemeFeedback]);

  useEffect(() => {
    if (appearanceSetupFeedback) {
      const timer = setTimeout(() => setAppearanceSetupFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [appearanceSetupFeedback]);

  useEffect(() => {
    if (appearanceAdvancedFeedback) {
      const timer = setTimeout(() => setAppearanceAdvancedFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [appearanceAdvancedFeedback]);

  useEffect(() => {
    if (setupInformationFeedback) {
      const timer = setTimeout(() => setSetupInformationFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [setupInformationFeedback]);

  useEffect(() => {
    if (setupLanguagesFeedback) {
      const timer = setTimeout(() => setSetupLanguagesFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [setupLanguagesFeedback]);

  useEffect(() => {
    if (setupAnnouncementsFeedback) {
      const timer = setTimeout(() => setSetupAnnouncementsFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [setupAnnouncementsFeedback]);

  useEffect(() => {
    if (setupListsFeedback) {
      const timer = setTimeout(() => setSetupListsFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [setupListsFeedback]);

  useEffect(() => {
    if (setupPrivacyFeedback) {
      const timer = setTimeout(() => setSetupPrivacyFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [setupPrivacyFeedback]);

  useEffect(() => {
    if (setupDateTimeFeedback) {
      const timer = setTimeout(() => setSetupDateTimeFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [setupDateTimeFeedback]);

  useEffect(() => {
    if (setupArchivingFeedback) {
      const timer = setTimeout(() => setSetupArchivingFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [setupArchivingFeedback]);

  // Save handlers
  const handleSaveAppearanceTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppearanceThemeFeedback(null);
    const success = await websiteSettings.saveSettings({
      appearance_theme: JSON.stringify(appearanceTheme),
    });
    if (success) {
      setAppearanceThemeFeedback({ type: 'success', message: 'Theme settings saved successfully.' });
    } else {
      setAppearanceThemeFeedback({ type: 'error', message: websiteSettings.error || 'Failed to save theme settings.' });
    }
  };

  const handleSaveAppearanceSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppearanceSetupFeedback(null);
    const success = await websiteSettings.saveSettings({
      appearance_setup: JSON.stringify(appearanceSetup),
    });
    if (success) {
      setAppearanceSetupFeedback({ type: 'success', message: 'Appearance setup saved successfully.' });
    } else {
      setAppearanceSetupFeedback({ type: 'error', message: websiteSettings.error || 'Failed to save appearance setup.' });
    }
  };

  const handleSaveAppearanceAdvanced = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppearanceAdvancedFeedback(null);
    const success = await websiteSettings.saveSettings({
      appearance_advanced: JSON.stringify(appearanceAdvanced),
    });
    if (success) {
      setAppearanceAdvancedFeedback({ type: 'success', message: 'Advanced appearance settings saved successfully.' });
    } else {
      setAppearanceAdvancedFeedback({ type: 'error', message: websiteSettings.error || 'Failed to save advanced appearance settings.' });
    }
  };

  const handleSaveSetupInformation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!setupInformation.journalTitle.trim()) {
      setSetupInformationFeedback({ type: 'error', message: 'Journal title is required.' });
      return;
    }

    setSetupInformationFeedback(null);
    const success = await websiteSettings.saveSettings({
      setup_information: JSON.stringify(setupInformation),
    });
    if (success) {
      setSetupInformationFeedback({ type: 'success', message: 'Information settings saved successfully.' });
    } else {
      setSetupInformationFeedback({ type: 'error', message: websiteSettings.error || 'Failed to save information settings.' });
    }
  };

  const handleSaveSetupLanguages = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupLanguages.primaryLocale) {
      setSetupLanguagesFeedback({ type: 'error', message: t('editor.settings.website.primaryLocale') + ' is required.' });
      return;
    }
    // Validation: Primary locale must have UI enabled
    if (!setupLanguages.languages[setupLanguages.primaryLocale]?.ui) {
      setSetupLanguagesFeedback({ type: 'error', message: t('editor.settings.website.primaryLocale') + ' must have UI enabled.' });
      return;
    }
    setSetupLanguagesFeedback(null);
    const success = await websiteSettings.saveSettings({
      setup_languages: JSON.stringify(setupLanguages),
    });
    if (success) {
      setSetupLanguagesFeedback({ type: 'success', message: t('editor.settings.saved') });
    } else {
      setSetupLanguagesFeedback({ type: 'error', message: websiteSettings.error || 'Failed to save language settings.' });
    }
  };

  const handleSaveSetupAnnouncements = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupAnnouncementsFeedback(null);
    const success = await websiteSettings.saveSettings({
      setup_announcements: JSON.stringify(setupAnnouncements),
    });
    if (success) {
      setSetupAnnouncementsFeedback({ type: 'success', message: 'Announcements settings saved successfully.' });
    } else {
      setSetupAnnouncementsFeedback({ type: 'error', message: websiteSettings.error || 'Failed to save announcements settings.' });
    }
  };

  const handleSaveSetupLists = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setupLists.itemsPerPage < 1) {
      setSetupListsFeedback({ type: 'error', message: 'Items per page must be at least 1.' });
      return;
    }
    setSetupListsFeedback(null);
    const success = await websiteSettings.saveSettings({
      setup_lists: JSON.stringify(setupLists),
    });
    if (success) {
      setSetupListsFeedback({ type: 'success', message: 'Lists settings saved successfully.' });
    } else {
      setSetupListsFeedback({ type: 'error', message: websiteSettings.error || 'Failed to save lists settings.' });
    }
  };

  const handleSaveSetupPrivacy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupPrivacyFeedback(null);
    const success = await websiteSettings.saveSettings({
      setup_privacy: JSON.stringify(setupPrivacy),
    });
    if (success) {
      setSetupPrivacyFeedback({ type: 'success', message: 'Privacy statement saved successfully.' });
    } else {
      setSetupPrivacyFeedback({ type: 'error', message: websiteSettings.error || 'Failed to save privacy statement.' });
    }
  };

  const handleSaveSetupDateTime = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupDateTimeFeedback(null);
    const success = await websiteSettings.saveSettings({
      setup_datetime: JSON.stringify(setupDateTime),
    });
    if (success) {
      setSetupDateTimeFeedback({ type: 'success', message: 'Date/Time settings saved successfully.' });
    } else {
      setSetupDateTimeFeedback({ type: 'error', message: websiteSettings.error || 'Failed to save date/time settings.' });
    }
  };

  const handleSaveSetupArchiving = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (setupArchiving.enableLockss && !setupArchiving.lockssUrl.trim()) {
      setSetupArchivingFeedback({ type: 'error', message: 'LOCKSS URL is required when LOCKSS is enabled.' });
      return;
    }
    
    if (setupArchiving.enableLockss) {
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(setupArchiving.lockssUrl)) {
        setSetupArchivingFeedback({ type: 'error', message: 'Please enter a valid URL for LOCKSS.' });
        return;
      }
    }
    
    if (setupArchiving.enableClockss && !setupArchiving.clockssUrl.trim()) {
      setSetupArchivingFeedback({ type: 'error', message: 'CLOCKSS URL is required when CLOCKSS is enabled.' });
      return;
    }
    
    if (setupArchiving.enableClockss) {
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(setupArchiving.clockssUrl)) {
        setSetupArchivingFeedback({ type: 'error', message: 'Please enter a valid URL for CLOCKSS.' });
        return;
      }
    }

    setSetupArchivingFeedback(null);
    const success = await websiteSettings.saveSettings({
      setup_archiving: JSON.stringify(setupArchiving),
    });
    if (success) {
      setSetupArchivingFeedback({ type: 'success', message: 'Archiving settings saved successfully.' });
    } else {
      setSetupArchivingFeedback({ type: 'error', message: websiteSettings.error || 'Failed to save archiving settings.' });
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
            {t('editor.settings.settingsTitle')} • {t('editor.settings.website.title')}
          </h1>
          <p style={{
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            marginTop: "0.5rem",
            marginBottom: 0,
          }}>
            Configure the appearance of and information on your reader-facing website, set up your site's languages and archiving settings, and install and enable plugins.
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
        <PkpTabs defaultValue="appearance" value={activeTab} onValueChange={setActiveTab}>
          {/* Main Tabs */}
          <div style={{
            borderBottom: "2px solid #e5e5e5",
            background: "#ffffff",
            padding: "0",
            display: "flex",
            marginBottom: "1.5rem",
          }}>
            <PkpTabsList style={{ flex: 1, padding: "0 1.5rem" }}>
              <PkpTabsTrigger value="appearance">{t('editor.settings.website.appearance')}</PkpTabsTrigger>
              <PkpTabsTrigger value="setup">{t('editor.settings.website.setup')}</PkpTabsTrigger>
              <PkpTabsTrigger value="plugins">{t('editor.settings.website.plugins')}</PkpTabsTrigger>
            </PkpTabsList>
          </div>

          {/* Appearance Tab Content */}
          {activeTab === "appearance" && (
            <div style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e5e5",
              boxShadow: "none",
              borderRadius: 0,
              display: "flex",
              gap: 0,
              minHeight: "500px",
            }}>
              {/* Side Tabs List */}
              <div style={{
                width: "20rem",
                flexShrink: 0,
                borderRight: "1px solid #e5e5e5",
                backgroundColor: "#f8f9fa",
                padding: "1rem 0",
              }}>
                <button
                  onClick={() => setActiveAppearanceSubTab("theme")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activeAppearanceSubTab === "theme" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activeAppearanceSubTab === "theme" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeAppearanceSubTab === "theme" ? 600 : 400,
                  }}
                >
                  Theme
                </button>
                <button
                  onClick={() => setActiveAppearanceSubTab("appearance-setup")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activeAppearanceSubTab === "appearance-setup" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activeAppearanceSubTab === "appearance-setup" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeAppearanceSubTab === "appearance-setup" ? 600 : 400,
                  }}
                >
                  Setup
                </button>
                <button
                  onClick={() => setActiveAppearanceSubTab("advanced")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activeAppearanceSubTab === "advanced" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activeAppearanceSubTab === "advanced" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeAppearanceSubTab === "advanced" ? 600 : 400,
                  }}
                >
                  Advanced
                </button>
              </div>

              {/* Side Tabs Content Area */}
              <div style={{ flex: 1, padding: "1.5rem", backgroundColor: "#ffffff" }}>
                {activeAppearanceSubTab === "theme" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Theme
                    </h2>
                    {appearanceThemeFeedback && (
                      <div style={{
                        padding: "0.75rem 1rem",
                        marginBottom: "1rem",
                        borderRadius: "4px",
                        backgroundColor: appearanceThemeFeedback.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: appearanceThemeFeedback.type === 'success' ? '#155724' : '#721c24',
                        border: `1px solid ${appearanceThemeFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                        fontSize: "0.875rem",
                      }}>
                        {appearanceThemeFeedback.message}
                      </div>
                    )}
                    <form onSubmit={handleSaveAppearanceTheme}>
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
                          Select a theme to change the overall design of your website. The look of the website will change but the content will remain the same.
                        </p>
                        <div style={{ marginBottom: "1rem" }}>
                          <label style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            marginBottom: "0.5rem",
                            color: "#002C40",
                          }}>
                            Active Theme
                          </label>
                          <PkpSelect 
                            style={{ width: "100%" }}
                            value={appearanceTheme.activeTheme}
                            onChange={(e) => setAppearanceTheme({ ...appearanceTheme, activeTheme: e.target.value })}
                          >
                            <option value="default">Default Theme</option>
                            <option value="custom">Custom Theme</option>
                          </PkpSelect>
                        </div>
                        <PkpButton variant="primary" type="submit" disabled={websiteSettings.loading} loading={websiteSettings.loading}>
                          {websiteSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}
                        </PkpButton>
                      </div>
                    </form>
                  </div>
                )}

                {activeAppearanceSubTab === "appearance-setup" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Appearance Setup
                    </h2>
                    {appearanceSetupFeedback && (
                      <div style={{
                        padding: "0.75rem 1rem",
                        marginBottom: "1rem",
                        borderRadius: "4px",
                        backgroundColor: appearanceSetupFeedback.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: appearanceSetupFeedback.type === 'success' ? '#155724' : '#721c24',
                        border: `1px solid ${appearanceSetupFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                        fontSize: "0.875rem",
                      }}>
                        {appearanceSetupFeedback.message}
                      </div>
                    )}
                    <form onSubmit={handleSaveAppearanceSetup}>
                      <div style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e5e5",
                        padding: "1.5rem",
                      }}>
                        <div style={{ marginBottom: "1rem" }}>
                          <label style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            marginBottom: "0.5rem",
                            color: "#002C40",
                          }}>
                            Upload Logo
                          </label>
                          <PkpInput type="file" accept="image/*" style={{ width: "100%" }} />
                          <p style={{
                            fontSize: "0.75rem",
                            color: "rgba(0, 0, 0, 0.54)",
                            marginTop: "0.5rem",
                            marginBottom: 0,
                          }}>
                            Upload a logo image to display at the top of your journal's website.
                          </p>
                        </div>
                        <div style={{ marginBottom: "1rem" }}>
                          <label style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            marginBottom: "0.5rem",
                            color: "#002C40",
                          }}>
                            Page Footer
                          </label>
                          <PkpTextarea
                            rows={5}
                            placeholder="Enter content to display in the page footer"
                            style={{ width: "100%" }}
                            value={appearanceSetup.pageFooter}
                            onChange={(e) => setAppearanceSetup({ ...appearanceSetup, pageFooter: e.target.value })}
                          />
                        </div>
                        <PkpButton variant="primary" type="submit" disabled={websiteSettings.loading} loading={websiteSettings.loading}>
                          {websiteSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}
                        </PkpButton>
                      </div>
                    </form>
                  </div>
                )}

                {activeAppearanceSubTab === "advanced" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Advanced Appearance
                    </h2>
                    {appearanceAdvancedFeedback && (
                      <div style={{
                        padding: "0.75rem 1rem",
                        marginBottom: "1rem",
                        borderRadius: "4px",
                        backgroundColor: appearanceAdvancedFeedback.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: appearanceAdvancedFeedback.type === 'success' ? '#155724' : '#721c24',
                        border: `1px solid ${appearanceAdvancedFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                        fontSize: "0.875rem",
                      }}>
                        {appearanceAdvancedFeedback.message}
                      </div>
                    )}
                    <form onSubmit={handleSaveAppearanceAdvanced}>
                      <div style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e5e5",
                        padding: "1.5rem",
                      }}>
                        <div style={{ marginBottom: "1rem" }}>
                          <label style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            marginBottom: "0.5rem",
                            color: "#002C40",
                          }}>
                            Upload Custom CSS
                          </label>
                          <PkpInput type="file" accept=".css" style={{ width: "100%" }} />
                          <p style={{
                            fontSize: "0.75rem",
                            color: "rgba(0, 0, 0, 0.54)",
                            marginTop: "0.5rem",
                            marginBottom: 0,
                          }}>
                            Upload a custom CSS file to override default styles.
                          </p>
                        </div>
                        <div style={{ marginBottom: "1rem" }}>
                          <label style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            marginBottom: "0.5rem",
                            color: "#002C40",
                          }}>
                            Custom CSS Code
                          </label>
                          <PkpTextarea
                            rows={10}
                            placeholder="Enter custom CSS code"
                            style={{ width: "100%", fontFamily: "monospace", fontSize: "0.8125rem" }}
                            value={appearanceAdvanced.customCss}
                            onChange={(e) => setAppearanceAdvanced({ ...appearanceAdvanced, customCss: e.target.value })}
                          />
                          <p style={{
                            fontSize: "0.75rem",
                            color: "rgba(0, 0, 0, 0.54)",
                            marginTop: "0.5rem",
                            marginBottom: 0,
                          }}>
                            Enter custom CSS code to override default styles.
                          </p>
                        </div>
                        <div style={{ marginBottom: "1rem" }}>
                          <label style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            marginBottom: "0.5rem",
                            color: "#002C40",
                          }}>
                            Upload Favicon
                          </label>
                          <PkpInput type="file" accept="image/*" style={{ width: "100%" }} />
                          <p style={{
                            fontSize: "0.75rem",
                            color: "rgba(0, 0, 0, 0.54)",
                            marginTop: "0.5rem",
                            marginBottom: 0,
                          }}>
                            Upload a favicon to display in browser tabs and bookmarks.
                          </p>
                        </div>
                        <PkpButton variant="primary" type="submit" disabled={websiteSettings.loading} loading={websiteSettings.loading}>
                          {websiteSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}
                        </PkpButton>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Setup Tab Content */}
          {activeTab === "setup" && (
            <div style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e5e5",
              boxShadow: "none",
              borderRadius: 0,
              display: "flex",
              gap: 0,
              minHeight: "500px",
            }}>
                {/* Side Tabs List */}
                <div style={{
                  width: "20rem",
                  flexShrink: 0,
                  borderRight: "1px solid #e5e5e5",
                  backgroundColor: "#f8f9fa",
                  padding: "1rem 0",
                }}>
                  <div style={{ display: "flex", flexDirection: "column", padding: 0, gap: 0 }}>
                    <button
                      type="button"
                      onClick={() => setActiveSetupSubTab("information")}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "0.75rem 1rem",
                        textAlign: "left",
                        backgroundColor: activeSetupSubTab === "information" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                        color: activeSetupSubTab === "information" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: activeSetupSubTab === "information" ? 600 : 400,
                      }}
                    >
                      Information
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSetupSubTab("languages")}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "0.75rem 1rem",
                        textAlign: "left",
                        backgroundColor: activeSetupSubTab === "languages" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                        color: activeSetupSubTab === "languages" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: activeSetupSubTab === "languages" ? 600 : 400,
                      }}
                    >
                      {t('editor.settings.website.languages')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSetupSubTab("navigationMenus")}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "0.75rem 1rem",
                        textAlign: "left",
                        backgroundColor: activeSetupSubTab === "navigationMenus" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                        color: activeSetupSubTab === "navigationMenus" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: activeSetupSubTab === "navigationMenus" ? 600 : 400,
                      }}
                    >
                      Navigation Menus
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSetupSubTab("announcements")}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "0.75rem 1rem",
                        textAlign: "left",
                        backgroundColor: activeSetupSubTab === "announcements" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                        color: activeSetupSubTab === "announcements" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: activeSetupSubTab === "announcements" ? 600 : 400,
                      }}
                    >
                      Announcements
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSetupSubTab("lists")}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "0.75rem 1rem",
                        textAlign: "left",
                        backgroundColor: activeSetupSubTab === "lists" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                        color: activeSetupSubTab === "lists" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: activeSetupSubTab === "lists" ? 600 : 400,
                      }}
                    >
                      Lists
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSetupSubTab("privacy")}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "0.75rem 1rem",
                        textAlign: "left",
                        backgroundColor: activeSetupSubTab === "privacy" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                        color: activeSetupSubTab === "privacy" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: activeSetupSubTab === "privacy" ? 600 : 400,
                      }}
                    >
                      Privacy
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSetupSubTab("dateTime")}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "0.75rem 1rem",
                        textAlign: "left",
                        backgroundColor: activeSetupSubTab === "dateTime" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                        color: activeSetupSubTab === "dateTime" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: activeSetupSubTab === "dateTime" ? 600 : 400,
                      }}
                    >
                      Date/Time
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSetupSubTab("archiving")}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "0.75rem 1rem",
                        textAlign: "left",
                        backgroundColor: activeSetupSubTab === "archiving" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                        color: activeSetupSubTab === "archiving" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: activeSetupSubTab === "archiving" ? 600 : 400,
                      }}
                    >
                      Archiving
                    </button>
                  </div>
                </div>

              {/* Side Tabs Content Area */}
              <div style={{ flex: 1, padding: "1.5rem", backgroundColor: "#ffffff" }}>
                {activeSetupSubTab === "information" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Information
                    </h2>
                    {setupInformationFeedback && (
                      <div style={{
                        padding: "0.75rem 1rem",
                        marginBottom: "1rem",
                        borderRadius: "4px",
                        backgroundColor: setupInformationFeedback.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: setupInformationFeedback.type === 'success' ? '#155724' : '#721c24',
                        border: `1px solid ${setupInformationFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                        fontSize: "0.875rem",
                      }}>
                        {setupInformationFeedback.message}
                      </div>
                    )}
                    <form onSubmit={handleSaveSetupInformation}>
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
                          Add information about your journal that will appear as links on your sidebar if the Information Block is enabled under Sidebar Management.
                        </p>
                        <div style={{ marginBottom: "1rem" }}>
                          <label style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            marginBottom: "0.5rem",
                            color: "#002C40",
                          }}>
                            Journal Title <span style={{ color: "#dc3545" }}>*</span>
                          </label>
                          <PkpInput
                            type="text"
                            placeholder="Enter journal title"
                            style={{ width: "100%" }}
                            value={setupInformation.journalTitle}
                            onChange={(e) => setSetupInformation({ ...setupInformation, journalTitle: e.target.value })}
                            required
                          />
                        </div>
                        <div style={{ marginBottom: "1rem" }}>
                          <label style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            marginBottom: "0.5rem",
                            color: "#002C40",
                          }}>
                            Journal Description
                          </label>
                          <PkpTextarea
                            rows={5}
                            placeholder="Enter journal description"
                            style={{ width: "100%" }}
                            value={setupInformation.journalDescription}
                            onChange={(e) => setSetupInformation({ ...setupInformation, journalDescription: e.target.value })}
                          />
                        </div>
                        <div style={{ marginBottom: "1rem" }}>
                          <label style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            marginBottom: "0.5rem",
                            color: "#002C40",
                          }}>
                            About the Journal
                          </label>
                          <PkpTextarea
                            rows={5}
                            placeholder="Enter information about the journal"
                            style={{ width: "100%" }}
                            value={setupInformation.aboutJournal}
                            onChange={(e) => setSetupInformation({ ...setupInformation, aboutJournal: e.target.value })}
                          />
                        </div>
                        <PkpButton variant="primary" type="submit" disabled={websiteSettings.loading} loading={websiteSettings.loading}>
                          {websiteSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}
                        </PkpButton>
                      </div>
                    </form>
                  </div>
                )}

                {activeSetupSubTab === "languages" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      {t('editor.settings.website.languages')}
                    </h2>
                    {setupLanguagesFeedback && (
                      <div style={{
                        padding: "0.75rem 1rem",
                        marginBottom: "1rem",
                        borderRadius: "4px",
                        backgroundColor: setupLanguagesFeedback.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: setupLanguagesFeedback.type === 'success' ? '#155724' : '#721c24',
                        border: `1px solid ${setupLanguagesFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                        fontSize: "0.875rem",
                      }}>
                        {setupLanguagesFeedback.message}
                      </div>
                    )}
                    <form onSubmit={handleSaveSetupLanguages}>
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
                          {t('editor.settings.website.languageDescription')}
                        </p>
                        
                        {/* Primary Locale Selector */}
                        <div style={{ marginBottom: "1.5rem" }}>
                          <label style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            marginBottom: "0.5rem",
                            color: "#002C40",
                          }}>
                            {t('editor.settings.website.primaryLocale')} <span style={{ color: "#dc3545" }}>*</span>
                          </label>
                          <PkpSelect 
                            style={{ width: "100%", maxWidth: "300px" }}
                            value={setupLanguages.primaryLocale}
                            onChange={(e) => setSetupLanguages({ ...setupLanguages, primaryLocale: e.target.value })}
                          >
                            {locales.map((loc) => {
                              const localeInfo = getLocaleInfo(loc);
                              return (
                                <option key={loc} value={loc}>
                                  {localeInfo ? `${localeInfo.label} (${localeInfo.nativeName})` : localeNames[loc]}
                                </option>
                              );
                            })}
                          </PkpSelect>
                          <p style={{
                            fontSize: "0.75rem",
                            color: "rgba(0, 0, 0, 0.54)",
                            marginTop: "0.5rem",
                            marginBottom: 0,
                          }}>
                            The primary locale will be used as the default language for the journal.
                          </p>
                        </div>

                        {/* Languages Grid */}
                        <div style={{
                          border: "1px solid #e5e5e5",
                          borderRadius: "4px",
                          overflow: "hidden",
                          marginBottom: "1.5rem",
                        }}>
                          <PkpTable>
                            <PkpTableHeader>
                              <PkpTableRow isHeader>
                                <PkpTableHead>{t('editor.settings.website.languages')}</PkpTableHead>
                                <PkpTableHead style={{ width: "100px", textAlign: "center" }}>{t('editor.settings.website.ui')}</PkpTableHead>
                                <PkpTableHead style={{ width: "100px", textAlign: "center" }}>{t('editor.settings.website.forms')}</PkpTableHead>
                                <PkpTableHead style={{ width: "120px", textAlign: "center" }}>{t('editor.settings.website.submissions')}</PkpTableHead>
                              </PkpTableRow>
                            </PkpTableHeader>
                            <tbody>
                              {locales.map((localeCode) => {
                                const localeInfo = getLocaleInfo(localeCode);
                                const langData = setupLanguages.languages[localeCode] || { ui: false, forms: false, submissions: false };
                                const isPrimary = setupLanguages.primaryLocale === localeCode;

                                return (
                                  <PkpTableRow key={localeCode}>
                                    <PkpTableCell>
                                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <div>
                                          <div style={{ fontWeight: 500, fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.84)" }}>
                                            {localeInfo ? localeInfo.label : localeNames[localeCode]}
                                          </div>
                                          {localeInfo && (
                                            <div style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)" }}>
                                              {localeInfo.nativeName}
                                            </div>
                                          )}
                                        </div>
                                        {isPrimary && (
                                          <span style={{
                                            display: "inline-block",
                                            padding: "0.125rem 0.5rem",
                                            backgroundColor: "#e3f2fd",
                                            color: "#1976d2",
                                            borderRadius: "0.125rem",
                                            fontSize: "0.75rem",
                                            fontWeight: 500,
                                            marginLeft: "0.5rem",
                                          }}>
                                            Primary
                                          </span>
                                        )}
                                      </div>
                                    </PkpTableCell>
                                    <PkpTableCell style={{ textAlign: "center" }}>
                                      <PkpCheckbox
                                        id={`lang-${localeCode}-ui`}
                                        checked={langData.ui}
                                        onChange={(e) => {
                                          setSetupLanguages({
                                            ...setupLanguages,
                                            languages: {
                                              ...setupLanguages.languages,
                                              [localeCode]: {
                                                ...langData,
                                                ui: e.target.checked,
                                              },
                                            },
                                          });
                                        }}
                                      />
                                    </PkpTableCell>
                                    <PkpTableCell style={{ textAlign: "center" }}>
                                      <PkpCheckbox
                                        id={`lang-${localeCode}-forms`}
                                        checked={langData.forms}
                                        onChange={(e) => {
                                          setSetupLanguages({
                                            ...setupLanguages,
                                            languages: {
                                              ...setupLanguages.languages,
                                              [localeCode]: {
                                                ...langData,
                                                forms: e.target.checked,
                                              },
                                            },
                                          });
                                        }}
                                      />
                                    </PkpTableCell>
                                    <PkpTableCell style={{ textAlign: "center" }}>
                                      <PkpCheckbox
                                        id={`lang-${localeCode}-submissions`}
                                        checked={langData.submissions}
                                        onChange={(e) => {
                                          setSetupLanguages({
                                            ...setupLanguages,
                                            languages: {
                                              ...setupLanguages.languages,
                                              [localeCode]: {
                                                ...langData,
                                                submissions: e.target.checked,
                                              },
                                            },
                                          });
                                        }}
                                      />
                                    </PkpTableCell>
                                  </PkpTableRow>
                                );
                              })}
                            </tbody>
                          </PkpTable>
                        </div>

                        <PkpButton variant="primary" type="submit" disabled={websiteSettings.loading} loading={websiteSettings.loading}>
                          {websiteSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}
                        </PkpButton>
                      </div>
                    </form>
                  </div>
                )}

                {activeSetupSubTab === "navigationMenus" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Navigation Menus
                    </h2>
                    <p style={{
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.54)",
                      marginBottom: "1.5rem",
                    }}>
                      Edit the existing navigation menus on your website. You can add and remove items and re-order them. You can also create custom menu items that link to pages on your site or to another website or even add a new custom menu.
                    </p>

                    {/* Navigation Menus Grid */}
                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e5e5",
                      padding: "1.5rem",
                      marginBottom: "2rem",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h3 style={{
                          fontSize: "1rem",
                          fontWeight: 600,
                          color: "#002C40",
                          margin: 0,
                        }}>
                          Navigation Menus
                        </h3>
                        <PkpButton variant="primary">
                          Add Menu
                        </PkpButton>
                      </div>
                      <PkpTable>
                        <PkpTableHeader>
                          <PkpTableRow isHeader>
                            <PkpTableHead style={{ width: "200px" }}>Menu Title</PkpTableHead>
                            <PkpTableHead>Area Name</PkpTableHead>
                            <PkpTableHead style={{ width: "100px" }}>Menu Items</PkpTableHead>
                            <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Actions</PkpTableHead>
                          </PkpTableRow>
                        </PkpTableHeader>
                        <tbody>
                          {USE_DUMMY && DUMMY_NAVIGATION_MENUS.length > 0 ? (
                            DUMMY_NAVIGATION_MENUS.map((menu) => (
                              <PkpTableRow key={menu.id}>
                                <PkpTableCell>{menu.title}</PkpTableCell>
                                <PkpTableCell>{menu.areaName || "-"}</PkpTableCell>
                                <PkpTableCell style={{ width: "100px" }}>
                                  <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{menu.menuItems}</span>
                                  <span style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)", marginLeft: "0.25rem" }}>items</span>
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
                                {USE_DUMMY ? "No navigation menus found." : "Navigation menus grid will be implemented here with add, edit, delete, and reorder functionality."}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </PkpTable>
                    </div>

                    {/* Navigation Menu Items Grid */}
                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e5e5",
                      padding: "1.5rem",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h3 style={{
                          fontSize: "1rem",
                          fontWeight: 600,
                          color: "#002C40",
                          margin: 0,
                        }}>
                          Menu Items
                        </h3>
                        <PkpButton variant="primary">
                          Add Menu Item
                        </PkpButton>
                      </div>
                      <PkpTable>
                        <PkpTableHeader>
                          <PkpTableRow isHeader>
                            <PkpTableHead style={{ width: "60px" }}>Order</PkpTableHead>
                            <PkpTableHead>Title</PkpTableHead>
                            <PkpTableHead>Type</PkpTableHead>
                            <PkpTableHead>URL/Path</PkpTableHead>
                            <PkpTableHead style={{ width: "120px", textAlign: "center" }}>Actions</PkpTableHead>
                          </PkpTableRow>
                        </PkpTableHeader>
                        <tbody>
                          {USE_DUMMY && DUMMY_NAVIGATION_MENU_ITEMS.length > 0 ? (
                            DUMMY_NAVIGATION_MENU_ITEMS.map((item) => (
                              <PkpTableRow key={item.id}>
                                <PkpTableCell style={{ width: "60px" }}>{item.order}</PkpTableCell>
                                <PkpTableCell>
                                  <div style={{ fontWeight: 500 }}>{item.title}</div>
                                </PkpTableCell>
                                <PkpTableCell>{item.type}</PkpTableCell>
                                <PkpTableCell>{item.path}</PkpTableCell>
                                <PkpTableCell style={{ width: "120px", textAlign: "center" }}>
                                  <PkpButton variant="onclick" size="sm" style={{ marginRight: "0.5rem" }}>Edit</PkpButton>
                                  <PkpButton variant="onclick" size="sm">Delete</PkpButton>
                                </PkpTableCell>
                              </PkpTableRow>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)", fontSize: "0.875rem" }}>
                                {USE_DUMMY ? "No menu items found." : "Menu items grid will be implemented here with add, edit, delete, and drag-and-drop reorder functionality."}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </PkpTable>
                    </div>
                  </div>
                )}

                {activeSetupSubTab === "announcements" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Announcements
                    </h2>
                    {setupAnnouncementsFeedback && (
                      <div style={{
                        padding: "0.75rem 1rem",
                        marginBottom: "1rem",
                        borderRadius: "4px",
                        backgroundColor: setupAnnouncementsFeedback.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: setupAnnouncementsFeedback.type === 'success' ? '#155724' : '#721c24',
                        border: `1px solid ${setupAnnouncementsFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                        fontSize: "0.875rem",
                      }}>
                        {setupAnnouncementsFeedback.message}
                      </div>
                    )}
                    <form onSubmit={handleSaveSetupAnnouncements}>
                      <div style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e5e5",
                        padding: "1.5rem",
                      }}>
                        <div style={{ marginBottom: "1rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <PkpCheckbox 
                              id="enableAnnouncements" 
                              checked={setupAnnouncements.enableAnnouncements}
                              onChange={(e) => setSetupAnnouncements({ ...setupAnnouncements, enableAnnouncements: e.target.checked })}
                            />
                            <label htmlFor="enableAnnouncements" style={{ fontSize: "0.875rem", cursor: "pointer" }}>Enable announcements on the journal website</label>
                          </div>
                          <p style={{
                            fontSize: "0.75rem",
                            color: "rgba(0, 0, 0, 0.54)",
                            marginTop: "0.5rem",
                            marginBottom: 0,
                          }}>
                            When enabled, announcements can be displayed on the journal website.
                          </p>
                        </div>
                        <PkpButton variant="primary" type="submit" disabled={websiteSettings.loading} loading={websiteSettings.loading}>
                          {websiteSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}
                        </PkpButton>
                      </div>
                    </form>
                  </div>
                )}

                {activeSetupSubTab === "lists" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Lists
                    </h2>
                    {setupListsFeedback && (
                      <div style={{
                        padding: "0.75rem 1rem",
                        marginBottom: "1rem",
                        borderRadius: "4px",
                        backgroundColor: setupListsFeedback.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: setupListsFeedback.type === 'success' ? '#155724' : '#721c24',
                        border: `1px solid ${setupListsFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                        fontSize: "0.875rem",
                      }}>
                        {setupListsFeedback.message}
                      </div>
                    )}
                    <form onSubmit={handleSaveSetupLists}>
                      <div style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e5e5",
                        padding: "1.5rem",
                      }}>
                        <div style={{ marginBottom: "1rem" }}>
                          <label style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            marginBottom: "0.5rem",
                            color: "#002C40",
                          }}>
                            Items Per Page
                          </label>
                          <PkpInput 
                            type="number" 
                            min="1"
                            value={setupLists.itemsPerPage}
                            onChange={(e) => setSetupLists({ ...setupLists, itemsPerPage: parseInt(e.target.value) || 25 })}
                            style={{ width: "100%" }} 
                          />
                          <p style={{
                            fontSize: "0.75rem",
                            color: "rgba(0, 0, 0, 0.54)",
                            marginTop: "0.5rem",
                            marginBottom: 0,
                          }}>
                            Set the default number of items to display per page in lists.
                          </p>
                        </div>
                        <PkpButton variant="primary" type="submit" disabled={websiteSettings.loading} loading={websiteSettings.loading}>
                          {websiteSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}
                        </PkpButton>
                      </div>
                    </form>
                  </div>
                )}

                {activeSetupSubTab === "privacy" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Privacy Statement
                    </h2>
                    {setupPrivacyFeedback && (
                      <div style={{
                        padding: "0.75rem 1rem",
                        marginBottom: "1rem",
                        borderRadius: "4px",
                        backgroundColor: setupPrivacyFeedback.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: setupPrivacyFeedback.type === 'success' ? '#155724' : '#721c24',
                        border: `1px solid ${setupPrivacyFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                        fontSize: "0.875rem",
                      }}>
                        {setupPrivacyFeedback.message}
                      </div>
                    )}
                    <form onSubmit={handleSaveSetupPrivacy}>
                      <div style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e5e5",
                        padding: "1.5rem",
                      }}>
                        <div style={{ marginBottom: "1rem" }}>
                          <label style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            marginBottom: "0.5rem",
                            color: "#002C40",
                          }}>
                            Privacy Statement
                          </label>
                          <PkpTextarea
                            rows={10}
                            placeholder="Enter privacy statement"
                            style={{ width: "100%" }}
                            value={setupPrivacy.privacyStatement}
                            onChange={(e) => setSetupPrivacy({ ...setupPrivacy, privacyStatement: e.target.value })}
                          />
                          <p style={{
                            fontSize: "0.75rem",
                            color: "rgba(0, 0, 0, 0.54)",
                            marginTop: "0.5rem",
                            marginBottom: 0,
                          }}>
                            This statement will be displayed on the journal website.
                          </p>
                        </div>
                        <PkpButton variant="primary" type="submit" disabled={websiteSettings.loading} loading={websiteSettings.loading}>
                          {websiteSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}
                        </PkpButton>
                      </div>
                    </form>
                  </div>
                )}

                {activeSetupSubTab === "dateTime" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Date/Time
                    </h2>
                    {setupDateTimeFeedback && (
                      <div style={{
                        padding: "0.75rem 1rem",
                        marginBottom: "1rem",
                        borderRadius: "4px",
                        backgroundColor: setupDateTimeFeedback.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: setupDateTimeFeedback.type === 'success' ? '#155724' : '#721c24',
                        border: `1px solid ${setupDateTimeFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                        fontSize: "0.875rem",
                      }}>
                        {setupDateTimeFeedback.message}
                      </div>
                    )}
                    <form onSubmit={handleSaveSetupDateTime}>
                      <div style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e5e5",
                        padding: "1.5rem",
                      }}>
                        <div style={{ marginBottom: "1rem" }}>
                          <label style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            marginBottom: "0.5rem",
                            color: "#002C40",
                          }}>
                            Time Zone
                          </label>
                          <PkpSelect 
                            style={{ width: "100%" }}
                            value={setupDateTime.timeZone}
                            onChange={(e) => setSetupDateTime({ ...setupDateTime, timeZone: e.target.value })}
                          >
                            <option value="UTC">UTC</option>
                            <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                            <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                            <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                          </PkpSelect>
                        </div>
                        <div style={{ marginBottom: "1rem" }}>
                          <label style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            marginBottom: "0.5rem",
                            color: "#002C40",
                          }}>
                            Date Format
                          </label>
                          <PkpSelect 
                            style={{ width: "100%" }}
                            value={setupDateTime.dateFormat}
                            onChange={(e) => setSetupDateTime({ ...setupDateTime, dateFormat: e.target.value })}
                          >
                            <option value="Y-m-d">YYYY-MM-DD</option>
                            <option value="d/m/Y">DD/MM/YYYY</option>
                            <option value="m/d/Y">MM/DD/YYYY</option>
                          </PkpSelect>
                        </div>
                        <PkpButton variant="primary" type="submit" disabled={websiteSettings.loading} loading={websiteSettings.loading}>
                          {websiteSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}
                        </PkpButton>
                      </div>
                    </form>
                  </div>
                )}

                {activeSetupSubTab === "archiving" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Archiving
                    </h2>
                    {setupArchivingFeedback && (
                      <div style={{
                        padding: "0.75rem 1rem",
                        marginBottom: "1rem",
                        borderRadius: "4px",
                        backgroundColor: setupArchivingFeedback.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: setupArchivingFeedback.type === 'success' ? '#155724' : '#721c24',
                        border: `1px solid ${setupArchivingFeedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                        fontSize: "0.875rem",
                      }}>
                        {setupArchivingFeedback.message}
                      </div>
                    )}
                    <form onSubmit={handleSaveSetupArchiving}>
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
                          Configure archiving services to preserve your journal content.
                        </p>

                        {/* LOCKSS */}
                        <div style={{ marginBottom: "1.5rem" }}>
                          <h3 style={{
                            fontSize: "1rem",
                            fontWeight: 600,
                            marginBottom: "0.75rem",
                            color: "#002C40",
                          }}>
                            LOCKSS
                          </h3>
                          <div style={{ marginBottom: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                              <PkpCheckbox 
                                id="enableLockss"
                                checked={setupArchiving.enableLockss}
                                onChange={(e) => setSetupArchiving({ ...setupArchiving, enableLockss: e.target.checked })}
                              />
                              <label htmlFor="enableLockss" style={{ fontSize: "0.875rem", cursor: "pointer" }}>Enable LOCKSS</label>
                            </div>
                            {setupArchiving.enableLockss && (
                              <div>
                                <label htmlFor="lockssUrl" style={{
                                  display: "block",
                                  fontSize: "0.875rem",
                                  fontWeight: 600,
                                  marginBottom: "0.5rem",
                                  color: "#002C40",
                                }}>
                                  LOCKSS URL <span style={{ color: "#dc3545" }}>*</span>
                                </label>
                                <PkpInput
                                  id="lockssUrl"
                                  type="url"
                                  placeholder="https://lockss.example.com"
                                  style={{ width: "100%" }}
                                  value={setupArchiving.lockssUrl}
                                  onChange={(e) => setSetupArchiving({ ...setupArchiving, lockssUrl: e.target.value })}
                                  required
                                />
                                <p style={{
                                  fontSize: "0.75rem",
                                  color: "rgba(0, 0, 0, 0.54)",
                                  marginTop: "0.5rem",
                                  marginBottom: 0,
                                }}>
                                  Enter the LOCKSS URL for your journal.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* CLOCKSS */}
                        <div style={{ marginBottom: "1.5rem" }}>
                          <h3 style={{
                            fontSize: "1rem",
                            fontWeight: 600,
                            marginBottom: "0.75rem",
                            color: "#002C40",
                          }}>
                            CLOCKSS
                          </h3>
                          <div style={{ marginBottom: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                              <PkpCheckbox 
                                id="enableClockss"
                                checked={setupArchiving.enableClockss}
                                onChange={(e) => setSetupArchiving({ ...setupArchiving, enableClockss: e.target.checked })}
                              />
                              <label htmlFor="enableClockss" style={{ fontSize: "0.875rem", cursor: "pointer" }}>Enable CLOCKSS</label>
                            </div>
                            {setupArchiving.enableClockss && (
                              <div>
                                <label htmlFor="clockssUrl" style={{
                                  display: "block",
                                  fontSize: "0.875rem",
                                  fontWeight: 600,
                                  marginBottom: "0.5rem",
                                  color: "#002C40",
                                }}>
                                  CLOCKSS URL <span style={{ color: "#dc3545" }}>*</span>
                                </label>
                                <PkpInput
                                  id="clockssUrl"
                                  type="url"
                                  placeholder="https://clockss.example.com"
                                  style={{ width: "100%" }}
                                  value={setupArchiving.clockssUrl}
                                  onChange={(e) => setSetupArchiving({ ...setupArchiving, clockssUrl: e.target.value })}
                                  required
                                />
                                <p style={{
                                  fontSize: "0.75rem",
                                  color: "rgba(0, 0, 0, 0.54)",
                                  marginTop: "0.5rem",
                                  marginBottom: 0,
                                }}>
                                  Enter the CLOCKSS URL for your journal.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <PkpButton variant="primary" type="submit" disabled={websiteSettings.loading} loading={websiteSettings.loading}>
                          {websiteSettings.loading ? t('editor.settings.saving') : t('editor.settings.save')}
                        </PkpButton>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Plugins Tab Content */}
          {activeTab === "plugins" && (
            <div style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e5e5",
              boxShadow: "none",
              borderRadius: 0,
              display: "flex",
              gap: 0,
              minHeight: "500px",
            }}>
              {/* Side Tabs */}
              <div style={{
                width: "20rem",
                flexShrink: 0,
                borderRight: "1px solid #e5e5e5",
                backgroundColor: "#f8f9fa",
                padding: "1rem 0",
              }}>
                <button
                  onClick={() => setActivePluginsSubTab("installedPlugins")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activePluginsSubTab === "installedPlugins" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activePluginsSubTab === "installedPlugins" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activePluginsSubTab === "installedPlugins" ? 600 : 400,
                  }}
                >
                  Installed Plugins
                </button>
                <button
                  onClick={() => setActivePluginsSubTab("pluginGallery")}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    backgroundColor: activePluginsSubTab === "pluginGallery" ? "rgba(0, 103, 152, 0.1)" : "transparent",
                    color: activePluginsSubTab === "pluginGallery" ? "#006798" : "rgba(0, 0, 0, 0.84)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activePluginsSubTab === "pluginGallery" ? 600 : 400,
                  }}
                >
                  Plugin Gallery
                </button>
              </div>

              {/* Content Area */}
              <div style={{ flex: 1, padding: "1.5rem", backgroundColor: "#ffffff" }}>
                {/* Installed Plugins */}
                {activePluginsSubTab === "installedPlugins" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Installed Plugins
                    </h2>
                    <p style={{
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.54)",
                      marginBottom: "1.5rem",
                    }}>
                      Plugins extend functionality of OJS and allow it to interact with external tools and services. Installed plugins can be enabled and configured here.
                    </p>
                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e5e5",
                      padding: "1.5rem",
                    }}>
                      {/* Plugin Categories */}
                      <div style={{ marginBottom: "1.5rem" }}>
                        <label htmlFor="pluginCategory" style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          marginBottom: "0.5rem",
                          color: "#002C40",
                        }}>
                          Filter by Category
                        </label>
                        <PkpSelect id="pluginCategory" style={{ width: "300px" }}>
                          <option value="">All Categories</option>
                          <option value="generic">Generic</option>
                          <option value="blocks">Blocks</option>
                          <option value="gateways">Gateways</option>
                          <option value="importexport">Import/Export</option>
                          <option value="paymethod">Payment Methods</option>
                          <option value="pubIds">Publication Identifiers</option>
                          <option value="reports">Reports</option>
                          <option value="themes">Themes</option>
                        </PkpSelect>
                      </div>

                      {/* Plugins Grid Placeholder */}
                      <div style={{
                        border: "1px solid #e5e5e5",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead style={{ backgroundColor: "#f8f9fa" }}>
                            <tr>
                              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.875rem", fontWeight: 600, color: "#002C40", borderBottom: "1px solid #e5e5e5" }}>
                                Plugin
                              </th>
                              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.875rem", fontWeight: 600, color: "#002C40", borderBottom: "1px solid #e5e5e5" }}>
                                Version
                              </th>
                              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.875rem", fontWeight: 600, color: "#002C40", borderBottom: "1px solid #e5e5e5" }}>
                                Status
                              </th>
                              <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.875rem", fontWeight: 600, color: "#002C40", borderBottom: "1px solid #e5e5e5" }}>
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {USE_DUMMY && DUMMY_PLUGINS.length > 0 ? (
                              DUMMY_PLUGINS.map((plugin) => (
                                <tr key={plugin.id}>
                                  <td style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e5e5e5" }}>
                                    <div style={{ fontWeight: 500, fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.84)" }}>{plugin.name}</div>
                                    {plugin.description && (
                                      <div style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)", marginTop: "0.25rem" }}>
                                        {plugin.description}
                                      </div>
                                    )}
                                  </td>
                                  <td style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e5e5e5", fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.84)" }}>
                                    {plugin.version}
                                  </td>
                                  <td style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e5e5e5" }}>
                                    <span
                                      style={{
                                        display: "inline-block",
                                        padding: "0.125rem 0.5rem",
                                        backgroundColor: plugin.status === "enabled" ? "#e8f5e9" : "#f5f5f5",
                                        color: plugin.status === "enabled" ? "#2e7d32" : "rgba(0, 0, 0, 0.54)",
                                        borderRadius: "0.125rem",
                                        fontSize: "0.75rem",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {plugin.status === "enabled" ? "Enabled" : "Disabled"}
                                    </span>
                                  </td>
                                  <td style={{ padding: "0.75rem 1rem", textAlign: "center", borderBottom: "1px solid #e5e5e5" }}>
                                    <PkpButton variant="onclick" size="sm" style={{ marginRight: "0.5rem" }}>Configure</PkpButton>
                                    <PkpButton variant="onclick" size="sm">
                                      {plugin.status === "enabled" ? "Disable" : "Enable"}
                                    </PkpButton>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)", fontSize: "0.875rem" }}>
                                  {USE_DUMMY ? "No plugins found." : "Plugins grid will be implemented here with enable/disable and configure functionality."}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Plugin Gallery */}
                {activePluginsSubTab === "pluginGallery" && (
                  <div>
                    <h2 style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                      color: "#002C40",
                    }}>
                      Plugin Gallery
                    </h2>
                    <p style={{
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.54)",
                      marginBottom: "1.5rem",
                    }}>
                      Browse and install additional plugins from the Plugin Gallery.
                    </p>
                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e5e5",
                      padding: "1.5rem",
                    }}>
                      {/* Search */}
                      <div style={{ marginBottom: "1.5rem" }}>
                        <PkpInput
                          type="search"
                          placeholder="Search plugins..."
                          style={{ width: "100%", maxWidth: "400px" }}
                        />
                      </div>

                      {/* Plugin Gallery Grid Placeholder */}
                      <div style={{
                        border: "1px solid #e5e5e5",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead style={{ backgroundColor: "#f8f9fa" }}>
                            <tr>
                              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.875rem", fontWeight: 600, color: "#002C40", borderBottom: "1px solid #e5e5e5" }}>
                                Plugin
                              </th>
                              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.875rem", fontWeight: 600, color: "#002C40", borderBottom: "1px solid #e5e5e5" }}>
                                Description
                              </th>
                              <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontSize: "0.875rem", fontWeight: 600, color: "#002C40", borderBottom: "1px solid #e5e5e5" }}>
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {USE_DUMMY && DUMMY_PLUGINS.length > 0 ? (
                              DUMMY_PLUGINS.map((plugin) => (
                                <tr key={plugin.id}>
                                  <td style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e5e5e5" }}>
                                    <div style={{ fontWeight: 500, fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.84)" }}>{plugin.name}</div>
                                    <div style={{ fontSize: "0.75rem", color: "rgba(0, 0, 0, 0.54)", marginTop: "0.25rem" }}>
                                      Version: {plugin.version} • Category: {plugin.category}
                                    </div>
                                  </td>
                                  <td style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e5e5e5", fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.84)" }}>
                                    {plugin.description}
                                  </td>
                                  <td style={{ padding: "0.75rem 1rem", textAlign: "center", borderBottom: "1px solid #e5e5e5" }}>
                                    <PkpButton variant="primary" size="sm">Install</PkpButton>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={3} style={{ padding: "2rem", textAlign: "center", color: "rgba(0, 0, 0, 0.54)", fontSize: "0.875rem" }}>
                                  {USE_DUMMY ? "No plugins available." : "Plugin gallery grid will be implemented here with browse and install functionality."}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </PkpTabs>
      </div>
    </div>
  );
}
