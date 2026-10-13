import React from 'react';

export interface PageHeaderProps {
  /** Primary page title */
  title: React.ReactNode;
  /** Optional descriptive subtitle or context */
  subtitle?: React.ReactNode;
  /** Optional action elements (e.g. primary buttons, filters, selectors) */
  extra?: React.ReactNode;
  /** Optional breadcrumb navigation element */
  breadcrumbs?: React.ReactNode;
  /** Optional container CSS class */
  className?: string;
}

/**
 * Reusable PageHeader component providing consistent titles, subtitles, and action areas.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  extra,
  breadcrumbs,
  className = '',
}) => {
  return (
    <header className={`mb-6 sm:mb-8 ${className}`}>
      {breadcrumbs && <div className="mb-2 text-sm text-gray-500">{breadcrumbs}</div>}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 m-0">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 sm:mt-1.5 text-sm sm:text-base text-gray-500 m-0">
              {subtitle}
            </p>
          )}
        </div>

        {extra && (
          <div className="flex items-center gap-3 shrink-0">{extra}</div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
