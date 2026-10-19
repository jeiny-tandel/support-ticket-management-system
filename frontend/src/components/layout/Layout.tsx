import React, { useState } from 'react';
import { Layout as AntLayout } from 'antd';
import { Header, type HeaderUser } from './Header';
import { Sidebar, type SidebarItem } from './Sidebar';

const { Content } = AntLayout;

export interface LayoutProps {
  children: React.ReactNode;
  sidebarItems?: readonly SidebarItem[];
  selectedMenuKey?: string;
  onSelectMenuKey?: (key: string, item: SidebarItem) => void;
  user?: HeaderUser | null;
  onLogout?: () => void;
  onProfileClick?: () => void;
  headerExtra?: React.ReactNode;
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  className?: string;
}

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
