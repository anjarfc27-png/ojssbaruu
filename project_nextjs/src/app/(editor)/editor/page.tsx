"use client";

import { SubmissionTable } from "@/features/editor/components/submission-table";
import { PkpTabs, PkpTabsList, PkpTabsTrigger, PkpTabsContent } from "@/components/ui/pkp-tabs";
import { useMemo, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { HelpCircle } from "lucide-react";
import {
  getMyQueueSubmissions,
  getUnassignedSubmissions,
  getAllActiveSubmissions,
  getArchivedSubmissions,
  calculateDashboardStats,
} from "@/features/editor/dummy-helpers";

export default function EditorPage() {
  const { user } = useAuth();
  
  // Use dummy user ID for demonstration (since we're using dummy data)
  // This ensures My Queue shows dummy submissions assigned to "current-user-id"
  const currentUserId = "current-user-id";
  
  // Check if user is Manager or Admin (for tab visibility)
  const isManagerOrAdmin = useMemo(() => {
    return user?.roles?.some(r => r.role_path === "admin" || r.role_path === "manager") ?? false;
  }, [user]);
  
  // Untuk development/testing - tampilkan semua tabs
  // TODO: Set to false setelah testing selesai dan pastikan user memiliki role Manager/Admin
  const showAllTabsForTesting = true;
  
  // Filter data menggunakan helper functions yang sesuai dengan OJS 3.3 logic
  const myQueue = useMemo(
    () => getMyQueueSubmissions(currentUserId),
    [currentUserId]
  );
  
  const unassigned = useMemo(() => getUnassignedSubmissions(), []);
  
  const active = useMemo(() => getAllActiveSubmissions(), []);
  
  const archived = useMemo(
    () => getArchivedSubmissions(currentUserId, isManagerOrAdmin),
    [currentUserId, isManagerOrAdmin]
  );

  // Calculate stats real-time menggunakan helper function
  const stats = useMemo(
    () => calculateDashboardStats(currentUserId, isManagerOrAdmin),
    [currentUserId, isManagerOrAdmin]
  );

  // Update tab active styling based on Tabs context
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = tabsContainerRef.current;
    if (!container) return;

    const updateTabStyling = () => {
      const triggers = container.querySelectorAll('[data-value]');
      triggers.forEach((trigger) => {
        const el = trigger as HTMLElement;
        const value = el.getAttribute('data-value');
        const isActive = el.getAttribute('data-state') === 'active';
        
        if (isActive) {
          el.style.backgroundColor = '#ffffff'; // White background for active tab
          el.style.color = 'rgba(0, 0, 0, 0.84)'; // Dark grey text
          el.style.borderTop = 'none';
          el.style.borderRight = 'none';
          el.style.borderBottom = '2px solid #006798'; // Blue underline at bottom
          el.style.borderLeft = 'none';
          el.style.marginBottom = '0';
          el.classList.add('pkp_tab_active');

          // Active badge styling - dark grey border and text
          const badge = el.querySelector('span');
          if (badge) {
            badge.style.backgroundColor = '#ffffff';
            badge.style.border = '1px solid rgba(0, 0, 0, 0.2)';
            badge.style.color = 'rgba(0, 0, 0, 0.54)';
          }
        } else {
          el.style.backgroundColor = 'transparent';
          el.style.color = '#006798'; // Blue text for inactive tabs
          el.style.borderTop = 'none';
          el.style.borderRight = 'none';
          el.style.borderBottom = '2px solid transparent';
          el.style.borderLeft = 'none';
          el.classList.remove('pkp_tab_active');

          // Inactive badge styling - blue border and text
          const badge = el.querySelector('span');
          if (badge) {
            badge.style.backgroundColor = '#ffffff';
            badge.style.border = '1px solid #006798';
            badge.style.color = '#006798';
          }
        }
      });
    };

    // Initial update
    updateTabStyling();

    // Watch for changes
    const observer = new MutationObserver(updateTabStyling);
    observer.observe(container, {
      attributes: true,
      attributeFilter: ['data-state'],
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="pkp_submission_list"
      style={{
        padding: 0, // Padding di-handle di parent wrapper (layout.tsx)
        backgroundColor: "#eaedee",
        minHeight: "100%",
        marginTop: 0, // Header sudah di-handle di page header
        width: "100%",
        maxWidth: "100%",
      }}
    >
      {/* Page Header - OJS 3.3 Exact Layout with Safe Area */}
      <div
        className="pkp_page_header"
        style={{
          padding: "1.5rem 2rem 0 2rem", // Safe area padding horizontal
          backgroundColor: "#ffffff",
          borderBottom: "2px solid #e5e5e5",
        }}
      >
        <h1
          className="app__pageHeading pkp_page_title"
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            margin: 0,
            padding: "0.5rem 0",
            lineHeight: "2.25rem",
            color: "#002C40",
          }}
        >
          Submissions
        </h1>
      </div>

      {/* Tabs - OJS 3.3 Style */}
      <PkpTabs defaultValue="myQueue" className="w-full">
        <div 
          ref={tabsContainerRef}
          style={{
            borderBottom: "2px solid #e5e5e5",
            background: "#ffffff",
            padding: "0 2rem", // Safe area padding horizontal
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            margin: 0,
          }}
        >
          <div style={{ display: "flex", flex: 1 }}>
            <PkpTabsList style={{ flex: 1 }}>
            {/* My Queue Tab */}
              <PkpTabsTrigger value="myQueue">
                My Queue
                {stats?.myQueue > 0 && (
                  <span style={{
                    marginLeft: '0.5rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  color: 'rgba(0, 0, 0, 0.54)',
                  padding: '0 0.25rem',
                  borderRadius: '50%',
                  minWidth: '20px',
                  height: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  lineHeight: '1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                  }}>
                    {stats.myQueue}
                  </span>
                )}
              </PkpTabsTrigger>
            
            {/* Unassigned Tab - Only visible for Manager/Admin */}
            {(isManagerOrAdmin || showAllTabsForTesting) && (
              <PkpTabsTrigger value="unassigned">
                Unassigned
                {stats?.unassigned > 0 && (
                  <span style={{
                    marginLeft: '0.5rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    color: '#006798',
                    padding: '0 0.25rem',
                    borderRadius: '50%',
                    minWidth: '20px',
                    height: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    lineHeight: '1',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {stats.unassigned}
                  </span>
                )}
              </PkpTabsTrigger>
            )}
            
            {/* All Active Tab - Only visible for Manager/Admin */}
            {(isManagerOrAdmin || showAllTabsForTesting) && (
              <PkpTabsTrigger value="active">
                All Active
                {stats?.allActive > 0 && (
                  <span style={{
                    marginLeft: '0.5rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    color: '#006798',
                    padding: '0 0.25rem',
                    borderRadius: '50%',
                    minWidth: '20px',
                    height: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    lineHeight: '1',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {stats.allActive}
                  </span>
                )}
              </PkpTabsTrigger>
            )}
            
            {/* Archives Tab - Always visible for Editor */}
              <PkpTabsTrigger value="archive">
              Archives
                {stats?.archived > 0 && (
                  <span style={{
                    marginLeft: '0.5rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  color: '#006798',
                  padding: '0 0.25rem',
                  borderRadius: '50%',
                  minWidth: '20px',
                  height: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  lineHeight: '1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                  }}>
                    {stats.archived}
                  </span>
                )}
                 </PkpTabsTrigger>
               </PkpTabsList>
          </div>
          
          {/* Help Link - Right side of tabs */}
          <div style={{
            padding: '0 0 0 1rem', // Padding left untuk spacing dari tabs
            display: 'flex',
            alignItems: 'center',
            height: '3rem'
          }}>
            <a
              href="#"
              title="Help"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                color: 'inherit',
                fontSize: '0.875rem'
              }}
              className="hover:opacity-80"
            >
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#00B24E', /* OJS green */
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 600,
                lineHeight: '1',
                flexShrink: 0
              }}>
                i
              </span>
              <span style={{
                color: '#006798',
                fontSize: '0.875rem',
                fontWeight: 400
              }}>
                Help
              </span>
            </a>
          </div>
        </div>

              {/* Tab Contents - OJS 3.3 Exact Layout with Safe Area */}
              <PkpTabsContent value="myQueue" style={{ position: "relative", padding: "1.5rem 2rem", backgroundColor: "#eaedee" }}>
                <SubmissionTable 
                  submissions={myQueue} 
                  emptyMessage="Tidak ada submission di My Queue."
                  tabLabel="My Assigned"
                />
              </PkpTabsContent>

              {/* Unassigned and All Active only visible for Manager/Admin */}
              {(isManagerOrAdmin || showAllTabsForTesting) && (
                <>
                  <PkpTabsContent value="unassigned" style={{ position: "relative", padding: "1.5rem 2rem", backgroundColor: "#eaedee" }}>
                    <SubmissionTable 
                      submissions={unassigned} 
                      emptyMessage="Tidak ada submission yang belum ditugaskan."
                      tabLabel="Unassigned"
                    />
                  </PkpTabsContent>

                  <PkpTabsContent value="active" style={{ position: "relative", padding: "1.5rem 2rem", backgroundColor: "#eaedee" }}>
                    <SubmissionTable 
                      submissions={active} 
                      emptyMessage="Tidak ada submission aktif."
                      tabLabel="All Active"
                    />
                  </PkpTabsContent>
                </>
              )}

              <PkpTabsContent value="archive" style={{ position: "relative", padding: "1.5rem 2rem", backgroundColor: "#eaedee" }}>
                <SubmissionTable 
                  submissions={archived} 
                  emptyMessage="Tidak ada submission yang diarsipkan."
                  tabLabel="Archives"
                />
              </PkpTabsContent>
      </PkpTabs>
    </section>
  );
}