import React, { useState } from 'react';
import { Layout as AntLayout } from 'antd';
import { Header, type HeaderUser } from './Header';
import { Sidebar, type SidebarItem } from './Sidebar';

const { Content } = AntLayout;

export interface LayoutProps {
  /** Page body content */
  children: React.ReactNode;
  /** Optional sidebar navigation items */
  sidebarItems?: readonly SidebarItem[];
  /** Currently selected menu item key */
  selectedMenuKey?: string;
  /** Callback triggered when a menu item is clicked */
  onSelectMenuKey?: (key: string, item: SidebarItem) => void;
  /** Authenticated user display details */
  user?: HeaderUser | null;
  /** Callback triggered when logout action is clicked */
  onLogout?: () => void;
  /** Callback triggered when My Profile action is clicked */
  onProfileClick?: () => void;
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
 * Reusable layout shell integrating Header, Sidebar, and content area.
 * Configured with fixed sidebar and independent smooth scrolling main content.
 */
export const Layout: React.FC<LayoutProps> = ({
  children,
  sidebarItems = [],
  selectedMenuKey,
  onSelectMenuKey,
  user,
  onLogout,
  onProfileClick,
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
    <AntLayout
      className={`h-screen flex flex-row overflow-hidden bg-gray-50 ${className}`}
    >
      {hasSidebar && (
        <Sidebar
          collapsed={isCollapsed}
          onCollapse={handleToggleCollapse}
          items={sidebarItems}
          selectedKey={selectedMenuKey}
          onSelectKey={onSelectMenuKey}
        />
      )}

      <AntLayout className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 min-w-0">
        <Header
          collapsed={isCollapsed}
          onToggleCollapse={hasSidebar ? handleToggleCollapse : undefined}
          user={user}
          onLogout={onLogout}
          onProfileClick={onProfileClick}
          rightContent={headerExtra}
          showLogo={!hasSidebar}
        />

        <Content className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 min-w-0">
          <div className="max-w-7xl mx-auto w-full min-w-0">{children}</div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
