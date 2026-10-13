import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../hooks";
import { selectIsAuthenticated } from "../../store";
import { AppLogo } from "../common/AppLogo";
import { AppButton } from "../common/AppButton";
import { ROUTES } from "../../constants/routes";

export const PublicHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={ROUTES.HOME} className="flex items-center">
          <AppLogo size="small" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to={ROUTES.HOME}
            className={`text-sm font-medium transition-colors ${
              isActive(ROUTES.HOME)
                ? "text-indigo-600 font-semibold"
                : "text-gray-600 hover:text-indigo-600"
            }`}
          >
            Home
          </Link>
          <Link
            to={ROUTES.ABOUT}
            className={`text-sm font-medium transition-colors ${
              isActive(ROUTES.ABOUT)
                ? "text-indigo-600 font-semibold"
                : "text-gray-600 hover:text-indigo-600"
            }`}
          >
            About Us
          </Link>
        </nav>

        {/* Desktop Auth Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Link to={ROUTES.DASHBOARD}>
              <AppButton type="primary">Go to Dashboard</AppButton>
            </Link>
          ) : (
            <>
              <Link to={ROUTES.LOGIN}>
                <AppButton type="default" className="font-medium text-gray-700">
                  Sign In
                </AppButton>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <AppButton type="primary" className="font-medium">
                  Register Agent
                </AppButton>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-100 transition-colors border-0 bg-transparent cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <CloseOutlined className="text-lg" />
            ) : (
              <MenuOutlined className="text-lg" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-2">
            <Link
              to={ROUTES.HOME}
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                isActive(ROUTES.HOME)
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Home
            </Link>
            <Link
              to={ROUTES.ABOUT}
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                isActive(ROUTES.ABOUT)
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              About Us
            </Link>
          </nav>

          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                to={ROUTES.DASHBOARD}
                onClick={() => setMobileMenuOpen(false)}
              >
                <AppButton type="primary" fullWidth>
                  Go to Dashboard
                </AppButton>
              </Link>
            ) : (
              <>
                <Link to={ROUTES.LOGIN} onClick={() => setMobileMenuOpen(false)}>
                  <AppButton type="default" fullWidth>
                    Sign In
                  </AppButton>
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <AppButton type="primary" fullWidth>
                    Register Agent
                  </AppButton>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;
