import React from 'react';

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  extra?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}

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
