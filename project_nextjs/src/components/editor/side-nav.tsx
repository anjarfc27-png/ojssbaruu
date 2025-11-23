"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { ChevronRight } from "lucide-react";

// Navigation items structure matching OJS 3.3
interface NavItem {
  label: string;
  labelKey: string; // Translation key for the label
  href: string;
  submenu?: NavItem[];
}

// Navigation items structure with translation keys
const getNavItems = (t: (key: string) => string): NavItem[] => [
  { label: t('editor.navigation.submissions'), labelKey: 'editor.navigation.submissions', href: "/editor" },
  { label: t('editor.navigation.issues'), labelKey: 'editor.navigation.issues', href: "/editor/issues" },
  { label: t('editor.navigation.announcements'), labelKey: 'editor.navigation.announcements', href: "/editor/announcements" },
  {
    label: t('editor.navigation.settings'), 
    labelKey: 'editor.navigation.settings',
    href: "/editor/settings/context",
    submenu: [
      { label: t('editor.navigation.context'), labelKey: 'editor.navigation.context', href: "/editor/settings/context" },
      { label: t('editor.navigation.website'), labelKey: 'editor.navigation.website', href: "/editor/settings/website" },
      { label: t('editor.navigation.workflow'), labelKey: 'editor.navigation.workflow', href: "/editor/settings/workflow" },
      { label: t('editor.navigation.distribution'), labelKey: 'editor.navigation.distribution', href: "/editor/settings/distribution" },
      { label: t('editor.navigation.access'), labelKey: 'editor.navigation.access', href: "/editor/settings/access" },
    ],
  },
  { label: t('editor.navigation.usersRoles'), labelKey: 'editor.navigation.usersRoles', href: "/editor/users-roles" },
  { label: t('editor.navigation.tools'), labelKey: 'editor.navigation.tools', href: "/editor/tools" },
  {
    label: t('editor.navigation.statistics'), 
    labelKey: 'editor.navigation.statistics',
    href: "/editor/statistics/editorial",
    submenu: [
      { label: t('editor.navigation.editorial'), labelKey: 'editor.navigation.editorial', href: "/editor/statistics/editorial" },
      { label: t('editor.navigation.publications'), labelKey: 'editor.navigation.publications', href: "/editor/statistics/publications" },
      { label: t('editor.navigation.users'), labelKey: 'editor.navigation.users', href: "/editor/statistics/users" },
    ],
  },
];

