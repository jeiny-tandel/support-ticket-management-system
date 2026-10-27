import React from "react";
import { Layout, Menu, type MenuProps } from "antd";
import {
  DashboardOutlined,
  CustomerServiceOutlined,
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Logo } from "../common/Logo";

const { Sider } = Layout;

export interface SidebarItem {
  key: string;
  label: string;
  path?: string;
  iconName?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  items: readonly SidebarItem[];
  selectedKey?: string;
  onSelectKey?: (key: string, item: SidebarItem) => void;
  brand?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const getMenuIcon = (iconName?: string): React.ReactNode => {
  switch (iconName) {
    case "DashboardOutlined":
      return <DashboardOutlined />;
    case "CustomerServiceOutlined":
      return <CustomerServiceOutlined />;
    case "TeamOutlined":
      return <TeamOutlined />;
    case "UserOutlined":
      return <UserOutlined />;
    case "SettingOutlined":
      return <SettingOutlined />;
    case "DeleteOutlined":
      return <DeleteOutlined />;
    default:
      return null;
  }
};

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onCollapse,
  items,
  selectedKey,
  onSelectKey,
  brand,
  footer,
  className = "",
}) => {
  const menuItems: MenuProps["items"] = items.map((item) => ({
    key: item.key,
    icon: item.icon ?? getMenuIcon(item.iconName),
    label: item.label,
    disabled: item.disabled,
  }));

  const handleMenuClick: MenuProps["onClick"] = (info) => {
    if (onSelectKey) {
      const selectedItem = items.find((item) => item.key === info.key);
      if (selectedItem) {
        onSelectKey(info.key, selectedItem);
      }
    }
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      trigger={null}
      width={300}
      collapsedWidth={80}
      theme="light"
      style={{ backgroundColor: "#ffffff" }}
      className={`border-r border-gray-100 h-screen shrink-0 sticky top-0 left-0 z-20 flex flex-col justify-between ${className}`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="h-16 px-5 flex items-center border-b border-gray-100 shrink-0 overflow-hidden">
          {brand ?? (
            <Logo size={collapsed ? "small" : "middle"} showText={!collapsed} />
          )}
        </div>

        <div className="flex-1 py-4 px-2 overflow-y-auto">
          <Menu
            mode="inline"
            selectedKeys={selectedKey ? [selectedKey] : []}
            items={menuItems}
            onClick={handleMenuClick}
            className="border-none font-medium"
          />
        </div>

        {footer && (
          <div className="p-4 border-t border-gray-100 shrink-0">{footer}</div>
        )}
      </div>
    </Sider>
  );
};

export default Sidebar;
