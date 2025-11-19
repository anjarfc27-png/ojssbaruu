import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  subtitle?: string | React.ReactNode
  showBreadcrumbs?: boolean
  className?: string
  crumbs?: { label: string; href?: string }[]
}

export function PageHeader({ 
  title, 
  subtitle, 
  showBreadcrumbs = true, 
  className,
  crumbs
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      {showBreadcrumbs && (
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            {(crumbs && crumbs.length > 0 ? crumbs : [{ label: "Home", href: "/" }, { label: title }]).map((c, i) => (
              <li key={i} className="inline-flex items-center">
                {i > 0 && <span className="text-gray-400">/</span>}
                {c.href ? (
                  <a href={c.href} className="text-gray-900 ml-2 text-sm font-medium">
                    {c.label}
                  </a>
                ) : (
                  <span className="text-gray-500 ml-2 text-sm">{c.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