export function EditorSideNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());
  
  // Get navigation items with translations - re-compute when locale changes
  const NAV_ITEMS = useMemo(() => getNavItems(t), [t, locale]);

  // Check if user has admin role
  const hasAdminRole = user?.roles?.some(r => r.role_path === "admin");

  // Check if any submenu item is active to auto-expand
  const shouldExpandSubmenu = (item: NavItem): boolean => {
    if (!item.submenu) return false;
    return item.submenu.some(subItem => 
      isActive(pathname, searchParams?.toString() ?? "", subItem.href)
    );
  };

  // Auto-expand submenus that have active items or when on any page in that section
  useEffect(() => {
    const initiallyOpen = new Set<string>();
    NAV_ITEMS.forEach(item => {
      if (item.submenu && shouldExpandSubmenu(item)) {
        initiallyOpen.add(item.label);
      }
      // Auto-expand Settings submenu when on any settings page
      if (item.labelKey === 'editor.navigation.settings' && pathname?.startsWith("/editor/settings")) {
        initiallyOpen.add(item.labelKey);
      }
      // Auto-expand Statistics submenu when on any statistics page
      if (item.labelKey === 'editor.navigation.statistics' && pathname?.startsWith("/editor/statistics")) {
        initiallyOpen.add(item.labelKey);
      }
    });
    if (initiallyOpen.size > 0) {
      setOpenSubmenus(prev => {
        const combined = new Set(prev);
        initiallyOpen.forEach(label => combined.add(label));
        return combined;
      });
    }
  }, [pathname, searchParams]);

  const toggleSubmenu = (labelKey: string) => {
    setOpenSubmenus(prev => {
      const next = new Set(prev);
      if (next.has(labelKey)) {
        next.delete(labelKey);
      } else {
        next.add(labelKey);
      }
      return next;
    });
  };

  const renderNavItem = (item: NavItem) => {
    const active = isActive(pathname, searchParams?.toString() ?? "", item.href);
    const isSubmenuOpen = item.submenu ? openSubmenus.has(item.labelKey) : false;
    const hasActiveSubmenu = item.submenu ? shouldExpandSubmenu(item) : false;

    return (
      <li key={item.label} style={{ margin: 0 }}>
        {item.submenu ? (
          <>
            {/* Parent item with submenu */}
            <button
              onClick={() => toggleSubmenu(item.labelKey)}
              className="pkp_nav_link"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '0.875rem 1rem', // Increased padding untuk lebih nyaman
                marginBottom: '0.25rem', // Spacing antar items
                borderRadius: '0.25rem', // Rounded corners
                color: hasActiveSubmenu ? '#ffffff' : 'rgba(255,255,255,0.9)',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: hasActiveSubmenu ? '600' : '400',
                backgroundColor: hasActiveSubmenu ? 'rgba(255,255,255,0.15)' : 'transparent',
                transition: 'all 0.15s ease',
                border: 'none',
                background: hasActiveSubmenu ? 'rgba(255,255,255,0.15)' : 'transparent',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!hasActiveSubmenu) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.95)';
                }
              }}
              onMouseLeave={(e) => {
                if (!hasActiveSubmenu) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
                }
              }}
            >
              <span>{item.label}</span>
              <ChevronRight
                className="h-4 w-4"
                style={{
                  width: '16px',
                  height: '16px',
                  transition: 'transform 0.2s ease',
                  transform: isSubmenuOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                }}
              />
            </button>
            {/* Submenu items */}
            {isSubmenuOpen && (
              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                }}
              >
                {item.submenu.map((subItem) => {
                  const subActive = isActive(pathname, searchParams?.toString() ?? "", subItem.href);
                  return (
                    <li key={subItem.href} style={{ margin: 0 }}>
                      <Link
                        href={subItem.href}
                        className="pkp_nav_link"
                        style={{
                          display: 'block',
                          padding: '0.75rem 1rem 0.75rem 2rem', // Increased padding
                          marginLeft: '0.5rem', // Safe indentation
                          marginBottom: '0.125rem', // Spacing antar submenu items
                          borderRadius: '0.25rem', // Rounded corners
                          color: subActive ? '#ffffff' : 'rgba(255,255,255,0.85)',
                          textDecoration: 'none',
                          fontSize: '0.9375rem',
                          fontWeight: subActive ? '600' : '400',
                          backgroundColor: subActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!subActive) {
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                            e.currentTarget.style.color = 'rgba(255,255,255,0.95)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!subActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                          }
                        }}
                      >
                        {subItem.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        ) : (
          /* Regular menu item */
          <Link
            href={item.href}
            className="pkp_nav_link"
            style={{
              display: 'block',
              padding: '0.875rem 1rem', // Increased padding
              marginBottom: '0.25rem', // Spacing antar items
              borderRadius: '0.25rem', // Rounded corners
              color: active ? '#ffffff' : 'rgba(255,255,255,0.9)',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: active ? '600' : '400',
              backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'transparent',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.95)';
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
              }
            }}
          >
            {item.label}
          </Link>
        )}
      </li>
    );
  };

  return (
    <nav className="pkp_nav" style={{
      padding: '0.5rem 0', // Safe padding top dan bottom
      width: '100%',
    }}>
      <ul
        className="pkp_nav_list"
        style={{
          listStyle: 'none',
          margin: 0,
          padding: '0 0.5rem', // Safe padding left dan right
          width: '100%',
        }}
      >
        {NAV_ITEMS.map(renderNavItem)}
        {/* Conditional Admin link */}
        {hasAdminRole && (
          <li style={{ margin: 0 }}>
            <Link
              href="/admin"
              className="pkp_nav_link"
              style={{
                display: 'block',
                padding: '0.875rem 1rem', // Increased padding
                marginTop: '0.5rem', // Spacing sebelum admin link
                marginBottom: '0.25rem', // Spacing setelah admin link
                borderRadius: '0.25rem', // Rounded corners
                color: pathname?.startsWith('/admin') ? '#ffffff' : 'rgba(255,255,255,0.9)',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: pathname?.startsWith('/admin') ? '600' : '400',
                backgroundColor: pathname?.startsWith('/admin') ? 'rgba(255,255,255,0.15)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!pathname?.startsWith('/admin')) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.95)';
                }
              }}
              onMouseLeave={(e) => {
                if (!pathname?.startsWith('/admin')) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
                }
              }}
            >
              Admin
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

function isActive(pathname: string, queryString: string, targetHref: string) {
  const [targetPath, targetQuery] = targetHref.split("?");
  
  // Special case: /editor and /editor/submissions should both be active for Submissions nav
  if (targetPath === "/editor" && (pathname === "/editor" || pathname === "/editor/submissions")) {
    if (!targetQuery) {
      return true;
    }
    // Check query params if needed
    const current = new URLSearchParams(queryString);
    const target = new URLSearchParams(targetQuery);
    for (const [key, value] of target.entries()) {
      if (current.get(key) !== value) {
        return false;
      }
    }
    return true;
  }
  
  if (pathname !== targetPath) {
    return false;
  }
  if (!targetQuery) {
    return true;
  }
  const current = new URLSearchParams(queryString);
  const target = new URLSearchParams(targetQuery);
  for (const [key, value] of target.entries()) {
    if (current.get(key) !== value) {
      return false;
    }
  }
  return true;
}
