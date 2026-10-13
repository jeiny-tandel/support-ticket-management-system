import React, { useState } from 'react';
import { Layout } from 'antd';
import { AppHeader, type AppHeaderUser } from './AppHeader';
import { AppSidebar, type SidebarItem } from './AppSidebar';

const { Content } = Layout;

export interface AppLayoutProps {
  /** Page body content */
  children: React.ReactNode;
  /** Optional sidebar navigation items */
  sidebarItems?: readonly SidebarItem[];
  /** Currently selected menu item key */
  selectedMenuKey?: string;
  /** Callback triggered when a menu item is clicked */
  onSelectMenuKey?: (key: string, item: SidebarItem) => void;
  /** Authenticated user display details */
  user?: AppHeaderUser | null;
  /** Callback triggered when logout action is clicked */
  onLogout?: () => void;
  /** Optional extra elements for the header */
  headerExtra?: React.ReactNode;
  /** Optional controlled collapsed state */
  collapsed?: boolean;
  /** Optional callback when collapse state changes */
  onCollapseChange?: (collapsed: boolean) => void;
  /** Optional layout CSS class */
  className?: string;
}

/**
 * Reusable layout shell integrating AppHeader, AppSidebar, and content area.
 * Configured with fixed sidebar and independent smooth scrolling main content.
 */
export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  sidebarItems = [],
  selectedMenuKey,
  onSelectMenuKey,
  user,
  onLogout,
  headerExtra,
  collapsed: externalCollapsed,
  onCollapseChange,
  className = '',
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const isControlled = externalCollapsed !== undefined;
  const isCollapsed = isControlled ? externalCollapsed : internalCollapsed;

  const handleToggleCollapse = () => {
    const nextState = !isCollapsed;
    if (!isControlled) {
      setInternalCollapsed(nextState);
    }
    onCollapseChange?.(nextState);
  };

  const hasSidebar = sidebarItems.length > 0;

  return (
    <Layout
      className={`h-screen flex flex-row overflow-hidden bg-gray-50 ${className}`}
    >
      {hasSidebar && (
        <AppSidebar
          collapsed={isCollapsed}
          onCollapse={handleToggleCollapse}
          items={sidebarItems}
          selectedKey={selectedMenuKey}
          onSelectKey={onSelectMenuKey}
        />
      )}

      <Layout className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
        <AppHeader
          collapsed={isCollapsed}
          onToggleCollapse={hasSidebar ? handleToggleCollapse : undefined}
          user={user}
          onLogout={onLogout}
          rightContent={headerExtra}
          showLogo={!hasSidebar}
        />

        <Content className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
